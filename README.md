# GitHub Tag Action

A GitHub Action to automatically bump and tag master, on merge, with the latest SemVer formatted version. Works on any platform.

## Usage

```yaml
name: Bump version
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Bump version and push tag
        id: tag_version
        uses: mathieudutour/github-tag-action@v4.6
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      - name: Create a GitHub release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.tag_version.outputs.new_tag }}
          release_name: Release ${{ steps.tag_version.outputs.new_tag }}
          body: ${{ steps.tag_version.outputs.changelog }}
```

### 📥 Inputs

- **github_token** _(required)_ - Required for permission to tag the repo. Usually `${{ secrets.GITHUB_TOKEN }}`.

#### Filter branches

- **release_branches** _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate the release tags. Other branches and pull-requests generate versions postfixed with the commit hash and do not generate any tag. Examples: `master` or `.*` or `release.*,hotfix.*,master`... (default: `master`).
- **pre_release_branches** _(optional)_ - Comma separated list of branches (JavaScript regular expression accepted) that will generate pre-release tags.

#### Customize the tag

- **default_bump** _(optional)_ - Which type of bump to use when [none is explicitly provided](#bumping) (default: `patch`). You can also set `false` to avoid generating a new tag when none is explicitly provided.
- **custom_tag** _(optional)_ - Custom tag name. If specified, it overrides bump settings.
- **create_annotated_tag** _(optional)_ - Boolean to create an annotated rather than a lightweight one (default: `false`).
- **tag_prefix** _(optional)_ - A prefix to the tag name (default: `v`).
- **append_to_pre_release_tag** _(optional)_ - A suffix to the pre-release tag name (default: `<branch>`).

#### Debugging

- **dry_run** _(optional)_ - Do not perform tagging, just calculate next version and changelog, then exit

### 📤 Outputs

- **new_tag** - The value of the newly created tag. Note that if there hasn't been any new commit, this will be `undefined`.
- **new_version** - The value of the newly created tag without the prefix. Note that if there hasn't been any new commit, this will be `undefined`.
- **previous_tag** - The value of the previous tag (or `0.0.0` if none). Note that if `custom_tag` is set, this will be `undefined`.
- **changelog** - The [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) since the previous tag.

> **_Note:_** This action creates a [lightweight tag](https://developer.github.com/v3/git/refs/#create-a-reference) by default.

### Bumping

The action will parse the new commits since the last tag using the [semantic-release](https://github.com/semantic-release/semantic-release) conventions.

semantic-release uses the commit messages to determine the type of changes in the codebase. Following formalized conventions for commit messages, semantic-release automatically determines the next [semantic version](https://semver.org) number.

By default semantic-release uses [Angular Commit Message Conventions](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines).

Here is an example of the release type that will be done based on a commit messages:

| Commit message                                                                                                                                                                                   | Release type  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `fix(pencil): stop graphite breaking when too much pressure applied`                                                                                                                             | Patch Release |
| `feat(pencil): add 'graphiteWidth' option`                                                                                                                                                       | Minor Release |
| `perf(pencil): remove graphiteWidth option`<br><br>`BREAKING CHANGE: The graphiteWidth option has been removed.`<br>`The default graphite width of 10mm is always used for performance reasons.` | Major Release |

If no commit message contains any information, then **default_bump** will be used.

## Credits

[anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action) - a similar action using a Dockerfile (hence not working on macOS)
