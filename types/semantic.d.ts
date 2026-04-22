/// <reference types="semver" />

/**
 * Ambient declarations for the `@semantic-release/*` packages we consume.
 *
 * These packages are ESM-only and ship without type declarations, so we
 * describe the subset of their APIs that this action relies on.
 */

interface Commit {
  readonly message: string;
  readonly hash: string | null;
}

interface Logger {
  readonly log: (...args: readonly unknown[]) => void;
}

/**
 * Shape of a single custom release rule accepted by
 * `@semantic-release/commit-analyzer`. Note that at runtime the analyzer
 * additionally accepts `releaseRules` as a path string to a JS/JSON file
 * exporting these rules, and the rule `type` / `scope` fields are matched
 * with `micromatch` rather than a plain equality — this ambient type only
 * describes the object form that this action actually constructs and
 * passes through.
 */
interface ReleaseRule {
  readonly type: string;
  readonly release: string;
  readonly scope?: string;
}

declare module '@semantic-release/commit-analyzer' {
  export function analyzeCommits(
    config: {
      preset?: string;
      config?: string;
      parserOpts?: unknown;
      releaseRules?: string | readonly ReleaseRule[];
      presetConfig?: unknown;
    },
    args: {
      commits: readonly Commit[];
      logger: Logger;
    }
  ): Promise<string | undefined>;
}

declare module '@semantic-release/release-notes-generator' {
  export function generateNotes(
    config: {
      preset?: string;
      config?: string;
      parserOpts?: unknown;
      writerOpts?: unknown;
      releaseRules?: string | readonly ReleaseRule[];
      presetConfig?: unknown;
    },
    args: {
      commits: readonly Commit[];
      logger: Logger;
      options: {
        repositoryUrl: string;
      };
      lastRelease: { gitTag: string };
      nextRelease: { gitTag: string; version: string };
    }
  ): Promise<string>;
}
