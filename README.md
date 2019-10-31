# GitHub Tag Action

A Github Action to automatically bump and tag master, on merge, with the latest SemVer formatted version. Works on any platform.

## Usage

```Dockerfile
name: Bump version
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Bump version and push tag
      uses: mathieudutour/github-tag-action@v1
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs

- **github_token** _(required)_ - Required for permission to tag the repo. Usually `${{ secrets.GITHUB_TOKEN }}`.
- **default_bump** _(optional)_ - Which type of bump to use when none explicitly provided (default: `minor`).
- **tag_prefix** _(optional)_ - A prefix to the tag name (default: `v`).
- **release_branches** _(optional)_ - Comma separated list of branches (bash reg exp accepted) that will generate the release tags. Other branches and pull-requests generate versions postfixed with the commit hash and do not generate any tag. Examples: `master` or `.*` or `release.*,hotfix.*,master` ...

### Outputs

- **new_tag** - The value of the newly created tag.

> **_Note:_** This action creates a [lightweight tag](https://developer.github.com/v3/git/refs/#create-a-reference).

## Credits

[anothrNick/github-tag-action](https://github.com/anothrNick/github-tag-action) - a similar action using a Dockerfile
