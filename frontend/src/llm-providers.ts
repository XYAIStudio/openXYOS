export const EXPERIENCE_MODELS = [
  { id: "deepseek", provider: "DeepSeek", name: "DeepSeek V4 Flash", baseUrl: "https://api.deepseek.com", model: "deepseek-v4-flash", hint: "高性价比推理与通用对话" },
  { id: "qwen", provider: "阿里云百炼", name: "通义千问 Plus", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus", hint: "中文与企业场景" },
  { id: "openai", provider: "OpenAI", name: "GPT-5 mini", baseUrl: "https://api.openai.com/v1", model: "gpt-5-mini", hint: "通用智能与工具调用" },
  { id: "zhipu", provider: "智谱 AI", name: "GLM-5", baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-5", hint: "中文智能与长任务" },
  { id: "moonshot", provider: "月之暗面", name: "Moonshot v1 8K", baseUrl: "https://api.moonshot.cn/v1", model: "moonshot-v1-8k", hint: "长文本与中文对话" },
] as const;

export type ExperienceModelId = typeof EXPERIENCE_MODELS[number]["id"];
