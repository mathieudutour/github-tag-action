import { inc, parse, ReleaseType } from 'semver';

export function nextVersion(
  previous: string,
  stable: string,
  bump: ReleaseType,
  identifier?: string,
  force = false
) {
  const current = parse(previous);
  if (!current) throw new Error(`Invalid previous version: ${previous}`);
  if (identifier === undefined) return inc(previous, bump);
  if (bump === 'prerelease') return inc(previous, 'prerelease', identifier);
  const baseBump = bump.replace(/^pre/, '') as 'major' | 'minor' | 'patch';
  // An RC already includes its bump. Only advance its base if a higher-level
  // change arrives (patch RC -> feature -> minor RC -> breaking -> major RC).
  if (current.prerelease.length && !force) {
    const baseline = parse(stable)!;
    const alreadyBumped =
      baseBump === 'major'
        ? current.major > baseline.major
        : baseBump === 'minor'
        ? current.major > baseline.major || current.minor > baseline.minor
        : current.major > baseline.major ||
          current.minor > baseline.minor ||
          current.patch > baseline.patch;
    if (alreadyBumped) return inc(previous, 'prerelease', identifier);
  }
  return inc(previous, `pre${baseBump}` as ReleaseType, identifier);
}
