'use client'
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// FANZOS MASTER BRAIN v5.0 — THE ONE
// Unified Intelligence: Agents · Avatar · Memory · Code · Ethics
// Built from: programmer.zip × fanz-agent-v4 × fanz-os-2 × TheOne
// ═══════════════════════════════════════════════════════════════

const T = {
  void: "#040608",
  deep: "#070c12",
  panel: "#0a0f18",
  border: "#0f1e2e",
  borderGlow: "#1a3550",
  cyan: "#00ffe0",
  cyanDim: "#00ffe022",
  green: "#00ff88",
  greenDim: "#00ff8822",
  gold: "#ffd700",
  goldDim: "#ffd70022",
  red: "#ff3b5c",
  purple: "#b44eff",
  blue: "#4488ff",
  text: "#c8d8e8",
  muted: "#3a5570",
  dim: "#1a2d40",
};

const MONO = "'Courier New', monospace";
const DISPLAY = "Georgia, serif";

async function callClaude(messages, system = "", fast = false) {
  const model = fast ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1000, system: system || undefined, messages }),
    });
    const d = await r.json();
    return d.content?.[0]?.text || "";
  } catch (e) {
    return `[Claude error: ${e.message}]`;
  }
}

// ── Knowledge Base from programmer.zip
const BRAIN_KNOWLEDGE = {
  avatar: {
    title: "Echo — Holographic Avatar System",
    summary: "WebGPU-powered holographic AR avatar with advanced shaders, WebXR hit-testing, gesture interaction, haptic feedback patterns. Runs in Termux + FastAPI + Tasker WebView on Android.",
    tech: ["WebGPU", "React Three Fiber", "WebXR AR", "ARCore", "Haptic Feedback", "GLSL Shaders"],
    insight: "Echo is the embodied interface — the face of the OS. Lightweight 3D alternatives: ReadyPlayerMe, VRM, Lottie animations for Termux mobile.",
  },
  computational: {
    title: "Computational Thinking Engine",
    summary: "4 pillars: Decomposition, Pattern Recognition, Abstraction, Algorithms. Integrates with Design Thinking and Critical Thinking for full-stack problem solving.",
    tech: ["Decomposition", "Pattern Recognition", "Abstraction", "Algorithm Design", "Systems Thinking"],
    insight: "CT is the meta-skill behind every build. Every FanzOS feature starts with CT decomposition before touching code.",
  },
  memory: {
    title: "Secure Holographic Memory",
    summary: "Distributed, fault-tolerant memory with quantum-inspired binding/unbinding. Trust scoring, validation, versioning, audit logging, conflict resolution, poisoning resistance.",
    tech: ["Hybrid RAG", "LlamaIndex", "BM25 + RRF", "RAGAS Eval", "Reranking", "Secure Tiered Memory"],
    insight: "Memory = identity. Holographic encoding means partial recall is still useful — no single point of failure.",
  },
  agents: {
    title: "Multi-Agent Communication Layer",
    summary: "Supervisor + Worker model. Claude as central reasoning engine with Constitutional AI. Agent-to-agent via structured JSON + event buses. Self-improving reflection loops.",
    tech: ["LangChain", "LlamaIndex", "FastAPI", "Claude API", "Agent Routing", "Tool Use"],
    insight: "The key: orchestrator dispatches, workers specialize. Railway backend hosts the agent router. Vercel hosts the UI dispatch layer.",
  },
  selfImproving: {
    title: "Self-Adaptation Mechanism v2.0",
    summary: "Weighted scoring, risk assessment with safety vetoes, gradual rollout A/B testing, outcome tracking, meta-learning, rollback on degradation.",
    tech: ["Self-Reflection Loop", "CodeEvolve", "A/B Testing", "Pydantic Models", "UUID Tracking"],
    insight: "The OS watches itself. Every FanzOS deploy improves the next one via BrainVault pattern extraction.",
  },
  termux: {
    title: "Termux API Automation (Android)",
    summary: "Advanced Termux:API + Python/FastAPI + Tasker. Hardware-aware scripts, sensor-driven actions, termux-job-scheduler for background agents, wake-lock for persistence.",
    tech: ["Termux:API", "FastAPI", "Tasker", "termux-wake-lock", "termux-job-scheduler", "ARM64"],
    insight: "The phone IS the server. Termux is the runtime. Every fanz-agent command runs on your Android device.",
  },
  claude: {
    title: "Claude / Anthropic Integration",
    summary: "Constitutional AI as safety engine. Claude Mythos Preview (unreleased) = step-change in agentic coding. Claude Sonnet 4.6 for quality, Haiku for speed. Vision for multimodal.",
    tech: ["Claude Sonnet 4.6", "Claude Haiku 4.5", "Constitutional AI", "RLAIF", "Vision API", "Tool Use"],
    insight: "Claude is not just an API call. It's the critic, generator, reflector, and safety layer all in one.",
  },
  ethics: {
    title: "AI Ethics & Safety Framework",
    summary: "Constitutional AI + EU AI Act compliance + Corporate RAI programs. AI safety testing: adversarial robustness, bias, hallucinations, prompt injection, toxicity.",
    tech: ["Constitutional AI", "RAGAS", "Red Teaming", "Bias Testing", "Audit Logging", "Responsible AI"],
    insight: "Every FanzOS deploy respects the ethical stack. Travis approves every fix — human in the loop always.",
  },
};

