import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
// @ts-ignore
import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types';
import { compareCommits, listTags } from './github';
import { defaultChangelogRules } from './defaults';
import { Await } from './ts';

type Tags = Await<ReturnType<typeof listTags>>;

export async function getValidTags(
  prefixRegex: RegExp,
  shouldFetchAllTags: boolean
) {
  const tags = await listTags(shouldFetchAllTags);

  const invalidTags = tags.filter(
    (tag) =>
      !prefixRegex.test(tag.name) || !valid(tag.name.replace(prefixRegex, ''))
  );

  invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));

  const validTags = tags
    .filter(
      (tag) =>
        prefixRegex.test(tag.name) && valid(tag.name.replace(prefixRegex, ''))
    )
    .sort((a, b) =>
      rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, ''))
    );

  validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));

  return validTags;
}

export async function getCommits(
  baseRef: string,
  headRef: string
): Promise<{ message: string; hash: string | null }[]> {
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

export function isPr(eventName: string) {
  return eventName.includes('pull_request');
}

export function isPrereleaseBranch(
  preReleaseBranches: string,
  currentBranch: string
) {
  if (preReleaseBranches) {
    return preReleaseBranches
      .split(',')
      .some((branch) => currentBranch.match(branch));
  }
  return false;
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
    .filter((customReleaseRule) => {
      const parts = customReleaseRule.split(releaseTypeSeparator);

      if (parts.length < 2) {
        core.warning(
          `${customReleaseRule} is not a valid custom release definition.`
        );
        return false;
      }

      const defaultRule = defaultChangelogRules[parts[0].toLowerCase()];
      if (customReleaseRule.length !== 3) {
        core.debug(
          `${customReleaseRule} doesn't mention the section for the changelog.`
        );
        core.debug(
          defaultRule
            ? `Default section (${defaultRule.section}) will be used instead.`
            : "The commits matching this rule won't be included in the changelog."
        );
      }

      if (!DEFAULT_RELEASE_TYPES.includes(parts[1])) {
        core.warning(`${parts[1]} is not a valid release type.`);
        return false;
      }

      return true;
    })
    .map((customReleaseRule) => {
      const [type, release, section] =
        customReleaseRule.split(releaseTypeSeparator);
      const defaultRule = defaultChangelogRules[type.toLowerCase()];

      return {
        type,
        release,
        section: section || defaultRule?.section,
      };
    });
}

export function mergeWithDefaultChangelogRules(
  mappedReleaseRules: ReturnType<typeof mapCustomReleaseRules> = []
) {
  const mergedRules = mappedReleaseRules.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.type]: curr,
    }),
    { ...defaultChangelogRules }
  );

  return Object.values(mergedRules).filter((rule) => !!rule.section);
}

export function getIdentifier(
  appendToPreReleaseTag: string,
  currentBranch: string,
  isPullRequest: boolean,
  isPrerelease: boolean,
  commitRef: string
): string {
  // On prerelease: Sanitize identifier according to
  // https://semver.org/#backusnaur-form-grammar-for-valid-semver-versions
  let identifier: string;
  if (isPullRequest) {
    // On pull request, use commit SHA for identifier
    return commitRef.slice(0, 7).replace(/[^a-zA-Z0-9-]/g, '-');
  }
  identifier = (
    appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch
  ).replace(/[^a-zA-Z0-9-]/g, '-');
  return identifier;
}
