import * as v8 from 'v8';
import { n as BirpcOptions, f as RuntimeRPC, o as ContextRPC, p as WorkerGlobalState, q as WorkerContext, R as ResolvedConfig } from './reporters-1evA5lom.js';
import { Awaitable } from '@vitest/utils';
import 'vite';
import '@vitest/runner';
import 'vite-node';
import '@vitest/snapshot';
import '@vitest/expect';
import '@vitest/runner/utils';
import 'tinybench';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';
import 'chai';

type WorkerRpcOptions = Pick<BirpcOptions<RuntimeRPC>, 'on' | 'post' | 'serialize' | 'deserialize'>;
interface VitestWorker {
    getRpcOptions(ctx: ContextRPC): WorkerRpcOptions;
    runTests(state: WorkerGlobalState): Awaitable<unknown>;
}

declare function createThreadsRpcOptions({ port }: WorkerContext): WorkerRpcOptions;
declare function createForksRpcOptions(nodeV8: typeof v8): WorkerRpcOptions;
declare function unwrapForksConfig(config: ResolvedConfig): ResolvedConfig;

declare function provideWorkerState(context: any, state: WorkerGlobalState): WorkerGlobalState;

declare function run(ctx: ContextRPC): Promise<void>;

declare function runVmTests(state: WorkerGlobalState): Promise<void>;

declare function runBaseTests(state: WorkerGlobalState): Promise<void>;

export { type VitestWorker, type WorkerRpcOptions, createForksRpcOptions, createThreadsRpcOptions, provideWorkerState, runBaseTests, run as runVitestWorker, runVmTests, unwrapForksConfig };
