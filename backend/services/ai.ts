import { dbGet } from "../db";
import { AGENT_TEMPLATES } from "../agent-templates";
import { assertModelEndpointAllowed } from "../config/runtime";
import { getRequestTenantId } from "./request-context";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  tokens_used: number;
  model: string;
}

export type AIOutputLanguage = "zh" | "en";

function languageInstruction(language: AIOutputLanguage): string {
  return language === "en"
    ? "Respond in clear, professional English. Keep required JSON keys and code fences unchanged."
    : "请使用清晰、专业的简体中文回答；保留要求的 JSON 字段和代码块格式。";
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export function sanitizeLLMInput(text: string): string {
  return text
    .replace(/忽略(所有|上述|之前|以上|一切).*指令/gi, "[已过滤]")
    .replace(/Ignore\s*(all|previous|above|the).*instructions/gi, "[filtered]")
    .replace(/system:\s*|<\s*\|?system\|?\s*>|\[system\]/gi, "[已过滤]")
    .slice(0, 16_000);
}

function getLLMConfig(): { apiKey: string; baseUrl: string; model: string } {
  const tenantId = getRequestTenantId() ?? 1;
  const getValue = (key: string) => dbGet("SELECT value FROM ai_config WHERE key = ? AND tenant_id = ?", [key, tenantId]) as any;
  return {
    apiKey: getValue("llm_api_key")?.value || process.env.LLM_API_KEY || "",
    baseUrl: getValue("llm_api_base")?.value || process.env.LLM_API_BASE || "",
    model: getValue("llm_model")?.value || process.env.LLM_MODEL || "",
  };
}

function aiIsEnabled(): boolean {
  const tenantId = getRequestTenantId() ?? 1;
  return (dbGet("SELECT value FROM ai_config WHERE key = 'ai_reply_enabled' AND tenant_id = ?", [tenantId]) as any)?.value !== "false";
}

function endpoint(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/chat/completions`;
}

export async function callLLM(messages: AIMessage[], temperature = 0.7, maxTokens = 1024, language: AIOutputLanguage = "zh"): Promise<AIResponse> {
  const { apiKey, baseUrl, model } = getLLMConfig();
  if (!aiIsEnabled()) return { content: language === "en" ? "[System] AI has been disabled by an administrator." : "[系统] AI 功能已被管理员关闭。", tokens_used: 0, model: "disabled" };
  if (!apiKey || !baseUrl || !model) return { content: language === "en" ? "[System] Configure a model provider in System settings before using AI." : "[系统] 请先在系统设置中完成模型服务配置。", tokens_used: 0, model: "unconfigured" };
  if (!assertModelEndpointAllowed(baseUrl)) return { content: language === "en" ? "[System] The current network policy does not allow this model provider." : "[系统] 当前网络策略不允许连接该模型服务。", tokens_used: 0, model: "blocked" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const response = await fetch(endpoint(baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      signal: controller.signal,
    });
    if (!response.ok) return { content: language === "en" ? "[System] The model service is temporarily unavailable. Please try again." : "[系统] 模型服务暂时不可用，请稍后重试。", tokens_used: 0, model };
    const data = await response.json() as any;
    return {
      content: data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || (language === "en" ? "(The model returned no content.)" : "（模型未返回内容）"),
      tokens_used: data.usage?.total_tokens || 0,
      model: data.model || model,
    };
  } catch (error: any) {
    return { content: error?.name === "AbortError" ? (language === "en" ? "[System] The model service timed out." : "[系统] 模型服务响应超时。") : (language === "en" ? "[System] Unable to connect to the model service." : "[系统] 无法连接模型服务。"), tokens_used: 0, model };
  } finally {
    clearTimeout(timeout);
  }
}

export async function callLLMStream(messages: AIMessage[], callbacks: StreamCallbacks, temperature = 0.7, maxTokens = 1024, language: AIOutputLanguage = "zh"): Promise<void> {
  const result = await callLLM(messages, temperature, maxTokens, language);
  if (result.model === "blocked" || result.model === "unconfigured" || result.model === "disabled") {
    callbacks.onError?.(new Error(result.content));
    return;
  }
  callbacks.onToken?.(result.content);
  callbacks.onComplete?.(result.content);
}

function buildEmployeePrompt(employee: any, language: AIOutputLanguage = "zh"): string {
  const template = AGENT_TEMPLATES[employee.agent_type];
  const role = employee.role || template?.role || "智能助手";
  const skills = employee.skills || template?.skills?.join("、") || "通用协作";
  return language === "en"
    ? `${languageInstruction(language)}\nYou are the organizational AI employee "${employee.name || role}". Role reference: ${role}. Professional scope: ${skills}. Provide grounded, practical advice; do not invent facts, make decisions for humans, or claim permissions you were not given.`
    : `${languageInstruction(language)}\n你是组织中的智能助手「${employee.name || role}」，岗位是「${role}」。\n专业范围：${skills}。\n请基于已知信息给出专业建议；不要杜撰数据、代替人类作决定或声称拥有未提供的权限。`;
}

export async function getSingleEmployeeResponse(employee: any, userMessage: string, chatHistory: { role: "user" | "assistant"; content: string }[], language: AIOutputLanguage = "zh"): Promise<string> {
  const result = await callLLM([
    { role: "system", content: buildEmployeePrompt(employee, language) },
    ...chatHistory.slice(-8),
    { role: "user", content: sanitizeLLMInput(userMessage) },
  ], 0.7, 2_500, language);
  return result.content;
}

export interface GroupConversationStep {
  employee_name: string;
  employee_role: string;
  agent_type: string;
  content: string;
}

export interface GroupConversationResult {
  steps: GroupConversationStep[];
  summary: string;
}

export async function runGroupConversation(userMessage: string, employees: any[], history: { role: "user" | "assistant"; content: string }[], onProgress?: (phase: string, detail: string, stepKey?: string) => void, language: AIOutputLanguage = "zh"): Promise<GroupConversationResult> {
  const steps: GroupConversationStep[] = [];
  for (const employee of employees.slice(0, 6)) {
    onProgress?.("group_reply", language === "en" ? `${employee.name} is preparing advice…` : `${employee.name} 正在准备建议…`, `group_${employee.id}`);
    steps.push({ employee_name: employee.name, employee_role: employee.role, agent_type: employee.agent_type, content: await getSingleEmployeeResponse(employee, userMessage, history, language) });
  }
  return { steps, summary: steps.length ? (language === "en" ? "These are independent suggestions. Final judgment and execution remain with organization members." : "以上为独立建议，最终判断与执行由组织成员负责。") : (language === "en" ? "No AI employees are available in this group chat." : "当前群聊中没有可用的智能助手。") };
}

export async function generateMeetingMinutes(userMessage: string, employees: any[], result: GroupConversationResult, language: AIOutputLanguage = "zh"): Promise<string> {
  const participants = employees.map(employee => `${employee.name}（${employee.role}）`).join("、");
  const discussion = result.steps.map(step => `【${step.employee_name}】${step.content}`).join("\n\n");
  const generated = await callLLM([
    { role: "system", content: language === "en" ? "You are a meeting-notes assistant. Write concise, structured English minutes covering the topic, discussion points, items to confirm, and follow-up actions. Do not present recommendations as approved decisions." : "你是会议记录助手。请根据输入生成简明会议纪要，包含议题、讨论要点、待确认事项与后续行动。不得把建议表述为已批准的正式决定。" },
    { role: "user", content: language === "en" ? `Topic: ${userMessage}\nParticipants: ${participants}\nDiscussion:\n${discussion}\nNote: ${result.summary}` : `议题：${userMessage}\n参会人：${participants}\n讨论内容：\n${discussion}\n提示：${result.summary}` },
  ], 0.3, 1_800, language);
  return language === "en" ? `# Meeting Minutes\n\n${generated.content}\n\n---\n\n*These minutes were drafted by AI and require human confirmation.*` : `# 会议纪要\n\n${generated.content}\n\n---\n\n*本纪要由 AI 草拟，需人工确认。*`;
}

export function isCasualChat(content: string): boolean {
  const text = content.trim();
  if (text.length < 6) return true;
  return /^(你好|您好|早上好|下午好|晚上好|hi|hello|在吗|谢谢|收到)/i.test(text);
}

export async function getCasualChatResponse(employees: any[], userMessage: string, history: { role: "user" | "assistant"; content: string }[], language: AIOutputLanguage = "zh"): Promise<{ employee: any; content: string }[]> {
  return Promise.all(employees.slice(0, 2).map(async employee => ({ employee, content: await getSingleEmployeeResponse(employee, userMessage, history, language) })));
}

export function buildAgentSystemPrompt(agentType: string, language: AIOutputLanguage = "zh"): string {
  const template = AGENT_TEMPLATES[agentType];
  const role = template?.role || "组织智能助手";
  const description = template?.description || "请提供可靠、可执行的建议。";
  return `${languageInstruction(language)}\n${language === "en" ? `You are an organizational intelligence assistant. Role reference: ${role}. Responsibilities: ${description}` : `你是${role}。${description}`}`;
}

export async function getAgentResponse(agentType: string, userMessage: string, chatHistory: { role: "user" | "assistant"; content: string }[], context?: string, language: AIOutputLanguage = "zh"): Promise<AIResponse> {
  return callLLM([
    { role: "system", content: buildAgentSystemPrompt(agentType, language) },
    ...(context ? [{ role: "system" as const, content: sanitizeLLMInput(context) }] : []),
    ...chatHistory.slice(-8),
    { role: "user", content: sanitizeLLMInput(userMessage) },
  ], 0.7, 2_500, language);
}

export async function decomposeTask(title: string, description: string, language: AIOutputLanguage = "zh"): Promise<any[]> {
  const result = await callLLM([{ role: "system", content: `${languageInstruction(language)} ${language === "en" ? "Break the task into 3 to 8 executable subtasks. Return only a JSON array; each item must contain title, description, and priority." : "将任务拆为 3 到 8 个可执行子任务。仅返回 JSON 数组，每项包含 title、description、priority。"}` }, { role: "user", content: language === "en" ? `Title: ${sanitizeLLMInput(title)}\nDescription: ${sanitizeLLMInput(description)}` : `标题：${sanitizeLLMInput(title)}\n说明：${sanitizeLLMInput(description)}` }], 0.4, 1_000, language);
  try { return JSON.parse(result.content.match(/\[[\s\S]*\]/)?.[0] || "[]"); } catch { return [{ title, description: result.content, priority: "medium" }]; }
}

export async function generateSummary(content: string, language: AIOutputLanguage = "zh"): Promise<string> {
  return (await callLLM([{ role: "system", content: language === "en" ? "Produce an accurate, concise, structured English summary." : "生成准确、简洁、结构化的中文摘要。" }, { role: "user", content: sanitizeLLMInput(content) }], 0.3, 1_000, language)).content;
}

export async function analyzeSentiment(text: string, language: AIOutputLanguage = "zh"): Promise<{ sentiment: string; confidence: number; analysis: string }> {
  const result = await callLLM([{ role: "system", content: language === "en" ? "Analyze sentiment. Return only JSON with sentiment, confidence, and analysis. Write analysis in English." : "分析文本情感，只返回 JSON：sentiment、confidence、analysis。" }, { role: "user", content: sanitizeLLMInput(text) }], 0.2, 400, language);
  try { return JSON.parse(result.content.match(/\{[\s\S]*\}/)?.[0] || "{}"); } catch { return { sentiment: "neutral", confidence: 0, analysis: result.content }; }
}

export function buildMessages(systemPrompt: string, userMessage: string, chatHistory: { role: "user" | "assistant"; content: string }[] = [], maxHistory = 8): AIMessage[] {
  return [{ role: "system", content: systemPrompt }, ...chatHistory.slice(-maxHistory), { role: "user", content: userMessage }];
}
