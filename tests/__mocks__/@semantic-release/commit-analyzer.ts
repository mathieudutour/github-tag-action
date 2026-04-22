/**
 * Minimal stand-in for `@semantic-release/commit-analyzer` used by Jest.
 *
 * The real module is ESM-only (as of v13) which cannot be loaded from Jest's
 * CommonJS VM on the versions of Jest / ts-jest this project uses. The mock
 * implements just enough of the "conventional commits" rules to exercise the
 * action's logic under test:
 *
 *   - `feat`                 -> `minor`
 *   - `fix` / `perf`         -> `patch`
 *   - `!` suffix on the type, or a body containing `BREAKING CHANGE` /
 *     `BREAKING-CHANGE`      -> `major` (the conventional-commits spec
 *     accepts either the space or hyphen form as the "breaking" note
 *     keyword, and `conventional-commits-parser` — used by the real
 *     analyzer — honours both.)
 *   - Custom release rules (`{ type, release }[]`) are matched first and
 *     override the defaults, using exact `type` equality.
 *
 * KNOWN NON-PARITY WITH THE REAL ANALYZER (intentional — the unit tests in
 * this repo do not cover these paths; if a future test needs them, extend
 * this stub or add a small integration script that loads the real package):
 *
 *   - Preset / parser options (`preset`, `config`, `parserOpts`) are
 *     ignored; the built-in conventional-commits defaults are always used.
 *   - Custom `releaseRules` only match by exact `type` (production uses
 *     `micromatch` and also supports `scope`, `subject`, `breaking`,
 *     `revert` matchers).
 *   - The wider default rule set from the real analyzer (`docs`, `style`,
 *     `refactor`, `test`, `build`, `ci`, etc. mapping to no release) is
 *     collapsed into "no match → no release"; behaviour is equivalent for
 *     all commit types this project exercises.
 */

interface Commit {
  message: string;
  hash: string | null;
}

interface ReleaseRule {
  type?: string;
  release?: string;
  scope?: string;
  breaking?: boolean;
  revert?: boolean;
}

const DEFAULT_RULES: ReleaseRule[] = [
  { type: 'feat', release: 'minor' },
  { type: 'fix', release: 'patch' },
  { type: 'perf', release: 'patch' },
];

const RELEASE_PRIORITY: Record<string, number> = {
  major: 4,
  premajor: 4,
  minor: 3,
  preminor: 3,
  patch: 2,
  prepatch: 2,
  prerelease: 1,
};

function parseType(message: string): {
  type: string;
  breaking: boolean;
} {
  // `conventional-commits-parser` accepts both "BREAKING CHANGE" and
  // "BREAKING-CHANGE" as note keywords (see `options.noteKeywords`), so
  // the mock honours both to stay consistent with production behaviour.
  const hasBreakingBody = /BREAKING[ -]CHANGE/i.test(message);
  const headerMatch = /^([a-zA-Z]+)(\([^)]*\))?(!?):/.exec(message);
  if (!headerMatch) {
    return { type: '', breaking: hasBreakingBody };
  }
  const [, type, , bang] = headerMatch;
  return {
    type: type ?? '',
    breaking: bang === '!' || hasBreakingBody,
  };
}

function pickHighest(
  releases: readonly (string | undefined)[]
): string | undefined {
  let best: string | undefined;
  for (const release of releases) {
    if (!release) continue;
    if (best === undefined) {
      best = release;
      continue;
    }
    const current = RELEASE_PRIORITY[release] ?? 0;
    const incumbent = RELEASE_PRIORITY[best] ?? 0;
    if (current > incumbent) {
      best = release;
    }
  }
  return best;
}

export async function analyzeCommits(
  config: { releaseRules?: readonly ReleaseRule[] },
  args: { commits: readonly Commit[] }
): Promise<string | undefined> {
  const customRules = config.releaseRules ?? [];
  const effectiveRules = [...customRules, ...DEFAULT_RULES];

  const releases: (string | undefined)[] = [];
  for (const commit of args.commits) {
    const { type, breaking } = parseType(commit.message);
    if (breaking) {
      releases.push('major');
      continue;
    }
    const match = effectiveRules.find((rule) => rule.type === type);
    releases.push(match?.release);
  }

  return pickHighest(releases);
}
