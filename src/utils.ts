import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
// @ts-ignore
import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types';
import { compareCommits, listTags } from './github';
import { Await } from './ts';

type Tags = Await<ReturnType<typeof listTags>>;

export async function getValidTags(prefixRegex: RegExp) {
  const tags = await listTags();

  const invalidTags = tags.filter(
    (tag) => !valid(tag.name.replace(prefixRegex, ''))
  );

  invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));

  const validTags = tags
    .filter((tag) => valid(tag.name.replace(prefixRegex, '')))
    .sort((a, b) =>
      rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, ''))
    );

  validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));

  return validTags;
}

export async function getPreviousTag(tagPrefix: string) {
  const tags = await listTags();
  return (
    tags.find((tag) => tag !== undefined) || {
      name: `${tagPrefix}0.0.0`,
      commit: {
        sha: 'HEAD',
      },
    }
  );
}

export async function getCommits(baseRef: string, headRef: string) {
  const commits = await compareCommits(baseRef, headRef);

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

export function isPr(ref: string) {
  return ref.includes('refs/pull/');
}

export function getLatestTag(
  tags: Tags,
  prefixRegex: RegExp,
  tagPrefix: string
) {
  return (
    tags.find((tag) => !prerelease(tag.name.replace(prefixRegex, ''))) || {
      name: `${tagPrefix}0.0.0`,
      commit: {
        sha: 'HEAD',
      },
    }
  );
}

export function getLatestPrereleaseTag(
  tags: Tags,
  identifier: string,
  prefixRegex: RegExp
) {
  return tags
    .filter((tag) => prerelease(tag.name.replace(prefixRegex, '')))
    .find((tag) => tag.name.replace(prefixRegex, '').match(identifier));
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
