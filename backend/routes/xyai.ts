import { Router } from "express";
import { dbGet, dbRun } from "../db";
import { authenticate, AuthRequest } from "../middleware";
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

function resolveDepartmentId(tenantId: number, body: any): number | null {
  const rawId = body?.department_id ?? body?.departmentId;
  if (rawId !== undefined && rawId !== null && rawId !== "") {
    const id = Number(rawId);
    if (Number.isSafeInteger(id) && id > 0) {
      const dept = dbGet("SELECT id FROM departments WHERE id = ? AND tenant_id = ?", [id, tenantId]) as { id: number } | undefined;
      return dept?.id ?? null;
    }
  }
  const name = cleanText(body?.department ?? body?.department_name ?? body?.departmentName, 80);
  if (!name) return null;
  const dept = dbGet("SELECT id FROM departments WHERE tenant_id = ? AND name = ?", [tenantId, name]) as { id: number } | undefined;
  return dept?.id ?? null;
}

// Studio 开发空间 → 备选员工. Contract for XYAI Studio `components/openxyos` submodule:
// POST /api/xyai/agents/import
// Header X-XYAI-Interop: studio
// Body: name (required), role|title, description, department|department_name|department_id,
//       agent_type, skills[], capabilities[], avatar_emoji, employee_type, external_id|source_id|studio_id
xyaiRoutes.post("/agents/import", requireStudioInterop, (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenant_id;
    const name = cleanText(req.body?.name, 80);
    if (!name) return res.status(400).json({ success: false, error: xyaiError(req, "智能体名称必填", "Agent name is required") });

    const role = cleanText(req.body?.role ?? req.body?.title, 80);
    const positioning = cleanText(req.body?.positioning, 400);
    const industry = cleanText(req.body?.industry, 80);
    const description = cleanText(req.body?.description, 12000)
      || [positioning, industry ? `行业：${industry}` : ""].filter(Boolean).join("\n");
    const skills = asStringList(req.body?.skills).join(",");
    const capabilities = asStringList(req.body?.capabilities);
    const agentType = cleanText(req.body?.agent_type ?? req.body?.agentType, 80);
    const avatarEmoji = cleanText(req.body?.avatar_emoji ?? req.body?.avatarEmoji, 16) || "🤖";
    const employeeType = cleanText(req.body?.employee_type ?? req.body?.employeeType, 16) === "human" ? "human" : "ai";
    const externalId = cleanText(req.body?.external_id ?? req.body?.source_id ?? req.body?.studio_id, 120);
    const departmentId = resolveDepartmentId(tenantId, req.body);
    const employeeSource = externalId ? `studio:${externalId}` : "studio";
    const capabilityPayload = JSON.stringify({
      schema: "openxyos.studio-agent.v1",
      capabilities,
      imported_from: "xyai-studio",
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
