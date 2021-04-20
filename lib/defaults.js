"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultChangelogRules = void 0;
/**
 * Default sections & changelog rules mentioned in `conventional-changelog-angular` & `conventional-changelog-conventionalcommits`.
 * References:
 * https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/writer-opts.js
 * https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/writer-opts.js
 */
exports.defaultChangelogRules = Object.freeze({
    feat: { type: 'feat', section: 'Features' },
    fix: { type: 'fix', section: 'Bug Fixes' },
    perf: { type: 'perf', section: 'Performance Improvements' },
    revert: { type: 'revert', section: 'Reverts' },
    docs: { type: 'docs', section: 'Documentation' },
    style: { type: 'style', section: 'Styles' },
    refactor: { type: 'refactor', section: 'Code Refactoring' },
    test: { type: 'test', section: 'Tests' },
    build: { type: 'build', section: 'Build Systems' },
    ci: { type: 'ci', section: 'Continuous Integration' },
});
