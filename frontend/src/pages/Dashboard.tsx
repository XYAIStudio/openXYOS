import { useEffect, useState } from "react";
import {
  Users, Building2, Package, MessageSquare, ListTodo, TrendingUp, Activity,
  FileText, Landmark, Target, DollarSign, Workflow, BarChart3,
  Gauge, BookOpen, Brain, Shield, Search, ArrowRight, Bot, Clock, ChevronRight,
} from "lucide-react";
import { authFetch } from "../api/authFetch";
import { useAuthStore } from "../stores/auth";
import { useNavigate } from "react-router-dom";

interface ModuleData {
  org: { departments: number; totalEmployees: number; aiEmployees: number; humanEmployees: number };
  skills: { skills: number; plugins: number; talent: number };
  chat: { chats: number; messages: number };
  tasks: { total: number; todo: number; in_progress: number; review: number; done: number; completionRate: number };
  contracts: { total: number; active: number; activeValue: number; paymentsOverdue: number };
  assets: { total: number; totalValue: number; inUse: number; idle: number; alerts: number };
  goals: { total: number; active: number; completed: number };
  budgets: { total: number; totalAmount: number };
  workflows: { total: number; active: number };
  performance: { reviews: number; avgScore: number };
  efficiency: { routines: number; active: number };
  knowledge: { notes: number };
  reflections: { total: number };
  governance: { rules: number };
  audit: { logs: number };
}

interface ActivitiesItem {
  action?: string; details?: string;
  user_name?: string; employee_name?: string;
  created_at?: string;
}

interface PerformanceItem {
  id: number; name: string; role: string; avatar_emoji: string;
  employee_type: string; completed: number; active: number; total: number;
}

function fmtCurrency(v: number): string {
  if (v >= 10000) return (v / 10000).toFixed(1) + "万";
  return v.toLocaleString();
}

function fmtValue(v: number): string {
  if (v >= 100000000) return (v / 100000000).toFixed(1) + "亿";
  if (v >= 10000) return (v / 10000).toFixed(1) + "万";
  return v.toLocaleString();
}

