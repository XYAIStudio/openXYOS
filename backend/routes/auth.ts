/**
 * V0.60 R1 认证路由 — 通过 AuthProvider 接口实现
 */

import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware";
import { LTSProvider, getAuthProvider } from "../services/auth-provider";
import { dbGet, dbRun } from "../db";
import bcrypt from "bcryptjs";
import { localizedApiError } from "../utils/locale";

function authErrorCode(code?: string) {
  const known = {
    INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
    TENANT_SUSPENDED: "AUTH_TENANT_SUSPENDED",
    ACCOUNT_LOCKED: "AUTH_ACCOUNT_DISABLED",
    TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  } as const;
  return known[code as keyof typeof known] || "AUTH_INVALID_CREDENTIALS";
}

export const authRoutes = Router();

// POST /register — 用户注册
authRoutes.post("/register", async (req, res) => {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== "true") {
      return res.status(403).json(localizedApiError(req, "AUTH_REGISTRATION_DISABLED"));
    }
    const { email, password, nickname } = req.body;
    if (!email || !password) {
      return res.status(400).json(localizedApiError(req, "AUTH_CREDENTIALS_REQUIRED"));
    }
    if (password.length < 6) {
      return res.status(400).json(localizedApiError(req, "AUTH_PASSWORD_TOO_SHORT"));
    }

    const existing = dbGet("SELECT id FROM users WHERE email = ?", [email]);
    if (existing) {
      return res.status(409).json(localizedApiError(req, "AUTH_EMAIL_REGISTERED"));
    }

    const hash = bcrypt.hashSync(password, 10);
    dbRun(
      "INSERT INTO users (email, password_hash, nickname, role, tenant_id) VALUES (?, ?, ?, 'user', 2)",
      [email, hash, nickname || email.split("@")[0]]
    );

    // 自动登录
    const provider = getAuthProvider();
    const result = await provider.authenticate({ email, password });
    if (!result.success) {
      return res.status(500).json(localizedApiError(req, "AUTH_AUTO_SIGN_IN_FAILED"));
    }

    res.json({ success: true, data: { user: result.user, tokens: result.tokens } });
  } catch {
    res.status(500).json(localizedApiError(req, "AUTH_SERVICE_UNAVAILABLE"));
  }
});

// POST /login — 凭据认证 → access + refresh token
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const provider = getAuthProvider();
    const result = await provider.authenticate({ email, password });

    if (!result.success) {
      const status = result.code === "TENANT_SUSPENDED" ? 403 : 401;
      return res.status(status).json(localizedApiError(req, authErrorCode(result.code)));
    }

    res.json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch {
    res.status(500).json(localizedApiError(req, "AUTH_SERVICE_UNAVAILABLE"));
  }
});

// POST /refresh — 刷新令牌对
authRoutes.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(localizedApiError(req, "AUTH_REFRESH_TOKEN_REQUIRED"));
    }

    const provider = getAuthProvider();
    const result = await provider.refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.status(401).json(localizedApiError(req, authErrorCode(result.code)));
    }

    res.json({ success: true, data: { tokens: result.tokens } });
  } catch (err: any) {
    res.status(500).json(localizedApiError(req, "AUTH_SERVICE_UNAVAILABLE"));
  }
});

// GET /me — 当前用户信息
authRoutes.get("/me", authenticate, (req: AuthRequest, res) => {
  const user = dbGet("SELECT id, email, nickname, role, tenant_id FROM users WHERE id = ?", [req.user!.id]);
  if (!user) return res.status(404).json(localizedApiError(req, "AUTH_USER_NOT_FOUND"));
  res.json({ success: true, data: user });
});

// POST /revoke — 撤销当前用户的所有令牌（需认证）
authRoutes.post("/revoke", authenticate, async (req: AuthRequest, res) => {
  try {
    const provider = getAuthProvider();
    await provider.revokeUserTokens(req.user!.id);
    res.json({ success: true, message: "令牌已撤销" });
  } catch {
    res.status(500).json(localizedApiError(req, "AUTH_SERVICE_UNAVAILABLE"));
  }
});
