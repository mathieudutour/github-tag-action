import * as core from '@actions/core';
import { gt, inc, parse, prerelease, ReleaseType, valid } from 'semver';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';
import {
  getBranchFromRef,
  isPr,
  getCommits,
  getLatestPrereleaseTag,
  getLatestTag,
  getValidTags,
  mapCustomReleaseRules,
  matchesBranch,
  escapeRegExp,
  filterCommits,
} from './utils';
import {
  createTag,
  createLocalTag,
  getRepository,
  resolveCommitRef,
} from './github';
import { nextVersion } from './version';
import { commitConfig } from './commits';

function bool(name: string, fallback = false) {
  const input = core.getInput(name);
  if (!input) return fallback;
  if (!/^(true|false)$/i.test(input))
    throw new Error(`${name} must be true or false.`);
  return input.toLowerCase() === 'true';
}
function csv(name: string) {
  return core
    .getInput(name)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}
function bumpInput(name: string, fallback: string) {
  const value = core.getInput(name) || fallback;
  if (
    ![
      'false',
      'major',
      'minor',
      'patch',
      'premajor',
      'preminor',
      'prepatch',
      'prerelease',
    ].includes(value)
  )
    throw new Error(`${name} is not a valid bump type.`);
  return value as ReleaseType | 'false';
}

