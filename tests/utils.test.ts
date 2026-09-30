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

  describe('filterCommits squash handling', () => {
    const headerPattern = /^(\w*)(?:\((.*)\))?!?: (.*)$/;
    const noPaths: string[] = [];
    const noScopes: string[] = [];
    const noIgnore: string[] = [];

    it('leaves an ordinary non-squash commit untouched regardless of squash flag', async () => {
      const commits = [
        { message: 'fix: correct rounding error', hash: 'sha1' },
      ];
      const result = await utils.filterCommits(
        commits,
        noPaths,
        noScopes,
        noIgnore,
        'fallback',
        headerPattern
      );
      expect(result).toEqual(commits);
    });

    it('defers to the header when it already parses, ignoring bullets entirely', async () => {
      const message = [
        'fix: processing step execution bugs (#252)',
        '',
        '* fix: dispatch stepCompleted when external processing step completes',
        '',
        '* feat(process): tidy up processing step logic',
      ].join('\n');
      const commits = [{ message, hash: 'sha1' }];

      const result = await utils.filterCommits(
        commits,
        noPaths,
        noScopes,
        noIgnore,
        'fallback',
        headerPattern
      );

      expect(result).toEqual([{ message, hash: 'sha1' }]);
    });

    it('falls back to bulleted sub-commits when the header does not parse', async () => {
      const message = [
        'Add feature X (#123)',
        '',
        '* feat: implement X',
        '',
        '* chore: bump vitest to match coverage',
        '',
        '* fix: align node engine range with vitest 5',
      ].join('\n');
      const commits = [{ message, hash: 'sha1' }];

      const result = await utils.filterCommits(
        commits,
        noPaths,
        noScopes,
        noIgnore,
        'fallback',
        headerPattern
      );

      expect(result).toEqual([
        { message, hash: 'sha1' },
        { message: 'feat: implement X', hash: 'sha1' },
        { message: 'chore: bump vitest to match coverage', hash: 'sha1' },
        { message: 'fix: align node engine range with vitest 5', hash: 'sha1' },
      ]);
    });

    it('strips git autosquash artifacts (amend!/fixup!/squash!) from extracted bullets', async () => {
      const message = [
        'Add feature X (#123)',
        '',
        '* feat: implement X',
        '',
        '* amend! feat: implement X',
        '',
        '* fixup! feat: implement X',
        '',
        '* squash! feat: implement X',
      ].join('\n');
      const commits = [{ message, hash: 'sha1' }];

      const result = await utils.filterCommits(
        commits,
        noPaths,
        noScopes,
        noIgnore,
        'fallback',
        headerPattern
      );

      expect(result).toEqual([
        { message, hash: 'sha1' },
        { message: 'feat: implement X', hash: 'sha1' },
      ]);
    });

    it('does not extract bullets at all when squash is false, even with an unparseable header', async () => {
      const message = 'Add feature X (#123)\n\n* feat: implement X';
      const commits = [{ message, hash: 'sha1' }];

      const result = await utils.filterCommits(
        commits,
        noPaths,
        noScopes,
        noIgnore,
        'off',
        headerPattern
      );

      expect(result).toEqual([{ message, hash: 'sha1' }]);
    });

    it('full mode analyzes the header and bullets even when the header parses', async () => {
      const message = 'fix: handle X (#1)\n\n* feat: add Y';
      const result = await utils.filterCommits(
        [{ message, hash: 'sha1' }],
        noPaths,
        noScopes,
        noIgnore,
        'full',
        headerPattern
      );
      expect(result).toEqual([
        { message, hash: 'sha1' },
        { message: 'feat: add Y', hash: 'sha1' },
      ]);
    });

    it('parses squash mode names and legacy booleans', () => {
      expect(utils.parseSquashMode('')).toBe('off');
      expect(utils.parseSquashMode('false')).toBe('off');
      expect(utils.parseSquashMode('true')).toBe('full');
      expect(utils.parseSquashMode('Fallback')).toBe('fallback');
      expect(utils.parseSquashMode('full')).toBe('full');
      expect(utils.parseSquashMode('off')).toBe('off');
      expect(() => utils.parseSquashMode('bogus')).toThrow();
    });
  });
});
