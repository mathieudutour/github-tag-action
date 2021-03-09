"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCustomReleaseRules = exports.getLatestPrereleaseTag = exports.getLatestTag = exports.isPr = exports.getBranchFromRef = exports.getCommits = exports.getValidTags = void 0;
const core = __importStar(require("@actions/core"));
const semver_1 = require("semver");
// @ts-ignore
const default_release_types_1 = __importDefault(require("@semantic-release/commit-analyzer/lib/default-release-types"));
const github_1 = require("./github");
function getValidTags(prefixRegex) {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield github_1.listTags();
        const invalidTags = tags.filter((tag) => !semver_1.valid(tag.name.replace(prefixRegex, '')));
        invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));
        const validTags = tags
            .filter((tag) => semver_1.valid(tag.name.replace(prefixRegex, '')))
            .sort((a, b) => semver_1.rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, '')));
        validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));
        return validTags;
    });
}
exports.getValidTags = getValidTags;
function getCommits(baseRef, headRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const commits = yield github_1.compareCommits(baseRef, headRef);
        return commits
            .filter((commit) => !!commit.commit.message)
            .map((commit) => ({
            message: commit.commit.message,
            hash: commit.sha,
        }));
    });
}
exports.getCommits = getCommits;
function getBranchFromRef(ref) {
    return ref.replace('refs/heads/', '');
}
exports.getBranchFromRef = getBranchFromRef;
function isPr(ref) {
    return ref.includes('refs/pull/');
}
exports.isPr = isPr;
function getLatestTag(tags, prefixRegex, tagPrefix) {
    return (tags.find((tag) => !semver_1.prerelease(tag.name.replace(prefixRegex, ''))) || {
        name: `${tagPrefix}0.0.0`,
        commit: {
            sha: 'HEAD',
        },
    });
}
exports.getLatestTag = getLatestTag;
function getLatestPrereleaseTag(tags, identifier, prefixRegex) {
    return tags
        .filter((tag) => semver_1.prerelease(tag.name.replace(prefixRegex, '')))
        .find((tag) => tag.name.replace(prefixRegex, '').match(identifier));
}
exports.getLatestPrereleaseTag = getLatestPrereleaseTag;
function mapCustomReleaseRules(customReleaseTypes) {
    const releaseRuleSeparator = ',';
    const releaseTypeSeparator = ':';
    return customReleaseTypes
        .split(releaseRuleSeparator)
        .map((customReleaseRule) => customReleaseRule.split(releaseTypeSeparator))
        .filter((customReleaseRule) => {
        if (customReleaseRule.length !== 2) {
            core.warning(`${customReleaseRule.join(releaseTypeSeparator)} is not a valid custom release definition.`);
            return false;
        }
        return true;
    })
        .map((customReleaseRule) => {
        const [keyword, release] = customReleaseRule;
        return {
            type: keyword,
            release,
        };
    })
        .filter((customRelease) => {
        if (!default_release_types_1.default.includes(customRelease.release)) {
            core.warning(`${customRelease.release} is not a valid release type.`);
            return false;
        }
        return true;
    });
}
exports.mapCustomReleaseRules = mapCustomReleaseRules;
