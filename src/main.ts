import * as core from "@actions/core";
import { exec as _exec } from "@actions/exec";
import { context, GitHub } from "@actions/github";
import { inc, ReleaseType } from "semver";
import { analyzeCommits } from "@semantic-release/commit-analyzer";
import { generateNotes } from "@semantic-release/release-notes-generator";

const HASH_SEPARATOR = "|commit-hash:";
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
    const tagMessage = core.getInput("tag_message");
    const releaseBranches = core.getInput("release_branches");
    const createAnnotatedTag = core.getInput("create_annotated_tag");
    const dryRun = core.getInput("dry_run");

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
      .every((branch) => !GITHUB_REF.replace("refs/heads/", "").match(branch));

    await exec("git fetch --tags");

    const hasTag = !!(await exec("git tag")).stdout.trim();
    let tag = "";
    let logs = "";

    if (hasTag) {
      const previousTagSha = (
        await exec("git rev-list --tags --topo-order --max-count=1")
      ).stdout.trim();
      tag = (await exec(`git describe --tags ${previousTagSha}`)).stdout.trim();
      logs = (
        await exec(
          `git log ${tag}..HEAD --pretty=format:'%s%n%b${HASH_SEPARATOR}%h${SEPARATOR}' --abbrev-commit`
        )
      ).stdout.trim();

      core.debug(`Setting previous_tag to: ${tag}`);
      core.setOutput("previous_tag", tag);

      if (previousTagSha === GITHUB_SHA) {
        core.debug("No new commits since previous tag. Skipping...");
        return;
      }
    } else {
      tag = "0.0.0";
      logs = (
        await exec(
          `git log --pretty=format:'%s%n%b${HASH_SEPARATOR}%h${SEPARATOR}' --abbrev-commit`
        )
      ).stdout.trim();
      core.setOutput("previous_tag", tag);
    }

    // for some reason the commits start and end with a `'` on the CI so we ignore it
    const commits = logs
      .split(SEPARATOR)
      .map((x) => {
        const data = x.trim().replace(/^'\n'/g, "").replace(/^'/g, "");
        if (!data) {
          return {};
        }
        const [message, hash] = data.split(HASH_SEPARATOR);
        return {
          message: message.trim(),
          hash: hash.trim(),
        };
      })
      .filter((x) => !!x.message);
    const bump = await analyzeCommits(
      {},
      { commits, logger: { log: console.info.bind(console) } }
    );

    if (!bump && defaultBump === "false") {
      core.debug("No commit specifies the version bump. Skipping...");
      return;
    }

    const semverRegex = /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:0|[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/ig;
    const semverTagArray = semverRegex.exec(tag);
    const semverTag = semverTagArray ? semverTagArray[0] : tag;

    const newVersion = `${inc(semverTag, bump || defaultBump)}${
      preRelease ? `-${GITHUB_SHA.slice(0, 7)}` : ""
    }`;

    const newTag = `${tagPrefix}${newVersion}`;
    const message = tagMessage || newTag;

    core.setOutput("new_version", newVersion);
    core.setOutput("new_tag", newTag);

    core.debug(`New tag: ${newTag}`);

    const changelog = await generateNotes(
      {},
      {
        commits,
        logger: { log: console.info.bind(console) },
        options: {
          repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
        },
        lastRelease: { gitTag: tag },
        nextRelease: { gitTag: newTag, version: newVersion },
      }
    );

    core.setOutput("changelog", changelog);

    if (preRelease) {
      core.debug(
        "This branch is not a release branch. Skipping the tag creation."
      );
      return;
    }

    const tagAlreadyExists = !!(
      await exec(`git tag -l "${newTag}"`)
    ).stdout.trim();

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
        message: message,
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
