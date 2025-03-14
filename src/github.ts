import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { Await } from './ts';

let octokitSingleton: ReturnType<typeof getOctokit>;

type Tag = {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  zipball_url: string;
  tarball_url: string;
  node_id: string;
};
type Ref = {
  ref: string;
  node_id: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
};

export function getOctokitSingleton() {
  if (octokitSingleton) {
    return octokitSingleton;
  }
  const githubToken = core.getInput('github_token');
  octokitSingleton = getOctokit(githubToken);
  return octokitSingleton;
}

/**
 * Fetch all tags for a given repository recursively
 */
export async function listTags(
  shouldFetchAllTags = false,
  fetchedTags: Tag[] = [],
  page = 1
): Promise<Tag[]> {
  const octokit = getOctokitSingleton();

  const tags = await octokit.repos.listTags({
    ...context.repo,
    per_page: 100,
    page,
  });

  if (tags.data.length < 100 || shouldFetchAllTags === false) {
    return [...fetchedTags, ...tags.data];
  }

  return listTags(shouldFetchAllTags, [...fetchedTags, ...tags.data], page + 1);
}

// Github API does not support filtering tags by prefix and it only allows getting 100 tags at a time.
// We need to use listMatchingRefs to get all tags.
export async function listRefs(
  tagPrefix: string,
): Promise<Tag[]> {
  const octokit = getOctokitSingleton();

  const refs = await octokit.git.listMatchingRefs({
    ...context.repo,
    ref: `tags/${tagPrefix}`,
  });
  console.log(refs.data);

  return refs.data.map((ref: Ref) => ({
    name: ref.ref.replace('refs/tags/', ''),
    commit: {
      sha: ref.object.sha,
      url: ref.object.url,
    },
    zipball_url: `https://github.com/${context.repo.owner}/${context.repo.repo}/zipball/${ref.ref.replace('refs/tags/', '')}`,
    tarball_url: `https://github.com/${context.repo.owner}/${context.repo.repo}/tarball/${ref.ref.replace('refs/tags/', '')}`,
    node_id: ref.node_id,
  }));
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