function ModuleCard({
  icon: Icon, title, path, color, bg, metrics, alert,
}: {
  icon: any; title: string; path: string; color: string; bg: string;
  metrics: { label: string; value: string | number; highlight?: boolean }[];
  alert?: number;
}) {
  const nav = useNavigate();
  return (
    <div
      onClick={() => nav(path)}
      className="group bg-bg-card border border-border rounded-lg px-4 py-3.5 cursor-pointer
        hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5
        transition-all duration-200 relative overflow-hidden"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-text flex-1">{title}</span>
        <ChevronRight size={14} className="text-text-muted/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
        {alert != null && alert > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold animate-[pulse_2s_infinite]">{alert}</span>
        )}
      </div>
      <div className="space-y-1">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-[11px]">
            <span className="text-text-muted">{m.label}</span>
            <span className={`font-semibold ${m.highlight ? "text-primary" : "text-text"}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [modules, setModules] = useState<ModuleData | null>(null);
  const [activities, setActivities] = useState<ActivitiesItem[]>([]);
  const [performance, setPerformance] = useState<PerformanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, actRes, perfRes] = await Promise.all([
          authFetch("/api/dashboard/modules").then(r => r.json()),
          authFetch("/api/dashboard/activities?limit=5").then(r => r.json()),
          authFetch("/api/dashboard/employee-performance").then(r => r.json()),
        ]);
        if (modRes.success) setModules(modRes.data);
        if (actRes.success) setActivities(actRes.data);
        if (perfRes.success) setPerformance(perfRes.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 6 ? "夜深了" : hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-text-muted">
      <Activity size={20} className="animate-spin mr-2" />加载中...
    </div>
  );

  const m = modules;
  if (!m) return <div className="p-5 text-text-muted text-sm">数据加载失败，请刷新页面</div>;

  const topPerformers = performance
    .filter(e => e.employee_type === "ai")
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  return (
    <div className="p-4 md:p-5 max-w-[1440px] mx-auto space-y-4 animate-[fadeIn_0.3s_ease]">
      {/* === Greeting Banner === */}
      <section className="bg-bg-card border border-border px-5 py-4 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-primary-bg text-primary text-[10px] font-semibold border border-primary-light">系统</span>
              <span className="flex items-center gap-1 text-text-muted text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulse_2s_infinite]" />运行中
              </span>
            </div>
            <h1 className="text-lg font-bold text-text">{greeting}，{user?.nickname || "用户"}</h1>
            <p className="text-xs text-text-muted mt-0.5">
              AI赋能下的人机共融企业管理效能增强管理系统 · {m.org.aiEmployees}位AI员工正在为您工作
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center"><div className="text-xl font-bold text-primary">{m.org.totalEmployees}</div><div className="text-[10px] text-text-muted">总员工</div></div>
            <div className="text-center"><div className="text-xl font-bold text-success">{m.tasks.done}</div><div className="text-[10px] text-text-muted">已完成任务</div></div>
            <div className="text-center"><div className="text-xl font-bold text-accent">{m.tasks.completionRate}%</div><div className="text-[10px] text-text-muted">完成率</div></div>
          </div>
        </div>
      </section>

      {/* === Module Cockpit Grid === */}
      <div className="space-y-3">
        {/* Row 1: 组织人事 */}
        <div>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">组织人事</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ModuleCard
              icon={Building2} title="组织架构" path="/org"
              color="#165DFF" bg="#E8F3FF"
              metrics={[
                { label: "部门数", value: m.org.departments },
                { label: "总员工", value: m.org.totalEmployees, highlight: true },
                { label: "AI员工", value: m.org.aiEmployees },
              ]}
            />
            <ModuleCard
              icon={Users} title="员工管理" path="/employees"
              color="#10B981" bg="#ECFDF5"
              metrics={[
                { label: "人类员工", value: m.org.humanEmployees },
                { label: "AI员工", value: m.org.aiEmployees },
                { label: "在职率", value: Math.round((m.org.totalEmployees / (m.org.totalEmployees + 1)) * 100) + "%" },
              ]}
            />
            <ModuleCard
              icon={BarChart3} title="绩效评估" path="/performance"
              color="#722ED1" bg="#F5E5FF"
              metrics={[
                { label: "评估次数", value: m.performance.reviews },
                { label: "均分", value: m.performance.avgScore + "分", highlight: true },
                { label: "上次周期", value: "2026-Q2" },
              ]}
            />
            <ModuleCard
              icon={Package} title="技能插件" path="/skills"
              color="#FF7D00" bg="#FFF7ED"
              metrics={[
                { label: "技能库", value: m.skills.skills },
                { label: "插件", value: m.skills.plugins },
                { label: "人才池", value: m.skills.talent, highlight: true },
              ]}
            />
          </div>
        </div>

        {/* Row 2: 协同办公 */}
        <div>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">协同办公</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ModuleCard
              icon={ListTodo} title="任务管理" path="/tasks"
              color="#165DFF" bg="#E8F3FF"
              metrics={[
                { label: "待办", value: m.tasks.todo },
                { label: "进行中", value: m.tasks.in_progress },
                { label: "已完成", value: m.tasks.done, highlight: true },
                { label: "完成率", value: m.tasks.completionRate + "%" },
              ]}
            />
            <ModuleCard
              icon={MessageSquare} title="沟通协作" path="/chat"
              color="#10B981" bg="#ECFDF5"
              metrics={[
                { label: "群聊", value: m.chat.chats },
                { label: "消息", value: fmtValue(m.chat.messages), highlight: true },
              ]}
            />
            <ModuleCard
              icon={Workflow} title="流程管理" path="/workflows"
              color="#722ED1" bg="#F5E5FF"
              metrics={[
                { label: "流程总数", value: m.workflows.total },
                { label: "运行中", value: m.workflows.active, highlight: true },
              ]}
            />
            <ModuleCard
              icon={Target} title="目标管理" path="/goals"
              color="#FF7D00" bg="#FFF7ED"
              metrics={[
                { label: "总目标", value: m.goals.total },
                { label: "进行中", value: m.goals.active },
                { label: "已完成", value: m.goals.completed, highlight: true },
              ]}
            />
          </div>
        </div>

        {/* Row 3: 资源管理 */}
        <div>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">资源管理</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ModuleCard
              icon={Landmark} title="资产管理" path="/assets"
              color="#165DFF" bg="#E8F3FF"
              metrics={[
                { label: "总资产", value: m.assets.total + "件" },
                { label: "在用", value: m.assets.inUse },
                { label: "闲置", value: m.assets.idle },
                { label: "资产总值", value: "¥" + fmtCurrency(m.assets.totalValue), highlight: true },
              ]}
              alert={m.assets.alerts > 0 ? m.assets.alerts : undefined}
            />
            <ModuleCard
              icon={FileText} title="合同管理" path="/contracts"
              color="#10B981" bg="#ECFDF5"
              metrics={[
                { label: "合同总数", value: m.contracts.total },
                { label: "生效中", value: m.contracts.active, highlight: true },
                { label: "合同价值", value: "¥" + fmtCurrency(m.contracts.activeValue) },
              ]}
              alert={m.contracts.paymentsOverdue > 0 ? m.contracts.paymentsOverdue : undefined}
            />
            <ModuleCard
              icon={DollarSign} title="预算管理" path="/budgets"
              color="#722ED1" bg="#F5E5FF"
              metrics={[
                { label: "预算项", value: m.budgets.total },
                { label: "总预算", value: "¥" + fmtCurrency(m.budgets.totalAmount), highlight: true },
              ]}
            />
            <ModuleCard
              icon={Gauge} title="效能仪表板" path="/efficiency"
              color="#FF7D00" bg="#FFF7ED"
              metrics={[
                { label: "例行事务", value: m.efficiency.routines, highlight: true },
                { label: "已启用", value: m.efficiency.active },
                { label: "启用率", value: m.efficiency.routines > 0 ? Math.round((m.efficiency.active / m.efficiency.routines) * 100) + "%" : "0%" },
              ]}
            />
          </div>
        </div>

        {/* Row 4: 智能分析 & 系统管理 */}
        <div>
          <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">智能分析与系统</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ModuleCard
              icon={BookOpen} title="知识库" path="/knowledge"
              color="#165DFF" bg="#E8F3FF"
              metrics={[
                { label: "知识笔记", value: m.knowledge.notes, highlight: true },
              ]}
            />
            <ModuleCard
              icon={Brain} title="反思引擎" path="/reflections"
              color="#10B981" bg="#ECFDF5"
              metrics={[
                { label: "反思记录", value: m.reflections.total, highlight: true },
              ]}
            />
            <ModuleCard
              icon={Shield} title="治理引擎" path="/governance"
              color="#722ED1" bg="#F5E5FF"
              metrics={[
                { label: "治理规则", value: m.governance.rules, highlight: true },
              ]}
            />
            <ModuleCard
              icon={Search} title="审计追溯" path="/audit"
              color="#FF7D00" bg="#FFF7ED"
              metrics={[
                { label: "审计日志", value: m.audit.logs, highlight: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* === Bottom Section: AI Performance + Recent Activities === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* AI员工效能 */}
        <div className="lg:col-span-7">
          <section className="bg-bg-card border border-border px-5 py-4 rounded-lg h-full">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={14} className="text-accent" />
              <h3 className="text-sm font-semibold text-text">AI员工效能排行</h3>
            </div>
            <div className="space-y-2">
              {topPerformers.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg">
                  <div className="w-9 h-9 rounded-full bg-primary-bg flex items-center justify-center text-sm font-bold text-primary">
                    {emp.avatar_emoji || emp.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text">{emp.name}</span>
                      <span className="text-[10px] text-text-muted bg-bg-card px-1.5 py-0.5 rounded">{emp.role}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-success">✓ {emp.completed}</span>
                      <span className="text-[10px] text-warning">⏳ {emp.active}</span>
                    </div>
                  </div>
                  <div className="w-16 bg-bg-card rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${emp.total > 0 ? (emp.completed / emp.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text w-8 text-right">
                    {emp.total > 0 ? Math.round((emp.completed / emp.total) * 100) : 0}%
                  </span>
                </div>
              ))}
              {topPerformers.length === 0 && (
                <p className="text-xs text-text-muted text-center py-4">暂无AI员工数据</p>
              )}
            </div>
          </section>
        </div>

        {/* 最近活动 */}
        <div className="lg:col-span-5">
          <section className="bg-bg-card border border-border px-5 py-4 rounded-lg h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-info" />
                <h3 className="text-sm font-semibold text-text">最近活动</h3>
              </div>
              <span className="text-[10px] text-text-muted">实时更新</span>
            </div>
            <div className="space-y-3">
              {activities.length === 0 && (
                <p className="text-xs text-text-muted text-center py-6">暂无活动记录</p>
              )}
              {activities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-2.5 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text leading-relaxed">{act.details || act.action || "系统操作"}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {act.user_name || act.employee_name || "系统"}
                      {act.created_at && ` · ${act.created_at.replace("T", " ").substring(0, 16)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
