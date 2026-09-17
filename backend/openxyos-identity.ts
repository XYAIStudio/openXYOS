import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8")
) as { name: string; version: string };

/** Public product name. Trademark use remains governed by TRADEMARKS.md. */
export const OPENXYOS_PRODUCT = "openXYOS";
export const OPENXYOS_EDITION = "community";

/** Single runtime/public version identity. Always read from package.json. */
export const OPENXYOS_VERSION = packageJson.version;
