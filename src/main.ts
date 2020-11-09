import * as core from "@actions/core";
import {exec as _exec} from "@actions/exec";
import {context, GitHub} from "@actions/github";
import {inc, parse, ReleaseType, valid} from "semver";
import {analyzeCommits} from "@semantic-release/commit-analyzer";
import {generateNotes} from "@semantic-release/release-notes-generator";

const HASH_SEPARATOR = "|commit-hash:";
const SEPARATOR = "==============================================";

async function getValidTags(githubToken: string) {
  const octokit = new GitHub(githubToken);

  const tags = await octokit.repos.listTags({
    ...context.repo,
    per_page: 100
  });

  const invalidTags = tags.data
    .map(tag => tag.name)
    .filter(name => !valid(name));

  invalidTags.map(name => core.debug(`Invalid: ${name}.`));

  const validTags = tags.data
    .filter(tag => valid(tag.name));

  validTags.map(tag => core.debug(`Valid: ${tag.name}.`));

  return validTags;
}

async function getCommits(githubToken: string, sha: string) {
  const octokit = new GitHub(githubToken);

  const commits = await octokit.repos.compareCommits({
    ...context.repo,
    base: sha,
    head: 'HEAD'
  });

  return commits.data.commits
    .filter(commit => !!commit.commit.message)
    .map(commit => ({
      message: commit.commit.message,
      hash: commit.sha
    }));
}

function getBranchFromRef(ref: string): string {
  return ref.replace("refs/heads/", "");
}

async function exec(command: string) {
  let stdout = "";
  let stderr = "";

  try {
    const options = {
      listeners: {
        stdout: (data: Buffer) => {
          stdout += data.toString();
        },
        stderr: (data: Buffer) => {
          stderr += data.toString();
        },
      },
    };

    const code = await _exec(command, undefined, options);

    return {
      code,
      stdout,
      stderr,
    };
  } catch (err) {
    return {
      code: 1,
      stdout,
      stderr,
      error: err,
    };
  }
}

async function run() {
  try {
    const defaultBump = core.getInput("default_bump") as ReleaseType | "false";
    const tagPrefix = core.getInput("tag_prefix");
    const customTag = core.getInput("custom_tag")
    const releaseBranches = core.getInput("release_branches");
    const preReleaseBranches = core.getInput("pre_release_branches");
    const appendToPreReleaseTag = core.getInput("append_to_pre_release_tag");
    const createAnnotatedTag = core.getInput("create_annotated_tag");
    const dryRun = core.getInput("dry_run");
    const githubToken = core.getInput("github_token")

    const {GITHUB_REF, GITHUB_SHA} = process.env;

    if (!GITHUB_REF) {
      core.setFailed("Missing GITHUB_REF");
      return;
    }

    if (!GITHUB_SHA) {
      core.setFailed("Missing GITHUB_SHA");
      return;
    }

    const currentBranch = getBranchFromRef(GITHUB_REF);
    const releaseBranch = releaseBranches
      .split(",")
      .some((branch) => currentBranch.match(branch));
    const preReleaseBranch = preReleaseBranches
      .split(",")
      .some((branch) => currentBranch.match(branch));

    if (releaseBranch && preReleaseBranch) {
      core.setFailed("Branch cannot be both pre-release and release at the same time.");
    }

    const tags = await getValidTags(githubToken);
    const previousTag = tags[0];

    let previousTagName;
    let commits;
    if (previousTag) {
      previousTagName = parse(previousTag.name);
      commits = await getCommits(githubToken, previousTag.commit.sha);
    } else {
      previousTagName = parse("0.0.0");
      commits = await getCommits(githubToken, 'HEAD');
    }

    core.debug(`Setting previous_tag to: ${previousTagName}`);
    core.setOutput("previous_tag", previousTagName.version);

    const bump = await analyzeCommits(
      {},
      {commits, logger: {log: console.info.bind(console)}}
    );

    if (!bump && defaultBump === "false") {
      core.debug("No commit specifies the version bump. Skipping...");
      return;
    }

    const releaseType: ReleaseType = preReleaseBranch ? 'prerelease' : (bump || defaultBump);
    const incrementedVersion = inc(previousTagName, releaseType, appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch);
    core.info(`Incremented version after applying conventional commits: ${incrementedVersion}.`);

    const newVersion = customTag ? customTag : incrementedVersion;
    const newTag = `${tagPrefix}${newVersion}`;
    core.info(`New tag after applying prefix: ${newTag}.`);

    core.setOutput("new_version", newVersion);
    core.setOutput("new_tag", newTag);

    const changelog = await generateNotes(
      {},
      {
        commits,
        logger: {log: console.info.bind(console)},
        options: {
          repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
        },
        lastRelease: {gitTag: previousTag.name },
        nextRelease: {gitTag: newTag, version: newVersion},
      }
    );

    core.setOutput("changelog", changelog);

    if (!releaseBranch && !preReleaseBranch) {
      core.info("This branch is neither a release nor a pre-release branch. Skipping the tag creation.");
      return;
    }

    const tagAlreadyExists = !!(await exec(`git tag -l "${newTag}"`)).stdout.trim();

    if (tagAlreadyExists) {
      core.debug("This tag already exists. Skipping the tag creation.");
      return;
    }

    if (/true/i.test(dryRun)) {
      core.info("Dry run: not performing tag action.");
      return;
    }

    const octokit = new GitHub(core.getInput("github_token"));

    if (createAnnotatedTag === "true") {
      core.debug(`Creating annotated tag`);

      const tagCreateResponse = await octokit.git.createTag({
        ...context.repo,
        tag: newTag,
        message: newTag,
        object: GITHUB_SHA,
        type: "commit",
      });

      core.debug(`Pushing annotated tag to the repo`);

      await octokit.git.createRef({
        ...context.repo,
        ref: `refs/tags/${newTag}`,
        sha: tagCreateResponse.data.sha,
      });
      return;
    }

    core.debug(`Pushing new tag to the repo`);

    await octokit.git.createRef({
      ...context.repo,
      ref: `refs/tags/${newTag}`,
      sha: GITHUB_SHA,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
