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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
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
// @ts-ignore
const default_release_types_1 = __importDefault(require("@semantic-release/commit-analyzer/lib/default-release-types"));
const github_1 = require("./github");
const defaults_1 = require("./defaults");
async function getValidTags(prefixRegex, shouldFetchAllTags) {
    const tags = await (0, github_1.listTags)(shouldFetchAllTags);
    const invalidTags = tags.filter((tag) => !prefixRegex.test(tag.name) || !(0, semver_1.valid)(tag.name.replace(prefixRegex, '')));
    invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));
    const validTags = tags
        .filter((tag) => prefixRegex.test(tag.name) && (0, semver_1.valid)(tag.name.replace(prefixRegex, '')))
        .sort((a, b) => (0, semver_1.rcompare)(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, '')));
    validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));
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
    return (tags.find((tag) => prefixRegex.test(tag.name) &&
        !(0, semver_1.prerelease)(tag.name.replace(prefixRegex, ''))) || {
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
        if (parts.length < 2) {
            core.warning(`${customReleaseRule} is not a valid custom release definition.`);
            return false;
        }
        const defaultRule = defaults_1.defaultChangelogRules[parts[0].toLowerCase()];
        if (customReleaseRule.length !== 3) {
            core.debug(`${customReleaseRule} doesn't mention the section for the changelog.`);
            core.debug(defaultRule
                ? `Default section (${defaultRule.section}) will be used instead.`
                : "The commits matching this rule won't be included in the changelog.");
        }
        if (!default_release_types_1.default.includes(parts[1])) {
            core.warning(`${parts[1]} is not a valid release type.`);
            return false;
        }
        return true;
    })
        .map((customReleaseRule) => {
        const [type, release, section] = customReleaseRule.split(releaseTypeSeparator);
        const defaultRule = defaults_1.defaultChangelogRules[type.toLowerCase()];
        return {
            type,
            release,
            section: section || defaultRule?.section,
        };
    });
}
function mergeWithDefaultChangelogRules(mappedReleaseRules = []) {
    const mergedRules = mappedReleaseRules.reduce((acc, curr) => ({
        ...acc,
        [curr.type]: curr,
    }), { ...defaults_1.defaultChangelogRules });
    return Object.values(mergedRules).filter((rule) => !!rule.section);
}
