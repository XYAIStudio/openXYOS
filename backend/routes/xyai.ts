import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { dbGet, dbRun } from "../db";
import { authenticate, AuthRequest } from "../middleware";
import { UPLOAD_DIR } from "../middleware/upload";
import { localizedError } from "../utils/locale";

export const XYAI_INTEROP_HEADER = "x-xyai-interop";
export const XYAI_STUDIO_INTEROP = "studio";

export const xyaiRoutes = Router();
xyaiRoutes.use(authenticate);

const xyaiError = (req: AuthRequest, zh: string, en: string) => localizedError(req, zh, en);

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 32);
  }
  const text = cleanText(value, 800);
  return text ? text.split(/[,，、]/).map((item) => item.trim()).filter(Boolean).slice(0, 32) : [];
}

function requireStudioInterop(req: AuthRequest, res: import("express").Response, next: import("express").NextFunction) {
  const header = String(req.headers[XYAI_INTEROP_HEADER] || "").trim().toLowerCase();
  if (header !== XYAI_STUDIO_INTEROP) {
    return res.status(403).json({
      success: false,
      error: xyaiError(req, "缺少有效的 Studio 互通标识", "A valid Studio interop header is required"),
    });
  }
  next();
}

function interopAsset(body: any): { asset: Record<string, unknown>; payload: Record<string, unknown> } {
  const asset = asRecord(body?.asset);
  return { asset, payload: asRecord(asset.payload) };
}

function resolveDepartmentId(tenantId: number, body: any, payload: Record<string, unknown>): number | null {
  const rawId = body?.department_id ?? body?.departmentId ?? payload.department_id ?? payload.departmentId;
  if (rawId !== undefined && rawId !== null && rawId !== "") {
    const id = Number(rawId);
    if (Number.isSafeInteger(id) && id > 0) {
      const dept = dbGet("SELECT id FROM departments WHERE id = ? AND tenant_id = ?", [id, tenantId]) as { id: number } | undefined;
      return dept?.id ?? null;
    }
  }
  const name = cleanText(body?.department ?? body?.department_name ?? body?.departmentName ?? payload.department ?? payload.department_name, 80);
  if (!name) return null;
  const dept = dbGet("SELECT id FROM departments WHERE tenant_id = ? AND name = ?", [tenantId, name]) as { id: number } | undefined;
  return dept?.id ?? null;
}

