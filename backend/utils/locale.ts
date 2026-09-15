import type { Request } from "express";

/** Stable, client-readable failure contract for routes that have been migrated. */
export const ERROR_MESSAGES = {
  AUTH_INVALID_CREDENTIALS: { zh: "邮箱或密码错误", en: "Invalid email or password" },
  AUTH_TENANT_SUSPENDED: { zh: "租户已被暂停", en: "This tenant is suspended" },
  AUTH_ACCOUNT_DISABLED: { zh: "账号已被禁用", en: "This account is disabled" },
  AUTH_TOKEN_EXPIRED: { zh: "令牌无效或已过期", en: "The token is invalid or has expired" },
  AUTH_REGISTRATION_DISABLED: { zh: "公开注册未启用", en: "Public registration is disabled" },
  AUTH_CREDENTIALS_REQUIRED: { zh: "邮箱和密码必填", en: "Email and password are required" },
  AUTH_PASSWORD_TOO_SHORT: { zh: "密码至少6位", en: "Password must be at least 6 characters" },
  AUTH_EMAIL_REGISTERED: { zh: "该邮箱已注册", en: "This email is already registered" },
  AUTH_AUTO_SIGN_IN_FAILED: { zh: "注册成功但登录失败，请手动登录", en: "Registration succeeded, but automatic sign-in failed. Please sign in manually." },
  AUTH_REFRESH_TOKEN_REQUIRED: { zh: "refreshToken 必填", en: "refreshToken is required" },
  AUTH_USER_NOT_FOUND: { zh: "用户不存在", en: "User not found" },
  AUTH_SERVICE_UNAVAILABLE: { zh: "认证服务暂时不可用，请稍后重试", en: "Authentication service is temporarily unavailable. Please try again" },
  MODULE_VIEW_DENIED: { zh: "无权查看该租户的模块设置", en: "You do not have permission to view this tenant's module settings" },
  MODULE_CHANGE_DENIED: { zh: "无权修改该租户的模块设置", en: "You do not have permission to change this tenant's module settings" },
  MODULE_INPUT_REQUIRED: { zh: "请提交 updates 或 labels", en: "Provide updates or labels" },
  MODULE_SERVICE_UNAVAILABLE: { zh: "模块设置服务暂时不可用，请稍后重试", en: "Module settings service is temporarily unavailable. Please try again" },
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export function isEnglishRequest(req: Pick<Request, "headers">): boolean {
  return String(req.headers["accept-language"] || "").toLowerCase().startsWith("en");
}

export function localizedError(req: Pick<Request, "headers">, zh: string, en: string): string {
  return isEnglishRequest(req) ? en : zh;
}

export function localizedApiError(req: Pick<Request, "headers">, code: ErrorCode) {
  const message = ERROR_MESSAGES[code];
  return { success: false as const, error_code: code, error: localizedError(req, message.zh, message.en) };
}
