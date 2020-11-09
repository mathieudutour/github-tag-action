import * as core from "@actions/core";
import {exec as _exec} from "@actions/exec";
import {context, GitHub} from "@actions/github";
import {inc, parse, ReleaseType, valid} from "semver";
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

function getLatestTag(tags: object[]) {
  return {
    name: '0.0.0',
    commit: {
      sha: 'HEAD'
    },
    ...tags[0]
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
      core.setFailed("Branch cannot be both pre-release and release at the same time.");
      return;
    }

    const validTags = await getValidTags(githubToken);
    console.log(validTags);
    const tag = getLatestTag(validTags);
    const previousTag = parse(tag.name);
    const commits = await getCommits(githubToken, tag.commit.sha);
    console.log(commits);

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
    console.log(bump);

    if (!bump && defaultBump === "false") {
      core.debug("No commit specifies the version bump. Skipping...");
      return;
    }

    const releaseType: ReleaseType = preReleaseBranch ? 'prerelease' : (bump || defaultBump);
    console.log(previousTag, releaseType, appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch);
    const incrementedVersion = inc(previousTag, releaseType, appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch);
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
        lastRelease: {gitTag: previousTag},
        nextRelease: {gitTag: newTag, version: newVersion},
      }
    );

    core.setOutput("changelog", changelog);

    if (!releaseBranch && !preReleaseBranch) {
      core.info("This branch is neither a release nor a pre-release branch. Skipping the tag creation.");
      return;
    }

    if (validTags.map(tag => tag.name).includes(newTag)) {
      core.debug("This tag already exists. Skipping the tag creation.");
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