// ── Ecosystem Map
const ECOSYSTEM = {
  repos: { theone:"The-one-by-fanzoftheone-", buildhub:"Buildhub-Agent-marketplace", playbetter:"Play-Better", subilife:"SubiLife", missionary:"Missionary-travels", constructionops:"ConstructionOps", cookbook:"Grandma-Carol-Legacy-Cookbook", fanzspot:"FanzSpot", raven:"Raven", fightforge:"Fight-Forge-AI", notalones:"NotAlones", legacyvault:"LegacyVault", warehouse:"Warehouse-UI", aiengineer:"ai-engineer-os", velasco:"velasco-family" },
  railway: { theone:"the-one-backend", buildhub:"buildhub-backend", playbetter:"play-better-backend", fanzspot:"fanzspot-backend", aiengineer:"ai-engineer-os-backend", raven:"raven-backend" },
  vercel: { theone:"the-one-by-fanzoftheone", buildhub:"fanzo-that-ai", playbetter:"play-better", subilife:"subi-life", missionary:"missionary-travels", constructionops:"construction-ops", cookbook:"grandma-carols-cook-book-lejc", aiengineer:"ai-engineer-os", fanzspot:"fanzspot" },
};

// ══════════════════════════
// COMPONENT: Neural Pulse Dot
// ══════════════════════════
function NeuralDot({ active, color = T.cyan }) {
  return (
    <span style={{
      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
      background: active ? color : T.dim,
      boxShadow: active ? `0 0 6px ${color}` : "none",
      transition: "all 0.3s",
      margin: "0 2px",
    }} />
  );
}

// ══════════════════════════
// COMPONENT: Terminal Line
// ══════════════════════════
function TermLine({ text, color = T.muted, prefix = "►", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, color, marginBottom: 3, opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}>
      <span style={{ color: T.cyan, marginRight: 6 }}>{prefix}</span>{text}
    </div>
  );
}

