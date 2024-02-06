import * as chai from 'chai';
import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment';
import { resolve } from 'pathe';
import { distDir } from '../path.js';
import { g as getWorkerState } from './global.CkGT_TMy.js';
import { r as rpc } from './rpc.w4v8oCkK.js';
import { t as takeCoverageInsideWorker } from './coverage.E7sG1b3r.js';
import { l as loadDiffConfig } from './setup-common.C2iBd0K0.js';

function setupChaiConfig(config) {
  Object.assign(chai.config, config);
}

class VitestSnapshotEnvironment extends NodeSnapshotEnvironment {
  constructor(rpc) {
    super();
    this.rpc = rpc;
  }
  getHeader() {
    return `// Vitest Snapshot v${this.getVersion()}, https://vitest.dev/guide/snapshot.html`;
  }
  resolvePath(filepath) {
    return this.rpc.resolveSnapshotPath(filepath);
  }
}

const runnersFile = resolve(distDir, "runners.js");
async function getTestRunnerConstructor(config, executor) {
  if (!config.runner) {
    const { VitestTestRunner, NodeBenchmarkRunner } = await executor.executeFile(runnersFile);
    return config.mode === "test" ? VitestTestRunner : NodeBenchmarkRunner;
  }
  const mod = await executor.executeId(config.runner);
  if (!mod.default && typeof mod.default !== "function")
    throw new Error(`Runner must export a default function, but got ${typeof mod.default} imported from ${config.runner}`);
  return mod.default;
}
async function resolveTestRunner(config, executor) {
  const TestRunner = await getTestRunnerConstructor(config, executor);
  const testRunner = new TestRunner(config);
  Object.defineProperty(testRunner, "__vitest_executor", {
    value: executor,
    enumerable: false,
    configurable: false
  });
  if (!testRunner.config)
    testRunner.config = config;
  if (!testRunner.importFile)
    throw new Error('Runner must implement "importFile" method.');
  testRunner.config.diffOptions = await loadDiffConfig(config, executor);
  const originalOnTaskUpdate = testRunner.onTaskUpdate;
  testRunner.onTaskUpdate = async (task) => {
    const p = rpc().onTaskUpdate(task);
    await (originalOnTaskUpdate == null ? void 0 : originalOnTaskUpdate.call(testRunner, task));
    return p;
  };
  const originalOnCollected = testRunner.onCollected;
  testRunner.onCollected = async (files) => {
    const state = getWorkerState();
    files.forEach((file) => {
      file.prepareDuration = state.durations.prepare;
      file.environmentLoad = state.durations.environment;
      state.durations.prepare = 0;
      state.durations.environment = 0;
    });
    rpc().onCollected(files);
    await (originalOnCollected == null ? void 0 : originalOnCollected.call(testRunner, files));
  };
  const originalOnAfterRun = testRunner.onAfterRunFiles;
  testRunner.onAfterRunFiles = async (files) => {
    const state = getWorkerState();
    const coverage = await takeCoverageInsideWorker(config.coverage, executor);
    rpc().onAfterSuiteRun({
      coverage,
      transformMode: state.environment.transformMode,
      projectName: state.ctx.projectName
    });
    await (originalOnAfterRun == null ? void 0 : originalOnAfterRun.call(testRunner, files));
  };
  const originalOnAfterRunTask = testRunner.onAfterRunTask;
  testRunner.onAfterRunTask = async (test) => {
    var _a, _b;
    if (config.bail && ((_a = test.result) == null ? void 0 : _a.state) === "fail") {
      const previousFailures = await rpc().getCountOfFailedTests();
      const currentFailures = 1 + previousFailures;
      if (currentFailures >= config.bail) {
        rpc().onCancel("test-failure");
        (_b = testRunner.onCancel) == null ? void 0 : _b.call(testRunner, "test-failure");
      }
    }
    await (originalOnAfterRunTask == null ? void 0 : originalOnAfterRunTask.call(testRunner, test));
  };
  return testRunner;
}

export { VitestSnapshotEnvironment as V, resolveTestRunner as r, setupChaiConfig as s };
