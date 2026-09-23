import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
// @ts-ignore
import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types';
import {
  compareCommits,
  listCommits,
  getCommitFiles,
  listTags,
} from './github';
import { minimatch } from 'minimatch';
import { defaultChangelogRules } from './defaults';
import { Await } from './ts';

type Tags = Await<ReturnType<typeof listTags>>;

export async function getValidTags(
  prefixRegex: RegExp,
  shouldFetchAllTags: boolean,
  tagSearchPattern = '',
  strictPrefix = false
) {
  const tags = (await listTags(shouldFetchAllTags)).filter(
    (tag) =>
      (!tagSearchPattern || minimatch(tag.name, tagSearchPattern)) &&
      (!strictPrefix || !tag.name.replace(prefixRegex, '').startsWith('v'))
  );

  const invalidTags = tags.filter(
    (tag) =>
      !prefixRegex.test(tag.name) || !valid(tag.name.replace(prefixRegex, ''))
  );

  invalidTags.forEach((tag) => core.debug(`Found Invalid Tag: ${tag.name}.`));

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
  const commits = baseRef
    ? await compareCommits(baseRef, headRef)
    : await listCommits(headRef);

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
  return (
    ref.startsWith('refs/pull/') ||
    [
      'pull_request',
      'pull_request_target',
      'pull_request_review',
      'pull_request_review_comment',
    ].includes(process.env.GITHUB_EVENT_NAME || '')
  );
}

export function getLatestTag(
  tags: Tags,
  prefixRegex: RegExp,
  tagPrefix: string
) {
  return (
    tags.find(
      (tag) =>
        prefixRegex.test(tag.name) &&
        !prerelease(tag.name.replace(prefixRegex, ''))
    ) || {
      name: `${tagPrefix}0.0.0`,
      commit: {
        sha: '',
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
    .find(
      (tag) =>
        String(prerelease(tag.name.replace(prefixRegex, ''))?.[0]) ===
        identifier
    );
}

export function mapCustomReleaseRules(customReleaseTypes: string) {
  return customReleaseTypes
    .split(',')
    .filter((rule) => rule.trim())
    .flatMap((rule) => {
      const parts = rule
        .trim()
        .split(/(?<!\\):/)
        .map((part) => part.replace(/\\:/g, ':').trim());
      const [type, release, section] = parts;
      if (!type || !DEFAULT_RELEASE_TYPES.includes(release)) {
        core.warning(`${rule} is not a valid custom release definition.`);
        return [];
      }
      return [
        {
          type,
          release,
          section:
            section || defaultChangelogRules[type.toLowerCase()]?.section,
        },
      ];
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

export function matchesBranch(branch: string, patterns: string) {
  return patterns
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean)
    .some((pattern) => new RegExp(`^(?:${pattern})$`).test(branch));
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type AnalyzedCommit = { message: string; hash: string | null };
export async function filterCommits(
  commits: AnalyzedCommit[],
  paths: string[],
  scopes: string[],
  ignore: string[],
  squash: boolean
) {
  const result: AnalyzedCommit[] = [];
  for (const commit of commits) {
    if (ignore.some((keyword) => commit.message.includes(keyword))) continue;
    if (paths.length) {
      if (!commit.hash)
        throw new Error('Path filtering requires a commit SHA.');
      const files = await getCommitFiles(commit.hash);
      if (
        !files.some((file) =>
          paths.some(
            (path) =>
              file === path.replace(/\/$/, '') ||
              file.startsWith(`${path.replace(/\/$/, '')}/`) ||
              minimatch(file, path, { dot: true })
          )
        )
      )
        continue;
    }
    // Opt-in: GitHub squash bodies may contain conventional subjects as bullets.
    const messages = squash
      ? [
          commit.message,
          ...commit.message
            .split('\n')
            .slice(1)
            .flatMap((line) => {
              const match = line.match(/^\s*[*-] (.+?(?:\([^)]*\))?!?: .+)$/u);
              return match ? [match[1]] : [];
            }),
        ]
      : [commit.message];
    for (const message of [...new Set(messages)]) {
      if (ignore.some((keyword) => message.includes(keyword))) continue;
      const scope = message.match(/^[^\n]+?\(([^)]+)\)!?: /)?.[1];
      if (
        scopes.length &&
        (!scope || !scopes.some((pattern) => minimatch(scope, pattern)))
      )
        continue;
      result.push({ ...commit, message });
    }
  }
  return result;
}
