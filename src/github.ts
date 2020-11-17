import { context, GitHub } from '@actions/github';
import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

let octokitSingleton;

export function getOctokitSingleton() {
  if (octokitSingleton) {
    return octokitSingleton;
  }
  const githubToken = core.getInput('github_token');
  octokitSingleton = new GitHub(githubToken);
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

export async function compareCommits(sha: string) {
  const octokit = getOctokitSingleton();

  const commits = await octokit.repos.compareCommits({
    ...context.repo,
    base: sha,
    head: 'HEAD',
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
    | Octokit.Response<Octokit.GitCreateTagResponse>
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
