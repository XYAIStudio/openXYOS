/*
 * Compatibility shim. Import from ../version or ../openxyos-identity instead.
 * Kept so existing relative imports cannot drift onto a second version number.
 */

export {
  CURRENT_VERSION,
  OPENXYOS_EDITION,
  OPENXYOS_PRODUCT,
  OPENXYOS_VERSION,
  UPGRADE_PATHS,
  VERSION_HISTORY,
  compareVersion,
  getBreakingChanges,
  getUpgradeMigrations,
  needsUpgrade,
} from "../version";
export type { UpgradePath, VersionInfo } from "../version";
export { default } from "../version";