function importStudioAgent(req: AuthRequest, res: import("express").Response) {
  const tenantId = req.user!.tenant_id;
  const { asset, payload } = interopAsset(req.body);
  const kind = cleanText(asset.kind ?? req.body?.kind, 40);
  if (kind === "knowledge-mount" || kind === "knowledge") {
    return res.status(400).json({
      success: false,
      error: xyaiError(req, "知识库请使用 /api/xyai/knowledge/import", "Use /api/xyai/knowledge/import for knowledge bases"),
    });
  }

  const name = cleanText(req.body?.name ?? asset.name, 80);
  if (!name) return res.status(400).json({ success: false, error: xyaiError(req, "智能体名称必填", "Agent name is required") });

  const role = cleanText(req.body?.role ?? req.body?.title ?? payload.role ?? payload.title ?? payload.category, 80);
  const positioning = cleanText(req.body?.positioning ?? payload.positioning ?? payload.subtitle, 400);
  const industry = cleanText(req.body?.industry ?? payload.industry, 80);
  const description = cleanText(req.body?.description ?? asset.description, 12000)
    || [positioning, industry ? `行业：${industry}` : ""].filter(Boolean).join("\n");
  const skills = asStringList(req.body?.skills ?? payload.skills ?? payload.capabilities).join(",");
  const capabilities = asStringList(req.body?.capabilities ?? payload.capabilities);
  const agentType = cleanText(req.body?.agent_type ?? req.body?.agentType ?? payload.agent_type, 80);
  const avatarEmoji = cleanText(req.body?.avatar_emoji ?? req.body?.avatarEmoji ?? payload.avatar_emoji ?? payload.emoji, 16) || "🤖";
  const employeeType = cleanText(req.body?.employee_type ?? req.body?.employeeType ?? payload.employee_type, 16) === "human" ? "human" : "ai";
  const externalId = cleanText(req.body?.external_id ?? req.body?.source_id ?? req.body?.studio_id ?? asset.id ?? payload.agentId, 120);
  const departmentId = resolveDepartmentId(tenantId, req.body, payload);
  const employeeSource = externalId ? `studio:${externalId}` : "studio";
  const capabilityPayload = JSON.stringify({
    schema: "openxyos.studio-agent.v1",
    capabilities,
    imported_from: "xyai-studio",
    ...(externalId ? { interop_id: externalId } : {}),
  });

  let talent = externalId
    ? dbGet("SELECT * FROM talent_pool WHERE tenant_id = ? AND source = 'studio' AND external_id = ?", [tenantId, externalId]) as any
    : undefined;
  let employee = externalId
    ? dbGet("SELECT * FROM employees WHERE tenant_id = ? AND source = ?", [tenantId, employeeSource]) as any
    : undefined;

  let talentId: number;
  let employeeId: number;
  let created = false;
  let updated = false;

  if (talent) {
    dbRun(
      `UPDATE talent_pool SET name = ?, avatar_emoji = ?, skills = ?, category = ?, description = ?, agent_type = ?, capabilities = ?, status = 'recruited', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND tenant_id = ?`,
      [name, avatarEmoji, skills, role, description, agentType || talent.agent_type, capabilityPayload, talent.id, tenantId],
    );
    talentId = Number(talent.id);
    updated = true;
  } else {
    const inserted = dbRun(
      `INSERT INTO talent_pool
       (tenant_id, talent_type, name, avatar_emoji, skills, category, description, source, rating, status, agent_type, capabilities, provider, integration_type, external_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'studio', 5, 'recruited', ?, ?, 'studio', 'studio-interop', ?)`,
      [tenantId, employeeType === "human" ? "human" : "ai", name, avatarEmoji, skills, role, description, agentType || null, capabilityPayload, externalId || null],
    );
    talentId = Number(inserted.lastInsertRowid);
    created = true;
  }

  if (employee) {
    dbRun(
      `UPDATE employees SET name = ?, role = ?, agent_type = ?, employee_type = ?, skills = ?, avatar_emoji = ?, description = ?, department_id = COALESCE(?, department_id)
       WHERE id = ? AND tenant_id = ?`,
      [name, role, agentType || employee.agent_type, employeeType, skills, avatarEmoji, description, departmentId, employee.id, tenantId],
    );
    employeeId = Number(employee.id);
    updated = true;
  } else {
    const inserted = dbRun(
      `INSERT INTO employees
       (company_id, department_id, name, role, agent_type, employee_type, skills, avatar_emoji, status, employment_category, description, tenant_id, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 'reserve', ?, ?, ?)`,
      [1, departmentId, name, role, agentType || null, employeeType, skills, avatarEmoji, description, tenantId, employeeSource],
    );
    employeeId = Number(inserted.lastInsertRowid);
    created = true;
  }

  return res.status(employee ? 200 : 201).json({
    success: true,
    data: {
      talent_id: talentId,
      employee_id: employeeId,
      employment_category: "reserve",
      status: "recruited",
      department_id: departmentId,
      created,
      updated,
      talent: { id: talentId, action: employee ? "updated" : "created" },
      employee: { id: employeeId, action: employee ? "updated" : "created" },
    },
  });
}

function writeKnowledgeSnapshot(tenantId: number, body: string): { storedPath: string; sizeKB: number } {
  const tenantDir = path.join(UPLOAD_DIR, "tenants", String(tenantId));
  fs.mkdirSync(tenantDir, { recursive: true, mode: 0o750 });
  const storedPath = path.join(tenantDir, `${crypto.randomUUID()}.md`);
  fs.writeFileSync(storedPath, body, { encoding: "utf8", mode: 0o640 });
  return { storedPath, sizeKB: Math.max(1, Math.round(Buffer.byteLength(body, "utf8") / 1024)) };
}

