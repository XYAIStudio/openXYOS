import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
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

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item, 80)).filter(Boolean).slice(0, 32);
  }
  const text = cleanText(value, 800);
  return text ? text.split(/[,，、]/).map((item) => item.trim()).filter(Boolean).slice(0, 32) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Studio may POST the official flat fields or wrap them as `{ asset, tenant_id }`.
 * Flat fields win; missing name / description / external_id fall back to the asset.
 */
export function flattenStudioImportBody(body: unknown): Record<string, unknown> {
  const raw = asRecord(body);
  const asset = asRecord(raw.asset);
  const payload = asRecord(asset.payload);
  return {
    ...payload,
    ...asset,
    ...raw,
    name: raw.name ?? asset.name ?? payload.name,
    description: raw.description ?? asset.description ?? payload.description,
    external_id: raw.external_id ?? raw.source_id ?? raw.studio_id ?? asset.id ?? payload.kbId ?? payload.agentId,
    source_id: raw.source_id ?? raw.external_id ?? raw.studio_id ?? asset.id,
    studio_id: raw.studio_id ?? raw.external_id ?? raw.source_id ?? asset.id,
  };
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

function resolveDepartmentId(tenantId: number, body: Record<string, unknown>): number | null {
  const rawId = body.department_id ?? body.departmentId;
  if (rawId !== undefined && rawId !== null && rawId !== "") {
    const id = Number(rawId);
    if (Number.isSafeInteger(id) && id > 0) {
      const dept = dbGet("SELECT id FROM departments WHERE id = ? AND tenant_id = ?", [id, tenantId]) as { id: number } | undefined;
      return dept?.id ?? null;
    }
  }
  const name = cleanText(body.department ?? body.department_name ?? body.departmentName, 80);
  if (!name) return null;
  const dept = dbGet("SELECT id FROM departments WHERE tenant_id = ? AND name = ?", [tenantId, name]) as { id: number } | undefined;
  return dept?.id ?? null;
}

function safeFileSlug(raw: string): string {
  const ascii = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return ascii || "kb";
}

function writeStudioKnowledgeMarkdown(tenantId: number, externalId: string, title: string, body: string): { storedPath: string; sizeKB: number } {
  const tenantDir = path.join(UPLOAD_DIR, "tenants", String(tenantId));
  fs.mkdirSync(tenantDir, { recursive: true, mode: 0o750 });
  const storedPath = path.join(tenantDir, `studio-kb-${safeFileSlug(externalId || title)}.md`);
  fs.writeFileSync(storedPath, body, "utf8");
  return { storedPath, sizeKB: Math.max(1, Math.ceil(Buffer.byteLength(body, "utf8") / 1024)) };
}

// Studio 开发空间 → 备选员工. Contract for XYAI Studio `components/openxyos` submodule:
// POST /api/xyai/agents/import
// Header Authorization: Bearer <tenant JWT>
// Header X-XYAI-Interop: studio
// Body: name (required), role|title, description, positioning, industry,
//       department|department_name|department_id, agent_type, skills[], capabilities[],
//       avatar_emoji, employee_type, external_id|source_id|studio_id
//       (aliases also accepted inside `{ asset }` so older Studio clients keep working)
xyaiRoutes.post("/agents/import", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenant_id;
    const body = flattenStudioImportBody(req.body);
    const name = cleanText(body.name, 80);
    if (!name) return res.status(400).json({ success: false, error: xyaiError(req, "智能体名称必填", "Agent name is required") });

    const role = cleanText(body.role ?? body.title, 80);
    const positioning = cleanText(body.positioning, 400);
    const industry = cleanText(body.industry, 80);
    const description = cleanText(body.description, 12000)
      || [positioning, industry ? `行业：${industry}` : ""].filter(Boolean).join("\n");
    const skills = asStringList(body.skills).join(",");
    const capabilities = asStringList(body.capabilities);
    const agentType = cleanText(body.agent_type ?? body.agentType, 80);
    const avatarEmoji = cleanText(body.avatar_emoji ?? body.avatarEmoji, 16) || "🤖";
    const employeeType = cleanText(body.employee_type ?? body.employeeType, 16) === "human" ? "human" : "ai";
    const externalId = cleanText(body.external_id ?? body.source_id ?? body.studio_id, 120);
    const departmentId = resolveDepartmentId(tenantId, body);
    const employeeSource = externalId ? `studio:${externalId}` : "studio";
    const capabilityPayload = JSON.stringify({
      schema: "openxyos.studio-agent.v1",
      capabilities,
      imported_from: "xyai-studio",
    });
    const importerId = req.user!.id;

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
        `UPDATE employees SET name = ?, role = ?, agent_type = ?, employee_type = ?, skills = ?, avatar_emoji = ?, description = ?, department_id = COALESCE(?, department_id), user_id = COALESCE(user_id, ?)
         WHERE id = ? AND tenant_id = ?`,
        [name, role, agentType || employee.agent_type, employeeType, skills, avatarEmoji, description, departmentId, importerId, employee.id, tenantId],
      );
      employeeId = Number(employee.id);
      updated = true;
    } else {
      const inserted = dbRun(
        `INSERT INTO employees
         (company_id, department_id, name, role, agent_type, employee_type, skills, avatar_emoji, status, employment_category, description, user_id, tenant_id, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 'reserve', ?, ?, ?, ?)`,
        [1, departmentId, name, role, agentType || null, employeeType, skills, avatarEmoji, description, importerId, tenantId, employeeSource],
      );
      employeeId = Number(inserted.lastInsertRowid);
      created = true;
    }

    res.status(employee ? 200 : 201).json({
      success: true,
      data: {
        talent_id: talentId,
        employee_id: employeeId,
        employment_category: "reserve",
        department_id: departmentId,
        created,
        updated,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: xyaiError(req, "智能体导入暂时不可用，请稍后重试", "Agent import is temporarily unavailable. Please try again") });
  }
});

