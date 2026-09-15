import { Router } from "express";
import { dbAll, dbGet, dbRun } from "../db";
import { authenticate, AuthRequest, requireAdmin } from "../middleware";
import { isLockedModule, isOpenXyosModuleKey, OPENXYOS_MODULES } from "../open-module-catalog";
import { isEnglishRequest, localizedApiError, localizedError } from "../utils/locale";

export const openModuleSettingsRoutes = Router();
openModuleSettingsRoutes.use(authenticate);

const openModuleSettingsError = (req: AuthRequest, zh: string, en: string) => localizedError(req, zh, en);

let schemaReady = false;
function ensureSchema() {
  if (schemaReady) return;
  try { dbRun("ALTER TABLE tenant_module_settings ADD COLUMN display_name TEXT"); }
  catch (error: any) { if (!error.message?.includes("duplicate column")) throw error; }
  schemaReady = true;
}
function resolveTenantId(req: AuthRequest, requested: unknown): number | null {
  const id = requested === undefined || requested === null || requested === "" ? req.user!.tenant_id : Number(requested);
  if (!Number.isInteger(id) || id <= 0) return null;
  if (id !== req.user!.tenant_id && req.user!.role !== "super_admin") return null;
  return id;
}
function readModules(tenantId: number, english = false) {
  ensureSchema();
  const rows = dbAll("SELECT module_key, enabled, display_name FROM tenant_module_settings WHERE tenant_id = ?", [tenantId]) as Array<{module_key:string;enabled:number;display_name:string|null}>;
  const stored = new Map(rows.map(row => [row.module_key, row]));
  return OPENXYOS_MODULES.map(module => {
    const setting = stored.get(module.key);
    const defaultLabel = english ? module.labelEn : module.label;
    return {
      ...module,
      defaultLabel,
      label: setting?.display_name?.trim() || defaultLabel,
      description: english ? module.descriptionEn : module.description,
      enabled: module.locked ? true : setting?.enabled !== 0,
    };
  });
}

openModuleSettingsRoutes.get("/", (req: AuthRequest, res) => {
  try {
    const tenantId = resolveTenantId(req, req.query.tenant_id);
    if (!tenantId) return res.status(403).json(localizedApiError(req, "MODULE_VIEW_DENIED"));
    const tenant = dbGet("SELECT id, name FROM tenants WHERE id = ?", [tenantId]);
    if (!tenant) return res.status(404).json({ success:false, error:openModuleSettingsError(req, "租户不存在", "Tenant not found") });
    res.json({ success:true, data:{ tenant, modules:readModules(tenantId, isEnglishRequest(req)) } });
  } catch { res.status(500).json(localizedApiError(req, "MODULE_SERVICE_UNAVAILABLE")); }
});

openModuleSettingsRoutes.put("/", requireAdmin, (req: AuthRequest, res) => {
  try {
    const tenantId = resolveTenantId(req, req.body?.tenant_id);
    if (!tenantId) return res.status(403).json(localizedApiError(req, "MODULE_CHANGE_DENIED"));
    const updates = req.body?.updates;
    const labels = req.body?.labels;
    if ((!updates || typeof updates !== "object" || Array.isArray(updates)) && (!labels || typeof labels !== "object" || Array.isArray(labels))) {
      return res.status(400).json(localizedApiError(req, "MODULE_INPUT_REQUIRED"));
    }
    ensureSchema();
    for (const [key,value] of Object.entries(updates || {})) {
      if (!isOpenXyosModuleKey(key)) return res.status(400).json({ success:false, error:openModuleSettingsError(req, `未知模块: ${key}`, `Unknown module: ${key}`) });
      if (isLockedModule(key)) return res.status(400).json({ success:false, error:openModuleSettingsError(req, `${key} 是基础模块，不能关闭`, `${key} is a foundation module and cannot be disabled`) });
      if (typeof value !== "boolean") return res.status(400).json({ success:false, error:openModuleSettingsError(req, `${key} 的开关值必须是布尔值`, `The toggle value for ${key} must be boolean`) });
      dbRun(`INSERT INTO tenant_module_settings (tenant_id,module_key,enabled,updated_by,updated_at)
        VALUES (?,?,?,?,CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id,module_key) DO UPDATE SET enabled=excluded.enabled,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`,
        [tenantId,key,value?1:0,req.user!.id]);
    }
    for (const [key,value] of Object.entries(labels || {})) {
      if (!isOpenXyosModuleKey(key)) return res.status(400).json({ success:false, error:openModuleSettingsError(req, `未知模块: ${key}`, `Unknown module: ${key}`) });
      if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 20) {
        return res.status(400).json({ success:false, error:openModuleSettingsError(req, `${key} 的显示名称须为 2-20 个字符`, `The display name for ${key} must be 2 to 20 characters`) });
      }
      dbRun(`INSERT INTO tenant_module_settings (tenant_id,module_key,enabled,display_name,updated_by,updated_at)
        VALUES (?,?,1,?,?,CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id,module_key) DO UPDATE SET display_name=excluded.display_name,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`,
        [tenantId,key,value.trim(),req.user!.id]);
    }
    const tenant = dbGet("SELECT id, name FROM tenants WHERE id = ?", [tenantId]);
    res.json({ success:true, data:{ tenant, modules:readModules(tenantId, isEnglishRequest(req)) } });
  } catch { res.status(500).json(localizedApiError(req, "MODULE_SERVICE_UNAVAILABLE")); }
});
