# How to publish a new version of the action

## Publish to a distribution branch

Actions are run from GitHub repos. We will create a releases branch and only checkin production modules (core in this case).

Comment out node_modules in .gitignore and create a releases/v1 branch

```bash
# comment out in distribution branches
# node_modules/
# lib/
```

```bash
$ git checkout -b releases/v1
$ npm install
$ npm run build
$ npm prune --production
$ git add .
$ git commit -a -m "prod dependencies"
$ git push
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing the releases/v1 branch

```yaml
uses: mathieudutour/github-tag-action@releases/v1
```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:

## Create a tag

After testing you can [create a tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and tested action

```yaml
uses: mathieudutour/github-tag-action@v1
```
