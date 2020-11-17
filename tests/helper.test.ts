import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export function setBranch(branch: string) {
  process.env['GITHUB_REF'] = `refs/heads/${branch}`;
}

export function setCommitSha(sha: string) {
  process.env['GITHUB_SHA'] = sha;
}

export function setInput(key: string, value: string) {
  process.env[`INPUT_${key.toUpperCase()}`] = value;
}

export function setInputs(map: Object) {
  Object.keys(map).forEach((key) => setInput(key, map[key]));
}

export function loadDefaultInputs() {
  const actionYaml = fs.readFileSync(path.join(process.cwd(), 'action.yml'));
  const actionJson = yaml.safeLoad(actionYaml);
  const defaultInputs = Object.keys(actionJson.inputs)
    .filter((key) => actionJson.inputs[key].default)
    .reduce(
      (obj, key) => ({ ...obj, [key]: actionJson.inputs[key].default }),
      {}
    );
  setInputs(defaultInputs);
}

// Don't know how to have this file only for test but not have 'tsc' complain. So I made it a test file...
describe('helper', () => {
  it('works', () => {});
});
