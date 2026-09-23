# GitHub Tag Action

A GitHub Action to automatically bump and tag master, on merge, with the latest SemVer formatted version. Works on GitHub Actions runners supporting Node 24.

> This README describes v7. See [Migrating from v6 to v7](docs/migrating-to-v7.md) before upgrading.

## Usage

```yaml
name: Bump version
on:
  push:
    branches:
      - master
permissions:
  contents: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Bump version and push tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v7
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - name: Create a GitHub release
        if: steps.tag_version.outputs.new_tag != ''
        uses: ncipollo/release-action@v1
        with:
          tag: ${{ steps.tag_version.outputs.new_tag }}
          name: Release ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}
          prerelease: ${{ steps.tag_version.outputs.prerelease == 'true' }}
```

### 📥 Inputs

- **github_token** _(required)_ - Required to read repository history, including in dry runs. Publishing needs `contents: write`. Usually `${{ secrets.GITHUB_TOKEN }}`.
- **commit_sha** _(optional)_ - The commit SHA value to add the tag. If specified, it uses this value instead GITHUB_SHA. It could be useful when a previous step merged a branch into github.ref.

#### Fetch all tags

- **fetch_all_tags** _(optional)_ - Fetch every page of tags (default: `true`). With `false`, a full 100-tag page fails explicitly because selecting a version from incomplete results would be unsafe.

#### Filter branches

- **release_branches** _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate the release tags. Other branches and pull-requests generate versions postfixed with the commit hash and do not generate any repository tag. Examples: `master` or `.*` or `release.*,hotfix.*,master`... (default: `^master$,^main$`). Expressions match the whole branch name.
- **pre_release_branches** _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate the pre-release tags. Empty means no prerelease branches. Pull-request events always calculate preview versions without publishing; tag-triggered runs are skipped.

#### Customize the tag

