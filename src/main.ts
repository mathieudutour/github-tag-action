import * as core from '@actions/core';
import action from './action';

async function run() {
  try {
    await action();
  } catch (error: any) {
    for (const output of [
      'new_tag',
      'new_version',
      'release_type',
      'changelog',
      'changelog_url',
      'prerelease',
    ])
      core.setOutput(output, '');
    if (core.getInput('soft_fail').toLowerCase() === 'true')
      core.warning(error.message);
    else core.setFailed(error.message);
  }
}

run();
