import type * as _ts from 'typescript';
import type { TsCompilerInstance } from '../types';
export declare const version = 1;
export declare const name = "hoist-jest";
export declare function factory({ configSet, }: TsCompilerInstance): (ctx: _ts.TransformationContext) => _ts.Transformer<_ts.SourceFile>;
