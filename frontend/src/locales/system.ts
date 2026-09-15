/**
 * Shared UI copy belongs here instead of being duplicated in components.
 * Keys are stable product contracts: do not derive them from source text.
 */
export const zhCN = {
  "common.language": "语言",
  "common.loading": "加载中…",
  "common.refreshNow": "立即刷新",
  "common.updateLater": "稍后更新",
  "pwa.updateReady": "发现新版本，刷新后即可使用最新功能。",
  "footer.community": "openXYOS 社区版 · Apache License 2.0 · 开放共建",
  "header.openMenu": "打开菜单",
  "header.closeMenu": "关闭菜单",
  "header.viewAnnouncement": "点击查看公告详情",
  "header.signOut": "退出登录",
  "header.useLightMode": "切换到亮色模式",
  "header.useDarkMode": "切换到深色模式",
  "header.aiReady": "AI 就绪",
} as const;

export const en = {
  "common.language": "Language",
  "common.loading": "Loading…",
  "common.refreshNow": "Refresh now",
  "common.updateLater": "Update later",
  "pwa.updateReady": "A new version is ready. Refresh to use the latest features.",
  "footer.community": "openXYOS Community · Apache License 2.0 · Built in the open",
  "header.openMenu": "Open menu",
  "header.closeMenu": "Close menu",
  "header.viewAnnouncement": "View announcement",
  "header.signOut": "Sign out",
  "header.useLightMode": "Use light mode",
  "header.useDarkMode": "Use dark mode",
  "header.aiReady": "AI ready",
} as const;

export const systemMessages = { "zh-CN": zhCN, en } as const;
export type SystemMessageKey = keyof typeof zhCN;
