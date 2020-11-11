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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestPrereleaseTag = exports.getLatestTag = exports.createTag = exports.getBranchFromRef = exports.getCommits = exports.getValidTags = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const semver_1 = require("semver");
const githubToken = core.getInput("github_token");
const octokit = new github_1.GitHub(githubToken);
function getValidTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield octokit.repos.listTags(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100 }));
        const invalidTags = tags.data
            .map((tag) => tag.name)
            .filter((name) => !semver_1.valid(name));
        invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));
        const validTags = tags.data
            .filter((tag) => semver_1.valid(tag.name))
            .sort((a, b) => semver_1.rcompare(a.name, b.name));
        validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));
        return validTags;
    });
}
exports.getValidTags = getValidTags;
function getCommits(sha) {
    return __awaiter(this, void 0, void 0, function* () {
        const commits = yield octokit.repos.compareCommits(Object.assign(Object.assign({}, github_1.context.repo), { base: sha, head: "HEAD" }));
        return commits.data.commits
            .filter((commit) => !!commit.commit.message)
            .map((commit) => ({
            message: commit.commit.message,
            hash: commit.sha,
        }));
    });
}
exports.getCommits = getCommits;
function getBranchFromRef(ref) {
    return ref.replace("refs/heads/", "");
}
exports.getBranchFromRef = getBranchFromRef;
function createTag(newTag, createAnnotatedTag, GITHUB_SHA) {
    return __awaiter(this, void 0, void 0, function* () {
        let annotatedTag = undefined;
        if (createAnnotatedTag) {
            core.debug(`Creating annotated tag.`);
            annotatedTag = yield octokit.git.createTag(Object.assign(Object.assign({}, github_1.context.repo), { tag: newTag, message: newTag, object: GITHUB_SHA, type: "commit" }));
        }
        core.debug(`Pushing new tag to the repo.`);
        yield octokit.git.createRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `refs/tags/${newTag}`, sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA }));
    });
}
exports.createTag = createTag;
function getLatestTag(tags) {
    return (tags.find((tag) => !semver_1.prerelease(tag.name)) || {
        name: "0.0.0",
        commit: {
            sha: "HEAD",
        },
    });
}
exports.getLatestTag = getLatestTag;
function getLatestPrereleaseTag(tags, identifier) {
    return tags
        .filter((tag) => semver_1.prerelease(tag.name))
        .find((tag) => tag.name.match(identifier));
}
exports.getLatestPrereleaseTag = getLatestPrereleaseTag;
