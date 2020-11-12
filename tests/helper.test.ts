import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

export function setInput(key, value) {
  process.env[`INPUT_${key.toUpperCase()}`] = value;
}

export function setInputs(map) {
  Object.keys(map).forEach(key => setInput(key, map[key]));
}

export function parseDefaultInputs() {
  const actionYaml = fs.readFileSync(path.join(process.cwd(), 'action.yml'));
  const actionJson = yaml.safeLoad(actionYaml);
  return Object
    .keys(actionJson.inputs)
    .filter(key => actionJson.inputs[key].default)
    .reduce((obj, key) => ({ ...obj, [key]: actionJson.inputs[key].default }), {});
}

// Don't know how to have this file only for test but not have 'tsc' complain. So I made it a test file...
describe('helper', () => {
  it('works', () => {});
});