// Studio 开发空间 → 知识库. Lands in knowledge_files (folder=/) + knowledge_notes.
// POST /api/xyai/knowledge/import
// Header Authorization: Bearer <tenant JWT>
// Header X-XYAI-Interop: studio
// Body: name (required), description, external_id|source_id|studio_id, payload
xyaiRoutes.post("/knowledge/import", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenant_id;
    const body = flattenStudioImportBody(req.body);
    const name = cleanText(body.name, 160);
    if (!name) return res.status(400).json({ success: false, error: xyaiError(req, "知识库名称必填", "Knowledge base name is required") });

    const description = cleanText(body.description, 12000);
    const externalId = cleanText(body.external_id ?? body.source_id ?? body.studio_id, 120);
    const payload = asRecord(body.payload);
    const mountKind = cleanText(payload.mountKind ?? payload.kind ?? body.kind, 40) || "knowledge-mount";
    const sourceRoot = cleanText(payload.sourceRoot, 500);
    const indexRoot = cleanText(payload.indexRoot, 500);
    const kbId = cleanText(payload.kbId, 120);
    const tags = "xyai-studio,knowledge-mount";
    const noteSource = externalId ? `studio:${externalId}` : "studio";
    const markdown = [
      `# ${name}`,
      "",
      description || "XYAI Studio 推送的知识库安装包。",
      "",
      `- source: xyai-studio`,
      `- mountKind: ${mountKind}`,
      kbId ? `- kbId: ${kbId}` : "",
      sourceRoot ? `- sourceRoot: ${sourceRoot}` : "",
      indexRoot ? `- indexRoot: ${indexRoot}` : "",
      externalId ? `- external_id: ${externalId}` : "",
    ].filter(Boolean).join("\n");

    let file = externalId
      ? dbGet("SELECT * FROM knowledge_files WHERE tenant_id = ? AND external_id = ?", [tenantId, externalId]) as any
      : undefined;
    let note = externalId
      ? dbGet("SELECT * FROM knowledge_notes WHERE tenant_id = ? AND (external_id = ? OR source = ?)", [tenantId, externalId, noteSource]) as any
      : undefined;

    const written = writeStudioKnowledgeMarkdown(tenantId, externalId || name, name, markdown);
    const fileName = `${name}.md`;
    let fileId: number;
    let noteId: number;
    let created = false;
    let updated = false;

    if (file) {
      dbRun(
        `UPDATE knowledge_files SET name = ?, original_name = ?, file_path = ?, file_size = ?, file_type = 'md', folder = '/', status = 'parsed',
         content_extracted = ?, extracted_summary = ?, keywords = ?, parsed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND tenant_id = ?`,
        [fileName, fileName, written.storedPath, written.sizeKB, markdown.slice(0, 10000), markdown.slice(0, 300).replace(/\n/g, " "), tags, file.id, tenantId],
      );
      fileId = Number(file.id);
      updated = true;
    } else {
      const inserted = dbRun(
        `INSERT INTO knowledge_files
         (tenant_id, name, original_name, file_path, file_size, file_type, folder, status, content_extracted, extracted_summary, keywords, uploaded_by, external_id)
         VALUES (?, ?, ?, ?, ?, 'md', '/', 'parsed', ?, ?, ?, ?, ?)`,
        [tenantId, fileName, fileName, written.storedPath, written.sizeKB, markdown.slice(0, 10000), markdown.slice(0, 300).replace(/\n/g, " "), tags, req.user!.id, externalId || null],
      );
      fileId = Number(inserted.lastInsertRowid);
      created = true;
    }

    if (note) {
      dbRun(
        `UPDATE knowledge_notes SET title = ?, content = ?, tags = ?, source = ?, external_id = ?
         WHERE id = ? AND tenant_id = ?`,
        [name, markdown, tags, noteSource, externalId || null, note.id, tenantId],
      );
      noteId = Number(note.id);
      updated = true;
    } else {
      const inserted = dbRun(
        `INSERT INTO knowledge_notes (title, content, tags, source, tenant_id, external_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, markdown, tags, noteSource, tenantId, externalId || null],
      );
      noteId = Number(inserted.lastInsertRowid);
      created = true;
    }

    res.status(file && note ? 200 : 201).json({
      success: true,
      data: {
        file_id: fileId,
        note_id: noteId,
        folder: "/",
        created,
        updated,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: xyaiError(req, "知识库导入暂时不可用，请稍后重试", "Knowledge import is temporarily unavailable. Please try again") });
  }
});
