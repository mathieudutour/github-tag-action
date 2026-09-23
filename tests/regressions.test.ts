import action from '../src/action';
import * as core from '@actions/core';
import * as github from '../src/github';
import {
  loadDefaultInputs,
  setInput,
  setBranch,
  setRepository,
  setCommitSha,
} from './helper.test';

jest.mock('../src/github', () => ({
  listTags: jest.fn(),
  compareCommits: jest.fn(),
  createTag: jest.fn(),
  listCommits: jest.fn(),
  getCommitFiles: jest.fn(),
  createLocalTag: jest.fn(),
  resolveCommitRef: jest.fn(),
  getRepository: () => ({ owner: 'org', repo: 'repo' }),
}));
const output = jest.spyOn(core, 'setOutput').mockImplementation(() => {});
jest.spyOn(core, 'info').mockImplementation(() => {});
jest.spyOn(core, 'debug').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
const failed = jest.spyOn(core, 'setFailed').mockImplementation(() => {});
const tags = github.listTags as jest.Mock;
const commits = github.compareCommits as jest.Mock;
const createTag = github.createTag as jest.Mock;
const tag = (name: string) => ({ name, commit: { sha: name, url: '' } });
const commit = (message: string) => ({ sha: 'abc1234', commit: { message } });

beforeEach(() => {
  jest.clearAllMocks();
  for (const key of Object.keys(process.env))
    if (key.startsWith('INPUT_')) delete process.env[key];
  delete process.env.GITHUB_EVENT_NAME;
  loadDefaultInputs();
  setRepository('https://github.com', 'org/repo');
  setBranch('main');
  setCommitSha('abc1234');
  tags.mockResolvedValue([tag('v1.0.0')]);
  commits.mockResolvedValue([commit('fix: repair')]);
});

