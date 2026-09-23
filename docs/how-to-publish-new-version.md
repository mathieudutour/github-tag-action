# Publishing the action

Run on Node 24:

```sh
npm ci
npm test -- --runInBand
npm run check
npm run typecheck
npm run build
npm run smoke
```

Commit the generated `dist/` directory (JavaScript, templates, and license notices) with the source. `action.yml` executes `dist/index.js`; consumers must not need `npm install`, `lib/`, or `node_modules/`. CI rebuilds and compares the distribution to catch stale generated code.

The smoke test copies only `dist/` into an isolated temporary directory and exercises it against a local API and temporary Git checkout. It publishes nothing to GitHub and requires no secrets. Before releasing, also validate a workflow in a disposable GitHub repository with the intended permissions, runner, proxy settings, and branch events.

Publish a new major version for the behavior changes in CHANGELOG.md. Do not move existing v6 tags to this code. Preparing this checkout does not publish a release or resolve open GitHub issues automatically.
