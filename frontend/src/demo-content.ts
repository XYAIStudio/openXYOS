// Public sample content is intentionally localized for the hosted demo.
// Do not use this map to translate tenant-created content at runtime.
const PUBLIC_DEMO_TASK_TITLES: Record<string, string> = {
  "完成Q2产品路线图规划": "Complete Q2 product roadmap planning",
  "部署生产环境CI/CD流水线": "Deploy the production CI/CD pipeline",
  "编写API接口文档": "Write API documentation",
  "设计新版Dashboard UI": "Design the new dashboard UI",
  "性能压测报告": "Performance load-test report",
  "月度财务分析报告": "Monthly financial analysis report",
  "竞品分析报告": "Competitive analysis report",
  "新员工入职培训方案": "New employee onboarding plan",
  "数据库迁移方案评审": "Review the database migration plan",
  "Q2市场推广计划": "Q2 marketing plan",
  "安全审计漏洞修复": "Remediate security audit findings",
  "知识库文档整理": "Organize knowledge base documentation",
};

export function localizePublicDemoTaskTitle(title: string, isEnglish: boolean): string {
  return isEnglish ? PUBLIC_DEMO_TASK_TITLES[title] || title : title;
}
