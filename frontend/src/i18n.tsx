import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "zh-CN" | "en";

type LocaleContextValue = {
  locale: Locale;
  isEnglish: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const STORAGE_KEY = "openxyos.locale";

function initialLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "zh-CN") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}


const EN_TEXT: Record<string, string> = {
  "加载中…": "Loading…", "加载中...": "Loading…", "加载失败": "Failed to load", "重新加载": "Reload",
  "保存": "Save", "保存成功": "Saved", "保存失败": "Save failed", "取消": "Cancel", "确认": "Confirm", "关闭": "Close",
  "删除": "Delete", "编辑": "Edit", "新建": "New", "创建": "Create", "添加": "Add", "更新": "Update",
  "搜索": "Search", "筛选": "Filter", "刷新": "Refresh", "返回": "Back", "查看": "View", "详情": "Details",
  "操作": "Actions", "状态": "Status", "名称": "Name", "描述": "Description", "类型": "Type", "角色": "Role",
  "部门": "Department", "岗位": "Position", "组织架构": "Organization", "组织": "Organization", "员工": "Employees",
  "人机资源": "Human–AI resources", "技能插件": "Skills & plugins", "沟通协作": "Collaboration", "智能体定制": "Agent Studio",
  "任务管理": "Task management", "知识库": "Knowledge base", "反思引擎": "Reflection engine", "治理引擎": "Governance engine",
  "系统设置": "System settings", "工作台": "Workspace", "通知公告": "Announcements", "登录": "Sign in", "退出登录": "Sign out",
  "邮箱": "Email", "密码": "Password", "昵称": "Display name", "管理员": "Administrator", "普通用户": "User",
  "启用": "Enable", "停用": "Disable", "已启用": "Enabled", "已停用": "Disabled", "成功": "Success", "失败": "Failed",
  "暂无数据": "No data yet", "无数据": "No data", "全部": "All", "开始时间": "Start date", "结束时间": "End date",
  "创建时间": "Created at", "更新时间": "Updated at", "提交": "Submit", "重置": "Reset", "导出": "Export", "导入": "Import",
  "权限不足": "Insufficient permissions", "未找到": "Not found", "网络错误": "Network error", "请求失败": "Request failed",
};

function translateKnown(value: string): string {
  const direct = EN_TEXT[value.trim()];
  if (direct) return value.replace(value.trim(), direct);
  return value;
}

function LocalizedDomText({ locale }: { locale: Locale }) {
  useEffect(() => {
    const originals = new WeakMap<Text, string>();
    const translateNode = (node: Text) => {
      const original = originals.get(node) ?? node.nodeValue ?? "";
      if (!originals.has(node)) originals.set(node, original);
      const next = locale === "en" ? translateKnown(original) : original;
      if (node.nodeValue !== next) node.nodeValue = next;
    };
    const translateElement = (element: Element) => {
      ["title", "placeholder", "aria-label"].forEach(attribute => {
        const original = element.getAttribute(`data-openxyos-${attribute}`) ?? element.getAttribute(attribute);
        if (original === null) return;
        if (!element.hasAttribute(`data-openxyos-${attribute}`)) element.setAttribute(`data-openxyos-${attribute}`, original);
        element.setAttribute(attribute, locale === "en" ? translateKnown(original) : original);
      });
    };
    const translateTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) translateNode(root as Text);
      if (root.nodeType === Node.ELEMENT_NODE) translateElement(root as Element);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode(node) {
          const tag = node.parentElement?.tagName;
          return tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        },
      });
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) translateNode(node as Text);
        else translateElement(node as Element);
      }
    };
    translateTree(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") translateNode(record.target as Text);
        record.addedNodes.forEach(translateTree);
        if (record.type === "attributes" && record.target instanceof Element) translateElement(record.target);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["title", "placeholder", "aria-label"] });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const setLocale = (next: Locale) => setLocaleState(next);
  const toggleLocale = () => setLocaleState(current => current === "zh-CN" ? "en" : "zh-CN");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, isEnglish: locale === "en", setLocale, toggleLocale }), [locale]);
  return <LocaleContext.Provider value={value}><LocalizedDomText locale={locale}/>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return <div className={`inline-flex items-center rounded border border-border bg-bg-card p-0.5 text-xs ${className}`} aria-label="Language">
    <button type="button" onClick={() => setLocale("zh-CN")} className={`rounded px-2 py-1 transition-colors ${locale === "zh-CN" ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}>中文</button>
    <button type="button" onClick={() => setLocale("en")} className={`rounded px-2 py-1 transition-colors ${locale === "en" ? "bg-primary text-white" : "text-text-muted hover:text-text"}`}>EN</button>
  </div>;
}