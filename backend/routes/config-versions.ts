import { Router } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../middleware";
import {
  saveConfigVersion, getConfigVersions, getCurrentConfig,
  rollbackConfig, deleteConfigVersion, getConfigStats
} from "../services/config-version";
import { localizedError } from "../utils/locale";

export const configVersionRoutes = Router();
configVersionRoutes.use(authenticate);

const configVersionError = (req: AuthRequest, zh: string, en: string) => localizedError(req, zh, en);

// 获取配置版本列表
configVersionRoutes.get("/", (req: AuthRequest, res) => {
  try {
    const versions = getConfigVersions(
      req.user!.tenant_id,
      req.query.type as string,
      req.query.key as string
    );
    res.json({ success: true, data: versions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});

// 获取配置统计
configVersionRoutes.get("/stats", (req: AuthRequest, res) => {
  try {
    const stats = getConfigStats(req.user!.tenant_id);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});

// 获取当前配置
configVersionRoutes.get("/current", (req: AuthRequest, res) => {
  try {
    const { type, key } = req.query;
    if (!type || !key) return res.status(400).json({ success: false, error: configVersionError(req, "type和key必填", "type and key are required") });
    const config = getCurrentConfig(req.user!.tenant_id, type as string, key as string);
    res.json({ success: true, data: config || null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});

// 保存配置版本
configVersionRoutes.post("/", requireAdmin, (req: AuthRequest, res) => {
  try {
    const id = saveConfigVersion({ ...req.body, tenant_id: req.user!.tenant_id, created_by: req.user!.id });
    res.json({ success: true, data: { id } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});

// 回滚配置
configVersionRoutes.post("/rollback/:id", requireAdmin, (req: AuthRequest, res) => {
  try {
    const success = rollbackConfig(req.user!.tenant_id, parseInt(req.params.id));
    if (!success) return res.status(404).json({ success: false, error: configVersionError(req, "版本不存在", "Configuration version not found") });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});

// 删除配置版本
configVersionRoutes.delete("/:id", requireAdmin, (req: AuthRequest, res) => {
  try {
    deleteConfigVersion(parseInt(req.params.id), req.user!.tenant_id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: configVersionError(req, "配置版本服务暂时不可用，请稍后重试", "Configuration version service is temporarily unavailable. Please try again") });
  }
});
