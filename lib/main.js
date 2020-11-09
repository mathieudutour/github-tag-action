"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const github_1 = require("@actions/github");
const semver_1 = require("semver");
const commit_analyzer_1 = require("@semantic-release/commit-analyzer");
const release_notes_generator_1 = require("@semantic-release/release-notes-generator");
const HASH_SEPARATOR = "|commit-hash:";
const SEPARATOR = "==============================================";
const git = {
    fetch: function () {
        return 'git fetch --tags';
    },
    tag: function () {
        return 'git tag';
    },
    revList: function () {
        return 'git rev-list --tags --topo-order --max-count=1';
    },
    describe: function (previousTagSha) {
        return `git describe --tags ${previousTagSha}`;
    },
    log: function (tag) {
        if (!tag) {
            return `git log --pretty=format:'%s%n%b${HASH_SEPARATOR}%h${SEPARATOR}' --abbrev-commit`;
        }
        return `git log ${tag}..HEAD --pretty=format:'%s%n%b${HASH_SEPARATOR}%h${SEPARATOR}' --abbrev-commit`;
    }
};
function getTags(githubToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = new github_1.GitHub(githubToken);
        const tags = yield octokit.repos.listTags(Object.assign({}, github_1.context.repo));
        return tags.data.map(function (tag) {
            return tag.name;
        });
    });
}
function getBranchFromRef(ref) {
    return ref.replace("refs/heads/", "");
}
function cleanRepoTag(tag) {
    return tag.split('-')[0];
}
function exec(command) {
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = "";
        let stderr = "";
        try {
            const options = {
                listeners: {
                    stdout: (data) => {
                        stdout += data.toString();
                    },
                    stderr: (data) => {
                        stderr += data.toString();
                    },
                },
            };
            const code = yield exec_1.exec(command, undefined, options);
            return {
                code,
                stdout,
                stderr,
            };
        }
        catch (err) {
            return {
                code: 1,
                stdout,
                stderr,
                error: err,
            };
        }
    });
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
            const createAnnotatedTag = core.getInput("create_annotated_tag");
            const dryRun = core.getInput("dry_run");
            const githubToken = core.getInput("github_token");
            const { GITHUB_REF, GITHUB_SHA } = process.env;
            if (!GITHUB_REF) {
                core.setFailed("Missing GITHUB_REF");
                return;
            }
            if (!GITHUB_SHA) {
                core.setFailed("Missing GITHUB_SHA");
                return;
            }
            const currentBranch = getBranchFromRef(GITHUB_REF);
            core.debug(`Current branch is ${currentBranch}.`);
            const releaseBranch = releaseBranches
                .split(",")
                .some((branch) => currentBranch.match(branch));
            const preReleaseBranch = preReleaseBranches
                .split(",")
                .some((branch) => currentBranch.match(branch));
            if (releaseBranch && preReleaseBranch) {
                core.setFailed("Branch cannot be both pre-release and release at the same time.");
            }
            core.debug(`Branch is release branch = ${releaseBranch}, pre-release branch = ${preReleaseBranch}`);
            yield exec(git.fetch());
            const tags = yield getTags(githubToken);
            tags.map(core.debug);
            const hasTag = !!(yield exec(git.tag())).stdout.trim();
            let tag = "";
            let logs = "";
            core.debug(`Has tag = ${hasTag}.`);
            if (hasTag) {
                const previousTagSha = (yield exec(git.revList())).stdout.trim();
                core.debug(`Previous tag sha: ${previousTagSha}.`);
                const repoTag = (yield exec(git.describe(previousTagSha))).stdout.trim();
                core.debug(`Repo tag ${repoTag}.`);
                tag = cleanRepoTag(repoTag);
                core.debug(`Cleaned repo tag ${tag}.`);
                logs = (yield exec(git.log(tag))).stdout.trim();
                if (previousTagSha === GITHUB_SHA) {
                    core.debug("No new commits since previous tag. Skipping...");
                    return;
                }
            }
            else {
                tag = "0.0.0";
                logs = (yield exec(git.log())).stdout.trim();
            }
            core.debug(`Setting previous_tag to: ${tag}`);
            core.setOutput("previous_tag", tag);
            // for some reason the commits start and end with a `'` on the CI so we ignore it
            const commits = logs
                .split(SEPARATOR)
                .map((x) => {
                const data = x.trim().replace(/^'\n'/g, "").replace(/^'/g, "");
                if (!data) {
                    return {};
                }
                const [message, hash] = data.split(HASH_SEPARATOR);
                return {
                    message: message.trim(),
                    hash: hash.trim(),
                };
            })
                .filter((x) => !!x.message);
            const bump = yield commit_analyzer_1.analyzeCommits({}, { commits, logger: { log: console.info.bind(console) } });
            if (!bump && defaultBump === "false") {
                core.debug("No commit specifies the version bump. Skipping...");
                return;
            }
            const currentVersion = tag
                .replace(tagPrefix, '')
                .replace(appendToPreReleaseTag, '');
            const releaseType = preReleaseBranch ? 'prerelease' : (bump || defaultBump);
            const incrementedVersion = semver_1.inc(currentVersion, releaseType, currentBranch);
            if (!incrementedVersion) {
                core.error(`ReleaseType = ${releaseType}, tag = ${tag}, current version = ${currentVersion}.`);
                core.setFailed('Could not increment version.');
            }
            core.info(`Incremented version after applying conventional commits: ${incrementedVersion}.`);
            const versionSuffix = preReleaseBranch ? `-${currentBranch}.${GITHUB_SHA.slice(0, 7)}` : "";
            const newVersion = customTag ? customTag : `${incrementedVersion}${versionSuffix}`;
            const newTag = appendToPreReleaseTag && preReleaseBranch ? `${tagPrefix}${newVersion}` : `${tagPrefix}${newVersion}`;
            core.info(`New tag after applying suffix: ${tag}.`);
            core.setOutput("new_version", newVersion);
            core.setOutput("new_tag", newTag);
            core.debug(`New tag: ${newTag}`);
            const changelog = yield release_notes_generator_1.generateNotes({}, {
                commits,
                logger: { log: console.info.bind(console) },
                options: {
                    repositoryUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}`,
                },
                lastRelease: { gitTag: tag },
                nextRelease: { gitTag: newTag, version: newVersion },
            });
            core.setOutput("changelog", changelog);
            if (!releaseBranch && !preReleaseBranch) {
                core.info("This branch is neither a release nor a pre-release branch. Skipping the tag creation.");
                return;
            }
            const tagAlreadyExists = !!(yield exec(`git tag -l "${newTag}"`)).stdout.trim();
            if (tagAlreadyExists) {
                core.debug("This tag already exists. Skipping the tag creation.");
                return;
            }
            if (/true/i.test(dryRun)) {
                core.info("Dry run: not performing tag action.");
                return;
            }
            const octokit = new github_1.GitHub(core.getInput("github_token"));
            if (createAnnotatedTag === "true") {
                core.debug(`Creating annotated tag`);
                const tagCreateResponse = yield octokit.git.createTag(Object.assign(Object.assign({}, github_1.context.repo), { tag: newTag, message: newTag, object: GITHUB_SHA, type: "commit" }));
                core.debug(`Pushing annotated tag to the repo`);
                yield octokit.git.createRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `refs/tags/${newTag}`, sha: tagCreateResponse.data.sha }));
                return;
            }
            core.debug(`Pushing new tag to the repo`);
            yield octokit.git.createRef(Object.assign(Object.assign({}, github_1.context.repo), { ref: `refs/tags/${newTag}`, sha: GITHUB_SHA }));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
