import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { OPENXYOS_MODULES } from "../backend/open-module-catalog";
import { CURRENT_VERSION, OPENXYOS_PRODUCT, OPENXYOS_VERSION } from "../backend/version";
import { CURRENT_VERSION as CONFIG_VERSION, OPENXYOS_VERSION as CONFIG_OPENXYOS_VERSION } from "../backend/config/version";
import { getFeatureVersion } from "../backend/config/features";

const root = path.resolve(import.meta.dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as { version: string };

assert.equal(pkg.version, "0.6.3");
assert.equal(OPENXYOS_VERSION, pkg.version);
assert.equal(CURRENT_VERSION.semver, pkg.version);
assert.equal(CURRENT_VERSION.product, "openXYOS");
assert.equal(CURRENT_VERSION.featureVersion, pkg.version);
assert.equal(CONFIG_VERSION.semver, pkg.version);
assert.equal(CONFIG_OPENXYOS_VERSION, pkg.version);
assert.equal(getFeatureVersion(), pkg.version);
assert.doesNotMatch(OPENXYOS_VERSION, /4\.5/);
assert.equal(OPENXYOS_PRODUCT, "openXYOS");
assert.equal(OPENXYOS_MODULES.length, 12);
assert.deepEqual(OPENXYOS_MODULES.map(module => module.key), [
  "workspace", "announcements", "organization", "employees", "skills", "chat",
  "agents", "tasks", "knowledge", "reflections", "governance", "settings",
]);

const serverSource = fs.readFileSync(path.join(root, "backend/server.ts"), "utf8");
assert.match(serverSource, /openModuleSettingsRoutes/);
assert.doesNotMatch(serverSource, /from ["'].*\/routes\/module-settings["']/);
assert.doesNotMatch(serverSource, /from ["'].*module-catalog["']/);

assert.ok(!fs.existsSync(path.join(root, "backend/module-catalog.ts")));
assert.ok(!fs.existsSync(path.join(root, "backend/routes/module-settings.ts")));
assert.ok(!fs.existsSync(path.join(root, "frontend/src/App.tsx")));
assert.ok(fs.existsSync(path.join(root, "docs/archive/commercial-backend/module-catalog.ts")));
assert.ok(fs.existsSync(path.join(root, "docs/archive/XYOS-CHANGELOG.md")));

const healthSource = fs.readFileSync(path.join(root, "backend/routes/health.ts"), "utf8");
assert.match(healthSource, /OPENXYOS_VERSION/);
assert.doesNotMatch(healthSource, /0\.50\.0-dev|4\.5\.2|0\.4\.5\.3|(?<![A-Z])XYOS_VERSION/);

const versionSource = fs.readFileSync(path.join(root, "backend/version.ts"), "utf8");
assert.doesNotMatch(versionSource, /4\.5\.2|0\.4\.5\.3|BranchControl/);

const frontendIdentity = fs.readFileSync(path.join(root, "frontend/src/openxyos-identity.ts"), "utf8");
assert.match(frontendIdentity, /package\.json/);

const openApp = fs.readFileSync(path.join(root, "frontend/src/OpenApp.tsx"), "utf8");
assert.match(openApp, /OpenDashboard/);
assert.doesNotMatch(openApp, /WorkflowPage|ContractPage|AttendancePage|AssetPage/);

console.log(`openXYOS identity tests passed (${OPENXYOS_PRODUCT} ${OPENXYOS_VERSION}, ${OPENXYOS_MODULES.length} modules)`);
