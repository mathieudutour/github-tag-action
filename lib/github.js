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
    octokitSingleton = github_1.getOctokit(githubToken);
    return octokitSingleton;
}
exports.getOctokitSingleton = getOctokitSingleton;
function listTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        const tags = yield octokit.repos.listTags(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100 }));
        return tags.data;
    });
}
exports.listTags = listTags;
/**
 * Compare `headRef` to `baseRef` (i.e. baseRef...headRef)
 * @param baseRef - old commit
 * @param headRef - new commit
 */
function compareCommits(baseRef, headRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        core.debug(`Comparing commits (${baseRef}...${headRef})`);
        const commits = yield octokit.repos.compareCommits(Object.assign(Object.assign({}, github_1.context.repo), { base: baseRef, head: headRef }));
        return commits.data.commits;
    });
}
exports.compareCommits = compareCommits;
function createTag(newTag, createAnnotatedTag, GITHUB_SHA) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokitSingleton();
        let annotatedTag = undefined;
        if (createAnnotatedTag) {
            core.debug(`Creating annotated tag.`);
            annotatedTag = yield octokit.git.createTag(Object.assign(Object.assign({}, github_1.context.repo), { tag: newTag, message: newTag, object: GITHUB_SHA, type: 'commit' }));
        }
        core.debug(`Pushing new tag to the repo.`);
        yield octokit.git.createRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `refs/tags/${newTag}`, sha: annotatedTag ? annotatedTag.data.sha : GITHUB_SHA }));
    });
}
exports.createTag = createTag;
