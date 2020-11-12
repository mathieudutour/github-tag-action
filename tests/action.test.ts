import { run } from '../src/action';
import * as utils from '../src/utils';
import * as github from '../src/github';
import * as core from '@actions/core';

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
  });

  it('happy path', async () => {
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
    await run();

    /*
     * Then
     */
    expect(mockValidTags).toHaveBeenCalled();
    expect(mockCommits).toHaveBeenCalledWith('HEAD');
    expect(mockCreateTag).toHaveBeenCalledWith('0.0.1', expect.any(Boolean), expect.any(String));
    expect(mockSetFailed).not.toBeCalled();
  })
});
