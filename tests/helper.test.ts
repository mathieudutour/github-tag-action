import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export function setRepository(
  GITHUB_SERVER_URL: string,
  GITHUB_REPOSITORY: string
) {
  process.env['GITHUB_SERVER_URL'] = GITHUB_SERVER_URL;
  process.env['GITHUB_REPOSITORY'] = GITHUB_REPOSITORY;
}

export function setBranch(branch: string) {
  process.env['GITHUB_REF'] = `refs/heads/${branch}`;
}

export function setCommitSha(sha: string) {
  process.env['GITHUB_SHA'] = sha;
}

export function setInput(key: string, value: string) {
  process.env[`INPUT_${key.toUpperCase()}`] = value;
}

export function setInputs(map: { [key: string]: string }) {
  Object.keys(map).forEach((key) => setInput(key, map[key]));
}

export function loadDefaultInputs() {
  const actionYaml = fs.readFileSync(
    path.join(process.cwd(), 'action.yml'),
    'utf-8'
  );
  const actionJson = yaml.load(actionYaml) as {
    inputs: { [key: string]: { default?: string } };
  };
  const defaultInputs = Object.keys(actionJson['inputs'])
    .filter((key) => actionJson['inputs'][key].default)
    .reduce(
      (obj, key) => ({ ...obj, [key]: actionJson['inputs'][key].default }),
      {}
    );
  setInputs(defaultInputs);
}

// Don't know how to have this file only for test but not have 'tsc' complain. So I made it a test file...
describe('helper', () => {
  it('works', () => {});
});
