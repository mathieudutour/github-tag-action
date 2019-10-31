import * as core from "@actions/core";
import { exec as _exec } from "@actions/exec";
import { context, GitHub } from "@actions/github";
import semver, { ReleaseType } from "semver";

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

    const code = await _exec(
      "git describe --tags `git rev-list --tags --max-count=1`",
      undefined,
      options
    );

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
    // @ts-ignore
    const bump: ReleaseType = core.getInput("default_bump");
    const tagPrefix = core.getInput("tag_prefix");
    const releaseBranches = core.getInput("release_branches");

    const { GITHUB_REF, GITHUB_SHA } = process.env;

    if (!GITHUB_REF) {
      core.setFailed("Missing GITHUB_REF");
      return;
    }

    if (!GITHUB_SHA) {
      core.setFailed("Missing GITHUB_SHA");
      return;
    }

    const preRelease = releaseBranches
      .split(",")
      .every(branch => !GITHUB_REF.replace("refs/heads/", "").match(branch));

    const previousTagSha = (await exec("git rev-list --tags --max-count=1"))
      .stdout;
    let tag = "";

    if (previousTagSha) {
      tag = (await exec(`git describe --tags ${previousTagSha}`)).stdout;
      const tag_commit = (await exec(`git rev-list -n 1 ${tag}`)).stdout;

      if (tag_commit === GITHUB_SHA) {
        core.debug("No new commits since previous tag. Skipping...");
        return;
      }
    } else {
      tag = "0.0.0";
    }

    const newTag = `${tagPrefix}${semver.inc(tag, bump)}${
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
