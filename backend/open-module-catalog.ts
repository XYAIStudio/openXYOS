export const OPENXYOS_MODULES = [
  { key: "workspace", label: "工作台", labelEn: "Workspace", description: "组织运行总览与待办入口", descriptionEn: "Organization overview and action hub", locked: true },
  { key: "announcements", label: "通知公告", labelEn: "Announcements", description: "可二次开发的通知发布与已读示例", descriptionEn: "Extensible notice publishing and read-status example", locked: false },
  { key: "organization", label: "组织架构", labelEn: "Organization", description: "集团、公司、部门、岗位与汇报关系", descriptionEn: "Groups, companies, departments, roles, and reporting lines", locked: false },
  { key: "employees", label: "人机资源", labelEn: "Human-AI Resources", description: "人类员工、AI 员工、备选员工与人才市场", descriptionEn: "Human staff, AI staff, candidates, and talent marketplace", locked: false },
  { key: "skills", label: "技能插件", labelEn: "Skills & Plugins", description: "智能体技能目录与能力装配", descriptionEn: "Agent skill catalog and capability assembly", locked: false },
  { key: "chat", label: "沟通协作", labelEn: "Collaboration", description: "人机单聊、群聊与实时协作", descriptionEn: "Human-AI direct messages, groups, and real-time collaboration", locked: false },
  { key: "agents", label: "智能体定制", labelEn: "Agent Studio", description: "在线生成顾问型智能体并登记人才市场", descriptionEn: "Create consultant agents online and register them in the talent marketplace", locked: false },
  { key: "tasks", label: "任务管理", labelEn: "Task Management", description: "可二次开发的任务、子任务与状态流转示例", descriptionEn: "Extensible tasks, subtasks, and workflow status examples", locked: false },
  { key: "knowledge", label: "知识库", labelEn: "Knowledge Base", description: "可二次开发的资料上传、解析与检索示例", descriptionEn: "Extensible document upload, parsing, and retrieval examples", locked: false },
  { key: "reflections", label: "反思引擎", labelEn: "Reflection Engine", description: "可二次开发的复盘与经验沉淀示例", descriptionEn: "Extensible review and organizational learning examples", locked: false },
  { key: "governance", label: "治理引擎", labelEn: "Governance Engine", description: "人机协作策略、人工复核与审计边界", descriptionEn: "Human-AI collaboration policies, human review, and audit boundaries", locked: false },
  { key: "settings", label: "系统设置", labelEn: "System Settings", description: "租户、模型、模块与用户设置", descriptionEn: "Tenant, model, module, and user settings", locked: true },
] as const;
export type OpenXyosModuleKey = typeof OPENXYOS_MODULES[number]["key"];
const KEYS = new Set<string>(OPENXYOS_MODULES.map(item => item.key));
export function isOpenXyosModuleKey(value: string): value is OpenXyosModuleKey { return KEYS.has(value); }
export function isLockedModule(value: string): boolean { return OPENXYOS_MODULES.some(item => item.key === value && item.locked); }
