import * as core from '@actions/core';
import action from './action';

async function run(): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Surface the full stack (and any `cause`) to the Actions run log so
      // failures are debuggable; `core.setFailed` only renders the message.
      core.error(error.stack ?? error.message);
      if (error.cause instanceof Error) {
        core.error(`Caused by: ${error.cause.stack ?? error.cause.message}`);
      } else if (error.cause !== undefined) {
        // Stringify via JSON so we don't fall back to "[object Object]" for
        // plain-object causes; fall back to String() for non-serialisable
        // values (e.g. BigInt, circular refs).
        let serialised: string;
        try {
          serialised = JSON.stringify(error.cause);
        } catch {
          serialised = Object.prototype.toString.call(error.cause);
        }
        core.error(`Caused by: ${serialised}`);
      }
      core.setFailed(error.message);
    } else {
      const message = String(error);
      core.error(message);
      core.setFailed(message);
    }
  }
}

void run();
