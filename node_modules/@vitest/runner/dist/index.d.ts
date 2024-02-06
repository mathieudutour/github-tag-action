import { VitestRunner } from './types.js';
export { CancelReason, VitestRunnerConfig, VitestRunnerConstructor, VitestRunnerImportSource } from './types.js';
import { T as Task, F as File, d as SuiteAPI, e as TestAPI, f as SuiteCollector, g as CustomAPI, h as SuiteHooks, O as OnTestFailedHandler, a as Test, C as Custom, S as Suite } from './tasks-rsXe_qLO.js';
export { D as DoneCallback, E as ExtendedContext, r as Fixture, q as FixtureFn, s as Fixtures, t as HookCleanupCallback, H as HookListener, I as InferFixturesTypes, R as RunMode, w as RuntimeContext, z as SequenceHooks, A as SequenceSetupFiles, v as SuiteFactory, j as TaskBase, y as TaskContext, u as TaskCustomOptions, l as TaskMeta, k as TaskPopulated, m as TaskResult, n as TaskResultPack, i as TaskState, x as TestContext, o as TestFunction, p as TestOptions, U as Use } from './tasks-rsXe_qLO.js';
import { Awaitable } from '@vitest/utils';
export { processError } from '@vitest/utils/error';
import '@vitest/utils/diff';

declare function updateTask(task: Task, runner: VitestRunner): void;
declare function startTests(paths: string[], runner: VitestRunner): Promise<File[]>;

declare const suite: SuiteAPI;
declare const test: TestAPI;
declare const describe: SuiteAPI;
declare const it: TestAPI;
declare function getCurrentSuite<ExtraContext = {}>(): SuiteCollector<ExtraContext>;
declare function createTaskCollector(fn: (...args: any[]) => any, context?: Record<string, unknown>): CustomAPI;

declare function beforeAll(fn: SuiteHooks['beforeAll'][0], timeout?: number): void;
declare function afterAll(fn: SuiteHooks['afterAll'][0], timeout?: number): void;
declare function beforeEach<ExtraContext = {}>(fn: SuiteHooks<ExtraContext>['beforeEach'][0], timeout?: number): void;
declare function afterEach<ExtraContext = {}>(fn: SuiteHooks<ExtraContext>['afterEach'][0], timeout?: number): void;
declare const onTestFailed: (fn: OnTestFailedHandler) => void;

declare function setFn(key: Test | Custom, fn: (() => Awaitable<void>)): void;
declare function getFn<Task = Test | Custom>(key: Task): (() => Awaitable<void>);
declare function setHooks(key: Suite, hooks: SuiteHooks): void;
declare function getHooks(key: Suite): SuiteHooks;

declare function getCurrentTest<T extends Test | Custom | undefined>(): T;

export { Custom, CustomAPI, File, OnTestFailedHandler, Suite, SuiteAPI, SuiteCollector, SuiteHooks, Task, Test, TestAPI, VitestRunner, afterAll, afterEach, beforeAll, beforeEach, createTaskCollector, describe, getCurrentSuite, getCurrentTest, getFn, getHooks, it, onTestFailed, setFn, setHooks, startTests, suite, test, updateTask };
