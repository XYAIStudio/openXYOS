import assert from "node:assert/strict";
import fs from "node:fs";
import os from "os";
import path from "path";
import type { AddressInfo } from "node:net";
import express from "express";

function expectStatus(actual: number, expected: number, description: string) {
  assert.equal(actual, expected, `${description}: expected HTTP ${expected}, received ${actual}`);
}

function collectEmployees(nodes: any[]): any[] {
  const out: any[] = [];
  for (const node of nodes || []) {
    out.push(...(node.employees || []));
    if (node.children) out.push(...collectEmployees(node.children));
  }
  return out;
}

function countDepth(nodes: any[], level = 1): number {
  if (!nodes?.length) return level - 1;
  return Math.max(level, ...nodes.map((node: any) => countDepth(node.children || [], level + 1)));
}

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openxyos-org-talent-"));
  process.env.NODE_ENV = "development";
  process.env.JWT_SECRET = "org-talent-ux-test-secret-at-least-32-characters";
  process.env.COOKIE_SECRET = "org-talent-ux-cookie-secret-at-least-32-chars";
  process.env.DATABASE_PATH = path.join(tempRoot, "test.db");

  const { initDatabase, dbGet, dbAll, dbRun } = await import("../backend/db");
  const { orgRoutes } = await import("../backend/routes/org");
  const { employeeRoutes } = await import("../backend/routes/employees");
  const { xyaiRoutes } = await import("../backend/routes/xyai");
  const { talentRoutes } = await import("../backend/routes/talent");
  const { knowledgeRoutes } = await import("../backend/routes/knowledge");
  const { signToken } = await import("../backend/middleware");
  await initDatabase();

  const tenantA = Number(dbRun("INSERT INTO tenants (name, slug, status) VALUES (?, ?, 'active')", ["Empty Org A", "empty-org-a"]).lastInsertRowid);
  const tenantB = Number(dbRun("INSERT INTO tenants (name, slug, status) VALUES (?, ?, 'active')", ["Other Org B", "empty-org-b"]).lastInsertRowid);
  const adminA = Number(dbRun("INSERT INTO users (email, password_hash, nickname, role, tenant_id) VALUES (?, ?, ?, 'admin', ?)", ["admin@empty.test", "unused", "Admin", tenantA]).lastInsertRowid);
  const userA = Number(dbRun("INSERT INTO users (email, password_hash, nickname, role, tenant_id) VALUES (?, ?, ?, 'user', ?)", ["user@empty.test", "unused", "User", tenantA]).lastInsertRowid);
  const adminB = Number(dbRun("INSERT INTO users (email, password_hash, nickname, role, tenant_id) VALUES (?, ?, ?, 'admin', ?)", ["admin@other.test", "unused", "Admin B", tenantB]).lastInsertRowid);

  const tokenA = signToken({ id: adminA, email: "admin@empty.test", nickname: "Admin", role: "admin", tenant_id: tenantA });
  const tokenUser = signToken({ id: userA, email: "user@empty.test", nickname: "User", role: "user", tenant_id: tenantA });
  const tokenB = signToken({ id: adminB, email: "admin@other.test", nickname: "Admin B", role: "admin", tenant_id: tenantB });

  const app = express();
  app.use(express.json());
  app.use("/api/org", orgRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/xyai", xyaiRoutes);
  app.use("/api/talent", talentRoutes);
  app.use("/api/knowledge", knowledgeRoutes);
  const server = app.listen(0, "127.0.0.1");
  let baseUrl = "";

  async function request(token: string, url: string, init: RequestInit = {}) {
    return fetch(`${baseUrl}${url}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
  }

  try {
    await new Promise<void>(resolve => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    const emptyTree = await request(tokenA, "/api/org/tree");
    expectStatus(emptyTree.status, 200, "empty org tree");
    const emptyTreeBody = await emptyTree.json() as any;
    assert.equal((emptyTreeBody.data || []).length, 0, "new tenant starts with no departments");

    const userCreate = await request(tokenUser, "/api/org/departments", {
      method: "POST",
      body: JSON.stringify({ name: "Blocked" }),
    });
    expectStatus(userCreate.status, 403, "non-admin cannot create department");

    const root = await request(tokenA, "/api/org/departments", {
      method: "POST",
      body: JSON.stringify({ name: "总部" }),
    });
    expectStatus(root.status, 200, "admin can create root department on empty org");
    const rootBody = await root.json() as any;
    assert.ok(rootBody.data.id, "root department id returned");
    assert.equal(rootBody.data.parent_id, null);
    assert.equal(rootBody.data.level, 1);

    let parentId = Number(rootBody.data.id);
    for (let i = 2; i <= 12; i += 1) {
      const child = await request(tokenA, "/api/org/departments", {
        method: "POST",
        body: JSON.stringify({ name: `L${i}部门`, parent_id: parentId }),
      });
      expectStatus(child.status, 200, `create nested department level ${i}`);
      const childBody = await child.json() as any;
      assert.equal(childBody.data.level, i, `department level is ${i} with no depth cap`);
      parentId = Number(childBody.data.id);
    }

    const deepTree = await request(tokenA, "/api/org/tree");
    const deepTreeBody = await deepTree.json() as any;
    assert.equal(countDepth(deepTreeBody.data), 12, "org tree keeps unlimited nesting");

    const leafId = parentId;
    const canvasEmp = await request(tokenA, "/api/org/employees", {
      method: "POST",
      body: JSON.stringify({ name: "画布员工", role: "工程师", department_id: leafId, employee_type: "human" }),
    });
    expectStatus(canvasEmp.status, 200, "add employee to department from canvas API");

    const noAuth = await request("", "/api/xyai/agents/import", {
      method: "POST",
      body: JSON.stringify({ name: "No Auth Agent" }),
    });
    expectStatus(noAuth.status, 401, "studio import requires auth");

    const noHeader = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      body: JSON.stringify({ name: "Missing Header Agent" }),
    });
    expectStatus(noHeader.status, 403, "studio import requires interop header");
    assert.equal((await noHeader.json() as any).error, "缺少有效的 Studio 互通标识");

    const englishDenied = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      headers: { "Accept-Language": "en" },
      body: JSON.stringify({ name: "Missing Header Agent" }),
    });
    assert.equal((await englishDenied.json() as any).error, "A valid Studio interop header is required");

    const missingName = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio", "Accept-Language": "en" },
      body: JSON.stringify({ role: "顾问" }),
    });
    expectStatus(missingName.status, 400, "studio import requires name");
    assert.equal((await missingName.json() as any).error, "Agent name is required");

    const imported = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        name: "增长顾问智能体",
        title: "增长顾问",
        description: "负责渠道增长分析",
        skills: ["增长", "分析"],
        capabilities: ["渠道诊断"],
        agent_type: "growth_advisor",
        external_id: "studio-agent-001",
      }),
    });
    expectStatus(imported.status, 201, "studio import creates reserve employee");
    const importedBody = await imported.json() as any;
    const employeeId = Number(importedBody.data.employee_id);
    assert.equal(importedBody.data.employment_category, "reserve");
    assert.ok(importedBody.data.talent_id);

    const reserveList = await request(tokenA, "/api/employees?category=reserve");
    const reserveBody = await reserveList.json() as any;
    const reserve = (reserveBody.data || []).find((item: any) => item.id === employeeId);
    assert.ok(reserve, "studio-pushed agent appears in 备选员工");
    assert.equal(reserve.role, "增长顾问");
    assert.equal(reserve.description, "负责渠道增长分析");

    const detail = await request(tokenA, `/api/employees/${employeeId}`);
    expectStatus(detail.status, 200, "reserve employee is readable without a department");
    assert.equal((await detail.json() as any).data.name, "增长顾问智能体");

    const edited = await request(tokenA, `/api/org/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: "增长顾问·修订",
        role: "增长负责人",
        description: "修订后的岗位职责",
        department_id: rootBody.data.id,
      }),
    });
    expectStatus(edited.status, 200, "reserve employee fields are editable");

    const afterEdit = dbGet("SELECT * FROM employees WHERE id = ?", [employeeId]) as any;
    assert.equal(afterEdit.name, "增长顾问·修订");
    assert.equal(afterEdit.role, "增长负责人");
    assert.equal(afterEdit.description, "修订后的岗位职责");
    assert.equal(Number(afterEdit.department_id), Number(rootBody.data.id));

    const orgAfterAssign = await request(tokenA, "/api/org/tree");
    const orgAfterAssignBody = await orgAfterAssign.json() as any;
    const orgEmployees = collectEmployees(orgAfterAssignBody.data);
    assert.ok(orgEmployees.some((item: any) => item.id === employeeId), "组织架构 shows assigned reserve employee");

    const collabList = await request(tokenA, "/api/employees?status=active");
    const collabBody = await collabList.json() as any;
    assert.ok((collabBody.data || []).some((item: any) => item.id === employeeId && Number(item.department_id) === Number(rootBody.data.id)), "沟通协作 source list shows the same membership");

    const idempotent = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        name: "增长顾问智能体",
        role: "增长顾问",
        external_id: "studio-agent-001",
      }),
    });
    expectStatus(idempotent.status, 200, "re-import with same external_id updates instead of duplicating");
    const idempotentBody = await idempotent.json() as any;
    assert.equal(Number(idempotentBody.data.employee_id), employeeId);
    const reserveCount = (dbAll("SELECT id FROM employees WHERE tenant_id = ? AND source = ?", [tenantA, "studio:studio-agent-001"]) as any[]).length;
    assert.equal(reserveCount, 1, "studio import stays idempotent");

    const outsider = await request(tokenB, `/api/employees/${employeeId}`);
    expectStatus(outsider.status, 404, "cross-tenant cannot read imported employee");

    const outsiderTree = await request(tokenB, "/api/org/tree");
    const outsiderEmployees = collectEmployees((await outsiderTree.json() as any).data);
    assert.equal(outsiderEmployees.some((item: any) => item.id === employeeId), false, "cross-tenant org tree does not include the agent");

    const talentAfterImport = dbGet("SELECT * FROM talent_pool WHERE id = ?", [importedBody.data.talent_id]) as any;
    assert.equal(talentAfterImport.status, "recruited", "studio import marks talent recruited, not available");
    const market = await request(tokenA, "/api/talent");
    const marketBody = await market.json() as any;
    assert.equal((marketBody.data || []).some((item: any) => item.id === importedBody.data.talent_id), false, "studio-pushed talent is hidden from 人才市场");

    const recruitStudio = await request(tokenA, `/api/talent/${importedBody.data.talent_id}/recruit`, { method: "POST" });
    expectStatus(recruitStudio.status, 400, "招募 is not used for studio-pushed agents");
    assert.match((await recruitStudio.json() as any).error, /备选员工|reserve/i);

    const userEdit = await request(tokenUser, `/api/org/employees/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify({ description: "普通用户也可编辑 Studio 备选员工" }),
    });
    expectStatus(userEdit.status, 200, "org editor can edit studio reserve employee without user_id");

    const otherHuman = Number(dbRun(
      "INSERT INTO employees (company_id, name, role, employee_type, status, employment_category, tenant_id) VALUES (1, '他人', '专员', 'human', 'active', 'internal', ?)",
      [tenantA],
    ).lastInsertRowid);
    const userEditOther = await request(tokenUser, `/api/org/employees/${otherHuman}`, {
      method: "PUT",
      body: JSON.stringify({ name: "不应成功" }),
    });
    expectStatus(userEditOther.status, 404, "non-admin cannot edit unrelated employees");

    const hired = await request(tokenUser, `/api/employees/${employeeId}/onboard`, {
      method: "POST",
      body: JSON.stringify({ department_id: rootBody.data.id, role: "增长负责人" }),
    });
    expectStatus(hired.status, 200, "录用 onboards studio reserve employee");
    const afterHire = dbGet("SELECT * FROM employees WHERE id = ?", [employeeId]) as any;
    assert.equal(afterHire.employment_category, "internal");
    assert.equal(Number(afterHire.department_id), Number(rootBody.data.id));

    const alreadyHired = await request(tokenA, `/api/employees/${employeeId}/onboard`, { method: "POST" });
    expectStatus(alreadyHired.status, 400, "already hired employee cannot be onboarded again");

    const wrapped = await request(tokenA, "/api/xyai/agents/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        tenant_id: tenantA,
        asset: {
          id: "interop-general-01",
          kind: "agent",
          name: "通用智能体",
          description: "AI智能助手",
          payload: { agentId: "agent-general", skills: ["对话", "总结"], role: "助手" },
        },
      }),
    });
    expectStatus(wrapped.status, 201, "asset-wrapper studio payload imports to reserve");
    const wrappedBody = await wrapped.json() as any;
    const wrappedTalent = dbGet("SELECT * FROM talent_pool WHERE id = ?", [wrappedBody.data.talent_id]) as any;
    assert.equal(wrappedTalent.status, "recruited");
    assert.equal(JSON.parse(wrappedTalent.capabilities).schema, "openxyos.studio-agent.v1");
    const wrappedEmp = dbGet("SELECT * FROM employees WHERE id = ?", [wrappedBody.data.employee_id]) as any;
    assert.equal(wrappedEmp.employment_category, "reserve");
    assert.equal(wrappedEmp.source, "studio:interop-general-01");

    const kbDenied = await request(tokenA, "/api/xyai/knowledge/import", {
      method: "POST",
      body: JSON.stringify({ name: "政策库" }),
    });
    expectStatus(kbDenied.status, 403, "knowledge import requires interop header");

    const kbImported = await request(tokenA, "/api/xyai/knowledge/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        asset: {
          id: "kb-policy-01",
          kind: "knowledge-mount",
          name: "政策库",
          description: "合规政策挂接",
          payload: { kbId: "kb-policy-01", mountKind: "local", sourceRoot: "/docs/policy" },
        },
      }),
    });
    expectStatus(kbImported.status, 201, "knowledge import creates listable file");
    const kbBody = await kbImported.json() as any;
    assert.ok(kbBody.data.file_id);
    assert.equal(kbBody.data.folder, "/");

    const files = await request(tokenA, "/api/knowledge/files/list?folder=/");
    expectStatus(files.status, 200, "knowledge file list");
    const filesBody = await files.json() as any;
    const listed = (filesBody.data || []).find((item: any) => item.id === kbBody.data.file_id);
    assert.ok(listed, "installed Studio KB appears in GET /api/knowledge/files/list?folder=/");
    assert.equal(listed.original_name, "政策库");
    assert.equal(listed.folder, "/");
    assert.equal(listed.external_id, "kb-policy-01");

    const notes = await request(tokenA, "/api/knowledge");
    const notesBody = await notes.json() as any;
    assert.ok((notesBody.data || []).some((item: any) => item.id === kbBody.data.note_id), "installed Studio KB note is listed");

    const kbAgain = await request(tokenA, "/api/xyai/knowledge/import", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        name: "政策库·修订",
        external_id: "kb-policy-01",
        description: "更新后的政策库",
      }),
    });
    expectStatus(kbAgain.status, 200, "knowledge import is idempotent by external_id");
    const kbAgainBody = await kbAgain.json() as any;
    assert.equal(Number(kbAgainBody.data.file_id), Number(kbBody.data.file_id));
    const fileCount = (dbAll("SELECT id FROM knowledge_files WHERE tenant_id = ? AND external_id = ?", [tenantA, "kb-policy-01"]) as any[]).length;
    assert.equal(fileCount, 1, "studio KB import stays idempotent");

    const outsiderFiles = await request(tokenB, "/api/knowledge/files/list?folder=/");
    const outsiderFilesBody = await outsiderFiles.json() as any;
    assert.equal((outsiderFilesBody.data || []).some((item: any) => item.id === kbBody.data.file_id), false, "cross-tenant cannot see imported KB");

    const inboxKb = await request(tokenA, "/api/xyai/inbox", {
      method: "POST",
      headers: { "X-XYAI-Interop": "studio" },
      body: JSON.stringify({
        asset: { id: "kb-inbox-02", kind: "knowledge-mount", name: "行业语料", description: "inbox 路由导入" },
      }),
    });
    expectStatus(inboxKb.status, 201, "inbox routes knowledge-mount to knowledge import");
    const inboxKbBody = await inboxKb.json() as any;
    const inboxListed = ((await (await request(tokenA, "/api/knowledge/files/list?folder=/")).json() as any).data || [])
      .some((item: any) => item.id === inboxKbBody.data.file_id);
    assert.ok(inboxListed, "inbox-installed KB appears in folder=/ list");

    console.log("org canvas + studio reserve edit/hire + knowledge import tests passed");
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
