import main from '../src/main';
import * as utils from '../src/utils';
import * as github from '../src/github';
import * as core from '@actions/core';
import { loadDefaultInputs, setBranch, setCommitSha, setInput } from './helper.test';

jest.spyOn(core, 'debug').mockImplementation(() => {});
jest.spyOn(core, 'info').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

const mockCreateTag = jest.spyOn(github, 'createTag').mockResolvedValue(undefined);
const mockSetFailed = jest.spyOn(core, 'setFailed');
const mockSetOutput = jest.spyOn(core, 'setOutput').mockImplementation(() => {});

describe('github-tag-action', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setBranch('master');
    setCommitSha('79e0ea271c26aa152beef77c3275ff7b8f8d8274');
    loadDefaultInputs();
  });

  describe('special cases', () => {
    it('does create initial tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'fix: this is my first fix' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v0.0.1', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create patch tag without commits', async () => {
      /*
       * Given
       */
      const commits = [];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v0.0.1', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does not create tag without commits and default_bump set to false', async () => {
      /*
       * Given
       */
      setInput('default_bump', 'false');
      const commits = [];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).not.toBeCalled();
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag using custom release types', async () => {
      /*
       * Given
       */
      setInput('custom_release_rules', 'james:patch,bond:major');
      const commits = [{ message: 'james: is the new cool guy' }, { message: 'bond: is his last name' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v2.0.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag using custom release types but non-custom commit message', async () => {
      /*
       * Given
       */
      setInput('custom_release_rules', 'james:patch,bond:major');
      const commits = [{ message: 'fix: is the new cool guy' }, { message: 'feat: is his last name' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.3.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });
  });

  describe('release branches', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      setBranch('release');
      setInput('release_branches', 'release');
    });

    it('does create patch tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'fix: this is my first fix' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.2.4', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create minor tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'feat: this is my first feature' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.3.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create major tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'my commit message\nBREAKING CHANGE:\nthis is a breaking change' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v2.0.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag when pre-release tag is newer', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'feat: some new feature on a release branch' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [
        { name: 'v1.2.3', commit: { sha: '012345' } },
        { name: 'v2.1.3-prerelease.0', commit: { sha: '678901' } },
        { name: 'v2.1.3-prerelease.1', commit: { sha: '234567' } },
      ];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v2.2.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag with custom release rules', async () => {
      /*
       * Given
       */
      setInput('custom_release_rules', 'james:preminor')
      const commits = [
        { message: 'feat: some new feature on a pre-release branch' },
        { message: 'james: this should make a preminor' },
      ];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.3.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });
  });

  describe('pre-release branches', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      setBranch('prerelease');
      setInput('pre_release_branches', 'prerelease');
    });

    it('does create prepatch tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'fix: this is my first fix' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.2.4-prerelease.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create preminor tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'feat: this is my first feature' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.3.0-prerelease.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create premajor tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'my commit message\nBREAKING CHANGE:\nthis is a breaking change' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v2.0.0-prerelease.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag when release tag is newer', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'feat: some new feature on a pre-release branch' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [
        { name: 'v1.2.3-prerelease.0', commit: { sha: '012345' } },
        { name: 'v3.1.2-feature.0', commit: { sha: '012345' } },
        { name: 'v2.1.4', commit: { sha: '234567' } },
      ];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v2.2.0-prerelease.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does create tag with custom release rules', async () => {
      /*
       * Given
       */
      setInput('custom_release_rules', 'james:preminor')
      const commits = [
        { message: 'feat: some new feature on a pre-release branch' },
        { message: 'james: this should make a preminor' },
      ];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockCreateTag).toHaveBeenCalledWith('v1.3.0-prerelease.0', expect.any(Boolean), expect.any(String));
      expect(mockSetFailed).not.toBeCalled();
    });
  });

  describe('other branches', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      setBranch('development');
      setInput('pre_release_branches', 'prerelease');
      setInput('release_branches', 'release');
    });

    it('does output patch tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'fix: this is my first fix' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockSetOutput).toHaveBeenCalledWith('new_version', '1.2.4');
      expect(mockCreateTag).not.toBeCalled();
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does output minor tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'feat: this is my first feature' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockSetOutput).toHaveBeenCalledWith('new_version', '1.3.0');
      expect(mockCreateTag).not.toBeCalled();
      expect(mockSetFailed).not.toBeCalled();
    });

    it('does output major tag', async () => {
      /*
       * Given
       */
      const commits = [{ message: 'my commit message\nBREAKING CHANGE:\nthis is a breaking change' }];
      jest
        .spyOn(utils, 'getCommits')
        .mockImplementation(async (sha) => commits);

      const validTags = [{ name: 'v1.2.3', commit: { sha: '012345' } }];
      jest
        .spyOn(utils, 'getValidTags')
        .mockImplementation(async () => validTags);

      /*
       * When
       */
      await main();

      /*
       * Then
       */
      expect(mockSetOutput).toHaveBeenCalledWith('new_version', '2.0.0');
      expect(mockCreateTag).not.toBeCalled();
      expect(mockSetFailed).not.toBeCalled();
    });
  });
});
