import { useEffect, useState } from "react";
import { ArrowRight, Bot, BriefcaseBusiness, Building2, FileText, Network, Send, Sparkles, UserRoundPlus, UsersRound } from "lucide-react";
import { useLocale } from "../i18n";
import "./agent-journey-demo.css";

const STEPS = [
  { zh: ["画像与资料", "定位 · 能力 · 行业经验"], en: ["Profile & sources", "Positioning · skills · experience"], icon: FileText },
  { zh: ["生成智能体", "顾问型蓝图与技能组合"], en: ["Generate an agent", "Advisor blueprint and skill set"], icon: Sparkles },
  { zh: ["进入人才市场", "示例招募至备选员工"], en: ["Enter talent market", "Example recruit into candidate staff"], icon: UserRoundPlus },
  { zh: ["组织内协作", "岗位、部门与人机群聊"], en: ["Collaborate in org", "Role, department, and human–AI chat"], icon: UsersRound },
] as const;

export default function AgentJourneyDemo({ onExperience }: { onExperience: () => void }) {
  const [step, setStep] = useState(0);
  const { isEnglish } = useLocale();
  const tx = (zh: string, en: string) => isEnglish ? en : zh;
  const copy = (index: number) => isEnglish ? STEPS[index].en : STEPS[index].zh;
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep(current => (current + 1) % STEPS.length), 3600);
    return () => window.clearInterval(timer);
  }, []);
  const StepIcon = STEPS[step].icon;

  return <section id="agent-flow" className="ox-agent-flow" aria-labelledby="agent-flow-title">
    <div className="ox-agent-flow-head">
      <div>
        <em className="demo-kicker">{tx("动画 / 示例演示", "Animation / example demo")}</em>
        <small>{tx("示例演示 / 02", "EXAMPLE DEMO / 02")}</small>
        <h2 id="agent-flow-title">{tx("让智能体从设想成为组织成员", "Turn an agent concept into an organization member")}</h2>
        <p>{tx("下面是动画示例：定制画像、吸收资料、生成顾问、再演示招募与归入组织。招募、确认和入组都不会提交真实组织审批。", "This is an animated example: define a profile, ground it in sources, generate an advisor, then show recruit and placement. Recruit, confirm, and join actions do not submit a real organization approval.")}</p>
      </div>
      <button className="ox-secondary" onClick={onExperience}>{tx("查看示例演示", "View the example demo")} <ArrowRight size={16}/></button>
    </div>
    <div className="journey-stepper" aria-label={tx("智能体定制动画示例步骤", "Agent customization example-demo steps")}>
      {STEPS.map((item, index) => { const [label, detail] = copy(index); return <button key={item.zh[0]} className={index === step ? "active" : index < step ? "done" : ""} onClick={() => setStep(index)} aria-current={index === step ? "step" : undefined}><span>{`0${index + 1}`}</span><b>{label}</b><small>{detail}</small></button>; })}
    </div>
    <p className="demo-banner">{tx("动画 / 示例演示 · 招募与确认只在画面中播放", "Animation / example demo · recruit and confirm play on screen only")}</p>
    <div className={`journey-stage stage-${step}`}>
      <div className="journey-grid"/>
      <div className="journey-input panel">
        <div className="panel-top"><span><Bot size={14}/> Agent Studio</span><i>{tx("示例", "example")}</i></div>
        <div className="form-label">{tx("智能体名称", "Agent name")} <b>{tx("示例", "example")}</b></div><div className="form-value"><span>{tx("战略增长顾问", "Strategic Growth Advisor")}</span><em className="typing"/></div>
        <div className="form-label">{tx("行业定位", "Industry positioning")}</div><div className="form-value muted">{tx("企业智能化转型 · 战略与组织", "Enterprise transformation · strategy & organization")}</div>
        <div className="form-label">{tx("能力与资料", "Capabilities & sources")}</div><div className="skill-chips"><span>{tx("组织诊断", "Organization diagnosis")}</span><span>{tx("增长策略", "Growth strategy")}</span><span>{tx("人才规划", "Talent planning")}</span></div>
        <div className="source-file"><FileText size={14}/><span>{tx("示例资料 · 行业研究与实践经验.pdf", "Example file · Industry research & practice.pdf")}</span></div>
        <div className="source-file pending"><Network size={14}/><span>{tx("ima 知识库：已关联、待运行验证", "ima knowledge base: linked, pending runtime verification")}</span></div>
        <div className="generate-line"><i/><span>{tx("正在播放可治理智能体蓝图示例", "Playing a governable agent blueprint example")}</span></div>
      </div>
      <div className="journey-rail" aria-hidden="true"><span/><i/><i/><i/><i/></div>
      <div className="journey-output panel"><div className="panel-top"><span><StepIcon size={14}/> {copy(step)[0]}</span><i>{tx("示例", "example")}</i></div><div className="agent-orb"><div className="orb-core"><Bot size={28}/></div><span/><span/><span/></div>
        {step === 0 && <div className="output-copy"><b>{tx("顾问型智能体蓝图", "Advisor agent blueprint")}</b><p>{tx("角色、能力、资料与知识库在示例中被组织为可编辑配置。", "In this example, role, capabilities, sources, and knowledge are organized as editable configuration.")}</p><div className="trace"><i/><span>{tx("示例 · 资料提取", "Example · sources")}</span><i/><span>{tx("示例 · 治理约束", "Example · governance")}</span></div></div>}
        {step === 1 && <div className="output-copy"><b>{tx("战略增长顾问 · 示例", "Strategic Growth Advisor · example")}</b><p>{tx("示例展示岗位定位、专业能力与协作边界，不会写入组织。", "The example shows a role profile, specialist skills, and collaboration boundaries. Nothing is written to an organization.")}</p><div className="metric-row"><span><strong>03</strong> {tx("技能", "skills")}</span><span><strong>02</strong> {tx("知识源", "sources")}</span><span><strong>{tx("示例", "Example")}</strong> {tx("确认", "confirm")}</span></div></div>}
        {step === 2 && <div className="talent-card"><div><span className="avatar"><Bot size={19}/></span><b>{tx("战略增长顾问", "Strategic Growth Advisor")}</b><small>{tx("人才市场 · 示例，等待招募", "Talent market · example, awaiting recruit")}</small></div><span className="demo-action" role="note">{tx("示例 · 招募", "Example · Recruit")} <UserRoundPlus size={14}/></span><p><BriefcaseBusiness size={14}/> {tx("示例：显示已进入备选员工序列（未实际招募）", "Example: shown in candidate staff (not actually recruited)")}</p></div>}
        {step === 3 && <div className="org-card"><div className="org-root"><Building2 size={15}/><b>{tx("示例组织 · 雄元科技", "Example org · Xiongyuan Technology")}</b></div><i/><div className="org-branch"><span><UsersRound size={14}/> {tx("战略与组织中心", "Strategy & Organization Center")}</span><div><b className="human">{tx("人", "H")}</b><b className="ai">AI</b><small>{tx("战略增长顾问", "Strategic Growth Advisor")}</small></div></div><div className="chat-line"><Send size={13}/><span>{tx("示例：人机协作群画面（未实际创建）", "Example: human–AI group scene (not actually created)")}</span></div></div>}
      </div>
      <div className="journey-caption"><span className="caption-dot"/><b>{copy(step)[0]}</b><span>{copy(step)[1]}</span><em>{tx("动画 / 示例演示", "Animation / example demo")}</em></div>
    </div>
  </section>;
}
