import * as core from "@actions/core";
import { exec } from "@actions/exec";
import github from "@actions/github";
import semver, { ReleaseType } from "semver";

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

    let tag = "";
    let tag_commit = "";

    try {
      const options = {
        listeners: {
          stdout: (data: Buffer) => {
            tag += data.toString();
          }
        }
      };

      await exec(
        "git describe --tags `git rev-list --tags --max-count=1`",
        undefined,
        options
      );
    } catch (err) {}

    if (tag) {
      try {
        const options = {
          listeners: {
            stdout: (data: Buffer) => {
              tag_commit += data.toString();
            }
          }
        };

        await exec(`git rev-list -n 1 ${tag}`, undefined, options);
      } catch (err) {}

      if (tag_commit === GITHUB_SHA) {
        core.debug("No new commits since previous tag. Skipping...");
        return;
      }
    } else if (!tag) {
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

    const octokit = new github.GitHub(core.getInput("github_token"));

    core.debug(`Pushing new tag to the repo`);

    await octokit.git.createRef({
      ...github.context.repo,
      ref: `refs/tags/${newTag}`,
      sha: GITHUB_SHA
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
