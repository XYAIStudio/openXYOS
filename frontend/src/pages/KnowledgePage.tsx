import { useState, useEffect, useRef } from "react";
import { BookOpen, Plus, FileText, Search, Trash2, Edit2, Upload, FolderOpen, X, CheckCircle, Clock, AlertTriangle, RefreshCw, FolderPlus, Folder, MoveRight } from "lucide-react";
import { authFetch } from "../api/authFetch";

interface Note { id: number; title: string; content: string; tags: string; created_at: string; }
interface KFile { id: number; name: string; original_name: string; file_size: number; file_type: string; folder: string; status: string; extracted_summary: string; keywords: string; created_at: string; }

export default function KnowledgePage() {
  const [tab, setTab] = useState<"notes" | "files">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<KFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fileStats, setFileStats] = useState<any>({});
  const [curFolder, setCurFolder] = useState("/");
  const [folders, setFolders] = useState<string[]>(["/"]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moveTarget, setMoveTarget] = useState<{id:number;name:string}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nContent, setNContent] = useState("");
  const [nTags, setNTags] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadFiles(); }, [curFolder]);

  async function loadAll() {
    setLoading(true);
    try {
      const [nr, fsr] = await Promise.all([
        authFetch("/api/knowledge").then(r => r.json()),
        authFetch("/api/knowledge/files/stats").then(r => r.json()),
      ]);
      if (nr.success) setNotes(nr.data || []);
      if (fsr.success) setFileStats(fsr.data);
      await loadFolders();
      await loadFiles();
    } catch(e){}
    setLoading(false);
  }

  async function loadFolders() {
    try {
      const r = await authFetch("/api/knowledge/files/folders");
      if (r.ok) { const j = await r.json(); if (j.success && j.data.length > 0) setFolders(j.data); }
    } catch(e){}
  }

  async function loadFiles() {
    try {
      let url = `/api/knowledge/files/list?folder=${encodeURIComponent(curFolder)}`;
      const r = await authFetch(url);
      if (r.ok) { const j = await r.json(); if (j.success) setFiles(j.data || []); }
    } catch(e){}
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const fl = e.target.files?.[0]; if (!fl) return;
    const fd = new FormData(); fd.append("file", fl); fd.append("folder", curFolder);
    await authFetch("/api/knowledge/files/upload", { method: "POST", body: fd });
    e.target.value = ""; loadFiles(); loadFolders();
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    await authFetch("/api/knowledge/files/folder", {
      method: "POST",
      body: JSON.stringify({ name: newFolderName.trim(), parent: curFolder })
    });
    setNewFolderName(""); setShowNewFolder(false);
    loadFolders();
  }

  async function moveFile(fileId: number, targetFolder: string) {
    await authFetch(`/api/knowledge/files/${fileId}/move`, {
      method: "PUT", body: JSON.stringify({ folder: targetFolder })
    });
    setMoveTarget(null); loadFiles(); loadFolders();
  }

  async function deleteFile(id: number) {
    if (!confirm("删除该文件？")) return;
    await authFetch(`/api/knowledge/files/${id}`, { method: "DELETE" });
    loadFiles(); loadFolders();
  }

  async function reparseFile(id: number) {
    await authFetch(`/api/knowledge/files/${id}/reparse`, { method: "POST" });
    setTimeout(() => loadFiles(), 1500);
  }

  async function saveNote() {
    if (!nTitle.trim()) return;
    const body = JSON.stringify({ title: nTitle, content: nContent, tags: nTags });
    if (editId) { await authFetch(`/api/knowledge/${editId}`, { method: "PUT", body }); }
    else { await authFetch("/api/knowledge", { method: "POST", body }); }
    setNTitle(""); setNContent(""); setNTags(""); setEditId(null); setShowForm(false); loadAll();
  }
  async function deleteNote(id: number) {
    if (!confirm("删除此笔记？")) return;
    await authFetch(`/api/knowledge/${id}`, { method: "DELETE" }); loadAll();
  }
  function startEdit(n: Note) { setEditId(n.id); setNTitle(n.title); setNContent(n.content); setNTags(n.tags||""); setShowForm(true); }

  const fFiles = search ? files.filter(f => f.original_name.toLowerCase().includes(search.toLowerCase())||(f.keywords||"").includes(search)||(f.extracted_summary||"").includes(search)) : files;
  const fNotes = search ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase())||n.content.toLowerCase().includes(search.toLowerCase())) : notes;

  const typeIcon = (t: string) => {
    if (t.includes("pdf")) return "📄"; if (t.includes("doc")) return "📝"; if (t.includes("xls")||t.includes("csv")) return "📊";
    if (t.includes("ppt")) return "📽️"; if (t.match(/png|jpg|jpeg|gif|svg|webp/)) return "🖼️";
    if (t.includes("txt")||t.includes("md")) return "📃"; if (t.match(/json|xml|html/)) return "💻"; if (t.match(/zip|rar/)) return "📦"; return "📁";
  };
  const statusBadge = (s: string) => {
    if (s==="parsed") return <span className="flex items-center gap-1 text-[10px] text-green-500"><CheckCircle size={10}/>已解析</span>;
    if (s==="parsing") return <span className="flex items-center gap-1 text-[10px] text-blue-500"><RefreshCw size={10} className="animate-spin"/>解析中</span>;
    if (s==="pending") return <span className="flex items-center gap-1 text-[10px] text-amber-500"><Clock size={10}/>待解析</span>;
    return <span className="flex items-center gap-1 text-[10px] text-red-500"><AlertTriangle size={10}/>失败</span>;
  };
  const fmtSize = (kb: number) => kb<1024?`${kb} KB`:`${(kb/1024).toFixed(1)} MB`;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text flex items-center gap-2"><BookOpen size={20} className="text-primary"/>知识库</h1>
          <div className="flex bg-bg border border-border rounded-lg p-0.5">
            <button onClick={()=>setTab("files")} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${tab==="files"?"bg-primary text-white":"text-text-muted hover:bg-bg-hover"}`}>📂 文件 ({fileStats.total||0})</button>
            <button onClick={()=>setTab("notes")} className={`px-3 py-1 text-xs rounded font-medium transition-colors ${tab==="notes"?"bg-primary text-white":"text-text-muted hover:bg-bg-hover"}`}>📝 笔记 ({notes.length})</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Search size={14} className="text-text-muted"/>
          <input placeholder="搜索..." value={search} onChange={e=>setSearch(e.target.value)}
            className="bg-bg border border-border rounded-lg text-xs px-3 py-1.5 w-44 focus:outline-none focus:border-primary"/>
          {tab==="files"&&<>
            <input ref={fileRef} type="file" className="hidden" onChange={uploadFile} accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.md,.csv,.json,.xml,.html,.png,.jpg,.jpeg,.gif,.svg,.webp,.zip,.rar"/>
            <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"><Upload size={13}/>上传文件</button>
          </>}
          {tab==="notes"&&
            <button onClick={()=>{setShowForm(true);setEditId(null);setNTitle("");setNContent("");setNTags("")}} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90"><Plus size={13}/>新建笔记</button>
          }
        </div>
      </div>

      {tab==="files"&&fileStats.total>0&&(
        <div className="flex items-center gap-4 px-4 py-1.5 bg-bg-card border-b border-border text-xs text-text-muted">
          <span>📂 {fileStats.total} 文件</span><span>✅ {fileStats.parsed||0} 已解析</span><span>⏳ {fileStats.pending||0} 待处理</span>
          <span className="flex items-center gap-1.5">
            💾 {fmtSize(fileStats.totalSizeKB||0)}
            <span className="text-text-muted">/</span>
            {fmtSize(fileStats.limitKB||1048576)}
          </span>
          <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden max-w-[120px]">
            <div className="h-full bg-primary rounded-full transition-all" style={{width:Math.min(100,((fileStats.totalSizeKB||0)/(fileStats.limitKB||1))*100)+"%"}}/>
          </div>
        </div>
      )}

      {tab==="files" ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Folder Sidebar */}
          <div className="w-48 border-r border-border bg-bg-card p-3 flex flex-col gap-1 overflow-auto shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-text-muted">文件夹</span>
              <button onClick={()=>setShowNewFolder(true)} className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg" title="新建文件夹"><FolderPlus size={14}/></button>
            </div>
            {showNewFolder&&(
              <div className="flex gap-1 mb-2">
                <input autoFocus value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createFolder()}
                  placeholder="文件夹名" className="flex-1 px-2 py-1 bg-bg border border-border rounded text-xs focus:outline-none focus:border-primary"/>
                <button onClick={createFolder} className="px-2 py-1 bg-primary text-white rounded text-[10px]">确定</button>
              </div>
            )}
            {folders.map(f => (
              <button key={f} onClick={()=>setCurFolder(f)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs text-left transition-colors ${curFolder===f?"bg-primary/10 text-primary font-medium":"text-text-muted hover:bg-bg hover:text-text"}`}>
                <Folder size={13}/> {f==="/"?"根目录":f.replace("/","")}
                {f===curFolder&&<span className="ml-auto text-[10px]">{files.length}</span>}
              </button>
            ))}
          </div>

          {/* File Grid */}
          <div className="flex-1 overflow-auto p-4">
            {loading?<div className="text-center py-16 text-text-muted text-sm">加载中...</div>
            :fFiles.length===0?(
              <div className="text-center py-16"><FolderOpen size={48} className="text-text-muted mx-auto mb-3 opacity-50"/><p className="text-text-muted text-sm mb-2">{curFolder==="/"?"暂无文件":"此文件夹为空"}</p><p className="text-text-muted text-xs">上传文档后AI自动解析为语料库</p><button onClick={()=>fileRef.current?.click()} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"><Upload size={13}/>上传文件</button></div>
            ):(
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fFiles.map(f=>(
                  <div key={f.id} className="bg-bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{typeIcon(f.file_type)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>setMoveTarget({id:f.id,name:f.original_name})} title="移动到..." className="p-1 rounded text-text-muted hover:text-blue-500 hover:bg-bg"><MoveRight size={12}/></button>
                        <button onClick={()=>reparseFile(f.id)} title="重新解析" className="p-1 rounded text-text-muted hover:text-primary hover:bg-bg"><RefreshCw size={12}/></button>
                        <button onClick={()=>deleteFile(f.id)} title="删除" className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-bg"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-text truncate mb-1" title={f.original_name}>{f.original_name}</h3>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] text-text-muted">{fmtSize(f.file_size)}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-bg rounded text-text-muted">{f.file_type}</span>
                      {statusBadge(f.status)}
                    </div>
                    {f.extracted_summary&&<p className="text-[11px] text-text-muted leading-relaxed line-clamp-2 mb-2">{f.extracted_summary}</p>}
                    {f.keywords&&<div className="flex flex-wrap gap-1">{f.keywords.split(",").filter(Boolean).slice(0,5).map((k,i)=><span key={i} className="text-[10px] px-1.5 py-0.5 bg-bg rounded text-text-muted">{k.trim()}</span>)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Notes Tab */
        <div className="flex-1 overflow-auto p-4">
          {loading?<div className="text-center py-16 text-text-muted text-sm">加载中...</div>
          :fNotes.length===0?(
            <div className="text-center py-16"><FileText size={48} className="text-text-muted mx-auto mb-3 opacity-50"/><p className="text-text-muted text-sm">暂无笔记</p><button onClick={()=>{setShowForm(true)}} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium">新建笔记</button></div>
          ):(
            <div className="space-y-2">
              {fNotes.map(n=>(
                <div key={n.id} className="bg-bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text">{n.title}</h3>
                      <p className="text-xs text-text-muted mt-1 line-clamp-3">{n.content}</p>
                      {n.tags&&<div className="flex flex-wrap gap-1 mt-2">{n.tags.split(",").filter(Boolean).map((t,i)=><span key={i} className="text-[10px] px-1.5 py-0.5 bg-bg rounded text-text-muted">{t.trim()}</span>)}</div>}
                      <div className="text-[10px] text-text-muted mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={()=>startEdit(n)} className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-bg"><Edit2 size={13}/></button>
                      <button onClick={()=>deleteNote(n.id)} className="p-1.5 rounded text-text-muted hover:text-red-500 hover:bg-bg"><Trash2 size={13}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Form Modal */}
      {showForm&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setShowForm(false)}>
          <div className="bg-bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg" onClick={e=>e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border flex items-center justify-between"><h3 className="text-sm font-bold">{editId?"编辑笔记":"新建笔记"}</h3><button onClick={()=>setShowForm(false)}><X size={18}/></button></div>
            <div className="p-5 space-y-3">
              <div><label className="block text-xs font-medium mb-1">标题</label><input value={nTitle} onChange={e=>setNTitle(e.target.value)} placeholder="标题" className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary"/></div>
              <div><label className="block text-xs font-medium mb-1">内容</label><textarea value={nContent} onChange={e=>setNContent(e.target.value)} placeholder="内容" rows={6} className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary resize-none"/></div>
              <div><label className="block text-xs font-medium mb-1">标签</label><input value={nTags} onChange={e=>setNTags(e.target.value)} placeholder="如：规范,协作,AI" className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary"/></div>
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end gap-2"><button onClick={()=>setShowForm(false)} className="px-4 py-2 text-xs border rounded-lg">取消</button><button onClick={saveNote} className="px-4 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90">保存</button></div>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {moveTarget&&(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setMoveTarget(null)}>
          <div className="bg-bg-card border border-border rounded-2xl shadow-xl w-80" onClick={e=>e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-border"><h3 className="text-sm font-bold">移动 "{moveTarget.name}" 到...</h3></div>
            <div className="p-4 space-y-1 max-h-64 overflow-auto">
              {folders.map(f=>(
                <button key={f} onClick={()=>moveFile(moveTarget.id,f)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-colors ${f===curFolder?"bg-primary/10 text-primary":"hover:bg-bg text-text"}`}>
                  <Folder size={13}/> {f==="/"?"根目录":f.replace("/","")}
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end"><button onClick={()=>setMoveTarget(null)} className="px-4 py-2 text-xs border rounded-lg">取消</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
