/*
 * openXYOS community edition — public version identity.
 * Semver is read from package.json; do not hard-code a second product version.
 */

import { OPENXYOS_EDITION, OPENXYOS_PRODUCT, OPENXYOS_VERSION } from "./openxyos-identity";

export { OPENXYOS_EDITION, OPENXYOS_PRODUCT, OPENXYOS_VERSION };

export interface VersionInfo {
  /** Semantic version from package.json */
  semver: string;
  product: string;
  edition: string;
  /** Feature-set label shown to operators; matches the public semver. */
  featureVersion: string;
  gitHash: string;
  isPrerelease: boolean;
}

export interface UpgradePath {
  from: string;
  to: string;
  migrations: string[];
  requiredFeatures: string[];
  breakingChanges: string[];
}

export const CURRENT_VERSION: VersionInfo = {
  semver: OPENXYOS_VERSION,
  product: OPENXYOS_PRODUCT,
  edition: OPENXYOS_EDITION,
  featureVersion: OPENXYOS_VERSION,
  gitHash: process.env.GIT_HASH || "unknown",
  isPrerelease: false,
};

/** Public community history only. Commercial XYOS 4.x notes live under docs/archive/. */
export const VERSION_HISTORY: VersionInfo[] = [CURRENT_VERSION];

export const UPGRADE_PATHS: UpgradePath[] = [];

export function getUpgradeMigrations(_fromVersion: string): string[] {
  return [];
}

export function getBreakingChanges(_fromVersion: string): string[] {
  return [];
}

/** Compare dotted numeric versions. Extra segments are treated as 0. */
export function compareVersion(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  const length = Math.max(partsA.length, partsB.length, 3);
  for (let i = 0; i < length; i++) {
    const left = partsA[i] ?? 0;
    const right = partsB[i] ?? 0;
    if (left < right) return -1;
    if (left > right) return 1;
  }
  return 0;
}

export function needsUpgrade(currentDbVersion: string): boolean {
  return compareVersion(currentDbVersion, CURRENT_VERSION.semver) < 0;
}

export default CURRENT_VERSION;
