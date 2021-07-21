import { listTags } from '../src/github';

jest.mock(
  '@actions/github',
  jest.fn().mockImplementation(() => ({
    context: { repo: { owner: 'mock-owner', repo: 'mock-repo' } },
    getOctokit: jest.fn().mockReturnValue({
      repos: {
        listTags: jest.fn().mockImplementation(({ page }: { page: number }) => {
          if (page === 6) {
            return { data: [] };
          }

          const res = [...new Array(100).keys()].map((_) => ({
            name: `v0.0.${_ + (page - 1) * 100}`,
            commit: { sha: 'string', url: 'string' },
            zipball_url: 'string',
            tarball_url: 'string',
            node_id: 'string',
          }));

          return { data: res };
        }),
      },
    }),
  }))
);

describe('github', () => {
  it('returns all tags', async () => {
    const tags = await listTags(true);

    expect(tags.length).toEqual(500);
    expect(tags[499]).toEqual({
      name: 'v0.0.499',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    });
  });

  it('returns only the last 100 tags', async () => {
    const tags = await listTags(true);

    expect(tags.length).toEqual(500);
    expect(tags[99]).toEqual({
      name: 'v0.0.99',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    });
  });
});
