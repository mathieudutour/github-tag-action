import * as core from '@actions/core';
import main from './main';

async function run() {
  try {
    await main();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
