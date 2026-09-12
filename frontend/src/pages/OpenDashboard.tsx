import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Bell, BookOpen, Bot, Brain, Building2, ChevronRight, ListTodo,
  MessageSquare, Package, Settings, Shield, Users,
} from "lucide-react";
import { authFetch } from "../api/authFetch";
import { useAuthStore } from "../stores/auth";
import { OpenModuleKey, useOpenModules } from "../open-modules";

interface Overview {
  employees: { total: number; ai: number; human: number };
  tasks: { total: number; todo: number; in_progress: number; review: number; done: number };
  chats: number;
  messages: number;
  knowledge: number;
  metrics: { completionRate: number; activeRate: number; aiUtilization: number };
}

const entries: Array<{ key: OpenModuleKey; path: string; icon: typeof Users; text: string }> = [
  { key: "announcements", path: "/announcements", icon: Bell, text: "发布、阅读与追踪组织通知" },
  { key: "organization", path: "/org", icon: Building2, text: "集团、公司、部门和岗位关系" },
  { key: "employees", path: "/employees", icon: Users, text: "人类员工、AI 员工与人才市场" },
  { key: "skills", path: "/skills", icon: Package, text: "技能目录、插件与能力装配" },
  { key: "chat", path: "/chat", icon: MessageSquare, text: "人机单聊、群聊与实时协作" },
  { key: "agents", path: "/agents", icon: Bot, text: "创建顾问智能体并进入人才市场" },
  { key: "tasks", path: "/tasks", icon: ListTodo, text: "任务分派、状态流转与验收" },
  { key: "knowledge", path: "/knowledge", icon: BookOpen, text: "资料上传、解析与知识沉淀" },
  { key: "reflections", path: "/reflections", icon: Brain, text: "复盘协作过程并沉淀经验" },
  { key: "governance", path: "/governance", icon: Shield, text: "人工复核、策略与审计边界" },
  { key: "settings", path: "/settings", icon: Settings, text: "租户、模型、模块与用户设置" },
];

export default function OpenDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const enabled = useOpenModules(state => state.modules);
  const labels = useOpenModules(state => state.labels);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/api/dashboard/overview")
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "工作台数据加载失败");
        setOverview(result.data);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : "工作台数据加载失败"));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? "夜深了" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const visibleEntries = entries.filter(item => enabled[item.key] && (!item.key.match(/governance|settings/) || user?.role === "admin" || user?.role === "super_admin"));

  return <div className="max-w-[1320px] mx-auto p-4 md:p-6 space-y-5 animate-[fadeIn_.3s_ease]">
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-bg-card p-6 md:p-8">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-primary mb-3"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> openXYOS 正在运行</div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">{greeting}，{user?.nickname || "用户"}</h1>
          <p className="text-sm text-text-muted mt-2">人机协作 · 人工确认 · 审计留痕</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
          {['组织','智能体','协作','审计'].map((node, index) => <span key={index} className="flex items-center gap-2"><b className="min-w-8 h-8 px-2 rounded-full border border-primary/30 grid place-items-center text-primary not-italic">{node}</b>{index < 3 && <i className="w-6 h-px bg-primary/35" />}</span>)}
        </div>
      </div>
    </section>

    {error ? <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div> : !overview ?
      <div className="h-32 grid place-items-center text-text-muted"><Activity className="animate-spin mr-2" size={18} />加载组织数据…</div> :
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["组织成员", overview.employees.total, `${overview.employees.human} 人类 · ${overview.employees.ai} AI`],
          ["任务进展", overview.tasks.total, `${overview.tasks.in_progress} 进行中 · ${overview.tasks.done} 完成`],
          ["协作会话", overview.chats, `${overview.messages} 条消息`],
          ["知识沉淀", overview.knowledge, `任务完成率 ${overview.metrics.completionRate}%`],
        ].map(([title, value, note]) => <article key={String(title)} className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-xs text-text-muted">{title}</p><strong className="block text-2xl text-text mt-2">{value}</strong><small className="text-xs text-text-muted">{note}</small>
        </article>)}
      </section>}

    <section>
      <div className="flex items-end justify-between mb-3"><div><p className="text-xs text-primary font-mono">CORE MODULES</p><h2 className="text-lg font-bold text-text mt-1">当前租户能力</h2></div><span className="text-xs text-text-muted">{visibleEntries.length + 1} 个模块已启用</span></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleEntries.map(({ key, path, icon: Icon, text }) => <button key={key} onClick={() => navigate(path)} className="group text-left rounded-xl border border-border bg-bg-card p-4 hover:border-primary/35 hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon size={19} /></span><div className="flex-1"><h3 className="text-sm font-semibold text-text">{labels[key]}</h3><p className="text-xs text-text-muted mt-1">{text}</p></div><ChevronRight size={16} className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" /></div>
        </button>)}
      </div>
    </section>
  </div>;
}
