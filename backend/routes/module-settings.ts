import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db";
import { authenticate, AuthRequest, requireAdmin } from "../middleware";
import { isTenantModuleKey, TENANT_MODULES } from "../module-catalog";
import { localizedError } from "../utils/locale";

export const moduleSettingsRoutes = Router();
moduleSettingsRoutes.use(authenticate);

const moduleSettingsError = (req: AuthRequest, zh: string, en: string) => localizedError(req, zh, en);

function resolveTenantId(req: AuthRequest, requested: unknown): number | null {
  const requestedId = requested === undefined || requested === null || requested === ""
    ? req.user!.tenant_id
    : Number(requested);
  if (!Number.isInteger(requestedId) || requestedId <= 0) return null;
  if (requestedId !== req.user!.tenant_id && req.user!.role !== "super_admin") return null;
  return requestedId;
}

function readModules(tenantId: number) {
  const rows = dbAll(
    "SELECT module_key, enabled FROM tenant_module_settings WHERE tenant_id = ?",
    [tenantId]
  ) as Array<{ module_key: string; enabled: number }>;
  const stored = new Map(rows.map(row => [row.module_key, row.enabled === 1]));
  return TENANT_MODULES.map(module => ({ ...module, enabled: stored.get(module.key) ?? true }));
}

moduleSettingsRoutes.get("/", (req: AuthRequest, res) => {
  try {
    const tenantId = resolveTenantId(req, req.query.tenant_id);
    if (!tenantId) return res.status(403).json({ success: false, error: moduleSettingsError(req, "无权查看该租户的模块设置", "You do not have permission to view this tenant's module settings") });
    const tenant = dbGet("SELECT id, name FROM tenants WHERE id = ?", [tenantId]) as { id: number; name: string } | undefined;
    if (!tenant) return res.status(404).json({ success: false, error: moduleSettingsError(req, "租户不存在", "Tenant not found") });
    res.json({ success: true, data: { tenant, modules: readModules(tenantId) } });
  } catch {
    res.status(500).json({ success: false, error: moduleSettingsError(req, "模块设置服务暂时不可用，请稍后重试", "Module settings service is temporarily unavailable. Please try again") });
  }
});

moduleSettingsRoutes.put("/", requireAdmin, (req: AuthRequest, res) => {
  try {
    const tenantId = resolveTenantId(req, req.body?.tenant_id);
    if (!tenantId) return res.status(403).json({ success: false, error: moduleSettingsError(req, "无权修改该租户的模块设置", "You do not have permission to change this tenant's module settings") });
    const tenant = dbGet("SELECT id, name FROM tenants WHERE id = ?", [tenantId]) as { id: number; name: string } | undefined;
    if (!tenant) return res.status(404).json({ success: false, error: moduleSettingsError(req, "租户不存在", "Tenant not found") });

    const updates = req.body?.updates;
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: moduleSettingsError(req, "updates 必须是模块开关对象", "updates must be a module toggle object") });
    }
    const entries = Object.entries(updates);
    if (entries.length === 0) return res.status(400).json({ success: false, error: moduleSettingsError(req, "至少提交一个模块开关", "Provide at least one module toggle") });
    for (const [key, enabled] of entries) {
      if (!isTenantModuleKey(key)) return res.status(400).json({ success: false, error: moduleSettingsError(req, `未知模块: ${key}`, `Unknown module: ${key}`) });
      if (typeof enabled !== "boolean") return res.status(400).json({ success: false, error: moduleSettingsError(req, `${key} 的开关值必须是布尔值`, `The toggle value for ${key} must be boolean`) });
    }

    for (const [key, enabled] of entries) {
      dbRun(
        `INSERT OR REPLACE INTO tenant_module_settings
         (tenant_id, module_key, enabled, updated_by, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [tenantId, key, enabled ? 1 : 0, req.user!.id]
      );
    }
    res.json({ success: true, data: { tenant, modules: readModules(tenantId) } });
  } catch {
    res.status(500).json({ success: false, error: moduleSettingsError(req, "模块设置服务暂时不可用，请稍后重试", "Module settings service is temporarily unavailable. Please try again") });
  }
});