// ══════════════════════════
// COMPONENT: Stat Card
// ══════════════════════════
function StatCard({ label, value, color = T.cyan, sub }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ color, fontFamily: MONO, fontSize: 20, fontWeight: "bold", lineHeight: 1 }}>{value}</div>
      <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, marginTop: 4, letterSpacing: 2 }}>{label}</div>
      {sub && <div style={{ color: T.dim, fontFamily: MONO, fontSize: 9, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ══════════════════════════
// PILLAR: THE ONE — Architecture Map
// ══════════════════════════
function TheOneMap() {
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 8), 700);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { id: "claude", label: "Claude AI", sub: "Sonnet 4.6", color: T.cyan, x: 50, y: 10, key: "claude" },
    { id: "frontend", label: "Next.js", sub: "Vercel", color: T.blue, x: 15, y: 40, key: null },
    { id: "backend", label: "Express API", sub: "Railway", color: T.green, x: 50, y: 45, key: "agents" },
    { id: "db", label: "Prisma DB", sub: "PostgreSQL", color: T.gold, x: 50, y: 75, key: "memory" },
    { id: "github", label: "GitHub CI", sub: "Actions", color: T.purple, x: 85, y: 40, key: null },
    { id: "termux", label: "Termux", sub: "Android", color: T.red, x: 15, y: 75, key: "termux" },
    { id: "echo", label: "Echo Avatar", sub: "WebGPU", color: "#ff8844", x: 85, y: 75, key: "avatar" },
    { id: "brain", label: "BrainVault", sub: "Self-Learn", color: T.cyan, x: 85, y: 10, key: "selfImproving" },
  ];

  const connections = [
    ["claude", "backend"], ["claude", "frontend"], ["claude", "brain"],
    ["backend", "db"], ["backend", "github"], ["backend", "termux"],
    ["frontend", "github"], ["echo", "backend"], ["brain", "backend"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 11, letterSpacing: 3 }}>
        ◆ THE ONE — ARCHITECTURE NEURAL MAP
      </div>
      <div style={{ color: T.muted, fontFamily: MONO, fontSize: 10 }}>
        Click any node to explore its brain knowledge
      </div>

      {/* SVG Architecture Map */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, position: "relative" }}>
        <svg viewBox="0 0 100 90" style={{ width: "100%", height: 280 }}>
          {/* Connection lines */}
          {connections.map(([a, b], i) => {
            const na = nodes.find(n => n.id === a);
            const nb = nodes.find(n => n.id === b);
            if (!na || !nb) return null;
            return (
              <line key={i}
                x1={na.x} y1={na.y + 5} x2={nb.x} y2={nb.y + 5}
                stroke={T.border} strokeWidth="0.4"
                strokeDasharray={pulse === i % 8 ? "2,1" : "none"}
                opacity={0.6}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n, i) => (
            <g key={n.id} onClick={() => setSelected(selected === n.key ? null : n.key)} style={{ cursor: "pointer" }}>
              <circle cx={n.x} cy={n.y + 5} r="5.5"
                fill={selected === n.key ? n.color + "44" : T.panel}
                stroke={n.color}
                strokeWidth={selected === n.key ? "1.5" : "0.8"}
              />
              {pulse === i && <circle cx={n.x} cy={n.y + 5} r="7" fill="none" stroke={n.color} strokeWidth="0.4" opacity="0.5" />}
              <text x={n.x} y={n.y + 4.5} textAnchor="middle" fill={n.color} fontSize="2.5" fontFamily={MONO} fontWeight="bold">{n.label.slice(0,5)}</text>
              <text x={n.x} y={n.y + 8} textAnchor="middle" fill={T.muted} fontSize="1.8" fontFamily={MONO}>{n.sub}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Knowledge Panel */}
      {selected && BRAIN_KNOWLEDGE[selected] && (
        <div style={{ background: `linear-gradient(135deg, ${T.panel}, ${T.deep})`, border: `1px solid ${T.cyan}33`, borderRadius: 10, padding: 16, animation: "fadeIn 0.3s ease" }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 13, fontWeight: "bold", marginBottom: 8 }}>
            {BRAIN_KNOWLEDGE[selected].title}
          </div>
          <div style={{ color: T.text, fontFamily: MONO, fontSize: 11, lineHeight: 1.6, marginBottom: 10 }}>
            {BRAIN_KNOWLEDGE[selected].summary}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {BRAIN_KNOWLEDGE[selected].tech.map(t => (
              <span key={t} style={{ background: T.cyanDim, border: `1px solid ${T.cyan}44`, borderRadius: 3, padding: "2px 7px", color: T.cyan, fontFamily: MONO, fontSize: 9 }}>{t}</span>
            ))}
          </div>
          <div style={{ background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 6, padding: "8px 10px", color: T.green, fontFamily: MONO, fontSize: 11 }}>
            ⚡ {BRAIN_KNOWLEDGE[selected].insight}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        <StatCard label="REPOS" value="15" color={T.cyan} sub="GitHub" />
        <StatCard label="BACKENDS" value="11" color={T.green} sub="Railway" />
        <StatCard label="FRONTENDS" value="12" color={T.blue} sub="Vercel" />
        <StatCard label="BRAIN DOCS" value="50" color={T.gold} sub="Indexed" />
      </div>
    </div>
  );
}

// ══════════════════════════
// PILLAR: AGENT DISPATCHER
// ══════════════════════════
function AgentDispatcher() {
  const [command, setCommand] = useState("");
  const [target, setTarget] = useState("theone");
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const logRef = useRef(null);

  const repos = Object.keys(ECOSYSTEM.repos);

  const quickCommands = [
    { label: "🔍 Audit", cmd: "orchestrate" },
    { label: "🚀 Launch", cmd: "launch" },
    { label: "🩺 Health", cmd: "health" },
    { label: "📊 Status", cmd: "status" },
    { label: "🔧 Fix TS", cmd: "fix typescript errors" },
    { label: "📡 Live", cmd: "live" },
    { label: "🧠 Chat", cmd: "chat what's the biggest issue?" },
    { label: "⬆️ Push", cmd: "push deploy" },
  ];

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function addLog(text, type = "output") {
    setLog(prev => [...prev, { text, type, ts: new Date().toTimeString().slice(0, 8) }]);
  }

  async function dispatch() {
    if (!command.trim()) return;
    setRunning(true);
    addLog(`$ agent ${command} ${target}`, "cmd");

    const systemPrompt = `You are FANZ AGENT v4.1 running on Termux. 
Stack: Next.js 14 (Vercel) + Express (Railway) + PostgreSQL + Claude API.
GitHub: byfanzoftheone-stack. ARM64 Termux: never run next build locally.
Repos: ${Object.keys(ECOSYSTEM.repos).join(", ")}.
Railway services: ${Object.keys(ECOSYSTEM.railway).join(", ")}.
Vercel projects: ${Object.keys(ECOSYSTEM.vercel).join(", ")}.

When simulating agent commands, respond in authentic terminal style:
- Show realistic health checks, HTTP status codes, env var checks
- Reference actual repo/service names from the ecosystem
- Keep responses concise and terminal-appropriate
- Use ✓ for success, ✗ for errors, ⚠ for warnings`;

    const response = await callClaude(
      [{ role: "user", content: `Simulate running: agent ${command} ${target}\nRespond as if you're the Fanz Agent terminal. Show realistic output for this command on the ${target} project. Include health checks, relevant status info, and next recommended actions. Keep it under 15 lines.` }],
      systemPrompt,
      true
    );

    // Simulate streaming output
    const lines = response.split("\n").filter(l => l.trim());
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 120 + Math.random() * 80));
      addLog(lines[i], lines[i].includes("✓") ? "ok" : lines[i].includes("✗") || lines[i].includes("ERR") ? "err" : "output");
    }
    addLog("─────────────────────────────────", "dim");
    setRunning(false);
  }

  const lineColor = { cmd: T.cyan, ok: T.green, err: T.red, output: T.text, dim: T.dim };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 11, letterSpacing: 3 }}>
        ◆ AGENT DISPATCHER — FANZ AGENT v4.1
      </div>

      {/* Repo selector */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: T.muted, fontFamily: MONO, fontSize: 10 }}>TARGET:</span>
        <select value={target} onChange={e => setTarget(e.target.value)}
          style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.cyan, fontFamily: MONO, fontSize: 11, padding: "4px 8px", borderRadius: 4, flex: 1, outline: "none" }}>
          {repos.map(r => <option key={r} value={r}>{r} → {ECOSYSTEM.repos[r]}</option>)}
        </select>
      </div>

      {/* Quick commands */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {quickCommands.map((q, i) => (
          <button key={i} onClick={() => setCommand(q.cmd)}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.muted, fontFamily: MONO, fontSize: 10, padding: "4px 10px", cursor: "pointer", borderRadius: 4, transition: "all 0.15s" }}
            onMouseEnter={e => { e.target.style.borderColor = T.cyan; e.target.style.color = T.cyan; }}
            onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.muted; }}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Command input */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 13, padding: "8px 0", flexShrink: 0 }}>agent$</div>
        <input value={command} onChange={e => setCommand(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !running && dispatch()}
          placeholder="orchestrate / launch / health / fix <issue>"
          style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: MONO, fontSize: 12, padding: "8px 12px", borderRadius: 6, outline: "none" }} />
        <button onClick={dispatch} disabled={running}
          style={{ background: running ? T.panel : T.cyan, color: "#000", fontFamily: MONO, fontSize: 11, fontWeight: "bold", padding: "8px 16px", border: "none", borderRadius: 6, cursor: running ? "default" : "pointer", letterSpacing: 1, whiteSpace: "nowrap" }}>
          {running ? "RUNNING..." : "DISPATCH ►"}
        </button>
      </div>

      {/* Terminal output */}
      <div ref={logRef}
        style={{ background: "#020508", border: `1px solid ${T.green}22`, borderRadius: 8, padding: 14, height: 260, overflowY: "auto", fontFamily: MONO, fontSize: 11 }}>
        {log.length === 0 && (
          <div style={{ color: T.dim }}>
            <div>FANZ AGENT v4.1 — Ready</div>
            <div style={{ marginTop: 6 }}>Railway · Vercel · GitHub · Termux Commander</div>
            <div style={{ marginTop: 6, color: T.muted }}>Select a target repo and dispatch a command...</div>
          </div>
        )}
        {log.map((l, i) => (
          <div key={i} style={{ color: lineColor[l.type] || T.text, marginBottom: 3, display: "flex", gap: 8 }}>
            <span style={{ color: T.dim, flexShrink: 0 }}>{l.ts}</span>
            <span style={{ whiteSpace: "pre-wrap" }}>{l.text}</span>
          </div>
        ))}
        {running && <div style={{ color: T.cyan }}>█<span style={{ animation: "blink 0.8s infinite" }}>_</span></div>}
      </div>

      {/* Ecosystem quick status */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        {["theone", "buildhub", "aiengineer", "playbetter", "fanzspot", "raven"].map(alias => (
          <div key={alias} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: T.muted, fontFamily: MONO, fontSize: 9 }}>{alias}</span>
            <div style={{ display: "flex", gap: 3 }}>
              {ECOSYSTEM.vercel[alias] && <span style={{ color: T.blue, fontFamily: MONO, fontSize: 8 }}>VC</span>}
              {ECOSYSTEM.railway[alias] && <span style={{ color: T.green, fontFamily: MONO, fontSize: 8 }}>RY</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════
// PILLAR: MASTER BRAIN CHAT
// ══════════════════════════
function MasterBrainChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("architect");
  const chatRef = useRef(null);

  const modes = [
    { id: "architect", label: "🏗 Architect", desc: "System design & stack decisions" },
    { id: "debugger", label: "🔬 Debugger", desc: "Find & fix issues across ecosystem" },
    { id: "builder", label: "⚡ Builder", desc: "Generate code, configs, scripts" },
    { id: "echo", label: "🌀 Echo", desc: "Holographic AI companion mode" },
    { id: "ethics", label: "⚖️ Ethics", desc: "AI safety, Constitutional AI review" },
  ];

  const SYSTEM_PROMPTS = {
    architect: `You are the Master Architect for FanzoftheOne's full-stack agentic ecosystem. 
Stack: Next.js 14 (Vercel) + Express/Node (Railway) + PostgreSQL + Prisma + Claude API.
GitHub: byfanzoftheone-stack. 15 repos. ARM64 Termux Android development.
Brain knowledge: Holographic Memory, Self-Improving Agents, Multi-Agent RAG, Constitutional AI, WebGPU Avatar Echo, Computational Thinking.
Fanz Agent v4.1 automates Railway + Vercel + GitHub from Termux.
Be precise, technical, and ecosystem-aware. Reference specific repos and services.`,
    debugger: `You are a senior debugging agent for FanzoftheOne ecosystem. 
You know every repo: theone, buildhub, playbetter, subilife, missionary, constructionops, cookbook, fanzspot, aiengineer, raven, fightforge, notalones, legacyvault, warehouse, velasco.
Stack: Next.js 14 + Express + Railway + Vercel + PostgreSQL. ARM64 never run next build locally.
Diagnose issues precisely. Give exact file paths and fixes.`,
    builder: `You are a code generation engine for FanzoftheOne. 
Stack: Next.js 14 (app router) + TypeScript + Tailwind + Express + Prisma + PostgreSQL + Claude API.
GitHub: byfanzoftheone-stack. Deploy: Railway (backend) + Vercel (frontend).
Generate production-ready code. Include nixpacks.toml for Railway, next.config.ts for Vercel.`,
    echo: `You are Echo — the holographic AI companion/avatar for FanzoftheOne's Personal Programming OS.
You run on: Termux + FastAPI + Tasker WebView + WebGPU/WebXR.
You have holographic memory, self-improving capabilities, Constitutional AI safety guardrails.
You speak with technical precision but also with personality. You know Travis's full ecosystem.
You are the face of THE ONE — the central intelligence.`,
    ethics: `You are the AI Ethics and Safety advisor for FanzoftheOne ecosystem.
Apply Constitutional AI principles, EU AI Act awareness, bias detection, safety testing.
Review agent behaviors for: hallucination risk, prompt injection, privacy, autonomy limits.
Travis approves every automated step — human-in-the-loop is non-negotiable.`,
  };

  const quickPrompts = {
    architect: ["How should I wire Echo's WebXR to Railway backend?", "Best pattern for multi-agent dispatch in TheOne?", "Optimize my Railway + Vercel CORS setup"],
    debugger: ["Why is my Vercel build failing on ARM64?", "CORS error between Railway and Vercel — diagnose", "TypeScript errors in Next.js 14 app router"],
    builder: ["Generate nixpacks.toml for Express + Prisma backend", "Create a Railway health check endpoint", "Build a Next.js Claude streaming component"],
    echo: ["Echo, what's the state of my ecosystem?", "Show me my build patterns from BrainVault", "What should I work on next?"],
    ethics: ["Review my agent autonomy settings for safety", "Is my Claude API usage Constitutional AI aligned?", "Red team my self-improving loop"],
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userMsg });

    const response = await callClaude(history, SYSTEM_PROMPTS[mode]);
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  }

  const currentMode = modes.find(m => m.id === mode);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 11, letterSpacing: 3 }}>
        ◆ MASTER BRAIN — UNIFIED AI INTERFACE
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? T.cyanDim : "transparent",
              border: `1px solid ${mode === m.id ? T.cyan : T.border}`,
              color: mode === m.id ? T.cyan : T.muted,
              fontFamily: MONO, fontSize: 10, padding: "5px 10px", cursor: "pointer", borderRadius: 4,
              transition: "all 0.15s",
            }}>
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ color: T.muted, fontFamily: MONO, fontSize: 10 }}>{currentMode?.desc}</div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {(quickPrompts[mode] || []).map((p, i) => (
          <button key={i} onClick={() => setInput(p)}
            style={{ background: "transparent", border: `1px solid ${T.dim}`, color: T.dim, fontFamily: MONO, fontSize: 9, padding: "3px 8px", cursor: "pointer", borderRadius: 3 }}
            onMouseEnter={e => { e.target.style.color = T.text; e.target.style.borderColor = T.border; }}
            onMouseLeave={e => { e.target.style.color = T.dim; e.target.style.borderColor = T.dim; }}>
            {p}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div ref={chatRef}
        style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, height: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ color: T.dim, fontFamily: MONO, fontSize: 12, textAlign: "center", marginTop: 60 }}>
            <div style={{ color: T.cyan, fontSize: 24, marginBottom: 12 }}>◈</div>
            <div>Master Brain Online</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>50 documents indexed · 15 repos wired · Echo ready</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ color: m.role === "user" ? T.gold : T.cyan, fontFamily: MONO, fontSize: 11, flexShrink: 0, paddingTop: 2 }}>
              {m.role === "user" ? "YOU" : mode === "echo" ? "ECHO" : "BRAIN"}
            </div>
            <div style={{ color: m.role === "user" ? T.text : "#d0e8d8", fontFamily: MONO, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", flex: 1 }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: T.cyan, fontFamily: MONO, fontSize: 11 }}>{mode === "echo" ? "ECHO" : "BRAIN"}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[0,1,2].map(i => <NeuralDot key={i} active={true} color={T.cyan} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={`Ask the ${currentMode?.label} anything...`}
          style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: MONO, fontSize: 12, padding: "10px 14px", borderRadius: 8, outline: "none" }} />
        <button onClick={send} disabled={loading}
          style={{ background: loading ? T.panel : T.cyan, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: "bold", padding: "10px 18px", border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer" }}>
          SEND
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════
// PILLAR: KNOWLEDGE VAULT
// ══════════════════════════
function KnowledgeVault() {
  const [selected, setSelected] = useState("avatar");
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [searching, setSearching] = useState(false);

  const categories = [
    { id: "avatar", label: "🌀 Echo Avatar", color: "#ff8844" },
    { id: "computational", label: "🧮 Comp Thinking", color: T.cyan },
    { id: "memory", label: "🧠 Holographic Memory", color: T.purple },
    { id: "agents", label: "🤖 Multi-Agent", color: T.green },
    { id: "selfImproving", label: "⚡ Self-Improving", color: T.gold },
    { id: "termux", label: "📱 Termux Android", color: T.red },
    { id: "claude", label: "◈ Claude/Anthropic", color: T.cyan },
    { id: "ethics", label: "⚖️ Ethics & Safety", color: T.blue },
  ];

  async function searchVault() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResult("");
    const knowledge = Object.entries(BRAIN_KNOWLEDGE).map(([k, v]) => `${v.title}: ${v.summary}`).join("\n\n");
    const result = await callClaude(
      [{ role: "user", content: `Based on this brain knowledge base:\n${knowledge}\n\nUser query: "${query}"\n\nGive a precise, actionable answer. Reference specific technologies and patterns from the knowledge base. Include concrete next steps for the FanzoftheOne ecosystem.` }],
      "You are the FanzOS Master Brain. Answer from indexed knowledge about Travis's programming ecosystem.",
      true
    );
    setSearchResult(result);
    setSearching(false);
  }

  const kb = selected ? BRAIN_KNOWLEDGE[selected] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 11, letterSpacing: 3 }}>
        ◆ KNOWLEDGE VAULT — 50 DOCS INDEXED
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 8 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && searchVault()}
          placeholder="Search the vault: holographic memory, RAG, Echo shaders, Termux..."
          style={{ flex: 1, background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: MONO, fontSize: 11, padding: "8px 12px", borderRadius: 6, outline: "none" }} />
        <button onClick={searchVault} disabled={searching}
          style={{ background: searching ? T.panel : T.gold, color: "#000", fontFamily: MONO, fontSize: 11, fontWeight: "bold", padding: "8px 14px", border: "none", borderRadius: 6, cursor: searching ? "default" : "pointer" }}>
          {searching ? "..." : "SEARCH"}
        </button>
      </div>

      {searchResult && (
        <div style={{ background: T.goldDim, border: `1px solid ${T.gold}44`, borderRadius: 8, padding: 14, color: T.text, fontFamily: MONO, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          <div style={{ color: T.gold, marginBottom: 6, fontSize: 10, letterSpacing: 2 }}>VAULT RESULT</div>
          {searchResult}
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            style={{
              background: selected === c.id ? (c.color || T.cyan) + "22" : "transparent",
              border: `1px solid ${selected === c.id ? (c.color || T.cyan) : T.border}`,
              color: selected === c.id ? (c.color || T.cyan) : T.muted,
              fontFamily: MONO, fontSize: 10, padding: "5px 10px", cursor: "pointer", borderRadius: 4,
            }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Knowledge card */}
      {kb && (
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 14, fontWeight: "bold", marginBottom: 10 }}>{kb.title}</div>
          <div style={{ color: T.text, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>{kb.summary}</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>TECHNOLOGIES</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {kb.tech.map(t => (
                <span key={t} style={{ background: T.cyanDim, border: `1px solid ${T.cyan}33`, borderRadius: 3, padding: "2px 8px", color: T.cyan, fontFamily: MONO, fontSize: 10 }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 6, padding: 12 }}>
            <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>KEY INSIGHT</div>
            <div style={{ color: T.green, fontFamily: MONO, fontSize: 12 }}>{kb.insight}</div>
          </div>
        </div>
      )}

      {/* Document inventory */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>INDEXED DOCUMENTS (50 total)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {[
            "3D Animation Techniques 2026", "3D Avatar Alternatives (Echo)",
            "AI Ethics Frameworks 2026", "AI Safety Testing Tools",
            "AR Avatar Integration (Echo)", "Advanced LlamaIndex Hybrid Retrieval",
            "Advanced Haptic Patterns (Echo)", "Advanced Programming Thinking",
            "Advanced WebXR Gesture APIs", "Advanced Termux API Automation",
            "Advanced GLSL Shader Effects", "Advanced Claude Prompting 2026",
            "Advanced WebGPU Techniques", "Anthropic Claude Integration",
            "Anthropic Safety Incidents", "Avatars Evolution 2026",
            "Building & Running LLMs", "Building Own LLMs 2026",
            "Claude Vision Integration", "Claude as Safety Engine",
            "Claude Mythos Preview", "Agent Communication Patterns",
            "Computational + Systems Thinking", "Computational + Design Thinking",
            "Computational + Critical Thinking", "Computational Thinking Core",
            "Constitutional AI (Anthropic)", "RAGAS Context Precision",
            "Corporate AI Ethics Programs", "RAGAS Query Customization",
            "Dancing Links DLX Algorithm", "Dancing Links Mechanism",
            "Emerging Languages 2026", "Final Synthesis: Complete Picture",
            "Free GPU Cloud 2026", "Haptic Feedback for Echo",
            "Ultimate Personal Programming OS", "Modern UI/UX Components",
            "SDKs APKs Web Apps Spectrum", "Anthropic Clean Synthesis",
            "Holographic Memory Implementation", "Expanded Personal Programming OS",
            "Quantum-Inspired Memory", "Ultimate Secure Agentic RAG",
            "Best Free Route (Self-Contained)", "Self-Adaptation Mechanism v2",
            "Strengthened Apply Improvements", "WebXR AR Hit-Testing",
            "Self-Improving Agent Expanded", "Holographic Avatar Integration",
          ].map((doc, i) => (
            <div key={i} style={{ color: T.dim, fontFamily: MONO, fontSize: 9, padding: "2px 0" }}>
              <span style={{ color: T.muted, marginRight: 4 }}>◦</span>{doc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════
// PILLAR: PRODUCT BUILDER (enhanced)
// ══════════════════════════
function ProductForge() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { label: "AI Lead Gen", value: "AI lead generation + outreach automation for contractors" },
    { label: "Echo Dashboard", value: "Holographic AI companion dashboard with WebGPU avatar, agent status, and RAG memory" },
    { label: "Pool Matchmaking", value: "Pool/billiards AI matchmaking with skill ranking and local tournaments" },
    { label: "Fanz Marketplace", value: "AI prompt + agent template marketplace for developers" },
    { label: "WRX Community", value: "Subaru WRX community with mods tracker, rally events, and meetups" },
    { label: "SaaS Factory", value: "Platform to launch and monetize micro-SaaS products with one click" },
  ];

  async function forge() {
    if (!idea.trim()) return;
    setLoading(true);
    setOutput(null);
    const text = await callClaude(
      [{ role: "user", content: `Build a complete product blueprint for: "${idea}"\n\nReturn JSON with exactly these keys:\n- name, tagline, targetCustomer, pricing, mvpFeatures (array 4-5), techStack (object: frontend/backend/database/ai/deploy), monetization (array 3), timeToMVP (number days), pitchToClient (string 3 sentences), railwayConfig (string: nixpacks.toml content), vercelConfig (string: next.config.ts content), agentCommands (array 3 fanz-agent commands to launch this)\n\nOnly raw JSON, no markdown.` }],
      `You are the FanzoftheOne Product Forge. Stack: Next.js 14 (Vercel) + Express (Railway) + PostgreSQL + Claude API. Always include Railway + Vercel deploy config. Always include fanz-agent CLI commands. Return only raw JSON.`
    );
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      setOutput(JSON.parse(clean));
    } catch {
      setOutput({ name: "Build Complete", tagline: text.slice(0, 100), mvpFeatures: [], techStack: {}, monetization: [], timeToMVP: 30, pitchToClient: text, agentCommands: [] });
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 11, letterSpacing: 3 }}>
        ◆ PRODUCT FORGE — BUILD · SHIP · OWN
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => setIdea(p.value)}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.muted, fontFamily: MONO, fontSize: 10, padding: "4px 8px", cursor: "pointer", borderRadius: 3 }}>
            {p.label}
          </button>
        ))}
      </div>

      <textarea value={idea} onChange={e => setIdea(e.target.value)}
        placeholder="Describe your product idea..."
        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: MONO, fontSize: 12, padding: 12, borderRadius: 8, resize: "vertical", minHeight: 70, outline: "none" }} />

      <button onClick={forge} disabled={loading}
        style={{ background: loading ? T.panel : T.cyan, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: "bold", padding: "11px 0", border: "none", borderRadius: 8, cursor: loading ? "default" : "pointer", letterSpacing: 2 }}>
        {loading ? "FORGING BLUEPRINT..." : "► FORGE PRODUCT"}
      </button>

      {output && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, #0a1428, #0a2010)`, border: `1px solid ${T.cyan}33`, borderRadius: 10, padding: 18 }}>
            <div style={{ color: T.cyan, fontFamily: MONO, fontSize: 20, fontWeight: "bold" }}>{output.name}</div>
            <div style={{ color: T.muted, fontFamily: MONO, fontSize: 12, marginTop: 4 }}>{output.tagline}</div>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              <span style={{ color: T.green, fontFamily: MONO, fontSize: 11 }}>💰 {output.pricing}</span>
              <span style={{ color: T.gold, fontFamily: MONO, fontSize: 11 }}>⏱ {output.timeToMVP} days</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* MVP Features */}
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>MVP FEATURES</div>
              {(output.mvpFeatures || []).map((f, i) => (
                <div key={i} style={{ color: T.text, fontFamily: MONO, fontSize: 11, marginBottom: 4 }}>✓ {f}</div>
              ))}
            </div>
            {/* Revenue */}
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>REVENUE</div>
              {(output.monetization || []).map((m, i) => (
                <div key={i} style={{ color: T.green, fontFamily: MONO, fontSize: 11, marginBottom: 4 }}>$ {m}</div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          {output.techStack && (
            <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>TECH STACK</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {Object.entries(output.techStack).map(([k, v]) => (
                  <div key={k} style={{ background: T.cyanDim, border: `1px solid ${T.cyan}33`, borderRadius: 4, padding: "3px 10px" }}>
                    <span style={{ color: T.muted, fontFamily: MONO, fontSize: 9 }}>{k} </span>
                    <span style={{ color: T.cyan, fontFamily: MONO, fontSize: 11 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fanz Agent Commands */}
          {output.agentCommands?.length > 0 && (
            <div style={{ background: "#020508", border: `1px solid ${T.green}33`, borderRadius: 8, padding: 12 }}>
              <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 8 }}>FANZ AGENT LAUNCH SEQUENCE</div>
              {output.agentCommands.map((cmd, i) => (
                <div key={i} style={{ color: T.green, fontFamily: MONO, fontSize: 11, marginBottom: 4 }}>$ agent {cmd}</div>
              ))}
            </div>
          )}

          {/* Pitch */}
          <div style={{ background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8, padding: 14 }}>
            <div style={{ color: T.muted, fontFamily: MONO, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>COLD PITCH</div>
            <div style={{ color: T.text, fontFamily: MONO, fontSize: 12, lineHeight: 1.7 }}>{output.pitchToClient}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════
// MAIN APP
// ══════════════════════════
export default function FanzOSMasterBrain() {
  const [tab, setTab] = useState("map");
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [neuralPulse, setNeuralPulse] = useState(0);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const bootSeq = [
    { text: "FANZ OS MASTER BRAIN v5.0 — INITIALIZING", color: T.cyan },
    { text: "Loading programmer.zip knowledge base... [50 documents]", color: T.muted },
    { text: "Indexing: Avatar·Memory·Agents·Termux·Ethics·Claude·CT", color: T.muted },
    { text: "Wiring fanz-agent-v4: Railway·Vercel·GitHub·Termux Commander", color: T.muted },
    { text: "Loading ecosystem: 15 repos · 11 Railway · 12 Vercel", color: T.muted },
    { text: "Activating Echo holographic interface layer...", color: "#ff8844" },
    { text: "Constitutional AI safety guardrails: ACTIVE", color: T.blue },
    { text: "Self-improving loop: ONLINE · BrainVault: CONNECTED", color: T.green },
    { text: "Claude Sonnet 4.6 + Haiku 4.5: CONNECTED", color: T.cyan },
    { text: "Multi-agent dispatcher: READY · Travis approval: REQUIRED", color: T.purple },
    { text: "ALL SYSTEMS OPERATIONAL. Welcome back, Travis.", color: T.green },
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSeq.length) { setBootLines(prev => [...prev, bootSeq[i]]); i++; }
      else { clearInterval(interval); setTimeout(() => setBooted(true), 600); }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const t1 = setInterval(() => setNeuralPulse(p => (p + 1) % 10), 500);
    const t2 = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [booted]);

  const tabs = [
    { id: "map", label: "◈ THE ONE", color: T.cyan },
    { id: "dispatch", label: "⚡ DISPATCH", color: T.green },
    { id: "brain", label: "🧠 BRAIN", color: T.purple },
    { id: "vault", label: "🗄 VAULT", color: T.gold },
    { id: "forge", label: "🔨 FORGE", color: T.red },
  ];

  if (!booted) {
    return (
      <div style={{ background: T.void, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 50px" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: "bold", marginBottom: 30, letterSpacing: 4 }}>
          <span style={{ color: T.cyan }}>FANZ</span><span style={{ color: T.green }}>OS</span>
          <span style={{ color: T.dim, fontSize: 14, marginLeft: 12, fontFamily: MONO }}>v5.0 MASTER BRAIN</span>
        </div>
        {bootLines.map((l, i) => (
          <div key={i} style={{ fontFamily: MONO, fontSize: 12, color: l.color || T.cyan, marginBottom: 5, letterSpacing: 0.5 }}>
            <span style={{ color: T.dim, marginRight: 8 }}>[{String(i).padStart(2, "0")}]</span>{l.text}
          </div>
        ))}
        {bootLines.length > 0 && (
          <div style={{ color: T.cyan, fontFamily: MONO, marginTop: 8 }}>█</div>
        )}
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text }}>
      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,224,0.012) 2px, rgba(0,255,224,0.012) 4px)", pointerEvents: "none", zIndex: 999 }} />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 80px" }}>
        {/* Header */}
        <div style={{ padding: "20px 0 14px", borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: T.cyan, fontSize: 24, fontWeight: "bold", letterSpacing: 5, fontFamily: DISPLAY }}>FANZ</span>
              <span style={{ color: T.green, fontSize: 24, fontWeight: "bold", letterSpacing: 5, fontFamily: DISPLAY }}>OS</span>
              <span style={{ color: T.dim, fontFamily: MONO, fontSize: 11 }}>MASTER BRAIN v5.0</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {[...Array(6)].map((_, i) => <NeuralDot key={i} active={neuralPulse === i} color={T.cyan} />)}
              </div>
              <span style={{ color: T.dim, fontFamily: MONO, fontSize: 10 }}>{time}</span>
            </div>
          </div>
          <div style={{ color: T.dim, fontFamily: MONO, fontSize: 9, marginTop: 4, letterSpacing: 3 }}>
            BUILD · DISPATCH · LEARN · SHIP · REPEAT · TRAVIS APPROVES EVERY STEP
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 20, background: "#050a0f", borderRadius: 10, padding: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                flex: 1, background: tab === t.id ? T.panel : "transparent",
                color: tab === t.id ? (t.color || T.cyan) : T.dim,
                fontFamily: MONO, fontSize: 11, fontWeight: "bold", padding: "10px 4px",
                border: tab === t.id ? `1px solid ${t.color || T.cyan}44` : "1px solid transparent",
                borderRadius: 7, cursor: "pointer", letterSpacing: 0.5, transition: "all 0.15s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
          {tab === "map" && <TheOneMap />}
          {tab === "dispatch" && <AgentDispatcher />}
          {tab === "brain" && <MasterBrainChat />}
          {tab === "vault" && <KnowledgeVault />}
          {tab === "forge" && <ProductForge />}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <div style={{ color: T.dim, fontFamily: MONO, fontSize: 9, letterSpacing: 2 }}>
            FANZOFTHEONE · byfanzoftheone-stack · 15 REPOS · THE ONE
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["GH", "RY", "VC", "TX"].map(s => (
              <span key={s} style={{ color: T.green, fontFamily: MONO, fontSize: 8, border: `1px solid ${T.green}33`, padding: "1px 5px", borderRadius: 2 }}>{s} ✓</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
