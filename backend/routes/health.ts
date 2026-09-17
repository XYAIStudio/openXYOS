import { Router } from "express";
import { dbGet } from "../db";
import { OPENXYOS_EDITION, OPENXYOS_PRODUCT, OPENXYOS_VERSION } from "../openxyos-identity";

export const healthRoutes = Router();

function checkDatabase() {
  const employees = dbGet("SELECT COUNT(*) as c FROM employees") as any;
  const tasks = dbGet("SELECT COUNT(*) as c FROM tasks") as any;
  const users = dbGet("SELECT COUNT(*) as c FROM users") as any;
  return { employees: employees.c, tasks: tasks.c, users: users.c };
}

function publicIdentity() {
  return { product: OPENXYOS_PRODUCT, edition: OPENXYOS_EDITION, version: OPENXYOS_VERSION };
}

healthRoutes.get("/livez", (_req, res) => {
  res.status(200).json({ status: "live", uptime: Math.floor(process.uptime()), ...publicIdentity() });
});

healthRoutes.get("/readyz", (_req, res) => {
  try {
    const stats = checkDatabase();
    res.status(200).json({
      status: "ready",
      ...publicIdentity(),
      database: "ok",
      uptime: Math.floor(process.uptime()),
      stats,
    });
  } catch {
    res.status(503).json({ status: "not_ready", ...publicIdentity(), database: "error" });
  }
});

// 兼容既有部署健康检查，同时保证依赖异常时返回非 2xx。
healthRoutes.get("/", (_req, res) => {
  try {
    const stats = checkDatabase();
    res.status(200).json({ status: "ready", ...publicIdentity(), database: "ok", uptime: Math.floor(process.uptime()), stats });
  } catch {
    res.status(503).json({ status: "not_ready", ...publicIdentity(), database: "error" });
  }
});
