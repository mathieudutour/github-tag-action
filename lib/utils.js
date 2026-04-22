"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidTags = getValidTags;
exports.getCommits = getCommits;
exports.getBranchFromRef = getBranchFromRef;
exports.isPr = isPr;
exports.getLatestTag = getLatestTag;
exports.getLatestPrereleaseTag = getLatestPrereleaseTag;
exports.mapCustomReleaseRules = mapCustomReleaseRules;
exports.mergeWithDefaultChangelogRules = mergeWithDefaultChangelogRules;
const core = __importStar(require("@actions/core"));
const semver_1 = require("semver");
const github_1 = require("./github");
const defaults_1 = require("./defaults");
// Mirror of the list exported by `@semantic-release/commit-analyzer`
// (its internal `lib/default-release-types.js` is not a public export).
// See: https://github.com/semantic-release/commit-analyzer
const DEFAULT_RELEASE_TYPES = [
    'major',
    'premajor',
    'minor',
    'preminor',
    'patch',
    'prepatch',
    'prerelease',
];
async function getValidTags(prefixRegex, shouldFetchAllTags) {
    const tags = await (0, github_1.listTags)(shouldFetchAllTags);
    const invalidTags = tags.filter((tag) => !prefixRegex.test(tag.name) || !(0, semver_1.valid)(tag.name.replace(prefixRegex, '')));
    invalidTags.forEach((tag) => {
        core.debug(`Found Invalid Tag: ${tag.name}.`);
    });
    const validTags = tags
        .filter((tag) => prefixRegex.test(tag.name) && (0, semver_1.valid)(tag.name.replace(prefixRegex, '')))
        .sort((a, b) => (0, semver_1.rcompare)(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, '')));
    validTags.forEach((tag) => {
        core.debug(`Found Valid Tag: ${tag.name}.`);
    });
    return validTags;
}
async function getCommits(baseRef, headRef) {
    const commits = await (0, github_1.compareCommits)(baseRef, headRef);
    return commits
        .filter((commit) => !!commit.commit.message)
        .map((commit) => ({
        message: commit.commit.message,
        hash: commit.sha,
    }));
}
function getBranchFromRef(ref) {
    return ref.replace('refs/heads/', '');
}
function isPr(ref) {
    return ref.includes('refs/pull/');
}
function getLatestTag(tags, prefixRegex, tagPrefix) {
    return (tags.find((tag) => !(0, semver_1.prerelease)(tag.name.replace(prefixRegex, ''))) ?? {
        name: `${tagPrefix}0.0.0`,
        commit: {
            sha: 'HEAD',
        },
    });
}
function getLatestPrereleaseTag(tags, identifier, prefixRegex) {
    return tags
        .filter((tag) => (0, semver_1.prerelease)(tag.name.replace(prefixRegex, '')))
        .find((tag) => tag.name.replace(prefixRegex, '').match(identifier));
}
function mapCustomReleaseRules(customReleaseTypes) {
    const releaseRuleSeparator = ',';
    const releaseTypeSeparator = ':';
    return customReleaseTypes
        .split(releaseRuleSeparator)
        .filter((customReleaseRule) => {
        const parts = customReleaseRule.split(releaseTypeSeparator);
        const rawType = parts[0];
        const rawRelease = parts[1];
        if (rawType === undefined || rawRelease === undefined) {
            core.warning(`${customReleaseRule} is not a valid custom release definition.`);
            return false;
        }
        const defaultRule = defaults_1.defaultChangelogRules[rawType.toLowerCase()];
        if (parts.length !== 3) {
            core.debug(`${customReleaseRule} doesn't mention the section for the changelog.`);
            core.debug(defaultRule
                ? `Default section (${defaultRule.section ?? ''}) will be used instead.`
                : "The commits matching this rule won't be included in the changelog.");
        }
        if (!DEFAULT_RELEASE_TYPES.includes(rawRelease)) {
            core.warning(`${rawRelease} is not a valid release type.`);
            return false;
        }
        return true;
    })
        .map((customReleaseRule) => {
        const parts = customReleaseRule.split(releaseTypeSeparator);
        const type = parts[0] ?? '';
        const release = parts[1] ?? '';
        const section = parts[2];
        const defaultRule = defaults_1.defaultChangelogRules[type.toLowerCase()];
        const resolvedSection = section ?? defaultRule?.section;
        return {
            type,
            release,
            section: resolvedSection,
        };
    });
}
function mergeWithDefaultChangelogRules(mappedReleaseRules = []) {
    const mergedRules = mappedReleaseRules.reduce((acc, curr) => ({
        ...acc,
        [curr.type]: curr,
    }), { ...defaults_1.defaultChangelogRules });
    return Object.values(mergedRules).filter((rule) => Boolean(rule.section));
}
//# sourceMappingURL=utils.js.map