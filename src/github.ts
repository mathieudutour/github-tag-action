import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { Await } from './ts';

let octokitSingleton: ReturnType<typeof getOctokit>;

export function getOctokitSingleton() {
  if (octokitSingleton) {
    return octokitSingleton;
  }
  const githubToken = core.getInput('github_token');
  octokitSingleton = getOctokit(githubToken);
  return octokitSingleton;
}

export async function listTags() {
  const octokit = getOctokitSingleton();

  const tags = await octokit.repos.listTags({
    ...context.repo,
    per_page: 100,
  });

  return tags.data;
}

/**
 * Compare `headRef` to `baseRef` (i.e. baseRef...headRef)
 * @param baseRef - old commit
 * @param headRef - new commit
 */
export async function compareCommits(baseRef: string, headRef: string) {
  const octokit = getOctokitSingleton();
  core.debug(`Comparing commits (${baseRef}...${headRef})`);

  const commits = await octokit.repos.compareCommits({
    ...context.repo,
    base: baseRef,
    head: headRef,
  });

  return commits.data.commits;
}

export async function createTag(
  newTag: string,
  createAnnotatedTag: boolean,
  GITHUB_SHA: string
) {
  const octokit = getOctokitSingleton();
  let annotatedTag:
    | Await<ReturnType<typeof octokit.git.createTag>>
    | undefined = undefined;
  if (createAnnotatedTag) {
    core.debug(`Creating annotated tag.`);
    annotatedTag = await octokit.git.createTag({
      ...context.repo,
      tag: newTag,
      message: newTag,
      object: GITHUB_SHA,
      type: 'commit',
    });
  }

  core.debug(`Pushing new tag to the repo.`);
  await octokit.git.createRef({
    ...context.repo,
    ref: `refs/tags/${newTag}`,
    sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA,
  });
}
