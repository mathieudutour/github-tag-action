import { isNil, uniqBy, template, flatten, isEmpty } from "lodash-es";
import pFilter from "p-filter";
import AggregateError from "aggregate-error";
import issueParser from "issue-parser";
import debugFactory from "debug";

import parseGithubUrl from "./parse-github-url.js";
import resolveConfig from "./resolve-config.js";
import { toOctokitOptions } from "./octokit.js";
import getSearchQueries from "./get-search-queries.js";
import getSuccessComment from "./get-success-comment.js";
import findSRIssues from "./find-sr-issues.js";
import { RELEASE_NAME } from "./definitions/constants.js";
import getReleaseLinks from "./get-release-links.js";

const debug = debugFactory("semantic-release:github");

export default async function success(pluginConfig, context, { Octokit }) {
  const {
    options: { repositoryUrl },
    commits,
    nextRelease,
    releases,
    logger,
  } = context;
  const {
    githubToken,
    githubUrl,
    githubApiPathPrefix,
    proxy,
    successComment,
    failComment,
    failTitle,
    releasedLabels,
    addReleases,
  } = resolveConfig(pluginConfig, context);

  const octokit = new Octokit(
    toOctokitOptions({ githubToken, githubUrl, githubApiPathPrefix, proxy }),
  );

  // In case the repo changed name, get the new `repo`/`owner` as the search API will not follow redirects
  const { data: repoData } = await octokit.request(
    "GET /repos/{owner}/{repo}",
    parseGithubUrl(repositoryUrl),
  );
  const [owner, repo] = repoData.full_name.split("/");

  const errors = [];

  if (successComment === false) {
    logger.log("Skip commenting on issues and pull requests.");
  } else {
    const parser = issueParser(
      "github",
      githubUrl ? { hosts: [githubUrl] } : {},
    );
    const releaseInfos = releases.filter((release) => Boolean(release.name));
    const shas = commits.map(({ hash }) => hash);

    const searchQueries = getSearchQueries(
      `repo:${owner}/${repo}+type:pr+is:merged`,
      shas,
    ).map(
      async (q) =>
        (await octokit.request("GET /search/issues", { q })).data.items,
    );

    const searchQueriesResults = await Promise.all(searchQueries);
    const uniqueSearchQueriesResults = uniqBy(
      flatten(searchQueriesResults),
      "number",
    );
    const prs = await pFilter(
      uniqueSearchQueriesResults,
      async ({ number }) => {
        const commits = await octokit.paginate(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
          {
            owner,
            repo,
            pull_number: number,
          },
        );
        const matchingCommit = commits.find(({ sha }) => shas.includes(sha));
        if (matchingCommit) return matchingCommit;

        const { data: pullRequest } = await octokit.request(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}",
          {
            owner,
            repo,
            pull_number: number,
          },
        );
        return shas.includes(pullRequest.merge_commit_sha);
      },
    );

    debug(
      "found pull requests: %O",
      prs.map((pr) => pr.number),
    );

    // Parse the release commits message and PRs body to find resolved issues/PRs via comment keyworkds
    const issues = [
      ...prs.map((pr) => pr.body),
      ...commits.map((commit) => commit.message),
    ].reduce(
      (issues, message) =>
        message
          ? issues.concat(
              parser(message)
                .actions.close.filter(
                  (action) =>
                    isNil(action.slug) || action.slug === `${owner}/${repo}`,
                )
                .map((action) => ({
                  number: Number.parseInt(action.issue, 10),
                })),
            )
          : issues,
      [],
    );

    debug("found issues via comments: %O", issues);

    await Promise.all(
      uniqBy([...prs, ...issues], "number").map(async (issue) => {
        const body = successComment
          ? template(successComment)({ ...context, issue })
          : getSuccessComment(issue, releaseInfos, nextRelease);
        try {
          const comment = { owner, repo, issue_number: issue.number, body };
          debug("create comment: %O", comment);
          const {
            data: { html_url: url },
          } = await octokit.request(
            "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
            comment,
          );
          logger.log("Added comment to issue #%d: %s", issue.number, url);

          if (releasedLabels) {
            const labels = releasedLabels.map((label) =>
              template(label)(context),
            );
            await octokit.request(
              "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
              {
                owner,
                repo,
                issue_number: issue.number,
                data: labels,
              },
            );
            logger.log("Added labels %O to issue #%d", labels, issue.number);
          }
        } catch (error) {
          if (error.status === 403) {
            logger.error(
              "Not allowed to add a comment to the issue #%d.",
              issue.number,
            );
          } else if (error.status === 404) {
            logger.error(
              "Failed to add a comment to the issue #%d as it doesn't exist.",
              issue.number,
            );
          } else {
            errors.push(error);
            logger.error(
              "Failed to add a comment to the issue #%d.",
              issue.number,
            );
            // Don't throw right away and continue to update other issues
          }
        }
      }),
    );
  }

  if (failComment === false || failTitle === false) {
    logger.log("Skip closing issue.");
  } else {
    const srIssues = await findSRIssues(octokit, failTitle, owner, repo);

    debug("found semantic-release issues: %O", srIssues);

    await Promise.all(
      srIssues.map(async (issue) => {
        debug("close issue: %O", issue);
        try {
          const updateIssue = {
            owner,
            repo,
            issue_number: issue.number,
            state: "closed",
          };
          debug("closing issue: %O", updateIssue);
          const {
            data: { html_url: url },
          } = await octokit.request(
            "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
            updateIssue,
          );
          logger.log("Closed issue #%d: %s.", issue.number, url);
        } catch (error) {
          errors.push(error);
          logger.error("Failed to close the issue #%d.", issue.number);
          // Don't throw right away and continue to close other issues
        }
      }),
    );
  }

  if (addReleases !== false && errors.length === 0) {
    const ghRelease = releases.find(
      (release) => release.name && release.name === RELEASE_NAME,
    );
    if (!isNil(ghRelease)) {
      const ghRelaseId = ghRelease.id;
      const additionalReleases = getReleaseLinks(releases);
      if (!isEmpty(additionalReleases) && !isNil(ghRelaseId)) {
        const newBody =
          addReleases === "top"
            ? additionalReleases.concat("\n---\n", nextRelease.notes)
            : nextRelease.notes.concat("\n---\n", additionalReleases);
        await octokit.request(
          "PATCH /repos/{owner}/{repo}/releases/{release_id}",
          {
            owner,
            repo,
            release_id: ghRelaseId,
            body: newBody,
          },
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }
}