- **default_bump** _(optional)_ - Which type of bump to use when [none is explicitly provided](#bumping) when commiting to a release branch (default: `patch`). You can also set `false` to avoid generating a new tag when none is explicitly provided. Can be `patch, minor or major`.
- **default_prerelease_bump** _(optional)_ - Which type of bump to use when [none is explicitly provided](#bumping) when commiting to a prerelease branch (default: `prerelease`). You can also set `false` to avoid generating a new tag when none is explicitly provided. Can be `prerelease, prepatch, preminor or premajor`.
- **custom_tag** _(optional)_ - Custom tag name. If specified, it overrides bump settings.
- **create_annotated_tag** _(optional)_ - Boolean to create an annotated rather than a lightweight one (default: `false`).
- **tag_prefix** _(optional)_ - A prefix to the tag name (default: `v`).
- **append_to_pre_release_tag** _(optional)_ - A suffix to the pre-release tag name (default: `<branch>`).

#### Customize the conventional commit messages & titles of changelog sections

- **custom_release_rules** _(optional)_ - Comma separated list of release rules.

  **Format**: `<keyword>:<release_type>:<changelog_section>` where `<changelog_section>` is optional and will default to [Angular's conventions](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular).

  **Examples**:

  1. `hotfix:patch,pre-feat:preminor`,
  2. `bug:patch:Bug Fixes,chore:patch:Chores`

#### Debugging

- **dry_run** _(optional)_ - Do not perform tagging, just calculate next version and changelog, then exit

### 📤 Outputs

- **new_tag** - The value of the newly calculated tag. Note that if there hasn't been any new commit, this will be `undefined`.
- **new_version** - The value of the newly created tag without the prefix. Note that if there hasn't been any new commit, this will be `undefined`.
- **previous_tag** - The value of the previous tag (or `v0.0.0` if none). Available with `custom_tag` too.
- **previous_version** - The value of the previous tag (or `0.0.0` if none) without the prefix. Available with `custom_tag` too.
- **release_type** - The computed release type (`major`, `minor`, `patch` or `custom` - can be prefixed with `pre`).
- **changelog** - The [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) since the previous tag.

> **_Note:_** This action creates a [lightweight tag](https://developer.github.com/v3/git/refs/#create-a-reference) by default.

### Bumping

The action will parse the new commits since the last tag using the [semantic-release](https://github.com/semantic-release/semantic-release) conventions.

semantic-release uses the commit messages to determine the type of changes in the codebase. Following formalized conventions for commit messages, semantic-release automatically determines the next [semantic version](https://semver.org) number.

The default parser is `conventionalcommits`, shared by bump analysis and changelog generation. Both `feat!: breaking change` and `BREAKING CHANGE:` footers trigger a major release. Set `commit_analyzer_preset: angular` for Angular parsing.

Here is an example of the release type that will be done based on a commit messages:

<table>
<tr>
<td> Commit message </td> <td> Release type </td>
</tr>
<tr>
<td>

```
fix(pencil): stop graphite breaking when too much pressure applied
```

</td>
<td>Patch Release</td>
</tr>
<tr>
<td>

```
feat(pencil): add 'graphiteWidth' option
```

</td>
<td>Minor Release</td>
</tr>
<tr>
<td>

```
perf(pencil): remove graphiteWidth option

BREAKING CHANGE: The graphiteWidth option has been removed.
The default graphite width of 10mm is always used for performance reasons.
```

</td>
<td>Major Release</td>
</tr>
</table>

If eligible commits exist but none selects a bump, **default_bump** is used. With no eligible commits, no new version is calculated unless `custom_tag` or a force-bump input is supplied.

#### Commit and tag selection

- **path_filter** — Comma-separated repository-relative directories or file globs, such as `packages/web,shared/**`. Both old and new paths of renamed files count. Each commit's files are fetched separately. A truncated file list fails instead of silently omitting changes.
- **scopes** — Comma-separated conventional commit scope globs. When combined with paths, both filters must match.
- **ignore_keywords** — Comma-separated literal strings excluding entire commits from both the bump and changelog. Default: `[no-release],[skip-release]`. Set an empty string to disable.
- **parse_squash_commits** — Opt in to analyzing conventional subjects in `* ...` or `- ...` squash-message bullets in addition to the original commit. Default: `false`. Conventional PR titles remain the recommended default. This does not recover commits removed by squash/rebase or infer missing footers for individual bullets.
- **commit_analyzer_preset** — `conventionalcommits` (default) or `angular`. Both presets and their templates ship inside the action; arbitrary installed preset packages are not loaded.
- **preset_config** — JSON object for the conventional preset, for example `{"issuePrefixes":["AB#"],"issueUrlFormat":"https://dev.azure.com/example/project/_workitems/edit/{{id}}"}`. This action does not read `.releaserc`.
- **tag_search_pattern** — Glob restricting the version stream, e.g. `v1.*` for a maintained v1 branch. Without a filter, the highest matching semantic version in the repository is used; branch ancestry is not inferred.
- **prefix_match_tag** — Reject an additional `v` after `tag_prefix`. With an empty prefix, this separates legacy `1.2.3` tags from `v2.0.0` tags. Default: `false`.

#### Explicit versions and prereleases

- **force_bump** / **force_prerelease_bump** — Override commit analysis, including when there are no new commits. Accepted bump types are `major`, `minor`, `patch`, `premajor`, `preminor`, `prepatch`, `prerelease`; `false` disables version creation for that mode. Prefer the `pre*` types for prereleases.
- **default_draft_bump** — First prerelease's base bump when `default_prerelease_bump` is `prerelease`. Defaults to `default_bump` (or `patch` when that is `false`).
- **initial_version** — Semantic baseline before the first tag, default `0.0.0`. The first release analyzes all history reachable from the target commit.
- **previous_tag** — Explicit Git tag to compare against. **previous_version** optionally supplies its semantic baseline, allowing a legacy tag such as `1.2.3.4` to be analyzed as `1.2.3`.
- **custom_tag_prerelease** — Interpret a semantic `custom_tag` as the target version and append/increment its prerelease identifier, e.g. `2.0.0-rc.0`. Default: `false`.

An existing prerelease already includes its version bump: a fix after `1.1.1-rc.0` produces `1.1.1-rc.1`. A higher-level change can still advance the base: a feature on a patch RC starts a minor RC; a breaking change starts a major RC. Explicit force-bump inputs override that progression. Identifiers match exactly, so `feature` never selects `feature-extra` tags. Empty `append_to_pre_release_tag` uses the branch name; to produce stable tags, configure `release_branches` instead.

Custom tags are literal suffixes after `tag_prefix`. Use `tag_prefix: ""` to avoid `v`, or `custom_tag` for formats such as `1.2`, `1.2.3.4`, or `deployed`. Automatic calculation stays SemVer-compliant, including the numerical prerelease counter. To omit that counter, provide your own `custom_tag`.

#### Publishing, local tags, and repository context

- **force_update** — Allow updating an existing tag, e.g. `custom_tag: deployed` with an empty prefix. Default: `false`.
- **rolling_tags** — After publishing a stable semantic tag, update major and minor aliases, e.g. `v2` and `v2.3`. Default: `false`. These aliases deliberately move; the full version tag is not overwritten unless `force_update` is also enabled.
- **push** — Default `true`. Set `false` to create the tag only in the local checkout.
- **create_local_tag** — Also create the calculated tag locally, default `false`. Remote tagging uses the GitHub API and does not otherwise update `.git`. Annotated local tags require Git identity configuration.
- **working_directory** — Checkout directory for local Git operations, including API fallback; default is the current directory.
- **repository** — Target `owner/repo`, default `GITHUB_REPOSITORY`. The token and selected ref/SHA must belong to or be accessible in that repository. Local operations require its matching checkout.
- **repository_url** — Override repository links in the changelog, default selected repository on `GITHUB_SERVER_URL`.
- **ref** — Override branch/ref selection for manual or comment-triggered workflows. Also selects the target commit unless `commit_sha` is supplied. `commit_sha` takes precedence, then `ref`, then `GITHUB_SHA`.
- **soft_fail** — On an error, warn and clear release outputs instead of failing the step. Default: `false`. Earlier successful writes cannot be rolled back; inspect logs before retrying.

`dry_run: true` suppresses all tag writes, including local tags and rolling aliases. PR events never publish remote tags, even when configured as release branches. Unlisted branches and PRs receive versions ending in the first seven characters of the target commit hash.

Concurrent runs targeting the same version stream should be serialized with workflow `concurrency`. The action retries transient server failures for reads only. If the compare API remains unavailable, it uses a complete local checkout (`fetch-depth: 0`). It fails if neither source can provide history, rather than guessing a bump.

### Additional outputs

- **prerelease** — `true` or `false` for the calculated version; suitable for a downstream release action.
- **latest_release_tag** / **latest_release_version** — Latest stable tag/version in the selected stream, independent of the current prerelease.
- **changelog_url** — Comparison URL, or commit-history URL for an initial release.

## Troubleshooting

- **No token / 403 / 404:** provide an available token, give it repository access and `contents: write` when publishing, and check repository tag rules. Fork and Dependabot events may not receive your secrets. Tagging older workflow-changing commits may require additional token permissions; the action cannot grant these.
- **A tag does not trigger another workflow:** GitHub restricts events created with `GITHUB_TOKEN`; use an appropriately scoped GitHub App/PAT when a separate workflow must run. Keep triggers restricted to branches to avoid loops. The action also ignores tag-triggered runs.
- **Commit ignored:** the conventional subject must start the commit message, not appear only in its description. Use `feat: ...`, `fix(scope): ...`, or a matching custom rule. Escaped colon types are supported, e.g. `\:sparkles\::minor:Features` for `:sparkles:(web): new UI`.
- **Downstream release says no tag found:** guard the step with `if: steps.tag_version.outputs.new_tag != ''`; no eligible bump intentionally produces no new tag.
- **A file updated earlier in the workflow is not in the tag:** commit and push that file, then pass its new SHA through `commit_sha`. `GITHUB_SHA` remains the original event SHA. Use a dry run to calculate the version and `custom_tag` to reuse it.
- **Tag not found locally:** use `create_local_tag: true`, `push: false`, or explicitly fetch the remote tags afterward. Fetching is required if you need the exact remote annotated tag object locally.
- **Proxy runners:** HTTP(S) proxy variables and `NO_PROXY` are supported by the bundled HTTP client. No runtime npm install is required. Extra corporate CA certificates can be provided through `NODE_EXTRA_CA_CERTS`.
- **Legacy reports:** errors from v5/v6 should be reproduced with the new distribution before being closed; upgrading source alone does not change a published action tag.

## Credits

[anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action) - a similar action using a Dockerfile (hence not working on macOS)
