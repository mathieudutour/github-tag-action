import * as core from '@actions/core';
import { getExecOutput } from '@actions/exec';
import { fetch, EnvHttpProxyAgent } from 'undici';
const dispatcher = new EnvHttpProxyAgent();

export type Tag = { name: string; commit: { sha: string; url?: string } };
export type Commit = { sha: string; commit: { message: string } };
type ApiError = Error & { status: number };

export function getRepository() {
  const repository =
    core.getInput('repository') || process.env.GITHUB_REPOSITORY || '';
  const parts = repository.split('/');
  if (parts.length !== 2 || parts.some((part) => !/^[\w.-]+$/.test(part))) {
    throw new Error('Set repository or GITHUB_REPOSITORY to owner/repo.');
  }
  return { owner: parts[0], repo: parts[1] };
}

function repositoryPath() {
  const { owner, repo } = getRepository();
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export async function request<T>(
  path: string,
  method = 'GET',
  body?: object
): Promise<T> {
  const token = core.getInput('github_token');
  if (!token)
    throw new Error(
      'github_token is required even in dry_run to read tags and commits. Check that the secret is available to this workflow event.'
    );
  const api = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(
    /\/$/,
    ''
  );
  for (let attempt = 0; ; attempt++) {
    let response;
    try {
      response = await fetch(`${api}${repositoryPath()}${path}`, {
        method,
        dispatcher,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'github-tag-action',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000),
        redirect: 'error',
      });
    } catch {
      if (method === 'GET' && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
        continue;
      }
      throw Object.assign(
        new Error(
          `Cannot reach GitHub API for ${method} ${path.split('?')[0]}.`
        ),
        { status: method === 'GET' ? 503 : 0 }
      );
    }
    if (response.ok)
      return (response.status === 204 ? undefined : await response.json()) as T;
    // Only retry reads: a failed write may already have taken effect.
    if (method === 'GET' && response.status >= 500 && attempt < 2) {
      await response.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
      continue;
    }
    const hint = [401, 403, 404].includes(response.status)
      ? ' Check repository access, contents: write for publishing, and repository rules. Tokens may be unavailable to fork or Dependabot events.'
      : '';
    throw Object.assign(
      new Error(
        `GitHub API ${method} ${path.split('?')[0]} failed (${
          response.status
        }).${hint}`
      ),
      { status: response.status }
    );
  }
}

export async function listTags(shouldFetchAllTags = true): Promise<Tag[]> {
  const tags: Tag[] = [];
  for (let page = 1; ; page++) {
    const batch = await request<Tag[]>(`/tags?per_page=100&page=${page}`);
    tags.push(...batch);
    if (batch.length < 100) return tags;
    if (!shouldFetchAllTags)
      throw new Error(
        'Tag results may be incomplete. Set fetch_all_tags: true to determine the version safely.'
      );
  }
}

export async function listCommits(headRef: string): Promise<Commit[]> {
  const commits: Commit[] = [];
  for (let page = 1; ; page++) {
    const batch = await request<Commit[]>(
      `/commits?sha=${encodeURIComponent(headRef)}&per_page=100&page=${page}`
    );
    commits.push(...batch);
    if (batch.length < 100) return commits.reverse();
  }
}

export async function git(args: string[]) {
  const result = await getExecOutput('git', args, {
    cwd: core.getInput('working_directory') || undefined,
    silent: true,
  });
  return result.stdout.trim();
}

export async function compareCommits(
  baseRef: string,
  headRef: string
): Promise<Commit[]> {
  try {
    const commits: Commit[] = [];
    for (let page = 1; ; page++) {
      const result = await request<{ commits: Commit[] }>(
        `/compare/${encodeURIComponent(baseRef)}...${encodeURIComponent(
          headRef
        )}?per_page=100&page=${page}`
      );
      commits.push(...result.commits);
      if (result.commits.length < 100) return commits;
    }
  } catch (error) {
    if ((error as ApiError).status < 500 || !(error as ApiError).status)
      throw error;
    core.warning(
      'GitHub compare API is unavailable; trying complete local Git history.'
    );
    try {
      if ((await git(['rev-parse', '--is-shallow-repository'])) !== 'false')
        throw new Error('Local history is shallow.');
      // Resolve refs before passing a range to git log; never treat user inputs as options.
      const base = await git([
        'rev-parse',
        '--verify',
        '--end-of-options',
        `${baseRef}^{commit}`,
      ]);
      const head = await git([
        'rev-parse',
        '--verify',
        '--end-of-options',
        `${headRef}^{commit}`,
      ]);
      const result = await git([
        'log',
        '--reverse',
        '--format=%H%x00%B%x00',
        `${base}..${head}`,
        '--',
      ]);
      const parts = result.split('\0');
      const commits: Commit[] = [];
      for (let i = 0; i + 1 < parts.length; i += 2)
        commits.push({
          sha: parts[i].trim(),
          commit: { message: parts[i + 1].trim() },
        });
      return commits;
    } catch {
      throw new Error(
        'Cannot retrieve commits from GitHub or complete local history. Retry, or use checkout with fetch-depth: 0. No version was guessed.'
      );
    }
  }
}

export async function getCommitFiles(sha: string): Promise<string[]> {
  const files = new Set<string>();
  for (let page = 1; page <= 30; page++) {
    const result = await request<{
      files: { filename: string; previous_filename?: string }[];
    }>(`/commits/${encodeURIComponent(sha)}?per_page=100&page=${page}`);
    for (const file of result.files) {
      files.add(file.filename);
      if (file.previous_filename) files.add(file.previous_filename);
    }
    if (result.files.length < 100) return [...files];
  }
  throw new Error(
    'Commit file list reached the GitHub 3000-file limit; refusing incomplete path filtering.'
  );
}

export async function createTag(
  newTag: string,
  annotated: boolean,
  sha: string,
  force = false
) {
  await git(['check-ref-format', `refs/tags/${newTag}`]);
  let exists = false;
  if (force) {
    try {
      await request(`/git/ref/tags/${encodeURIComponent(newTag)}`);
      exists = true;
    } catch (error) {
      if ((error as ApiError).status !== 404) throw error;
    }
  }
  let target = sha;
  if (annotated) {
    const tag = await request<{ sha: string }>('/git/tags', 'POST', {
      tag: newTag,
      message: newTag,
      object: sha,
      type: 'commit',
    });
    target = tag.sha;
  }
  if (exists)
    await request(`/git/refs/tags/${encodeURIComponent(newTag)}`, 'PATCH', {
      sha: target,
      force: true,
    });
  else
    await request('/git/refs', 'POST', {
      ref: `refs/tags/${newTag}`,
      sha: target,
    });
}

export async function createLocalTag(
  tag: string,
  sha: string,
  annotated: boolean,
  force: boolean
) {
  await git(['check-ref-format', `refs/tags/${tag}`]);
  const target = await git([
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${sha}^{commit}`,
  ]);
  await git([
    'tag',
    ...(force ? ['--force'] : []),
    ...(annotated ? ['-a', '-m', tag] : []),
    '--',
    tag,
    target,
  ]);
}

export async function resolveCommitRef(ref: string) {
  const commit = await request<{ sha: string }>(
    `/commits/${encodeURIComponent(ref)}`
  );
  return commit.sha;
}
