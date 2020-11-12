import main from '../src/main';
import * as utils from '../src/utils';
import * as github from '../src/github';
import * as core from '@actions/core';
import { setInputs, parseDefaultInputs, setInput } from "./helper.test";

const mockCreateTag = jest.spyOn(github, 'createTag').mockImplementation(async () => {
});
const mockSetFailed = jest.spyOn(core, 'setFailed');

describe('main tests', () => {
  const mockGetCommits = (commits) => jest.spyOn(utils, 'getCommits').mockImplementation(async (sha) => {
    return commits;
  });
  const mockGetValidTags = (validTags) => jest.spyOn(utils, 'getValidTags').mockImplementation(async () => {
    return validTags;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['GITHUB_REF'] = 'refs/heads/master';
    process.env['GITHUB_SHA'] = 'GITHUB_SHA';
    setInputs(parseDefaultInputs());
  });

  it('does create initial tag', async () => {
    /*
     * Given
     */
    const mockValidTags = mockGetValidTags([]);
    const commits = [
      { message: 'fix: this is my first fix' },
    ]
    const mockCommits = mockGetCommits(commits);

    /*
     * When
     */
    await main();

    /*
     * Then
     */
    expect(mockValidTags).toHaveBeenCalled();
    expect(mockCommits).toHaveBeenCalledWith('HEAD');
    expect(mockCreateTag).toHaveBeenCalledWith('v0.0.1', expect.any(Boolean), expect.any(String));
    expect(mockSetFailed).not.toBeCalled();
  });

  it('does create patch tag without commits', async () => {
    /*
     * Given
     */
    const mockValidTags = mockGetValidTags([{ name: 'v1.2.3', commit: { sha: '012345' } }]);
    const mockCommits = mockGetCommits([]);

    /*
     * When
     */
    await main();

    /*
     * Then
     */
    expect(mockValidTags).toHaveBeenCalled();
    expect(mockCommits).toHaveBeenCalledWith('012345');
    expect(mockCreateTag).toHaveBeenCalledWith('v1.2.4', expect.any(Boolean), expect.any(String));
    expect(mockSetFailed).not.toBeCalled();
  });

  it('does not create tag without commits and default_bump set to false', async () => {
    /*
     * Given
     */
    setInput('default_bump', 'false');
    const mockValidTags = mockGetValidTags([{ name: 'v1.2.3', commit: { sha: '012345' } }]);
    const mockCommits = mockGetCommits([]);

    /*
     * When
     */
    await main();

    /*
     * Then
     */
    expect(mockValidTags).toHaveBeenCalled();
    expect(mockCommits).toHaveBeenCalledWith('012345');
    expect(mockCreateTag).not.toBeCalled();
    expect(mockSetFailed).not.toBeCalled();
  });
});
