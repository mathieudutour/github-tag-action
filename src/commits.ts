import * as core from '@actions/core';
// Statically load supported presets so the distribution includes their code and templates.
// @ts-ignore
import conventional from 'conventional-changelog-conventionalcommits';
// @ts-ignore
import angular from 'conventional-changelog-angular';
import { mapCustomReleaseRules, mergeWithDefaultChangelogRules } from './utils';

export async function commitConfig(
  rules: ReturnType<typeof mapCustomReleaseRules>
) {
  const preset =
    core.getInput('commit_analyzer_preset') || 'conventionalcommits';
  const raw = core.getInput('preset_config');
  const config = raw ? JSON.parse(raw) : {};
  if (!config || Array.isArray(config) || typeof config !== 'object')
    throw new Error('preset_config must be a JSON object.');
  if (!['conventionalcommits', 'angular'].includes(preset))
    throw new Error(
      'commit_analyzer_preset must be conventionalcommits or angular.'
    );
  const loaded =
    preset === 'angular'
      ? await angular
      : await conventional({
          ...config,
          types: mergeWithDefaultChangelogRules(rules),
        });
  // Accept gitmoji and escaped shortcode types as well as ordinary words.
  const parserOpts = rules.some((rule) => !/^\w+$/.test(rule.type))
    ? {
        ...loaded.parserOpts,
        headerPattern: /^(.+?)(?:\((.*)\))?!?: (.*)$/,
        headerCorrespondence: ['type', 'scope', 'subject'],
      }
    : loaded.parserOpts;
  return { parserOpts, writerOpts: loaded.writerOpts };
}
