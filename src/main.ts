import * as core from '@actions/core';
import action from './action';

async function run() {
  try {
    await action();
  } catch (error: any) {
    console.error(error)
    core.setFailed(error.message);
  }
}

run();
