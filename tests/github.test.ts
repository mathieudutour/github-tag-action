import { fetch } from 'undici';
import {
  listTags,
  compareCommits,
  listCommits,
  getCommitFiles,
  createTag,
  request,
} from '../src/github';
import { setInput, setRepository } from './helper.test';
jest.mock('undici', () => ({ fetch: jest.fn(), EnvHttpProxyAgent: jest.fn() }));
const mockFetch = fetch as jest.Mock;
const ok = (data: unknown) => ({
  ok: true,
  status: 200,
  json: async () => data,
});
const failure = (status: number) => ({
  ok: false,
  status,
  body: { cancel: async () => {} },
});
beforeEach(() => {
  jest.clearAllMocks();
  setRepository('https://github.com', 'org/repo');
  setInput('repository', '');
  setInput('github_token', 'test-token');
});
test('fetches all tag pages by default', async () => {
  mockFetch
    .mockResolvedValueOnce(
      ok(Array.from({ length: 100 }, (_, i) => ({ name: `v1.0.${i}` })))
    )
    .mockResolvedValueOnce(ok([{ name: 'v2.0.0' }]));
  expect(await listTags()).toHaveLength(101);
  expect(mockFetch.mock.calls[1][0]).toContain('page=2');
});
test('does not silently select a version from incomplete tags', async () => {
  mockFetch.mockResolvedValue(ok(Array(100).fill({ name: 'v1.0.0' })));
  await expect(listTags(false)).rejects.toThrow('fetch_all_tags: true');
});
test('explicit first page works if it is complete', async () => {
  mockFetch.mockResolvedValue(ok([{ name: 'v1.0.0' }]));
  expect(await listTags(false)).toHaveLength(1);
});
test('paginates compare commits beyond the first page', async () => {
  mockFetch
    .mockResolvedValueOnce(ok({ commits: Array(100).fill({ sha: 'a' }) }))
    .mockResolvedValueOnce(ok({ commits: [{ sha: 'b' }] }));
  expect(await compareCommits('v1.0.0', 'head')).toHaveLength(101);
  expect(mockFetch.mock.calls[1][0]).toContain('page=2');
});
test('initial release reads commit history rather than comparing HEAD to HEAD', async () => {
  mockFetch.mockResolvedValue(ok([{ sha: 'new' }, { sha: 'root' }]));
  expect(await listCommits('head')).toEqual([{ sha: 'root' }, { sha: 'new' }]);
  expect(mockFetch.mock.calls[0][0]).toContain('/commits?sha=head');
});
test('transient server errors retry reads', async () => {
  mockFetch
    .mockResolvedValueOnce(failure(503))
    .mockResolvedValueOnce(ok({ commits: [] }));
  expect(await compareCommits('base', 'head')).toEqual([]);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
test('permission failures do not retry or silently fall back', async () => {
  mockFetch.mockResolvedValue(failure(403));
  await expect(compareCommits('base', 'head')).rejects.toThrow(
    'contents: write'
  );
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
test('path filtering sees both sides of renamed files and pagination', async () => {
  mockFetch
    .mockResolvedValueOnce(
      ok({
        files: Array(100).fill({
          filename: 'new/file',
          previous_filename: 'old/file',
        }),
      })
    )
    .mockResolvedValueOnce(ok({ files: [{ filename: 'second/file' }] }));
  expect(await getCommitFiles('sha')).toEqual([
    'new/file',
    'old/file',
    'second/file',
  ]);
});
test('force updating an annotated tag uses the annotated object SHA', async () => {
  mockFetch
    .mockResolvedValueOnce(ok({ object: { sha: 'old' } }))
    .mockResolvedValueOnce(ok({ sha: 'annotation' }))
    .mockResolvedValueOnce(ok({}));
  await createTag('v1.0.0', true, 'commit', true);
  expect(mockFetch.mock.calls[2][1]).toMatchObject({
    method: 'PATCH',
    body: JSON.stringify({ sha: 'annotation', force: true }),
  });
});
test('force update creates a missing tag', async () => {
  mockFetch.mockResolvedValueOnce(failure(404)).mockResolvedValueOnce(ok({}));
  await createTag('latest', false, 'commit', true);
  expect(mockFetch.mock.calls[1][1]).toMatchObject({
    method: 'POST',
    body: JSON.stringify({ ref: 'refs/tags/latest', sha: 'commit' }),
  });
});
test('repository override is used consistently', async () => {
  setInput('repository', 'other/project');
  mockFetch.mockResolvedValue(ok([]));
  await listTags();
  expect(mockFetch.mock.calls[0][0]).toContain('/repos/other/project/tags');
});
test('writes are not retried after ambiguous server errors', async () => {
  mockFetch.mockResolvedValue(failure(502));
  await expect(request('/git/refs', 'POST', {})).rejects.toThrow('502');
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
test('temporary transport failures retry reads', async () => {
  mockFetch
    .mockRejectedValueOnce(new TypeError('fetch failed'))
    .mockResolvedValueOnce(ok([]));
  expect(await listTags()).toEqual([]);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
