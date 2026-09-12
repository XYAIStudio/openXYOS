export const LLM_PROVIDERS = {
  deepseek: {
    provider: "DeepSeek",
    name: "DeepSeek V4 Flash",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
  },
  qwen: {
    provider: "阿里云百炼",
    name: "通义千问 Plus",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen-plus",
  },
  openai: {
    provider: "OpenAI",
    name: "GPT-5 mini",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5-mini",
  },
  zhipu: {
    provider: "智谱 AI",
    name: "GLM-5",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-5",
  },
  moonshot: {
    provider: "月之暗面",
    name: "Moonshot v1 8K",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
  },
} as const;

export type LLMProviderId = keyof typeof LLM_PROVIDERS;
