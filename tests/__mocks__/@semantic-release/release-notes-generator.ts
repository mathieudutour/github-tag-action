/**
 * Minimal stand-in for `@semantic-release/release-notes-generator`.
 *
 * The real module is ESM-only (v14+) and cannot be loaded from Jest's
 * CommonJS VM. The action's test suite only asserts on tag/version
 * outputs, so this stub returns a deterministic string.
 */

interface Commit {
  message: string;
  hash: string | null;
}

export async function generateNotes(
  _config: unknown,
  args: {
    commits: readonly Commit[];
    nextRelease: { gitTag: string; version: string };
  }
): Promise<string> {
  const { gitTag, version } = args.nextRelease;
  const bullets = args.commits
    .map((commit) => `* ${commit.message}`)
    .join('\n');
  return `# ${gitTag} (${version})\n\n${bullets}`.trim();
}
