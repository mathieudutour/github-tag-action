import * as utils from '../src/utils';
import { getValidTags } from '../src/utils';
import * as core from '@actions/core';
import * as github from '../src/github';
import { defaultChangelogRules } from '../src/defaults';

jest.spyOn(core, 'debug').mockImplementation(() => {});
jest.spyOn(core, 'warning').mockImplementation(() => {});

const regex = /^v/;

describe('utils', () => {
  it('extracts branch from ref', () => {
    /*
     * Given
     */
    const remoteRef = 'refs/heads/master';

    /*
     * When
     */
    const branch = utils.getBranchFromRef(remoteRef);

    /*
     * Then
     */
    expect(branch).toEqual('master');
  });

  it('test if ref is PR', () => {
    /*
     * Given
     */
    const remoteRef = 'refs/pull/123/merge';

    /*
     * When
     */
    const isPullRequest = utils.isPr(remoteRef);

    /*
     * Then
     */
    expect(isPullRequest).toEqual(true);
  });

  it('returns valid tags', async () => {
    /*
     * Given
     */
    const testTags = [
      {
        name: 'release-1.2.3',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: 'v1.2.3',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
    ];
    const mockListTags = jest
      .spyOn(github, 'listTags')
      .mockImplementation(async () => testTags);

    /*
     * When
     */
    const validTags = await getValidTags(regex, false);

    /*
     * Then
     */
    expect(mockListTags).toHaveBeenCalled();
    expect(validTags).toHaveLength(1);
  });

  it('returns sorted tags', async () => {
    /*
     * Given
     */
    const testTags = [
      {
        name: 'v1.2.4-prerelease.1',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: 'v1.2.4-prerelease.2',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: 'v1.2.4-prerelease.0',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: 'v1.2.3',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
    ];
    const mockListTags = jest
      .spyOn(github, 'listTags')
      .mockImplementation(async () => testTags);

    /*
     * When
     */
    const validTags = await getValidTags(regex, false);

    /*
     * Then
     */
    expect(mockListTags).toHaveBeenCalled();
    expect(validTags[0]).toEqual({
      name: 'v1.2.4-prerelease.2',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    });
  });

  it('returns only prefixed tags', async () => {
    /*
     * Given
     */
    const testTags = [
      {
        name: 'app2/5.0.0',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: '7.0.0',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
      {
        name: 'app1/3.0.0',
        commit: { sha: 'string', url: 'string' },
        zipball_url: 'string',
        tarball_url: 'string',
        node_id: 'string',
      },
    ];
    const mockListTags = jest
      .spyOn(github, 'listTags')
      .mockImplementation(async () => testTags);
    /*
     * When
     */
    const validTags = await getValidTags(/^app1\//, false);
    /*
     * Then
     */
    expect(mockListTags).toHaveBeenCalled();
    expect(validTags).toHaveLength(1);
    expect(validTags[0]).toEqual({
      name: 'app1/3.0.0',
      commit: { sha: 'string', url: 'string' },
      zipball_url: 'string',
      tarball_url: 'string',
      node_id: 'string',
    });
  });

  describe('custom release types', () => {
    it('maps custom release types', () => {
      /*
       * Given
       */
      const customReleasesString =
        'james:preminor,bond:premajor,007:major:Breaking Changes,feat:minor';

      /*
       * When
       */
      const mappedReleases = utils.mapCustomReleaseRules(customReleasesString);

      /*
       * Then
       */
      expect(mappedReleases).toEqual([
        { type: 'james', release: 'preminor' },
        { type: 'bond', release: 'premajor' },
        { type: '007', release: 'major', section: 'Breaking Changes' },
        {
          type: 'feat',
          release: 'minor',
          section: defaultChangelogRules['feat'].section,
        },
      ]);
    });

    it('filters out invalid custom release types', () => {
      /*
       * Given
       */
      const customReleasesString = 'james:pre-release,bond:premajor';

      /*
       * When
       */
      const mappedReleases = utils.mapCustomReleaseRules(customReleasesString);

      /*
       * Then
       */
      expect(mappedReleases).toEqual([{ type: 'bond', release: 'premajor' }]);
    });
  });

  describe('method: mergeWithDefaultChangelogRules', () => {
    it('combines non-existing type rules with default rules', () => {
      /**
       * Given
       */
      const newRule = {
        type: 'james',
        release: 'major',
        section: '007 Changes',
      };

      /**
       * When
       */
      const result = utils.mergeWithDefaultChangelogRules([newRule]);

      /**
       * Then
       */
      expect(result).toEqual([
        ...Object.values(defaultChangelogRules),
        newRule,
      ]);
    });

    it('overwrites existing default type rules with provided rules', () => {
      /**
       * Given
       */
      const newRule = {
        type: 'feat',
        release: 'minor',
        section: '007 Changes',
      };

      /**
       * When
       */
      const result = utils.mergeWithDefaultChangelogRules([newRule]);
      const overWrittenRule = result.find((rule) => rule.type === 'feat');

      /**
       * Then
       */
      expect(overWrittenRule?.section).toBe(newRule.section);
    });

    it('returns only the rules having changelog section', () => {
      /**
       * Given
       */
      const mappedReleaseRules = [
        { type: 'james', release: 'major', section: '007 Changes' },
        { type: 'bond', release: 'minor', section: undefined },
      ];

      /**
       * When
       */
      const result = utils.mergeWithDefaultChangelogRules(mappedReleaseRules);

      /**
       * Then
       */
      expect(result).toContainEqual(mappedReleaseRules[0]);
      expect(result).not.toContainEqual(mappedReleaseRules[1]);
    });
  });

  describe('method: parsePathFilter', () => {
    it('splits legacy single-line input on commas (no newline present)', () => {
      /*
       * Given / When
       */
      const result = utils.parsePathFilter('packages/web,shared/**');

      /*
       * Then
       */
      expect(result).toEqual(['packages/web', 'shared/**']);
    });

    it('splits newline-separated input on newlines, preserving commas within a pattern', () => {
      /*
       * Given / When
       */
      const result = utils.parsePathFilter(
        'packages/web/**\n!**/*.md\nsrc/{a,b}/**'
      );

      /*
       * Then
       */
      expect(result).toEqual(['packages/web/**', '!**/*.md', 'src/{a,b}/**']);
    });

    it('forces ordered single-pattern treatment for single-line input when forceGlobSyntax is true', () => {
      /*
       * Given / When
       */
      const result = utils.parsePathFilter('src/{a,b}/**', true);

      /*
       * Then
       */
      expect(result).toEqual(['src/{a,b}/**']);
    });

    it('returns an empty array for empty input', () => {
      expect(utils.parsePathFilter('')).toEqual([]);
    });
  });

  describe('method: matchesPathFilter', () => {
    it('matches a bare directory prefix without requiring an explicit /** glob', () => {
      const patterns = ['packages/web'];

      expect(
        utils.matchesPathFilter('packages/web/src/index.ts', patterns)
      ).toBe(true);
      expect(utils.matchesPathFilter('packages/web', patterns)).toBe(true);
      expect(utils.matchesPathFilter('packages/other/x.ts', patterns)).toBe(
        false
      );
    });

    it('matches glob patterns via micromatch', () => {
      const patterns = ['shared/**/*.ts'];

      expect(utils.matchesPathFilter('shared/lib/util.ts', patterns)).toBe(
        true
      );
      expect(utils.matchesPathFilter('shared/lib/util.js', patterns)).toBe(
        false
      );
    });

    it('matches brace expansion patterns', () => {
      const patterns = ['src/{a,b}/**'];

      expect(utils.matchesPathFilter('src/a/index.ts', patterns)).toBe(true);
      expect(utils.matchesPathFilter('src/b/index.ts', patterns)).toBe(true);
      expect(utils.matchesPathFilter('src/c/index.ts', patterns)).toBe(false);
    });

    it('excludes files matched by a later negated pattern', () => {
      const patterns = ['packages/web/**', '!**/*.md'];

      expect(
        utils.matchesPathFilter('packages/web/src/index.ts', patterns)
      ).toBe(true);
      expect(utils.matchesPathFilter('packages/web/README.md', patterns)).toBe(
        false
      );
    });

    it('excludes bare directory via negation pattern', () => {
      const patterns = ['packages/**', '!packages/legacy'];

      expect(
        utils.matchesPathFilter('packages/web/src/index.ts', patterns)
      ).toBe(true);
      expect(
        utils.matchesPathFilter('packages/legacy/src/index.ts', patterns)
      ).toBe(false);
      expect(utils.matchesPathFilter('packages/legacy', patterns)).toBe(false);
    });

    it('supports checking a list of files', () => {
      const patterns = ['packages/web/**', '!**/*.md'];

      expect(
        utils.matchesPathFilter(
          ['packages/web/README.md', 'packages/web/src/index.ts'],
          patterns
        )
      ).toBe(true);
      expect(
        utils.matchesPathFilter(['packages/web/README.md'], patterns)
      ).toBe(false);
    });

    it('lets a later positive pattern re-include a file excluded earlier', () => {
      const patterns = [
        'packages/web/**',
        '!**/*.md',
        'packages/web/CHANGELOG.md',
      ];

      expect(
        utils.matchesPathFilter('packages/web/CHANGELOG.md', patterns)
      ).toBe(true);
      expect(utils.matchesPathFilter('packages/web/README.md', patterns)).toBe(
        false
      );
    });

    it('behaves as a plain OR for a flat pattern list with no negation (legacy comma-mode shape)', () => {
      const patterns = ['packages/web', 'shared/**'];

      expect(utils.matchesPathFilter('packages/web/x.ts', patterns)).toBe(true);
      expect(utils.matchesPathFilter('shared/lib/y.ts', patterns)).toBe(true);
      expect(utils.matchesPathFilter('other/z.ts', patterns)).toBe(false);
    });

    it('returns true when patterns is empty (not configured)', () => {
      expect(utils.matchesPathFilter('packages/web/x.ts', [])).toBe(true);
      expect(
        utils.matchesPathFilter(['packages/web/x.ts', 'packages/web/y.ts'], [])
      ).toBe(true);
    });
  });

  describe('method: filterCommits path filtering', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('keeps a commit whose changed files match a legacy comma-separated path_filter', async () => {
      /*
       * Given
       */
      jest
        .spyOn(github, 'getCommitFiles')
        .mockResolvedValue(['packages/web/src/index.ts']);
      const commits = [{ message: 'fix: x', hash: 'sha1' }];

      /*
       * When
       */
      const result = await utils.filterCommits(
        commits,
        utils.parsePathFilter('packages/web,shared/**'),
        [],
        [],
        false
      );

      /*
       * Then
       */
      expect(result).toEqual(commits);
    });

    it('excludes a commit that only touches files excluded by an ordered negation pattern', async () => {
      /*
       * Given
       */
      jest
        .spyOn(github, 'getCommitFiles')
        .mockResolvedValue(['packages/web/README.md']);
      const commits = [{ message: 'docs: update readme', hash: 'sha1' }];

      /*
       * When
       */
      const result = await utils.filterCommits(
        commits,
        utils.parsePathFilter('packages/web/**\n!**/*.md'),
        [],
        [],
        false
      );

      /*
       * Then
       */
      expect(result).toEqual([]);
    });

    it('keeps a commit matching a negated path_filter pattern that touches a non-excluded file', async () => {
      /*
       * Given
       */
      jest
        .spyOn(github, 'getCommitFiles')
        .mockResolvedValue(['packages/web/src/index.ts']);
      const commits = [{ message: 'fix: x', hash: 'sha1' }];

      /*
       * When
       */
      const result = await utils.filterCommits(
        commits,
        utils.parsePathFilter('packages/web/**\n!**/*.md'),
        [],
        [],
        false
      );

      /*
       * Then
       */
      expect(result).toEqual(commits);
    });
  });
});
