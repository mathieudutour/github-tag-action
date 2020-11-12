import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import { prerelease, rcompare, valid } from "semver";
import DEFAULT_RELEASE_TYPES from "@semantic-release/commit-analyzer/lib/default-release-types.js";
import { compareCommits, listTags } from "./github";

export async function getValidTags() {
  const tags = await listTags();

  const invalidTags = tags
    .map((tag) => tag.name)
    .filter((name) => !valid(name));

  invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));

  const validTags = tags
    .filter((tag) => valid(tag.name))
    .sort((a, b) => rcompare(a.name, b.name));

  validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));

  return validTags;
}

export async function getCommits(sha: string) {
  const commits = await compareCommits(sha);

  return commits
    .filter((commit) => !!commit.commit.message)
    .map((commit) => ({
      message: commit.commit.message,
      hash: commit.sha,
    }));
}

export function getBranchFromRef(ref: string) {
  return ref.replace("refs/heads/", "");
}

export function getLatestTag(tags: Octokit.ReposListTagsResponseItem[]) {
  return (
    tags.find((tag) => !prerelease(tag.name)) || {
      name: "0.0.0",
      commit: {
        sha: "HEAD",
      },
    }
  );
}

export function getLatestPrereleaseTag(
  tags: Octokit.ReposListTagsResponseItem[],
  identifier: string
) {
  return tags
    .filter((tag) => prerelease(tag.name))
    .find((tag) => tag.name.match(identifier));
}

export function mapCustomReleaseTypes(
  customReleaseTypes: string
) {
  return customReleaseTypes
    .split(';')
    .map(part => {
      const custom = part.split(':');
      if (custom.length !== 2) {
        core.warning(`${part} is not a valid custom release definition.`);
        return null;
      }
      const [keyword, release] = custom;
      return {
        type: keyword,
        release
      };
    })
    .filter(customRelease => DEFAULT_RELEASE_TYPES.includes(customRelease?.release));
}
