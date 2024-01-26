var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { context, getOctokit } from '@actions/github';
import * as core from '@actions/core';
let octokitSingleton;
export function getOctokitSingleton() {
    if (octokitSingleton) {
        return octokitSingleton;
    }
    const githubToken = core.getInput('github_token');
    octokitSingleton = getOctokit(githubToken);
    return octokitSingleton;
}
/**
 * Fetch all tags for a given repository recursively
 */
export function listTags(shouldFetchAllTags = false, fetchedTags = [], page = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        const tags = yield octokit.rest.repos.listTags(Object.assign(Object.assign({}, context.repo), { per_page: 100, page }));
        if (tags.data.length < 100 || shouldFetchAllTags === false) {
            return [...fetchedTags, ...tags.data];
        }
        return listTags(shouldFetchAllTags, [...fetchedTags, ...tags.data], page + 1);
    });
}
/**
 * Compare `headRef` to `baseRef` (i.e. baseRef...headRef)
 * @param baseRef - old commit
 * @param headRef - new commit
 */
export function compareCommits(baseRef, headRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        core.debug(`Comparing commits (${baseRef}...${headRef})`);
        const commits = yield octokit.rest.repos.compareCommits(Object.assign(Object.assign({}, context.repo), { base: baseRef, head: headRef }));
        return commits.data.commits;
    });
}
export function createTag(newTag, createAnnotatedTag, GITHUB_SHA) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        let annotatedTag = undefined;
        if (createAnnotatedTag) {
            core.debug(`Creating annotated tag.`);
            annotatedTag = yield octokit.rest.git.createTag(Object.assign(Object.assign({}, context.repo), { tag: newTag, message: newTag, object: GITHUB_SHA, type: 'commit' }));
        }
        core.debug(`Pushing new tag to the repo.`);
        yield octokit.rest.git.createRef(Object.assign(Object.assign({}, context.repo), { ref: `refs/tags/${newTag}`, sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA }));
    });
}
