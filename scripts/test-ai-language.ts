import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import express from "express";

async function listen(app: express.Express): Promise<{ server: ReturnType<express.Express["listen"]>; baseUrl: string }> {
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  return { server, baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openxyos-ai-language-"));
  process.env.NODE_ENV = "development";
  process.env.JWT_SECRET = "ai-language-test-secret-at-least-32-characters";
  process.env.COOKIE_SECRET = "ai-language-cookie-secret-at-least-32-chars";
  process.env.DATABASE_PATH = path.join(tempRoot, "test.db");

  const provider = express();
  provider.use(express.json());
  provider.post("/chat/completions", (req, res) => {
    const system = String(req.body?.messages?.find((message: any) => message.role === "system")?.content || "");
    const english = system.includes("Respond in clear, professional English") || system.includes("Produce an accurate, concise, structured English summary");
    res.json({ model: "language-test", choices: [{ message: { content: english ? "English model output." : "中文模型输出。" } }], usage: { total_tokens: 1 } });
  });
  const providerRuntime = await listen(provider);

  const { initDatabase, dbGet, dbRun } = await import("../backend/db");
  const { chatRoutes } = await import("../backend/routes/chats");
  const { aiRoutes } = await import("../backend/routes/ai");
  const { signToken } = await import("../backend/middleware");
  await initDatabase();

  const tenantId = Number(dbRun("INSERT INTO tenants (name, slug, status) VALUES (?, ?, 'active')", ["Language Test", "language-test"]).lastInsertRowid);
  const userId = Number(dbRun("INSERT INTO users (email, password_hash, nickname, role, tenant_id) VALUES (?, ?, ?, 'admin', ?)", ["admin@language.test", "unused", "Admin", tenantId]).lastInsertRowid);
  const employeeId = Number(dbRun("INSERT INTO employees (name, role, employee_type, status, tenant_id) VALUES (?, ?, 'ai', 'active', ?)", ["English Agent", "Advisor", tenantId]).lastInsertRowid);
  const chatId = Number(dbRun("INSERT INTO chats (company_id, title, type, created_by, tenant_id) VALUES (1, ?, 'single', ?, ?)", ["Language chat", userId, tenantId]).lastInsertRowid);
  dbRun("INSERT INTO chat_members (chat_id, user_id, role, tenant_id, joined_at) VALUES (?, ?, 'admin', ?, datetime('now'))", [chatId, userId, tenantId]);
  dbRun("INSERT INTO chat_members (chat_id, employee_id, role, tenant_id, joined_at) VALUES (?, ?, 'member', ?, datetime('now'))", [chatId, employeeId, tenantId]);
  for (const [key, value] of [["llm_api_key", "test-key"], ["llm_api_base", providerRuntime.baseUrl], ["llm_model", "language-test"], ["ai_reply_enabled", "true"]]) {
    dbRun("INSERT INTO ai_config (key, value, tenant_id) VALUES (?, ?, ?)", [key, value, tenantId]);
  }

  const token = signToken({ id: userId, email: "admin@language.test", nickname: "Admin", role: "admin", tenant_id: tenantId });
  const app = express();
  app.use(express.json());
  app.use("/api/chats", chatRoutes);
  app.use("/api/ai", aiRoutes);
  const appRuntime = await listen(app);
  const request = (pathName: string, language: string, body: unknown) => fetch(`${appRuntime.baseUrl}${pathName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept-Language": language, Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  try {
    const englishChat = await request(`/api/chats/${chatId}/messages`, "en-US,en;q=0.9", { content: "Please provide a deployment recommendation." });
    assert.equal(englishChat.status, 200);
    assert.equal((dbGet("SELECT content FROM messages WHERE chat_id = ? AND sender_type = 'employee' ORDER BY id DESC LIMIT 1", [chatId]) as any)?.content, "English model output.");

    const chineseChat = await request(`/api/chats/${chatId}/messages`, "zh-CN,zh;q=0.9", { content: "请提供部署建议。" });
    assert.equal(chineseChat.status, 200);
    assert.equal((dbGet("SELECT content FROM messages WHERE chat_id = ? AND sender_type = 'employee' ORDER BY id DESC LIMIT 1", [chatId]) as any)?.content, "中文模型输出。");

    const englishSummary = await request("/api/ai/summarize", "en-US,en;q=0.9", { content: "Release is ready." });
    assert.equal(englishSummary.status, 200);
    assert.equal((await englishSummary.json() as any).data.summary, "English model output.");
    console.log("AI language contract tests passed");
  } finally {
    await new Promise<void>((resolve, reject) => appRuntime.server.close(error => error ? reject(error) : resolve()));
    await new Promise<void>((resolve, reject) => providerRuntime.server.close(error => error ? reject(error) : resolve()));
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

void main();
