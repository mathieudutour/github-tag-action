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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = exports.compareCommits = exports.listTags = exports.getOctokitSingleton = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
let octokitSingleton;
function getOctokitSingleton() {
    if (octokitSingleton) {
        return octokitSingleton;
    }
    const githubToken = core.getInput('github_token');
    octokitSingleton = (0, github_1.getOctokit)(githubToken);
    return octokitSingleton;
}
exports.getOctokitSingleton = getOctokitSingleton;
/**
 * Fetch all tags for a given repository recursively
 */
async function listTags(shouldFetchAllTags = false, fetchedTags = [], page = 1) {
    const octokit = getOctokitSingleton();
    const tags = await octokit.rest.repos.listTags({
        ...github_1.context.repo,
        per_page: 100,
        page,
    });
    if (tags.data.length < 100 || shouldFetchAllTags === false) {
        return [...fetchedTags, ...tags.data];
    }
    return listTags(shouldFetchAllTags, [...fetchedTags, ...tags.data], page + 1);
}
exports.listTags = listTags;
/**
 * Compare `headRef` to `baseRef` (i.e. baseRef...headRef)
 * @param baseRef - old commit
 * @param headRef - new commit
 */
async function compareCommits(baseRef, headRef) {
    const octokit = getOctokitSingleton();
    core.debug(`Comparing commits (${baseRef}...${headRef})`);
    const commits = await octokit.rest.repos.compareCommits({
        ...github_1.context.repo,
        base: baseRef,
        head: headRef,
    });
    return commits.data.commits;
}
exports.compareCommits = compareCommits;
async function createTag(newTag, createAnnotatedTag, GITHUB_SHA) {
    const octokit = getOctokitSingleton();
    let annotatedTag = undefined;
    if (createAnnotatedTag) {
        core.debug(`Creating annotated tag.`);
        annotatedTag = await octokit.rest.git.createTag({
            ...github_1.context.repo,
            tag: newTag,
            message: newTag,
            object: GITHUB_SHA,
            type: 'commit',
        });
    }
    core.debug(`Pushing new tag to the repo.`);
    await octokit.rest.git.createRef({
        ...github_1.context.repo,
        ref: `refs/tags/${newTag}`,
        sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA,
    });
}
exports.createTag = createTag;
