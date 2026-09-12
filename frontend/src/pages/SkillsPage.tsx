import { useState, useEffect, useMemo } from "react";
import { useSkillsStore, SKILL_CATEGORIES, CATEGORY_ICONS, Skill } from "../stores/skills";
import { authFetch } from "../api/authFetch";
import { Search, Plus, Trash2, ToggleLeft, ToggleRight, Grid3X3, List, FolderTree, X, Download, Loader2, Package, Check, ChevronRight, ChevronDown, Puzzle, ExternalLink } from "lucide-react";

function SkillCardGrid({ skill }: { skill: Skill }) {
  const { selectedIds, toggleSelect, toggleEnabled, setDetailSkill } = useSkillsStore();
  const selected = selectedIds.has(skill.id);
  const enabled = skill.enabled !== 0;
  const tags = (skill.tags || "").split(",").filter(Boolean).slice(0, 3);

  return (
    <div className={`bg-bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative ${selected ? "border-success shadow-[0_0_0_2px_rgba(34,197,94,0.15)]" : "border-border hover:border-border-hover"}`}
      onClick={() => setDetailSkill(skill)}>
      <div className="absolute top-3 left-3 z-10">
        <button onClick={(e) => { e.stopPropagation(); toggleSelect(skill.id); }}
          className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center text-[10px] transition-all ${selected ? "bg-success border-success text-white" : "border-border text-transparent hover:border-success"}`}>
          {selected && <Check size={10} />}
        </button>
      </div>
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-lg shrink-0">{skill.icon || "📦"}</span>
          <span className="text-sm font-semibold text-text truncate">{skill.name || "未命名"}</span>
        </div>
        {skill.rating > 0 && <span className="text-xs text-amber-500 shrink-0 ml-1">⭐{skill.rating.toFixed(1)}</span>}
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] text-text-muted">{skill.version || "1.0.0"}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">{skill.category}</span>
      </div>
      <p className="text-xs text-text-muted leading-relaxed mb-2.5 line-clamp-2 min-h-[32px]">{skill.description || "暂无描述"}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {tags.map((t, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-bg text-text-muted border border-border">{t.trim()}</span>)}
        </div>
      )}
      <div className="flex items-center gap-1.5 pt-2.5 border-t border-border">
        <button onClick={(e) => { e.stopPropagation(); toggleEnabled(skill.id); }}
          className={`p-1 rounded transition-colors ${enabled ? "text-success" : "text-text-muted"}`}>
          {enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); setDetailSkill(skill); }}
          className="text-[11px] px-2.5 py-1 rounded-md border border-border text-text-secondary hover:border-success hover:text-success transition-colors">
          详情
        </button>
        <span className="text-[10px] text-text-muted ml-auto">安装 {skill.install_count || 0}次</span>
      </div>
    </div>
  );
}

function SkillRowList({ skill }: { skill: Skill }) {
  const { selectedIds, toggleSelect, toggleEnabled, setDetailSkill } = useSkillsStore();
  const selected = selectedIds.has(skill.id);
  const enabled = skill.enabled !== 0;

  return (
    <div className={`bg-bg-card border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all hover:shadow-sm ${selected ? "border-success" : "border-border hover:border-border-hover"}`}
      onClick={() => setDetailSkill(skill)}>
      <button onClick={(e) => { e.stopPropagation(); toggleSelect(skill.id); }}
        className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center text-[10px] shrink-0 transition-all ${selected ? "bg-success border-success text-white" : "border-border text-transparent hover:border-success"}`}>
        {selected && <Check size={10} />}
      </button>
      <span className="text-xl shrink-0">{skill.icon || "📦"}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-text truncate">{skill.name}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success">{skill.category}</span>
          <span className="text-[11px] text-text-muted">{skill.version || "1.0.0"}</span>
          {skill.rating > 0 && <span className="text-[11px] text-amber-500">⭐{skill.rating.toFixed(1)}</span>}
          <span className="text-[11px] text-text-muted">安装 {skill.install_count || 0}</span>
        </div>
      </div>
      <p className="text-[11px] text-text-muted truncate max-w-[200px] hidden md:block">{(skill.description || "").substring(0, 60)}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={(e) => { e.stopPropagation(); toggleEnabled(skill.id); }}
          className={`p-1 rounded transition-colors ${enabled ? "text-success" : "text-text-muted"}`}>
          {enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
      </div>
    </div>
  );
}