function importStudioKnowledge(req: AuthRequest, res: import("express").Response) {
  const tenantId = req.user!.tenant_id;
  const { asset, payload } = interopAsset(req.body);
  const name = cleanText(req.body?.name ?? req.body?.title ?? asset.name, 160);
  if (!name) return res.status(400).json({ success: false, error: xyaiError(req, "知识库名称必填", "Knowledge base name is required") });

  const description = cleanText(req.body?.description ?? req.body?.content ?? asset.description ?? payload.subtitle, 12000);
  const externalId = cleanText(
    req.body?.external_id ?? req.body?.source_id ?? req.body?.studio_id ?? req.body?.kbId ?? asset.id ?? payload.kbId,
    120,
  );
  const tags = cleanText(req.body?.tags ?? payload.tags, 240);
  const folder = "/";
  const sourceRoot = cleanText(payload.sourceRoot ?? req.body?.sourceRoot, 1000);
  const indexRoot = cleanText(payload.indexRoot ?? req.body?.indexRoot, 1000);
  const provider = cleanText(payload.provider ?? req.body?.provider, 80);
  const mountKind = cleanText(payload.mountKind ?? req.body?.mountKind, 40);
  const snapshot = [
    `# ${name}`,
    "",
    description || "Studio 推送的知识库挂接快照。",
    "",
    mountKind ? `- kind: ${mountKind}` : "",
    sourceRoot ? `- sourceRoot: ${sourceRoot}` : "",
    indexRoot ? `- indexRoot: ${indexRoot}` : "",
    provider ? `- provider: ${provider}` : "",
    externalId ? `- external_id: ${externalId}` : "",
  ].filter((line) => line !== "").join("\n");
  const summary = (description || snapshot).replace(/\n/g, " ").slice(0, 300);
  const noteContent = description || snapshot;

  const existingFile = externalId
    ? dbGet("SELECT * FROM knowledge_files WHERE tenant_id = ? AND external_id = ?", [tenantId, externalId]) as any
    : undefined;
  const existingNote = externalId
    ? dbGet("SELECT * FROM knowledge_notes WHERE tenant_id = ? AND external_id = ?", [tenantId, externalId]) as any
    : undefined;

  let fileId: number;
  let noteId: number;
  let created = false;
  let updated = false;

  if (existingFile) {
    dbRun(
      `UPDATE knowledge_files SET name = ?, original_name = ?, extracted_summary = ?, content_extracted = ?, keywords = ?, folder = ?, status = 'parsed', updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND tenant_id = ?`,
      [name, name, summary, snapshot.slice(0, 10000), tags, folder, existingFile.id, tenantId],
    );
    fileId = Number(existingFile.id);
    updated = true;
  } else {
    const written = writeKnowledgeSnapshot(tenantId, snapshot);
    const inserted = dbRun(
      `INSERT INTO knowledge_files (tenant_id, name, original_name, file_path, file_size, file_type, folder, status, content_extracted, extracted_summary, keywords, uploaded_by, external_id)
       VALUES (?, ?, ?, ?, ?, '.md', ?, 'parsed', ?, ?, ?, ?, ?)`,
      [tenantId, path.basename(written.storedPath), name, written.storedPath, written.sizeKB, folder, snapshot.slice(0, 10000), summary, tags, req.user!.id, externalId || null],
    );
    fileId = Number(inserted.lastInsertRowid);
    created = true;
  }

  if (existingNote) {
    dbRun(
      "UPDATE knowledge_notes SET title = ?, content = ?, tags = ?, source = 'studio' WHERE id = ? AND tenant_id = ?",
      [name, noteContent, tags, existingNote.id, tenantId],
    );
    noteId = Number(existingNote.id);
    updated = true;
  } else {
    const inserted = dbRun(
      "INSERT INTO knowledge_notes (title, content, tags, source, tenant_id, external_id) VALUES (?, ?, ?, 'studio', ?, ?)",
      [name, noteContent, tags, tenantId, externalId || null],
    );
    noteId = Number(inserted.lastInsertRowid);
    created = true;
  }

  return res.status(existingFile ? 200 : 201).json({
    success: true,
    data: {
      file_id: fileId,
      note_id: noteId,
      folder,
      external_id: externalId || null,
      created,
      updated,
    },
  });
}

// Studio 开发空间 → 备选员工. Contract:
// POST /api/xyai/agents/import
// Header X-XYAI-Interop: studio
// Body: name (required) or asset { id, kind, name, description, payload }
// Result: talent_pool.status=recruited (not listed in 人才市场) + employees.employment_category=reserve
// Capabilities schema remains openxyos.studio-agent.v1
xyaiRoutes.post("/agents/import", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    importStudioAgent(req, res);
  } catch {
    res.status(500).json({ success: false, error: xyaiError(req, "智能体导入暂时不可用，请稍后重试", "Agent import is temporarily unavailable. Please try again") });
  }
});

// Studio knowledge-mount → 知识库列表（folder=/）
xyaiRoutes.post("/knowledge/import", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    importStudioKnowledge(req, res);
  } catch {
    res.status(500).json({ success: false, error: xyaiError(req, "知识库导入暂时不可用，请稍后重试", "Knowledge import is temporarily unavailable. Please try again") });
  }
});

// Studio xyos-bridge inbox fallback: route by asset.kind
xyaiRoutes.post("/inbox", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    const kind = cleanText(req.body?.kind ?? req.body?.asset?.kind, 40);
    if (kind === "knowledge-mount" || kind === "knowledge") {
      return importStudioKnowledge(req, res);
    }
    return importStudioAgent(req, res);
  } catch {
    res.status(500).json({ success: false, error: xyaiError(req, "互通导入暂时不可用，请稍后重试", "Interop import is temporarily unavailable. Please try again") });
  }
});
