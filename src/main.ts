import * as core from "@actions/core";
import { exec as _exec } from "@actions/exec";
import { context, GitHub } from "@actions/github";
import semver, { ReleaseType } from "semver";
import { analyzeCommits } from "@semantic-release/commit-analyzer";

const SEPARATOR = "==============================================";

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
        }
      }
    };

    const code = await _exec(command, undefined, options);

    return {
      code,
      stdout,
      stderr
    };
  } catch (err) {
    return {
      code: 1,
      stdout,
      stderr,
      error: err
    };
  }
}

async function run() {
  try {
    const defaultBump = core.getInput("default_bump") as ReleaseType;
    const tagPrefix = core.getInput("tag_prefix");
    const releaseBranches = core.getInput("release_branches");
    const createAnnotatedTag = core.getInput("create_annotated_tag");

    const { GITHUB_REF, GITHUB_SHA, GITHUB_REPOSITORY } = process.env;

    if (!GITHUB_REF) {
      core.setFailed("Missing GITHUB_REF");
      return;
    }

    if (!GITHUB_SHA) {
      core.setFailed("Missing GITHUB_SHA");
      return;
    }
    if (createAnnotatedTag && !GITHUB_REPOSITORY) {
      core.setFailed("Missing GITHUB_REPOSITORY");
      return;
    }

    const preRelease = releaseBranches
      .split(",")
      .every(branch => !GITHUB_REF.replace("refs/heads/", "").match(branch));

    const hasTag = !!(await exec("git tag")).stdout.trim();
    let tag = "";
    let logs = "";

    if (hasTag) {
      const previousTagSha = (
        await exec("git rev-list --tags --max-count=1")
      ).stdout.trim();
      tag = (await exec(`git describe --tags ${previousTagSha}`)).stdout.trim();
      logs = (
        await exec(
          `git log ${tag}..HEAD --pretty=format:'%s%n%b${SEPARATOR}' --abbrev-commit`
        )
      ).stdout.trim();

      if (previousTagSha === GITHUB_SHA) {
        core.debug("No new commits since previous tag. Skipping...");
        core.setOutput("previous_tag", tag);
        return;
      }
    } else {
      tag = "0.0.0";
      logs = (
        await exec(
          `git log --pretty=format:'%s%n%b${SEPARATOR}' --abbrev-commit`
        )
      ).stdout.trim();
      core.setOutput("previous_tag", tag);
    }

    const commits = logs.split(SEPARATOR).map(x => ({ message: x }));
    const bump = await analyzeCommits(
      {},
      { commits, logger: { log: core.debug.bind(core) } }
    );

    const newTag = `${tagPrefix}${semver.inc(tag, bump || defaultBump)}${
      preRelease ? `-${GITHUB_SHA.slice(0, 7)}` : ""
    }`;

    core.setOutput("new_tag", newTag);

    core.debug(`New tag: ${newTag}`);

    if (preRelease) {
      core.debug(
        "This branch is not a release branch. Skipping the tag creation."
      );
      return;
    }

    const octokit = new GitHub(core.getInput("github_token"));

    core.debug(`Pushing new tag to the repo`);

    if (createAnnotatedTag) {
      core.debug(`Creating annotated tag`);

      const [owner, repository] = GITHUB_REPOSITORY!.split("/");
      
      core.debug(`owner: ${owner}`);
      core.debug(`repository ${repository}`);

      await octokit.git.createTag({
        owner: owner,
        repo: repository,
        tag: newTag,
        message: newTag,
        object: GITHUB_SHA,
        type: "commit"
      });
    }

    await octokit.git.createRef({
      ...context.repo,
      ref: `refs/tags/${newTag}`,
      sha: GITHUB_SHA
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
