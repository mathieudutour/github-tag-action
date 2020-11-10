import * as core from "@actions/core";
import {context, GitHub} from "@actions/github";
import {inc, parse, ReleaseType, valid, gte, rcompare, prerelease} from "semver";
import {analyzeCommits} from "@semantic-release/commit-analyzer";
import {generateNotes} from "@semantic-release/release-notes-generator";

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
    .filter(tag => valid(tag.name))
    .sort((a, b) => rcompare(a.name, b.name));

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

function getLatestTag(tags: object[]) {
  return {
    name: '0.0.0',
    commit: {
      sha: 'HEAD'
    },
    // @ts-ignore
    ...tags.find(tag => !prerelease(tag.name))
  };
}

async function createTag(githubToken: string, newTag: string, createAnnotatedTag: boolean, GITHUB_SHA: string) {
  const octokit = new GitHub(githubToken);

  let createdTag;
  if (createAnnotatedTag) {
    core.debug(`Creating annotated tag.`);
    createdTag = await octokit.git.createTag({
      ...context.repo,
      tag: newTag,
      message: newTag,
      object: GITHUB_SHA,
      type: "commit",
    });
  }

  core.debug(`Pushing new tag to the repo.`);
  await octokit.git.createRef({
    ...context.repo,
    ref: `refs/tags/${newTag}`,
    sha: createAnnotatedTag ? createdTag.data.sha : GITHUB_SHA,
  });
}

function getLatestPrereleaseTag(tags: object[], identifier: string) {
  const prereleaseTags = tags
    // @ts-ignore
    .filter(tag => prerelease(tag.name))
    // @ts-ignore
    .filter(tag => tag.name.match(identifier));

  console.log(prereleaseTags);

  return prereleaseTags[0];
}

async function run() {
  try {
    const defaultBump = core.getInput("default_bump") as ReleaseType | "false";
    const tagPrefix = core.getInput("tag_prefix");
    const customTag = core.getInput("custom_tag")
    const releaseBranches = core.getInput("release_branches");
    const preReleaseBranches = core.getInput("pre_release_branches");
    const appendToPreReleaseTag = core.getInput("append_to_pre_release_tag");
    const createAnnotatedTag = !!core.getInput("create_annotated_tag");
    const dryRun = core.getInput("dry_run");
    const githubToken = core.getInput("github_token")

    const {GITHUB_REF, GITHUB_SHA} = process.env;

    if (!GITHUB_REF) {
      core.setFailed("Missing GITHUB_REF.");
      return;
    }

    if (!GITHUB_SHA) {
      core.setFailed("Missing GITHUB_SHA.");
      return;
    }

    const currentBranch = getBranchFromRef(GITHUB_REF);
    const releaseBranch = releaseBranches
      .split(",")
      .some(branch => currentBranch.match(branch));
    const preReleaseBranch = preReleaseBranches
      .split(",")
      .some(branch => currentBranch.match(branch));

    if (releaseBranch && preReleaseBranch) {
      core.setFailed("Branch must not be both pre-release and release at the same time.");
      return;
    }

    const validTags = await getValidTags(githubToken);
    const tag = getLatestTag(validTags);
    const prereleaseTag = getLatestPrereleaseTag(validTags, currentBranch);
    // @ts-ignore
    const previousTag = parse(gte(tag.name, prereleaseTag.name) ? tag.name : prereleaseTag.name);
    const commits = await getCommits(githubToken, tag.commit.sha);

    if (!previousTag) {
      core.setFailed('Could not parse previous tag.');
      return;
    }

    core.info(`Previous tag was ${previousTag}.`);
    core.setOutput("previous_tag", previousTag.version);

    const bump = await analyzeCommits(
      {},
      {commits, logger: {log: console.info.bind(console)}}
    );

    if (!bump && defaultBump === "false") {
      core.debug("No commit specifies the version bump. Skipping the tag creation.");
      return;
    }

    const releaseType: ReleaseType = preReleaseBranch ? 'prerelease' : (bump || defaultBump);

    const incrementedVersion = inc(previousTag, releaseType, appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch);
    if (!incrementedVersion) {
      core.setFailed('Could not increment version.');
      return;
    }

    const validVersion = valid(incrementedVersion);
    if (!validVersion) {
      core.setFailed(`${incrementedVersion} is not a valid semver.`);
      return;
    }

    const newVersion = customTag ? customTag : incrementedVersion;
    core.info(`New version is ${newVersion}.`);
    core.setOutput("new_version", newVersion);

    const newTag = `${tagPrefix}${newVersion}`;
    core.info(`New tag after applying prefix is ${newTag}.`);
    core.setOutput("new_tag", newTag);

    const changelog = await generateNotes(
      {},
      {
        commits,
        logger: {log: console.info.bind(console)},
        options: {
          repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
        },
        lastRelease: {gitTag: tag.name},
        nextRelease: {gitTag: newTag, version: newVersion},
      }
    );
    core.info(`Changelog is ${changelog}.`);
    core.setOutput("changelog", changelog);

    if (!releaseBranch && !preReleaseBranch) {
      core.info("This branch is neither a release nor a pre-release branch. Skipping the tag creation.");
      return;
    }

    if (validTags.map(tag => tag.name).includes(newTag)) {
      core.info("This tag already exists. Skipping the tag creation.");
      return;
    }

    if (/true/i.test(dryRun)) {
      core.info("Dry run: not performing tag action.");
      return;
    }

    await createTag(githubToken, newTag, createAnnotatedTag, GITHUB_SHA);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