test('feat! produces a major release and breaking changelog', async () => {
  commits.mockResolvedValue([commit('feat!: incompatible API')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '2.0.0');
  expect(output).toHaveBeenCalledWith(
    'changelog',
    expect.stringContaining('BREAKING')
  );
});
test('zero commits does not create another release', async () => {
  commits.mockResolvedValue([]);
  await action();
  expect(createTag).not.toHaveBeenCalled();
  expect(output).not.toHaveBeenCalledWith('new_tag', expect.anything());
});
test('maintenance is not the main release branch', async () => {
  setBranch('maintenance');
  await action();
  expect(createTag).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1-abc1234');
});
test('pull_request_target never publishes a release tag', async () => {
  process.env.GITHUB_EVENT_NAME = 'pull_request_target';
  await action();
  expect(createTag).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1-abc1234');
});
test('tag push does not recursively create tags', async () => {
  process.env.GITHUB_REF = 'refs/tags/v1.0.0';
  await action();
  expect(createTag).not.toHaveBeenCalled();
  expect(commits).not.toHaveBeenCalled();
});
test('existing RC increments instead of bumping patch again', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  setInput('append_to_pre_release_tag', 'rc');
  tags.mockResolvedValue([tag('v1.1.1-rc.0'), tag('v1.1.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.1-rc.1');
});
test('prerelease identifiers match exactly', async () => {
  setBranch('CICD-304');
  setInput('pre_release_branches', '.*');
  tags.mockResolvedValue([
    tag('v1.0.1-CICD-304-Test.0'),
    tag('v1.0.1-CICD-304.0'),
    tag('v1.0.0'),
  ]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1-CICD-304.1');
});
test('first prerelease respects default minor bump', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  setInput('default_bump', 'minor');
  commits.mockResolvedValue([commit('docs: update')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.0-staging.0');
});
test('custom tags still expose the previous version', async () => {
  setInput('custom_tag', '2.0.0');
  await action();
  expect(output).toHaveBeenCalledWith('previous_tag', 'v1.0.0');
  expect(output).toHaveBeenCalledWith('previous_version', '1.0.0');
});
test('prefix is literal, including regex metacharacters', async () => {
  setInput('tag_prefix', 'app[web].');
  tags.mockResolvedValue([tag('app[web].1.2.3')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_tag', 'app[web].1.2.4');
  expect(failed).not.toHaveBeenCalled();
});

test('first release analyzes all history with default_bump false', async () => {
  tags.mockResolvedValue([]);
  setInput('default_bump', 'false');
  (github.listCommits as jest.Mock).mockResolvedValue([
    commit('feat: initial API'),
  ]);
  await action();
  expect(github.listCommits).toHaveBeenCalledWith('abc1234');
  expect(commits).not.toHaveBeenCalled();
  expect(output).toHaveBeenCalledWith('new_version', '0.1.0');
});
test('initial version changes the baseline', async () => {
  tags.mockResolvedValue([]);
  setInput('initial_version', '2.0.0');
  (github.listCommits as jest.Mock).mockResolvedValue([commit('fix: initial')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '2.0.1');
});
test('minor RC advances to major RC for a breaking change', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  setInput('append_to_pre_release_tag', 'rc');
  tags.mockResolvedValue([tag('v1.1.0-rc.2'), tag('v1.0.0')]);
  commits.mockResolvedValue([commit('feat!: incompatible')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '2.0.0-rc.0');
});
test('features on an existing minor RC only increment its counter', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  setInput('append_to_pre_release_tag', 'rc');
  tags.mockResolvedValue([tag('v1.1.0-rc.2'), tag('v1.0.0')]);
  commits.mockResolvedValue([commit('feat: compatible')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.0-rc.3');
});
test('path filter excludes another project feature from bump and changelog', async () => {
  setInput('path_filter', 'packages/web');
  commits.mockResolvedValue([
    { ...commit('feat: other app'), sha: 'other' },
    commit('fix: web'),
  ]);
  (github.getCommitFiles as jest.Mock).mockImplementation(async (sha) => [
    sha === 'other' ? 'packages/web-api/a.ts' : 'packages/web/a.ts',
  ]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1');
  const notes = output.mock.calls.find(([name]) => name === 'changelog')![1];
  expect(notes).not.toContain('other app');
  expect(notes).toContain('web');
});
test('all commits excluded by path filter produces no tag', async () => {
  setInput('path_filter', 'packages/web');
  (github.getCommitFiles as jest.Mock).mockResolvedValue(['packages/api/a.ts']);
  await action();
  expect(createTag).not.toHaveBeenCalled();
});
test('scope and ignore filters affect both bump and changelog', async () => {
  setInput('scopes', 'web');
  commits.mockResolvedValue([
    commit('feat(api): new API'),
    commit('feat(web): experiment [no-release]'),
    commit('fix(web): repair'),
  ]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1');
  const notes = output.mock.calls.find(([name]) => name === 'changelog')![1];
  expect(notes).not.toContain('experiment');
  expect(notes).not.toContain('new API');
});
test('squash bullet parsing is opt-in', async () => {
  setInput('parse_squash_commits', 'true');
  commits.mockResolvedValue([
    commit(
      'fix(web): aggregate (#12)\n\n* fix(web): repair\n* feat(web): new UI'
    ),
  ]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.0');
  expect(output).toHaveBeenCalledWith(
    'changelog',
    expect.stringContaining('new UI')
  );
});
test('squash parsing preserves breaking change footers', async () => {
  setInput('parse_squash_commits', 'true');
  commits.mockResolvedValue([
    commit('feat: aggregate\n\nBREAKING CHANGE: remove API\n\n* fix: typo'),
  ]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '2.0.0');
});
test('tag search pattern isolates a maintained major version', async () => {
  setInput('tag_search_pattern', 'v1.*');
  tags.mockResolvedValue([tag('v2.0.0'), tag('v1.3.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_tag', 'v1.3.1');
});
test('strict empty prefix separates legacy versions from v-prefixed tags', async () => {
  setInput('tag_prefix', '');
  setInput('prefix_match_tag', 'true');
  tags.mockResolvedValue([tag('v2.0.0'), tag('1.0.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_tag', '1.0.1');
});
test('explicit force bump overrides detected breaking changes', async () => {
  setInput('force_bump', 'patch');
  commits.mockResolvedValue([commit('feat!: breaking')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1');
});
test('force bump can intentionally tag with no new commits', async () => {
  setInput('force_bump', 'minor');
  commits.mockResolvedValue([]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.0');
});
test('forced prerelease bump can start the next candidate version', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  setInput('force_prerelease_bump', 'prepatch');
  tags.mockResolvedValue([tag('v1.0.1-staging.1'), tag('v1.0.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.2-staging.0');
});
test('explicit semantic baseline works with non-semantic existing tags', async () => {
  setInput('previous_tag', '1.2.3.4');
  setInput('previous_version', '1.2.3');
  await action();
  expect(commits).toHaveBeenCalledWith('1.2.3.4', 'abc1234');
  expect(output).toHaveBeenCalledWith('new_version', '1.2.4');
});
test('custom prerelease target increments its own RC counter', async () => {
  setInput('custom_tag', '2.0.0');
  setInput('custom_tag_prerelease', 'true');
  setInput('append_to_pre_release_tag', 'rc');
  tags.mockResolvedValue([tag('v2.0.0-rc.2'), tag('v1.0.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '2.0.0-rc.3');
  expect(output).toHaveBeenCalledWith('prerelease', true);
});
test('custom non-semantic tag can be moved deliberately', async () => {
  setInput('tag_prefix', '');
  setInput('custom_tag', 'deployed');
  setInput('force_update', 'true');
  await action();
  expect(createTag).toHaveBeenCalledWith('deployed', false, 'abc1234', true);
});
test('rolling stable aliases are opt-in', async () => {
  setInput('rolling_tags', 'true');
  await action();
  expect(createTag.mock.calls).toEqual([
    ['v1.0.1', false, 'abc1234'],
    ['v1', false, 'abc1234', true],
    ['v1.0', false, 'abc1234', true],
  ]);
});
test('dry_run suppresses remote tags and aliases', async () => {
  setInput('rolling_tags', 'true');
  setInput('dry_run', 'true');
  await action();
  expect(createTag).not.toHaveBeenCalled();
});
test('escaped gitmoji shortcode rules work', async () => {
  setInput('custom_release_rules', '\\:sparkles\\::minor:Features');
  commits.mockResolvedValue([commit(':sparkles:(web): new UI')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.1.0');
});
test('angular preset retains its legacy breaking-marker behavior', async () => {
  setInput('commit_analyzer_preset', 'angular');
  commits.mockResolvedValue([commit('feat!: compatibility')]);
  await action();
  expect(output).toHaveBeenCalledWith('new_version', '1.0.1');
});
test('reverted changes do not force an incorrect major release', async () => {
  commits.mockResolvedValue([
    { sha: '1234567', commit: { message: 'feat!: remove API' } },
    {
      sha: 'abcdef0',
      commit: {
        message: 'Revert "feat!: remove API"\n\nThis reverts commit 1234567.',
      },
    },
  ]);
  setInput('default_bump', 'false');
  await action();
  expect(createTag).not.toHaveBeenCalled();
});
test('ref overrides resolve a remote commit without requiring checkout', async () => {
  setInput('ref', 'refs/heads/release');
  setInput('release_branches', 'release');
  (github.resolveCommitRef as jest.Mock).mockResolvedValue('123456789abcdef');
  await action();
  expect(github.resolveCommitRef).toHaveBeenCalledWith('refs/heads/release');
  expect(createTag).toHaveBeenCalledWith('v1.0.1', false, '123456789abcdef');
});
test('commit_sha takes precedence over ref for the target', async () => {
  setInput('ref', 'refs/heads/main');
  setInput('commit_sha', '9999999');
  await action();
  expect(createTag).toHaveBeenCalledWith('v1.0.1', false, '9999999');
});
test('pull_request with refs/pull never publishes', async () => {
  process.env.GITHUB_REF = 'refs/pull/123/merge';
  setInput('release_branches', '.*');
  await action();
  expect(createTag).not.toHaveBeenCalled();
});
test('local-only previews do not publish remotely', async () => {
  setBranch('feature');
  setInput('push', 'false');
  await action();
  expect(createTag).not.toHaveBeenCalled();
  expect(github.createLocalTag).toHaveBeenCalledWith(
    'v1.0.1-abc1234',
    'abc1234',
    false,
    false
  );
});
test('dry run suppresses explicit local creation too', async () => {
  setInput('push', 'false');
  setInput('dry_run', 'true');
  await action();
  expect(github.createLocalTag).not.toHaveBeenCalled();
});
test('preset configuration customizes issue links', async () => {
  setInput(
    'preset_config',
    JSON.stringify({
      issuePrefixes: ['AB#'],
      issueUrlFormat: 'https://tracker.example/items/{{id}}',
    })
  );
  commits.mockResolvedValue([commit('fix: close AB#123')]);
  await action();
  expect(output).toHaveBeenCalledWith(
    'changelog',
    expect.stringContaining('https://tracker.example/items/123')
  );
});
test('rolling aliases cannot point elsewhere than an existing immutable version tag', async () => {
  setInput('custom_tag', '1.0.0');
  setInput('rolling_tags', 'true');
  tags.mockResolvedValue([{ name: 'v1.0.0', commit: { sha: 'oldsha' } }]);
  await action();
  expect(createTag.mock.calls).toEqual([
    ['v1', false, 'oldsha', true],
    ['v1.0', false, 'oldsha', true],
  ]);
});
test('release_type reports an actual RC increment', async () => {
  setBranch('staging');
  setInput('pre_release_branches', 'staging');
  tags.mockResolvedValue([tag('v1.0.1-staging.0'), tag('v1.0.0')]);
  await action();
  expect(output).toHaveBeenCalledWith('release_type', 'prerelease');
});
