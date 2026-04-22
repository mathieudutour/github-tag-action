import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
import { compareCommits, listTags } from './github';
import { defaultChangelogRules } from './defaults';

// Mirror of the list exported by `@semantic-release/commit-analyzer`
// (its internal `lib/default-release-types.js` is not a public export).
// See: https://github.com/semantic-release/commit-analyzer
const DEFAULT_RELEASE_TYPES: readonly string[] = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
];

type Tags = Awaited<ReturnType<typeof listTags>>;

export async function getValidTags(
  prefixRegex: RegExp,
  shouldFetchAllTags: boolean
) {
  const tags = await listTags(shouldFetchAllTags);

  const invalidTags = tags.filter(
    (tag) =>
      !prefixRegex.test(tag.name) || !valid(tag.name.replace(prefixRegex, ''))
  );

  invalidTags.forEach((tag) => {
    core.debug(`Found Invalid Tag: ${tag.name}.`);
  });

  const validTags = tags
    .filter(
      (tag) =>
        prefixRegex.test(tag.name) && valid(tag.name.replace(prefixRegex, ''))
    )
    .sort((a, b) =>
      rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, ''))
    );

  validTags.forEach((tag) => {
    core.debug(`Found Valid Tag: ${tag.name}.`);
  });

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

export function isPr(ref: string) {
  return ref.includes('refs/pull/');
}

export function getLatestTag(
  tags: Tags,
  prefixRegex: RegExp,
  tagPrefix: string
) {
  return (
    tags.find((tag) => !prerelease(tag.name.replace(prefixRegex, ''))) ?? {
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

export interface MappedReleaseRule {
  type: string;
  release: string;
  section: string | undefined;
}

export function mapCustomReleaseRules(
  customReleaseTypes: string
): MappedReleaseRule[] {
  const releaseRuleSeparator = ',';
  const releaseTypeSeparator = ':';

  return customReleaseTypes
    .split(releaseRuleSeparator)
    .filter((customReleaseRule) => {
      const parts = customReleaseRule.split(releaseTypeSeparator);
      const rawType = parts[0];
      const rawRelease = parts[1];

      if (rawType === undefined || rawRelease === undefined) {
        core.warning(
          `${customReleaseRule} is not a valid custom release definition.`
        );
        return false;
      }

      const defaultRule = defaultChangelogRules[rawType.toLowerCase()];
      if (parts.length !== 3) {
        core.debug(
          `${customReleaseRule} doesn't mention the section for the changelog.`
        );
        core.debug(
          defaultRule
            ? `Default section (${defaultRule.section ?? ''}) will be used instead.`
            : "The commits matching this rule won't be included in the changelog."
        );
      }

      if (!DEFAULT_RELEASE_TYPES.includes(rawRelease)) {
        core.warning(`${rawRelease} is not a valid release type.`);
        return false;
      }

      return true;
    })
    .map((customReleaseRule) => {
      const parts = customReleaseRule.split(releaseTypeSeparator);
      const type = parts[0] ?? '';
      const release = parts[1] ?? '';
      const section = parts[2];
      const defaultRule = defaultChangelogRules[type.toLowerCase()];

      const resolvedSection: string | undefined =
        section ?? defaultRule?.section;
      return {
        type,
        release,
        section: resolvedSection,
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

  return Object.values(mergedRules).filter((rule) => Boolean(rule.section));
}
