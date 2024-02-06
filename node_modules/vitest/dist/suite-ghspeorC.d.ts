import { Custom } from '@vitest/runner';
import '@vitest/runner/utils';
import { ao as BenchFunction, ap as BenchmarkAPI } from './reporters-1evA5lom.js';
import { Options } from 'tinybench';

declare function getBenchOptions(key: Custom): Options;
declare function getBenchFn(key: Custom): BenchFunction;
declare const bench: BenchmarkAPI;

export { getBenchOptions as a, bench as b, getBenchFn as g };
