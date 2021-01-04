import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
// @ts-ignore
import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types';
import { compareCommits, listTags } from './github';
import { Await } from './ts';

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
  return ref.replace('refs/heads/', '');
}

export function getLatestTag(tags: Await<ReturnType<typeof listTags>>) {
  return (
    tags.find((tag) => !prerelease(tag.name)) || {
      name: '0.0.0',
      commit: {
        sha: 'HEAD',
      },
    }
  );
}

export function getLatestPrereleaseTag(
  tags: Await<ReturnType<typeof listTags>>,
  identifier: string
) {
  return tags
    .filter((tag) => prerelease(tag.name))
    .find((tag) => tag.name.match(identifier));
}

export function mapCustomReleaseRules(customReleaseTypes: string) {
  const releaseRuleSeparator = ',';
  const releaseTypeSeparator = ':';

  return customReleaseTypes
    .split(releaseRuleSeparator)
    .map((customReleaseRule) => customReleaseRule.split(releaseTypeSeparator))
    .filter((customReleaseRule) => {
      if (customReleaseRule.length !== 2) {
        core.warning(
          `${customReleaseRule.join(
            releaseTypeSeparator
          )} is not a valid custom release definition.`
        );
        return false;
      }
      return true;
    })
    .map((customReleaseRule) => {
      const [keyword, release] = customReleaseRule;
      return {
        type: keyword,
        release,
      };
    })
    .filter((customRelease) => {
      if (!DEFAULT_RELEASE_TYPES.includes(customRelease.release)) {
        core.warning(`${customRelease.release} is not a valid release type.`);
        return false;
      }
      return true;
    });
}
