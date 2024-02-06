import { r as runBaseTests } from '../vendor/base.Rmxiv35Y.js';
import { a as createThreadsRpcOptions } from '../vendor/utils.GbToHGHI.js';
import 'vite-node/client';
import '../vendor/global.CkGT_TMy.js';
import '../vendor/execute.TxmaEFIQ.js';
import 'node:vm';
import 'node:url';
import 'vite-node/utils';
import 'pathe';
import '@vitest/utils/error';
import '../path.js';
import 'node:fs';
import '@vitest/utils';
import '../vendor/base.QYERqzkH.js';

class ThreadsBaseWorker {
  getRpcOptions(ctx) {
    return createThreadsRpcOptions(ctx);
  }
  runTests(state) {
    return runBaseTests(state);
  }
}
var threads = new ThreadsBaseWorker();

export { threads as default };
