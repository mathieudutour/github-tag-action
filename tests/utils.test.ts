import * as utils from '../src/utils';
import { getValidTags } from '../src/utils';
import * as github from '../src/github';

describe('utils', () => {
  it('maps custom release types', () => {
    /*
     * Given
     */
    const customReleasesString = 'james:preminor;bond:premajor';

    /*
     * When
     */
    const mappedReleases = utils.mapCustomReleaseTypes(customReleasesString);

    /*
     * Then
     */
    expect(mappedReleases)
      .toEqual([
        { type: 'james', release: 'preminor' },
        { type: 'bond', release: 'premajor' }
      ]);
  });

  it('filters out invalid custom release types', () => {
    /*
     * Given
     */
    const customReleasesString = 'james:pre-release;bond:premajor';

    /*
     * When
     */
    const mappedReleases = utils.mapCustomReleaseTypes(customReleasesString);

    /*
     * Then
     */
    expect(mappedReleases)
      .toEqual([
        { type: 'bond', release: 'premajor' }
      ]);
  });

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

  it('returns valid tags', async () => {
    /*
     * Given
     */
    const testTags = [
      { name: 'release-1.2.3' },
      { name: '1.2.3' },
    ]
    const mockListTags = jest.spyOn(github, 'listTags').mockImplementation(async () => testTags);

    /*
     * When
     */
    const validTags = await getValidTags();

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
      { name: '1.2.4-prerelease.1' },
      { name: '1.2.4-prerelease.2' },
      { name: '1.2.4-prerelease.0' },
      { name: '1.2.3' },
    ]
    const mockListTags = jest.spyOn(github, 'listTags').mockImplementation(async () => testTags);

    /*
     * When
     */
    const validTags = await getValidTags();

    /*
     * Then
     */
    expect(mockListTags).toHaveBeenCalled();
    expect(validTags[0]).toEqual({ name: '1.2.4-prerelease.2' });
  });
});
