import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { dbGet } from "./db";
import { getAuthProvider } from "./services/auth-provider";
import { runWithRequestContext } from "./services/request-context";

// P0安全：JWT密钥必须从环境变量获取，不允许硬编码默认值
const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (!configuredJwtSecret) {
  throw new Error("JWT_SECRET must be configured before the server starts");
}
const JWT_SECRET: string = configuredJwtSecret;

export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
  role: string;
  tenant_id: number;
  department_id?: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "未登录" });
  }

  try {
    const result = await getAuthProvider().validateAccessToken(authHeader.slice(7));
    if (!result.success || !result.user) {
      return res.status(401).json({ success: false, error: result.error || "登录已过期" });
    }
    req.user = result.user;
    runWithRequestContext(
      { tenantId: result.user.tenant_id, userId: result.user.id },
      next,
    );
  } catch {
    return res.status(401).json({ success: false, error: "登录已过期" });
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ success: false, error: "需要超级管理员权限" });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user?.role || !["super_admin", "admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: "需要管理员权限" });
  }
  next();
}
