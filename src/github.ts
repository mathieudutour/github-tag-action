import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
import { Await } from './ts';
import { createAppAuth } from "@octokit/auth-app";

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

export async function getOctokitSingleton() {
  const auth = createAppAuth({
    privateKey: process.env.PRIVATE_KEY || '',
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    appId: process.env.APP_ID || '',
  });
  
  const installationAuth = await auth({
    type:           "installation",
    installationId: parseInt(process.env.INSTALLATION_ID || '', 10),
  });
  
  // 3️⃣ wire it into Octokit
  const octokit = getOctokit(installationAuth.token);
  
  return octokit;
}

/**
 * Fetch all tags for a given repository recursively
 */
export async function listTags(
  shouldFetchAllTags = false,
  fetchedTags: Tag[] = [],
  page = 1
): Promise<Tag[]> {
  const octokit = await getOctokitSingleton();

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

/**
 * Compare `headRef` to `baseRef` (i.e. baseRef...headRef)
 * @param baseRef - old commit
 * @param headRef - new commit
 */
export async function compareCommits(baseRef: string, headRef: string) {
  const octokit = await getOctokitSingleton();
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
  const octokit = await getOctokitSingleton();
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
