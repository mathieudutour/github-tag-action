import * as core from '@actions/core';
import { gte, inc, parse, ReleaseType, SemVer, valid } from 'semver';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';
import {
  getBranchFromRef,
  getCommits,
  getLatestPrereleaseTag,
  getLatestTag,
  getValidTags,
  mapCustomReleaseRules,
} from './utils';
import { createTag } from './github';

export default async function main() {
  const defaultBump = core.getInput('default_bump') as ReleaseType | 'false';
  const tagPrefix = core.getInput('tag_prefix');
  const customTag = core.getInput('custom_tag');
  const releaseBranches = core.getInput('release_branches');
  const preReleaseBranches = core.getInput('pre_release_branches');
  const appendToPreReleaseTag = core.getInput('append_to_pre_release_tag');
  const createAnnotatedTag = !!core.getInput('create_annotated_tag');
  const dryRun = core.getInput('dry_run');
  const customReleaseRules = core.getInput('custom_release_rules');

  let mappedReleaseRules;
  if (customReleaseRules) {
    mappedReleaseRules = mapCustomReleaseRules(customReleaseRules);
  }

  const { GITHUB_REF, GITHUB_SHA } = process.env;

  if (!GITHUB_REF) {
    core.setFailed('Missing GITHUB_REF.');
    return;
  }

  if (!GITHUB_SHA) {
    core.setFailed('Missing GITHUB_SHA.');
    return;
  }

  const currentBranch = getBranchFromRef(GITHUB_REF);
  const isReleaseBranch = releaseBranches
    .split(',')
    .some((branch) => currentBranch.match(branch));
  const isPreReleaseBranch = preReleaseBranches
    .split(',')
    .some((branch) => currentBranch.match(branch));
  const isPrerelease = !isReleaseBranch && isPreReleaseBranch;

  const identifier = appendToPreReleaseTag
    ? appendToPreReleaseTag
    : currentBranch;

  const prefixRegex = new RegExp(`^${tagPrefix}`);

  const validTags = await getValidTags(prefixRegex);
  const latestTag = getLatestTag(validTags, prefixRegex);
  const latestPrereleaseTag = getLatestPrereleaseTag(
    validTags,
    identifier,
    prefixRegex
  );

  const commits = await getCommits(latestTag.commit.sha);

  let newVersion: string;

  if (customTag) {
    newVersion = customTag;
  } else {
    let previousTag: SemVer | null;
    if (!latestPrereleaseTag) {
      previousTag = parse(latestTag.name.replace(prefixRegex, ''));
    } else {
      previousTag = parse(
        gte(
          latestTag.name.replace(prefixRegex, ''),
          latestPrereleaseTag.name.replace(prefixRegex, '')
        )
          ? latestTag.name.replace(prefixRegex, '')
          : latestPrereleaseTag.name.replace(prefixRegex, '')
      );
    }

    if (!previousTag) {
      core.setFailed('Could not parse previous tag.');
      return;
    }

    core.info(`Previous tag was ${previousTag}.`);
    core.setOutput('previous_tag', previousTag.version);

    let bump = await analyzeCommits(
      { releaseRules: mappedReleaseRules },
      { commits, logger: { log: console.info.bind(console) } }
    );

    if (!bump && defaultBump === 'false') {
      core.debug(
        'No commit specifies the version bump. Skipping the tag creation.'
      );
      return;
    }

    // If somebody uses custom release rules on a prerelease branch they might create a 'preprepatch' bump.
    const preReg = /^pre/;
    if (isPrerelease && preReg.test(bump)) {
      bump = bump.replace(preReg, '');
    }

    const releaseType: ReleaseType = isPrerelease
      ? `pre${bump || defaultBump}`
      : bump || defaultBump;

    const incrementedVersion = inc(previousTag, releaseType, identifier);

    if (!incrementedVersion) {
      core.setFailed('Could not increment version.');
      return;
    }

    if (!valid(incrementedVersion)) {
      core.setFailed(`${incrementedVersion} is not a valid semver.`);
      return;
    }

    newVersion = incrementedVersion;
  }

  core.info(`New version is ${newVersion}.`);
  core.setOutput('new_version', newVersion);

  const newTag = `${tagPrefix}${newVersion}`;
  core.info(`New tag after applying prefix is ${newTag}.`);
  core.setOutput('new_tag', newTag);

  const changelog = await generateNotes(
    {},
    {
      commits,
      logger: { log: console.info.bind(console) },
      options: {
        repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
      },
      lastRelease: { gitTag: latestTag.name },
      nextRelease: { gitTag: newTag, version: newVersion },
    }
  );
  core.info(`Changelog is ${changelog}.`);
  core.setOutput('changelog', changelog);

  if (!isReleaseBranch && !isPreReleaseBranch) {
    core.info(
      'This branch is neither a release nor a pre-release branch. Skipping the tag creation.'
    );
    return;
  }

  if (validTags.map((tag) => tag.name).includes(newTag)) {
    core.info('This tag already exists. Skipping the tag creation.');
    return;
  }

  if (/true/i.test(dryRun)) {
    core.info('Dry run: not performing tag action.');
    return;
  }

  await createTag(newTag, createAnnotatedTag, GITHUB_SHA);
}