export default async function main() {
  // Always ignore tag-triggered runs, even when a ref override is configured.
  if (process.env.GITHUB_REF?.startsWith('refs/tags/')) {
    core.info('Tag event: skipping to prevent recursive releases.');
    return;
  }
  const ref = core.getInput('ref') || process.env.GITHUB_REF;
  let commitRef =
    core.getInput('commit_sha') ||
    core.getInput('ref') ||
    process.env.GITHUB_SHA;
  if (!ref || !commitRef)
    throw new Error('Missing ref/GITHUB_REF or commit_sha/GITHUB_SHA.');
  if (!/^[a-f0-9]{7,40}$/i.test(commitRef))
    commitRef = await resolveCommitRef(commitRef);
  const branch = getBranchFromRef(ref);
  const pullRequest = isPr(ref);
  const release =
    !pullRequest && matchesBranch(branch, core.getInput('release_branches'));
  const pre =
    !release &&
    !pullRequest &&
    matchesBranch(branch, core.getInput('pre_release_branches'));
  const preview = !release && !pre;
  const tagPrefix = core.getInput('tag_prefix');
  const prefixRegex = new RegExp(`^${escapeRegExp(tagPrefix)}`);
  const identifier = (
    core.getInput('append_to_pre_release_tag') || branch
  ).replace(/[^a-zA-Z0-9-]/g, '-');
  const tags = await getValidTags(
    prefixRegex,
    bool('fetch_all_tags', true),
    core.getInput('tag_search_pattern'),
    bool('prefix_match_tag')
  );
  const initial = core.getInput('initial_version') || '0.0.0';
  if (!valid(initial))
    throw new Error('initial_version must be a semantic version.');
  const latest = getLatestTag(tags, prefixRegex, tagPrefix);
  const stableVersion = latest.commit.sha
    ? latest.name.replace(prefixRegex, '')
    : initial;
  const latestPre = pre
    ? getLatestPrereleaseTag(tags, identifier, prefixRegex)
    : undefined;
  let previous =
    latestPre && gt(latestPre.name.replace(prefixRegex, ''), stableVersion)
      ? latestPre
      : latest;
  const previousInput = core.getInput('previous_tag');
  if (previousInput)
    previous = { name: previousInput, commit: { sha: previousInput } };
  const previousVersion =
    core.getInput('previous_version') ||
    (previous.commit.sha ? previous.name.replace(prefixRegex, '') : initial);
  if (!valid(previousVersion))
    throw new Error(
      'previous_tag (after removing tag_prefix) and initial_version must be semantic versions.'
    );
  core.setOutput(
    'previous_tag',
    previous.commit.sha ? previous.name : `${tagPrefix}${initial}`
  );
  core.setOutput('previous_version', previousVersion);
  core.setOutput('latest_release_tag', latest.name);
  core.setOutput('latest_release_version', stableVersion);
  const rawCommits = await getCommits(previous.commit.sha, commitRef);
  const commits = await filterCommits(
    rawCommits,
    csv('path_filter'),
    csv('scopes'),
    csv('ignore_keywords'),
    bool('parse_squash_commits')
  );
  const rules = mapCustomReleaseRules(core.getInput('custom_release_rules'));
  const config = await commitConfig(rules);
  let version = core.getInput('custom_tag');
  let releaseType = 'custom';
  const force = pre
    ? core.getInput('force_prerelease_bump')
    : core.getInput('force_bump');
  if (!version) {
    if (!commits.length && !force) {
      core.info('No eligible commits. Skipping version creation.');
      return;
    }
    const analyzed = await analyzeCommits(
      {
        parserOpts: config.parserOpts,
        releaseRules: rules.map(({ section, ...rule }) => rule),
      },
      { commits, logger: { log: core.info } }
    );
    const defaultBump = bumpInput('default_bump', 'patch');
    const defaultPre = bumpInput('default_prerelease_bump', 'prerelease');
    let bump = (
      force
        ? bumpInput(pre ? 'force_prerelease_bump' : 'force_bump', 'false')
        : analyzed || (pre ? defaultPre : defaultBump)
    ) as ReleaseType | 'false';
    if (bump === 'false') return;
    if (pre && !prerelease(previousVersion) && bump === 'prerelease')
      bump = bumpInput(
        'default_draft_bump',
        defaultBump === 'false' ? 'patch' : defaultBump
      );
    if (bump === 'false') return;
    releaseType = pre ? (bump.startsWith('pre') ? bump : `pre${bump}`) : bump;
    const next = nextVersion(
      previousVersion,
      previous.commit.sha ? stableVersion : initial,
      bump,
      pre ? identifier : undefined,
      !!force
    );
    if (!next) throw new Error('Could not increment version.');
    version = next;
    const oldCore = parse(previousVersion)!;
    const newCore = parse(version)!;
    if (
      pre &&
      oldCore.prerelease.length &&
      oldCore.major === newCore.major &&
      oldCore.minor === newCore.minor &&
      oldCore.patch === newCore.patch
    )
      releaseType = 'prerelease';
    if (preview) {
      const sha = commitRef;
      const parsed = parse(version)!;
      version = `${parsed.major}.${parsed.minor}.${parsed.patch}-${sha.slice(
        0,
        7
      )}`;
    }
  } else if (bool('custom_tag_prerelease')) {
    if (!valid(version))
      throw new Error('custom_tag_prerelease requires a semantic custom_tag.');
    const existing = getLatestPrereleaseTag(tags, identifier, prefixRegex);
    const candidate = existing?.name.replace(prefixRegex, '');
    const base = parse(version)!;
    const prior = candidate && parse(candidate);
    version =
      prior &&
      prior.major === base.major &&
      prior.minor === base.minor &&
      prior.patch === base.patch
        ? inc(candidate!, 'prerelease', identifier)!
        : `${base.major}.${base.minor}.${base.patch}-${identifier}.0`;
  }
  const newTag = `${tagPrefix}${version}`;
  const { owner, repo } = getRepository();
  const repositoryUrl =
    core.getInput('repository_url') ||
    `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${owner}/${repo}`;
  const changelog = await generateNotes(config, {
    commits,
    logger: { log: core.info },
    options: { repositoryUrl },
    lastRelease: { gitTag: previous.commit.sha ? previous.name : '' },
    nextRelease: { gitTag: newTag, version },
  });
  core.setOutput('release_type', releaseType);
  core.setOutput('new_version', version);
  core.setOutput('new_tag', newTag);
  core.setOutput('prerelease', !!(valid(version) && prerelease(version)));
  core.setOutput('changelog', changelog);
  core.setOutput(
    'changelog_url',
    previous.commit.sha
      ? `${repositoryUrl}/compare/${encodeURIComponent(
          previous.name
        )}...${encodeURIComponent(newTag)}`
      : `${repositoryUrl}/commits/${encodeURIComponent(newTag)}`
  );
  if (bool('dry_run')) return;
  const push = bool('push', true);
  const forceUpdate = bool('force_update');
  const existing = tags.find((tag) => tag.name === newTag);
  const targetSha = existing && !forceUpdate ? existing.commit.sha : commitRef;
  if (!preview && push) {
    if (!existing || forceUpdate) {
      if (forceUpdate)
        await createTag(newTag, bool('create_annotated_tag'), commitRef, true);
      else await createTag(newTag, bool('create_annotated_tag'), commitRef);
    }
    if (bool('rolling_tags') && valid(version) && !prerelease(version)) {
      const parsed = parse(version)!;
      for (const alias of [
        `${tagPrefix}${parsed.major}`,
        `${tagPrefix}${parsed.major}.${parsed.minor}`,
      ])
        await createTag(alias, false, targetSha, true);
    }
  }
  if (bool('create_local_tag') || !push)
    await createLocalTag(
      newTag,
      targetSha,
      bool('create_annotated_tag'),
      forceUpdate
    );
}
