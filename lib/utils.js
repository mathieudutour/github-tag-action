var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as core from '@actions/core';
import { prerelease, rcompare, valid } from 'semver';
// @ts-ignore
import DEFAULT_RELEASE_TYPES from '@semantic-release/commit-analyzer/lib/default-release-types';
import { compareCommits, listTags } from './github';
import { defaultChangelogRules } from './defaults';
export function getValidTags(prefixRegex, shouldFetchAllTags) {
    return __awaiter(this, void 0, void 0, function* () {
        const tags = yield listTags(shouldFetchAllTags);
        const invalidTags = tags.filter((tag) => !prefixRegex.test(tag.name) || !valid(tag.name.replace(prefixRegex, '')));
        invalidTags.forEach((name) => core.debug(`Found Invalid Tag: ${name}.`));
        const validTags = tags
            .filter((tag) => prefixRegex.test(tag.name) && valid(tag.name.replace(prefixRegex, '')))
            .sort((a, b) => rcompare(a.name.replace(prefixRegex, ''), b.name.replace(prefixRegex, '')));
        validTags.forEach((tag) => core.debug(`Found Valid Tag: ${tag.name}.`));
        return validTags;
    });
}
export function getCommits(baseRef, headRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const commits = yield compareCommits(baseRef, headRef);
        return commits
            .filter((commit) => !!commit.commit.message)
            .map((commit) => ({
            message: commit.commit.message,
            hash: commit.sha,
        }));
    });
}
export function getBranchFromRef(ref) {
    return ref.replace('refs/heads/', '');
}
export function isPr(ref) {
    return ref.includes('refs/pull/');
}
export function getLatestTag(tags, prefixRegex, tagPrefix) {
    return (tags.find((tag) => !prerelease(tag.name.replace(prefixRegex, ''))) || {
        name: `${tagPrefix}0.0.0`,
        commit: {
            sha: 'HEAD',
        },
    });
}
export function getLatestPrereleaseTag(tags, identifier, prefixRegex) {
    return tags
        .filter((tag) => prerelease(tag.name.replace(prefixRegex, '')))
        .find((tag) => tag.name.replace(prefixRegex, '').match(identifier));
}
export function mapCustomReleaseRules(customReleaseTypes) {
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
        const defaultRule = defaultChangelogRules[parts[0].toLowerCase()];
        if (customReleaseRule.length !== 3) {
            core.debug(`${customReleaseRule} doesn't mention the section for the changelog.`);
            core.debug(defaultRule
                ? `Default section (${defaultRule.section}) will be used instead.`
                : "The commits matching this rule won't be included in the changelog.");
        }
        if (!DEFAULT_RELEASE_TYPES.includes(parts[1])) {
            core.warning(`${parts[1]} is not a valid release type.`);
            return false;
        }
        return true;
    })
        .map((customReleaseRule) => {
        const [type, release, section] = customReleaseRule.split(releaseTypeSeparator);
        const defaultRule = defaultChangelogRules[type.toLowerCase()];
        return {
            type,
            release,
            section: section || (defaultRule === null || defaultRule === void 0 ? void 0 : defaultRule.section),
        };
    });
}
export function mergeWithDefaultChangelogRules(mappedReleaseRules = []) {
    const mergedRules = mappedReleaseRules.reduce((acc, curr) => (Object.assign(Object.assign({}, acc), { [curr.type]: curr })), Object.assign({}, defaultChangelogRules));
    return Object.values(mergedRules).filter((rule) => !!rule.section);
}
