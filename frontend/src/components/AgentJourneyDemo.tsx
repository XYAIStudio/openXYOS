import { useEffect, useState } from "react";
import { ArrowRight, Bot, BriefcaseBusiness, Building2, Check, FileText, Network, Send, Sparkles, UserRoundPlus, UsersRound } from "lucide-react";
import "./agent-journey-demo.css";

const STEPS = [
  { label: "画像与资料", detail: "定位 · 能力 · 行业经验", icon: FileText },
  { label: "生成智能体", detail: "顾问型蓝图与技能组合", icon: Sparkles },
  { label: "进入人才市场", detail: "招募至备选员工", icon: UserRoundPlus },
  { label: "组织内协作", detail: "岗位、部门与人机群聊", icon: UsersRound },
] as const;

export default function AgentJourneyDemo({ onExperience }: { onExperience: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep(current => (current + 1) % STEPS.length), 3600);
    return () => window.clearInterval(timer);
  }, []);
  const StepIcon = STEPS[step].icon;

  return <section id="agent-flow" className="ox-agent-flow" aria-labelledby="agent-flow-title">
    <div className="ox-agent-flow-head">
      <div><small>LIVE FLOW / 02</small><h2 id="agent-flow-title">让智能体从设想成为组织成员</h2><p>定制画像、吸收资料、生成顾问、进入人才市场，再由人类招募并归入组织。每一步都有明确的治理边界。</p></div>
      <button className="ox-secondary" onClick={onExperience}>体验智能体定制 <ArrowRight size={16}/></button>
    </div>
    <div className="journey-stepper" aria-label="智能体定制演示步骤">
      {STEPS.map(({ label, detail, icon: Icon }, index) => <button key={label} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => setStep(index)} aria-current={index === step ? "step" : undefined}><span>{index < step ? <Check size={13}/> : `0${index + 1}`}</span><b>{label}</b><small>{detail}</small></button>)}
    </div>
    <div className={`journey-stage stage-${step}`}>
      <div className="journey-grid"/>
      <div className="journey-input panel">
        <div className="panel-top"><span><Bot size={14}/> Agent Studio</span><i>draft</i></div>
        <div className="form-label">智能体名称 <b>必填</b></div><div className="form-value"><span>战略增长顾问</span><em className="typing"/></div>
        <div className="form-label">行业定位</div><div className="form-value muted">企业智能化转型 · 战略与组织</div>
        <div className="form-label">能力与资料</div><div className="skill-chips"><span>组织诊断</span><span>增长策略</span><span>人才规划</span></div>
        <div className="source-file"><FileText size={14}/><span>行业研究与实践经验.pdf</span><Check size={13}/></div>
        <div className="source-file"><Network size={14}/><span>ima 知识库已关联</span><Check size={13}/></div>
        <div className="generate-line"><i/><span>正在构建可治理智能体蓝图</span></div>
      </div>
      <div className="journey-rail" aria-hidden="true"><span/><i/><i/><i/><i/></div>
      <div className="journey-output panel">
        <div className="panel-top"><span><StepIcon size={14}/> {STEPS[step].label}</span><i>live</i></div>
        <div className="agent-orb"><div className="orb-core"><Bot size={28}/></div><span/><span/><span/></div>
        {step === 0 && <div className="output-copy"><b>顾问型智能体蓝图</b><p>角色、能力、资料与知识库已经组织为可编辑配置。</p><div className="trace"><i/><span>资料提取完成</span><i/><span>治理约束已加载</span></div></div>}
        {step === 1 && <div className="output-copy"><b>战略增长顾问 · XYAI</b><p>已生成可追溯的岗位定位、专业能力与协作边界。</p><div className="metric-row"><span><strong>03</strong> 技能</span><span><strong>02</strong> 知识源</span><span><strong>人工</strong> 确认</span></div></div>}
        {step === 2 && <div className="talent-card"><div><span className="avatar"><Bot size={19}/></span><b>战略增长顾问</b><small>人才市场 · 等待招募</small></div><button>招募 <UserRoundPlus size={14}/></button><p><BriefcaseBusiness size={14}/> 已进入备选员工序列</p></div>}
        {step === 3 && <div className="org-card"><div className="org-root"><Building2 size={15}/><b>雄元科技</b></div><i/><div className="org-branch"><span><UsersRound size={14}/> 战略与组织中心</span><div><b className="human">人</b><b className="ai">AI</b><small>战略增长顾问</small></div></div><div className="chat-line"><Send size={13}/><span>人机协作群已创建</span><Check size={13}/></div></div>}
      </div>
      <div className="journey-caption"><span className="caption-dot"/><b>{STEPS[step].label}</b><span>{STEPS[step].detail}</span><em>真实链路演示</em></div>
    </div>
  </section>;
}
