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
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
const semver_1 = require("semver");
const commit_analyzer_1 = require("@semantic-release/commit-analyzer");
const release_notes_generator_1 = require("@semantic-release/release-notes-generator");
function getValidTags(githubToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github_1.GitHub(githubToken);
        const tags = yield octokit.repos.listTags(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 100 }));
        const invalidTags = tags.data
            .map(tag => tag.name)
            .filter(name => !semver_1.valid(name));
        invalidTags.map(name => core.debug(`Invalid: ${name}.`));
        const validTags = tags.data
            .filter(tag => semver_1.valid(tag.name))
            .sort((a, b) => semver_1.rcompare(a.name, b.name));
        validTags.map(tag => core.debug(`Valid: ${tag.name}.`));
        return validTags;
    });
}
function getCommits(githubToken, sha) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github_1.GitHub(githubToken);
        const commits = yield octokit.repos.compareCommits(Object.assign(Object.assign({}, github_1.context.repo), { base: sha, head: 'HEAD' }));
        return commits.data.commits
            .filter(commit => !!commit.commit.message)
            .map(commit => ({
            message: commit.commit.message,
            hash: commit.sha
        }));
    });
}
function getBranchFromRef(ref) {
    return ref.replace("refs/heads/", "");
}
function getLatestTag(tags) {
    return Object.assign({ name: '0.0.0', commit: {
            sha: 'HEAD'
        } }, tags.find(tag => !semver_1.prerelease(tag.name)));
}
function createTag(githubToken, newTag, createAnnotatedTag, GITHUB_SHA) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github_1.GitHub(githubToken);
        let createdTag;
        if (createAnnotatedTag) {
            core.debug(`Creating annotated tag.`);
            createdTag = yield octokit.git.createTag(Object.assign(Object.assign({}, github_1.context.repo), { tag: newTag, message: newTag, object: GITHUB_SHA, type: "commit" }));
        }
        core.debug(`Pushing new tag to the repo.`);
        yield octokit.git.createRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `refs/tags/${newTag}`, sha: createAnnotatedTag ? createdTag.data.sha : GITHUB_SHA }));
    });
}
function getLatestPrereleaseTag(tags, identifier) {
    return tags
        // @ts-ignore
        .filter(tag => semver_1.prerelease(tag.name))
        // @ts-ignore
        .find(tag => tag.name.match(identifier));
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const defaultBump = core.getInput("default_bump");
            const tagPrefix = core.getInput("tag_prefix");
            const customTag = core.getInput("custom_tag");
            const releaseBranches = core.getInput("release_branches");
            const preReleaseBranches = core.getInput("pre_release_branches");
            const appendToPreReleaseTag = core.getInput("append_to_pre_release_tag");
            const createAnnotatedTag = !!core.getInput("create_annotated_tag");
            const dryRun = core.getInput("dry_run");
            const githubToken = core.getInput("github_token");
            const { GITHUB_REF, GITHUB_SHA } = process.env;
            if (!GITHUB_REF) {
                core.setFailed("Missing GITHUB_REF.");
                return;
            }
            if (!GITHUB_SHA) {
                core.setFailed("Missing GITHUB_SHA.");
                return;
            }
            const currentBranch = getBranchFromRef(GITHUB_REF);
            const releaseBranch = releaseBranches
                .split(",")
                .some(branch => currentBranch.match(branch));
            const preReleaseBranch = preReleaseBranches
                .split(",")
                .some(branch => currentBranch.match(branch));
            if (releaseBranch && preReleaseBranch) {
                core.setFailed("Branch must not be both pre-release and release at the same time.");
                return;
            }
            const validTags = yield getValidTags(githubToken);
            const latestTag = getLatestTag(validTags);
            const latestPrereleaseTag = getLatestPrereleaseTag(validTags, currentBranch);
            // @ts-ignore
            const previousTag = semver_1.parse(semver_1.gte(latestTag, latestPrereleaseTag) ? latestTag.name : latestPrereleaseTag.name);
            const commits = yield getCommits(githubToken, latestTag.commit.sha);
            if (!previousTag) {
                core.setFailed('Could not parse previous tag.');
                return;
            }
            core.info(`Previous tag was ${previousTag}.`);
            core.setOutput("previous_tag", previousTag.version);
            const bump = yield commit_analyzer_1.analyzeCommits({}, { commits, logger: { log: console.info.bind(console) } });
            if (!bump && defaultBump === "false") {
                core.debug("No commit specifies the version bump. Skipping the tag creation.");
                return;
            }
            const releaseType = preReleaseBranch ? 'prerelease' : (bump || defaultBump);
            const incrementedVersion = semver_1.inc(previousTag, releaseType, appendToPreReleaseTag ? appendToPreReleaseTag : currentBranch);
            if (!incrementedVersion) {
                core.setFailed('Could not increment version.');
                return;
            }
            const validVersion = semver_1.valid(incrementedVersion);
            if (!validVersion) {
                core.setFailed(`${incrementedVersion} is not a valid semver.`);
                return;
            }
            const newVersion = customTag ? customTag : incrementedVersion;
            core.info(`New version is ${newVersion}.`);
            core.setOutput("new_version", newVersion);
            const newTag = `${tagPrefix}${newVersion}`;
            core.info(`New tag after applying prefix is ${newTag}.`);
            core.setOutput("new_tag", newTag);
            const changelog = yield release_notes_generator_1.generateNotes({}, {
                commits,
                logger: { log: console.info.bind(console) },
                options: {
                    repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
                },
                lastRelease: { gitTag: latestTag.name },
                nextRelease: { gitTag: newTag, version: newVersion },
            });
            core.info(`Changelog is ${changelog}.`);
            core.setOutput("changelog", changelog);
            if (!releaseBranch && !preReleaseBranch) {
                core.info("This branch is neither a release nor a pre-release branch. Skipping the tag creation.");
                return;
            }
            if (validTags.map(tag => tag.name).includes(newTag)) {
                core.info("This tag already exists. Skipping the tag creation.");
                return;
            }
            if (/true/i.test(dryRun)) {
                core.info("Dry run: not performing tag action.");
                return;
            }
            yield createTag(githubToken, newTag, createAnnotatedTag, GITHUB_SHA);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
