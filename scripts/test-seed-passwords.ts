import assert from "node:assert/strict";
import { seedDatabase } from "../backend/seed";

const original = {
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  SEED_DEMO_PASSWORD: process.env.SEED_DEMO_PASSWORD,
};

function expectReject(password: string) {
  process.env.SEED_DEMO_DATA = "true";
  process.env.SEED_ADMIN_PASSWORD = password;
  process.env.SEED_DEMO_PASSWORD = password;
  assert.throws(() => seedDatabase(), /your own password of at least 12 characters/);
}

try {
  expectReject("short");
  expectReject("replace-me");
  expectReject("replace-me-with-a-unique-admin-password");
  expectReject("replace-me-with-a-unique-demo-password");
  expectReject("openxyos-demo-2026");
  expectReject("please-replace-me-now");

  process.env.SEED_DEMO_DATA = "false";
  process.env.SEED_ADMIN_PASSWORD = "replace-me";
  process.env.SEED_DEMO_PASSWORD = "replace-me";
  assert.doesNotThrow(() => seedDatabase());

  console.log("seed password policy check passed");
} finally {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
