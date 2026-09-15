import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import express from "express";

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openxyos-localized-errors-"));
  process.env.NODE_ENV = "development";
  process.env.JWT_SECRET = "localized-errors-test-secret-at-least-32-chars";
  process.env.COOKIE_SECRET = "localized-errors-cookie-secret-at-least-32-chars";
  process.env.DATABASE_PATH = path.join(tempRoot, "test.db");

  const { initDatabase } = await import("../backend/db");
  const { authRoutes } = await import("../backend/routes/auth");
  await initDatabase();

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (language: string) => fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": language },
    body: JSON.stringify({ email: "missing@example.test", password: "wrong" }),
  });

  try {
    const english = await request("en-US,en;q=0.9");
    assert.equal(english.status, 401);
    assert.deepEqual(await english.json(), { success: false, error_code: "AUTH_INVALID_CREDENTIALS", error: "Invalid email or password" });

    const chinese = await request("zh-CN,zh;q=0.9");
    assert.equal(chinese.status, 401);
    assert.deepEqual(await chinese.json(), { success: false, error_code: "AUTH_INVALID_CREDENTIALS", error: "邮箱或密码错误" });
    console.log("localized error HTTP contract tests passed");
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

void main();
