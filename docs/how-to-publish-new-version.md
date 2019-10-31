# How to publish a new version of the action

## Publish to a distribution branch

Actions are run from GitHub repos. We will create a releases branch and only checkin production modules (core in this case).

Comment out node_modules in .gitignore and create a releases/v1 branch

```bash
# comment out in distribution branches
# node_modules/
```

```bash
$ git checkout -b releases/v1
$ git commit -a -m "prod dependencies"
```

```bash
$ npm prune --production
$ git add node_modules
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing the releases/v1 branch

```yaml
uses: mathieudutour/github-tag-action@releases/v1
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:

## Usage

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and tested action

```yaml
uses: mathieudutour/github-tag-action@v1
with:
  milliseconds: 1000
```
