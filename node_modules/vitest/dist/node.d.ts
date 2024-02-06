import { V as VitestRunMode, U as UserConfig, d as VitestOptions, e as Vitest, R as ResolvedConfig, P as ProvidedContext, W as WorkspaceProject, f as RuntimeRPC, T as TestSequencer, g as WorkspaceSpec } from './reporters-1evA5lom.js';
export { l as BrowserProvider, k as BrowserProviderInitializationOptions, m as BrowserProviderOptions, h as ProcessPool, j as TestSequencerConstructor, i as VitestPackageInstaller, s as startVitest } from './reporters-1evA5lom.js';
import { UserConfig as UserConfig$1, Plugin } from 'vite';
import '@vitest/runner';
import 'vite-node';
import '@vitest/snapshot';
import '@vitest/expect';
import '@vitest/runner/utils';
import '@vitest/utils';
import 'tinybench';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';
import 'chai';

declare function createVitest(mode: VitestRunMode, options: UserConfig, viteOverrides?: UserConfig$1, vitestOptions?: VitestOptions): Promise<Vitest>;

declare function VitestPlugin(options?: UserConfig, ctx?: Vitest): Promise<Plugin[]>;

declare function registerConsoleShortcuts(ctx: Vitest): () => void;

interface GlobalSetupContext {
    config: ResolvedConfig;
    provide<T extends keyof ProvidedContext>(key: T, value: ProvidedContext[T]): void;
}

declare function createMethodsRPC(project: WorkspaceProject): RuntimeRPC;

declare class BaseSequencer implements TestSequencer {
    protected ctx: Vitest;
    constructor(ctx: Vitest);
    shard(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
    sort(files: WorkspaceSpec[]): Promise<WorkspaceSpec[]>;
}

export { BaseSequencer, type GlobalSetupContext, TestSequencer, Vitest, VitestPlugin, WorkspaceProject, WorkspaceSpec, createMethodsRPC, createVitest, registerConsoleShortcuts };
