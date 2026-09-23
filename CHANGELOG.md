# v7.0.0

v7 upgrades the action to Node 24 and introduces breaking changes to version calculation and branch handling. Review the migration guide before upgrading from v6.

- Run on Node 24 and ship a self-contained `dist/` bundle with both supported commit presets, templates, dependencies, and license notices. Refresh the lockfile, remove the old Octokit dependency chain, and retain proxy support.
- Align analysis and changelogs on Conventional Commits, including `feat!`. Angular remains selectable.
- Match whole branch names; an empty prerelease list now means no prerelease branches. Never publish from PR events or recursively process tag events. Preview versions include a commit SHA suffix.
- Fetch all tags and all compare-commit pages. Explicitly restricted tag fetching fails when results might be incomplete. Read initial commit history instead of comparing against a fabricated HEAD baseline.
- Skip version creation when no eligible commits remain, unless custom or forced versioning was explicitly requested.
- Keep stable release baselines separate from unrelated prereleases; match prerelease identifiers exactly, honor the first prerelease default, increment existing RCs, and allow higher-level changes to advance the RC base.
- Add path/scope/ignore filters, opt-in squash-bullet parsing, tag-stream filtering, explicit bump/version inputs, local/moving/rolling tags, repository/ref/directory overrides, and release metadata outputs.
- Retry transient API reads and fall back to complete local Git history for compare failures. No history means no guessed release. Optional soft failure clears release outputs.

## Migration

See [Migrating from v6 to v7](docs/migrating-to-v7.md) for changed defaults, workflow examples, prerelease behavior, and a dry-run validation procedure.

New inputs are opt-in unless explicitly described above and require v7. See the [README](README.md) for the full input contract.
