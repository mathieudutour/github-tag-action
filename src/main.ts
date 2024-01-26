import * as core from '@actions/core';
import action from './action.js';

async function run() {
  try {
    await action();
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