function SkillGroup({ category, skills }: { category: string; skills: Skill[] }) {
  const { expanded, setExpanded } = useSkillsStore();
  const isOpen = expanded === category || expanded === null;
  const icon = CATEGORY_ICONS[category] || "📁";

  return (
    <div className="mb-5">
      <button className="flex items-center gap-2 py-2.5 cursor-pointer select-none w-full text-left"
        onClick={() => setExpanded(isOpen ? category : null)}>
        {isOpen ? <ChevronDown size={14} className="text-text-muted" /> : <ChevronRight size={14} className="text-text-muted" />}
        <span className="text-sm font-semibold text-text">{icon} {category}</span>
        <span className="text-[11px] text-text-muted bg-bg px-2 py-0.5 rounded-full">{skills.length}</span>
      </button>
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
          {skills.map(s => <SkillCardGrid key={s.id} skill={s} />)}
        </div>
      )}
    </div>
  );
}

function DetailPanel() {
  const { detailSkill, setDetailSkill, toggleEnabled, deleteSkill } = useSkillsStore();
  if (!detailSkill) return null;
  const s = detailSkill;
  const tags = (s.tags || "").split(",").filter(Boolean);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 transition-opacity" onClick={() => setDetailSkill(null)} />
      <div className="fixed top-0 right-0 w-[420px] max-w-[90vw] h-screen bg-bg-card z-50 transform transition-transform duration-300 overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-bg-card z-10 px-6 pt-5 pb-4 border-b border-border">
          <button onClick={() => setDetailSkill(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-text-muted hover:text-text transition-colors">
            <X size={16} />
          </button>
          <div className="text-lg font-bold text-text flex items-center gap-2 pr-10">
            <span className="text-xl">{s.icon || "📦"}</span> {s.name}
          </div>
          <div className="text-xs text-text-muted flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded bg-success/10 text-success">{s.category}</span>
            <span>v{s.version || "1.0.0"}</span>
            {s.author && <span>by {s.author}</span>}
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex gap-4 flex-wrap">
            <span className="text-xs text-text-muted">⭐ {s.rating > 0 ? s.rating.toFixed(1) : "暂无评分"}</span>
            <span className="text-xs text-text-muted">📥 安装 {s.install_count || 0} 次</span>
            <span className="text-xs text-text-muted">📁 {s.file_size ? `${(s.file_size / 1024).toFixed(1)}KB` : "未知大小"}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => toggleEnabled(s.id)}
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors ${s.enabled ? "bg-success/10 text-success border border-success/20" : "bg-bg text-text-muted border border-border"}`}>
              {s.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              {s.enabled ? "已启用" : "已禁用"}
            </button>
          </div>
          <div>
            <h4 className="text-[13px] font-semibold text-text mb-2">描述</h4>
            <p className="text-[13px] text-text-secondary leading-relaxed">{s.description || "暂无描述"}</p>
          </div>
          {tags.length > 0 && (
            <div>
              <h4 className="text-[13px] font-semibold text-text mb-2">标签</h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-bg text-text-secondary">{t.trim()}</span>)}
              </div>
            </div>
          )}
          {s.content && (
            <div>
              <h4 className="text-[13px] font-semibold text-text mb-2">技能内容</h4>
              <pre className="bg-bg border border-border rounded-lg p-3 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto font-mono text-text-secondary">
                {s.content}
              </pre>
            </div>
          )}
          <div className="pt-5 border-t border-border">
            <button onClick={async () => { if (!confirm("确认删除此技能？")) return; await deleteSkill(s.id); setDetailSkill(null); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-danger/20 text-danger hover:bg-danger/10 transition-colors">
              <Trash2 size={12} /> 删除技能
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const { importSkill } = useSkillsStore();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImport = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    const ok = await importSkill(content.trim());
    setSubmitting(false);
    if (ok) onClose();
    else alert("导入失败，请检查内容格式");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} />
      <div className="fixed z-[60] bg-bg-card border border-border rounded-2xl w-[540px] max-w-[92vw] max-h-[85vh] overflow-y-auto shadow-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center justify-between px-6 pt-5">
          <h3 className="text-base font-semibold text-text">📥 导入技能</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={16} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="在此粘贴 SKILL.md 文件内容..."
            rows={10}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary resize-y min-h-[120px] font-mono" />
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-[13px] rounded-lg border border-border text-text-secondary hover:bg-bg transition-colors">取消</button>
          <button onClick={handleImport} disabled={!content.trim() || submitting}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            {submitting && <Loader2 size={14} className="animate-spin" />} 📥 确认导入
          </button>
        </div>
      </div>
    </>
  );
}

function NewSkillModal({ onClose }: { onClose: () => void }) {
  const { createSkill } = useSkillsStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !category) return;
    setSubmitting(true);
    const ok = await createSkill({ name: name.trim(), category, description, tags, content });
    setSubmitting(false);
    if (ok) onClose();
    else alert("创建失败");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} />
      <div className="fixed z-[60] bg-bg-card border border-border rounded-2xl w-[540px] max-w-[92vw] max-h-[85vh] overflow-y-auto shadow-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center justify-between px-6 pt-5">
          <h3 className="text-base font-semibold text-text">➕ 新建技能</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg"><X size={16} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">技能名称 *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="如：数据分析引擎" className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">分类 *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary">
              <option value="">请选择分类</option>
              {SKILL_CATEGORIES.filter(c => c !== "全部").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">简短描述</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="一句话描述此技能的功能..." className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">标签（逗号分隔）</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="如：数据分析,可视化,报表" className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">完整技能内容 (Markdown)</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="粘贴完整的技能定义内容（SKILL.md 格式）..." rows={8} className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary resize-y min-h-[100px] font-mono" />
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 text-[13px] rounded-lg border border-border text-text-secondary hover:bg-bg transition-colors">取消</button>
          <button onClick={handleCreate} disabled={!name.trim() || !category || submitting}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            {submitting && <Loader2 size={14} className="animate-spin" />} ✅ 创建技能
          </button>
        </div>
      </div>
    </>
  );
}

export default function SkillsPage() {
  const {
    skills, stats, category, search, viewMode, activeTab, selectedIds,
    loading, marketplaceTotalPages,
    fetchSkills, fetchStats, fetchMarketplace,
    setCategory, setSearch, setViewMode, setActiveTab,
    batchToggle, batchDelete, clearSelection,
  } = useSkillsStore();

  const [showImport, setShowImport] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mainTab, setMainTab] = useState<"skills" | "plugins">("skills");

  useEffect(() => {
    if (activeTab === "installed") { fetchSkills(); fetchStats(); }
    else { fetchMarketplace(1); }
  }, [activeTab]);

  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      if (category !== "全部" && s.category !== category) return false;
      if (search) {
        const kw = search.toLowerCase();
        const txt = `${s.name || ""} ${s.description || ""} ${s.tags || ""} ${s.slug || ""}`.toLowerCase();
        if (!txt.includes(kw)) return false;
      }
      return true;
    });
  }, [skills, category, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    skills.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, [skills]);

  const groupedSkills = useMemo(() => {
    const groups: Record<string, Skill[]> = {};
    filteredSkills.forEach(s => { const cat = s.category || "未分类"; if (!groups[cat]) groups[cat] = []; groups[cat].push(s); });
    return groups;
  }, [filteredSkills]);

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text flex items-center gap-2"><Package size={20} /> 技能插件</h1>
          <div className="inline-flex bg-bg border border-border rounded-lg p-0.5 ml-2">
            <button onClick={() => setMainTab("skills")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${mainTab === "skills" ? "bg-primary text-white" : "text-text-muted hover:bg-bg"}`}>
              📦 技能市场
            </button>
            <button onClick={() => setMainTab("plugins")}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${mainTab === "plugins" ? "bg-primary text-white" : "text-text-muted hover:bg-bg"}`}>
              🧩 插件中心
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg border border-border rounded-lg px-3 py-1.5 focus-within:border-primary transition-colors">
            <Search size={14} className="text-text-muted mr-1.5" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索技能名称、描述、标签..."
              className="text-[13px] outline-none w-48 bg-transparent text-text placeholder:text-text-muted" />
          </div>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:bg-bg transition-colors">
            <Download size={14} /> 导入
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 transition-colors font-semibold">
            <Plus size={14} /> 新建
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {mainTab === "skills" && (<>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          {[
            { icon: "📦", val: stats.total || skills.length, label: "总计" },
            { icon: "✅", val: stats.enabled || 0, label: "已启用" },
            { icon: "⏸️", val: stats.disabled || 0, label: "已禁用" },
            { icon: "📂", val: Object.keys(stats.categories || {}).length || 0, label: "分类" },
            { icon: "🆕", val: stats.recentInstalled || 0, label: "员工已学" },
          ].map((s, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-xl font-bold text-text leading-tight">{s.val}</div>
                <div className="text-[11px] text-text-muted">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex bg-bg-card border border-border rounded-lg p-0.5">
            <button onClick={() => setActiveTab("installed")}
              className={`px-5 py-2 text-[13px] font-medium rounded-md transition-colors ${activeTab === "installed" ? "bg-primary text-white" : "text-text-muted hover:bg-bg"}`}>
              📋 已安装
            </button>
            <button onClick={() => setActiveTab("marketplace")}
              className={`px-5 py-2 text-[13px] font-medium rounded-md transition-colors ${activeTab === "marketplace" ? "bg-primary text-white" : "text-text-muted hover:bg-bg"}`}>
              🏪 技能市场
            </button>
          </div>
          {activeTab === "installed" && (
            <div className="inline-flex bg-bg-card border border-border rounded-lg overflow-hidden">
              {([
                { mode: "grid" as const, icon: <Grid3X3 size={14} />, title: "网格" },
                { mode: "list" as const, icon: <List size={14} />, title: "列表" },
                { mode: "group" as const, icon: <FolderTree size={14} />, title: "分组" },
              ]).map(v => (
                <button key={v.mode} onClick={() => setViewMode(v.mode)} title={v.title}
                  className={`p-2 transition-colors ${viewMode === v.mode ? "bg-primary text-white" : "text-text-muted hover:bg-bg"}`}>
                  {v.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "installed" && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
            {SKILL_CATEGORIES.map(c => {
              const cnt = c === "全部" ? skills.length : (categoryCounts[c] || 0);
              if (c !== "全部" && !cnt) return null;
              return (
                <button key={c} onClick={() => setCategory(c)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors shrink-0 ${category === c ? "bg-primary text-white border-primary" : "bg-bg-card text-text-muted border-border hover:border-primary hover:text-primary"}`}>
                  {CATEGORY_ICONS[c] || "📁"} {c}
                  <span className="ml-1 text-[10px] opacity-70">{cnt}</span>
                </button>
              );
            })}
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-success/10 rounded-xl mb-3.5 text-[13px] text-success">
            <span>已选择 <strong>{selectedIds.size}</strong> 个技能</span>
            <button onClick={() => batchToggle(true)} className="text-[12px] px-3 py-1 rounded-md border border-success bg-white hover:bg-success hover:text-white transition-colors">✅ 批量启用</button>
            <button onClick={() => batchToggle(false)} className="text-[12px] px-3 py-1 rounded-md border border-success bg-white hover:bg-success hover:text-white transition-colors">⏸️ 批量禁用</button>
            <button onClick={batchDelete} className="text-[12px] px-3 py-1 rounded-md border border-danger bg-white text-danger hover:bg-danger hover:text-white transition-colors">🗑️ 批量删除</button>
            <button onClick={clearSelection} className="ml-auto text-[12px] px-3 py-1 rounded-md border border-text-muted text-text-muted hover:bg-bg transition-colors">取消选择</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-sm text-text-muted">加载中...</span>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <div className="text-5xl mb-4 opacity-40">🧩</div>
            <p className="text-[15px] mb-4">没有找到匹配的技能</p>
            <button onClick={() => setActiveTab("marketplace")} className="px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-colors">
              去技能市场看看 →
            </button>
          </div>
        ) : activeTab === "marketplace" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSkills.map(s => <SkillCardGrid key={s.id} skill={s} />)}
            </div>
            {marketplaceTotalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-5 py-4">
                {Array.from({ length: Math.min(marketplaceTotalPages, 10) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchMarketplace(p)}
                    className={`px-3 py-1.5 rounded-md text-[12px] border transition-colors ${p === useSkillsStore.getState().marketplacePage ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary hover:text-primary"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSkills.map(s => <SkillCardGrid key={s.id} skill={s} />)}
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-1.5">
            {filteredSkills.map(s => <SkillRowList key={s.id} skill={s} />)}
          </div>
        ) : (
          Object.entries(groupedSkills).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <SkillGroup key={cat} category={cat} skills={items} />
          ))
        )}
        </>)}

        {mainTab === "plugins" && <PluginCenter />}
      </div>

      <DetailPanel />
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showNew && <NewSkillModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

// ===== 插件中心 =====
function PluginCenter() {
  const [plugins, setPlugins] = useState<any[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("全部");
  const [sort, setSort] = useState("popular");
  const [stats, setStats] = useState<any>({ total: 0, byCategory: [] });
  const [installing, setInstalling] = useState<Set<number>>(new Set());
  const [payPlugin, setPayPlugin] = useState<any>(null); // 付费弹窗

  useEffect(() => { load(); loadInstalled(); }, [cat, sort]);

  async function load() {
    setLoading(true);
    try {
      let url = `/api/plugins?sort=${sort}`;
      if (cat !== "全部") url += `&category=${encodeURIComponent(cat)}`;
      const r = await authFetch(url);
      if (r.ok) { const j = await r.json(); if (j.success) setPlugins(j.data || []); }
      const sr = await authFetch("/api/plugins/stats");
      if (sr.ok) { const sj = await sr.json(); if (sj.success) setStats(sj.data); }
    } catch(e){
      console.error('[PluginCenter] 加载插件失败:', e);
    }
    setLoading(false);
  }

  async function loadInstalled() {
    try {
      const r = await authFetch("/api/plugins/installed");
      if (r.ok) {
        const j = await r.json();
        if (j.success) setInstalledIds(new Set(j.data || []));
      }
    } catch(e) {}
  }

  async function handleInstall(p: any) {
    if (installing.has(p.id)) return;

    // 付费插件 → 弹出付费窗口
    if (p.price !== "免费" && p.price !== "免费额度") {
      setPayPlugin(p);
      return;
    }

    // 免费插件 → 直接安装
    await doInstall(p.id);
  }

  async function doInstall(pluginId: number) {
    setInstalling(prev => new Set(prev).add(pluginId));
    try {
      const r = await authFetch(`/api/plugins/${pluginId}/install`, { method: "POST" });
      if (r.ok) {
        const j = await r.json();
        if (j.success) {
          setInstalledIds(prev => new Set(prev).add(pluginId));
          // 刷新安装数
          load();
        }
      }
    } catch(e) {}
    setInstalling(prev => {
      const next = new Set(prev);
      next.delete(pluginId);
      return next;
    });
  }

  async function handlePayConfirm() {
    if (!payPlugin) return;
    // 模拟付费成功
    await doInstall(payPlugin.id);
    setPayPlugin(null);
  }

  const filtered = search ? plugins.filter((p: any) =>
    p.name.includes(search) || (p.description||"").includes(search) || (p.tags||"").includes(search)
  ) : plugins;

  const categories = ["全部", ...(stats.byCategory || []).map((c: any) => c.category)];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[{ icon: "🧩", val: stats.total, label: "插件总数" },
          { icon: "📂", val: (stats.byCategory || []).length, label: "分类数" },
          { icon: "🆓", val: "多数免费", label: "即装即用" },
          { icon: "🔌", val: "API集成", label: "开放生态" },
        ].map((s, i) => (
          <div key={i} className="bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{s.icon}</span><div><div className="text-xl font-bold text-text">{s.val}</div><div className="text-[11px] text-text-muted">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="搜索插件..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-card border border-border rounded-lg text-xs focus:outline-none focus:border-primary" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-2 bg-bg-card border border-border rounded-lg text-xs">
          <option value="popular">最受欢迎</option><option value="rating">评分最高</option><option value="newest">最新上架</option>
        </select>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${cat === c ? "bg-primary text-white border-primary" : "bg-bg-card text-text-muted border-border hover:border-primary hover:text-primary"}`}>{c}</button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p: any) => {
            const isInstalled = installedIds.has(p.id);
            const isInstalling = installing.has(p.id);
            const isFree = p.price === "免费" || p.price === "免费额度";

            return (
            <div key={p.id} className="bg-bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-3xl">{p.icon || "🧩"}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-text truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-bg rounded text-text-muted">{p.category}</span>
                    <span className="text-[10px] text-text-muted">{p.version}</span>
                  </div>
                </div>
                {isFree ? (
                  <span className="text-[10px] px-2 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">免费</span>
                ) : (
                  <span className="text-[10px] px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full font-medium">{p.price}</span>
                )}
              </div>
              <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">{p.description}</p>
              {(p.tags || "").split(",").filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(p.tags || "").split(",").filter(Boolean).slice(0, 4).map((t: string, i: number) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-bg rounded text-text-muted">{t.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                  <span>⭐{p.rating?.toFixed(1) || "0"}</span><span className="mx-1">·</span>
                  <span>安装 {p.install_count || 0}次</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted">{p.author}</span>
                  {isInstalled ? (
                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium border border-green-200">✓ 已安装</span>
                  ) : isInstalling ? (
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">安装中...</span>
                  ) : (
                    <button onClick={() => handleInstall(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isFree ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"}`}>
                      {isFree ? "安装" : `${p.price} 购买`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* 付费插件弹窗 */}
      {payPlugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPayPlugin(null)}>
          <div className="bg-bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <span className="text-5xl">{payPlugin.icon || "🧩"}</span>
              <h2 className="text-lg font-semibold mt-2">{payPlugin.name}</h2>
              <p className="text-sm text-text-muted mt-1">{payPlugin.description}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{payPlugin.price}</p>
              <p className="text-xs text-amber-600 mt-1">按月订阅 · 随时可取消</p>
            </div>
            <div className="text-xs text-text-muted mb-4 space-y-1">
              <p>✓ 全功能使用权限</p>
              <p>✓ 持续版本更新</p>
              <p>✓ 技术支持服务</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPayPlugin(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-bg">取消</button>
              <button onClick={handlePayConfirm} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">确认支付</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
