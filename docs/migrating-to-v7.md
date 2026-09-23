# Migrating from v6 to v7

v7 changes version calculation and branch handling as well as the action runtime. Review the changes below before replacing `mathieudutour/github-tag-action@v6.2` with `mathieudutour/github-tag-action@v7`.

## Update your workflow

The following example publishes releases from `main`. Adjust the branch to match your repository. Self-hosted runners must support Node 24; changing `actions/setup-node` in your workflow does not change the runtime used by this action.

```yaml
name: Release
on:
  push:
    branches: [main]

permissions:
  contents: write

concurrency:
  group: release-main
  cancel-in-progress: false

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - name: Calculate and publish tag
        id: tag
        uses: mathieudutour/github-tag-action@v7
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          release_branches: main
      - name: Create GitHub release
        if: steps.tag.outputs.new_tag != ''
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag.outputs.new_tag }}
          name: Release ${{ steps.tag.outputs.new_tag }}
          body: ${{ steps.tag.outputs.changelog }}
          prerelease: ${{ steps.tag.outputs.prerelease == 'true' }}
```

`fetch-depth: 0` enables the local Git fallback if the GitHub compare API is unavailable. Normal tag and commit discovery uses the API, so a full checkout is not required for the normal path. The action includes its dependencies; consumers do not need to install them.

## Review changed defaults

| Area                | v6 behavior                                                                       | v7 behavior and migration                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commit parsing      | Analysis used Angular while changelogs used Conventional Commits.                 | Both use Conventional Commits. `feat!: ...` now triggers a major bump. Set `commit_analyzer_preset: angular` if you need Angular parsing; this also applies to the changelog.                         |
| Release branches    | Expressions could match part of a branch name; `main` also matched `maintenance`. | Expressions match the whole name. Use `release.*` for a family of branches, rather than relying on a partial `release` match.                                                                         |
| Prerelease branches | An empty input effectively matched every non-release branch.                      | An empty input matches nothing. Set `pre_release_branches: '.*'` explicitly if you want prereleases for all non-release branches.                                                                     |
| Tag discovery       | Only the first 100 tags were fetched by default.                                  | All pages are fetched. Remove `fetch_all_tags: false` or change it to `true`; a full page with `false` now fails rather than risking an incorrect version.                                            |
| No new commits      | The default bump could produce another tag.                                       | No new tag/version is calculated when there are no eligible commits, unless a custom tag or force-bump input is supplied. Guard downstream steps against an empty `new_tag`.                          |
| Ignored commits     | `[no-release]` and `[skip-release]` had no special meaning.                       | Commits containing either marker are excluded from both the bump and changelog. Set `ignore_keywords: ''` to disable this filter.                                                                     |
| Tag prefixes        | Prefixes were interpreted as regular expressions.                                 | Prefixes are literal. Remove regex escaping from `tag_prefix`; use `tag_search_pattern` to filter the tag stream.                                                                                     |
| First release       | Missing tags could lead to zero commits being analyzed.                           | All history reachable from the target commit is analyzed. The first version can therefore reflect an older feature or breaking change. `initial_version` sets the starting baseline, default `0.0.0`. |

## Configure prereleases explicitly

For stable releases on `main` and release candidates on `staging`:

```yaml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  release_branches: main
  pre_release_branches: staging
  append_to_pre_release_tag: rc
```

The prerelease calculation also changes:

- A fix after `1.1.1-rc.0`, with stable baseline `1.1.0`, produces `1.1.1-rc.1` instead of `1.1.2-rc.0`.
- A higher-level change can still advance the base: a feature on that patch candidate starts `1.2.0-rc.0`; a breaking change starts `2.0.0-rc.0`.
- When there is no detected bump and `default_prerelease_bump` is `prerelease`, the first candidate honors `default_bump`. With stable `1.2.3` and `default_bump: minor`, it starts at `1.3.0-rc.0`. Set `default_draft_bump: patch` if you want the first candidate to start at the next patch instead.
- Identifiers match exactly. A branch named `feature` no longer selects tags for `feature-extra`.
- Stable releases calculate from the latest matching stable tag, rather than an unrelated prerelease. Use `tag_search_pattern: 'v1.*'` when maintaining a separate v1 release stream.

Use `force_prerelease_bump` only when you intentionally want to override automatic candidate progression. For example, `prepatch` starts another patch candidate even if the current tag is already an RC.

## Check PR and tag-triggered workflows

PR events never publish remote tags, including `pull_request_target` events whose ref points at the base branch. PRs and branches outside both configured branch lists calculate preview versions with a seven-character commit SHA suffix, such as `1.2.4-abcdef0`. Update downstream consumers that assumed these previews were plain `major.minor.patch` versions.

Tag-triggered runs are skipped entirely to prevent recursive tagging. Move intentional release calculations to a branch push or manual workflow. For manual or comment-triggered workflows, `ref` selects the branch/ref and `commit_sha` can override the target commit.

The target defaults to the event's `GITHUB_SHA`. If an earlier step creates a new commit, pass its pushed SHA through `commit_sha`; changing the checkout does not change the event SHA.

## Make intentional version overrides explicit

`default_bump` remains a fallback for commits that do not select a bump. It does not override a detected feature or breaking change, and it no longer creates a release from an empty commit set.

For a workflow that deliberately creates a patch release regardless of commit analysis:

```yaml
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  force_bump: patch
```

Use `custom_tag` for an exact version. It still receives `tag_prefix`, so set `tag_prefix: ''` if the supplied tag should be used unchanged. `previous_tag` and `previous_version` are now available as outputs even when using `custom_tag`.

New capabilities such as `path_filter`, `scopes`, `parse_squash_commits`, `force_update`, `rolling_tags`, and local tagging are optional. They are not required to migrate an existing workflow. See the [README input reference](../README.md#-inputs) for their contracts.

## Validate before publishing

First run the tag step with `dry_run: true` using representative release and prerelease commits. Disable downstream publishing steps during this check: a dry run still emits `new_tag` and changelog outputs, so an empty-output guard alone will not prevent a separate release action from publishing.

Check the calculated version, selected previous tag, changelog, and prerelease flag. Then remove `dry_run` to enable publishing. Dry runs still require `github_token` because history is read through the GitHub API.

The action retries transient API reads and can fall back to complete local history for commit comparisons. It fails if neither source can provide the history. Leave `soft_fail` disabled when a missing release should fail the workflow; enabling it clears release outputs and warns, but cannot undo a write that already succeeded.
