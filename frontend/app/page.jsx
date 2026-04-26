'use client'
import { useState, useEffect, useRef } from "react";

const T = { void:"#040608",panel:"#0a0f18",border:"#0f1e2e",cyan:"#00ffe0",cyanDim:"#00ffe022",green:"#00ff88",greenDim:"#00ff8822",gold:"#ffd700",goldDim:"#ffd70022",red:"#ff3b5c",purple:"#b44eff",blue:"#4488ff",text:"#c8d8e8",muted:"#3a5570",dim:"#1a2d40" };
const MONO = "'Courier New', monospace";
const DISPLAY = "Georgia, serif";

async function callClaude(messages, system, fast) {
  try {
    const r = await fetch("/api/claude", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model: fast ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6", max_tokens:1000, system:system||undefined, messages }) });
    const d = await r.json();
    return d?.content?.[0]?.text || "[No response]";
  } catch(e) { return "[Error: "+e.message+"]"; }
}

function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => { if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);

  async function send() {
    if(!input.trim()||loading) return;
    const msg = input.trim(); setInput(""); setLoading(true);
    setMessages(p => [...p, {role:"user",content:msg}]);
    const history = messages.slice(-8).map(m => ({role:m.role,content:m.content}));
    history.push({role:"user",content:msg});
    const res = await callClaude(history, "You are the FanzOS Master Brain — AI architect for FanzoftheOne ecosystem. Stack: Next.js 14 (Vercel) + Express (Railway) + PostgreSQL + Claude API. GitHub: byfanzoftheone-stack. 30 repos. ARM64 Termux Android. Brain has 60 knowledge atoms indexed. Be precise and ecosystem-aware.");
    setMessages(p => [...p, {role:"assistant",content:res}]);
    setLoading(false);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div ref={ref} style={{background:T.panel,border:"1px solid "+T.border,borderRadius:10,padding:14,height:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
        {messages.length===0 && <div style={{color:T.dim,fontFamily:MONO,fontSize:12,textAlign:"center",marginTop:80}}><div style={{color:T.cyan,fontSize:28,marginBottom:12}}>◈</div><div>Master Brain Online — 60 atoms indexed</div></div>}
        {messages.map((m,i) => (
          <div key={i} style={{display:"flex",gap:10}}>
            <div style={{color:m.role==="user"?T.gold:T.cyan,fontFamily:MONO,fontSize:11,flexShrink:0}}>{m.role==="user"?"YOU":"BRAIN"}</div>
            <div style={{color:T.text,fontFamily:MONO,fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{color:T.cyan,fontFamily:MONO,fontSize:11}}>BRAIN ▌</div>}
      </div>
      <div style={{display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask the Master Brain anything..." style={{flex:1,background:T.panel,border:"1px solid "+T.border,color:T.text,fontFamily:MONO,fontSize:12,padding:"10px 14px",borderRadius:8,outline:"none"}} />
        <button onClick={send} disabled={loading} style={{background:loading?T.panel:T.cyan,color:"#000",fontFamily:MONO,fontSize:12,fontWeight:"bold",padding:"10px 18px",border:"none",borderRadius:8,cursor:loading?"default":"pointer"}}>SEND</button>
      </div>
    </div>
  );
}

export default function FanzOSMasterBrain() {
  const [booted, setBooted] = useState(false);
  const [lines, setLines] = useState([]);

  const bootSeq = [
    "FANZ OS MASTER BRAIN v5.0 — INITIALIZING",
    "Loading BrainVault... 60 atoms indexed",
    "Indexing: Avatar · Memory · Agents · Termux · Ethics · Claude",
    "Wiring fanz-agent-v5.2: Railway · Vercel · GitHub",
    "Constitutional AI safety guardrails: ACTIVE",
    "Self-improving loop: ONLINE · BrainVault: CONNECTED",
    "Claude Sonnet 4.6 + Haiku 4.5: CONNECTED",
    "ALL SYSTEMS OPERATIONAL. Welcome back, Travis.",
  ];

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if(i < bootSeq.length) { setLines(p => [...p, bootSeq[i]]); i++; }
      else { clearInterval(iv); setTimeout(() => setBooted(true), 500); }
    }, 250);
    return () => clearInterval(iv);
  }, []);

  if(!booted) return (
    <div style={{background:T.void,minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 50px"}}>
      <div style={{fontFamily:DISPLAY,fontSize:30,fontWeight:"bold",marginBottom:30,letterSpacing:4}}>
        <span style={{color:T.cyan}}>FANZ</span><span style={{color:T.green}}>OS</span>
        <span style={{color:T.dim,fontSize:14,marginLeft:12,fontFamily:MONO}}>v5.0 MASTER BRAIN</span>
      </div>
      {lines.map((l,i) => (
        <div key={i} style={{fontFamily:MONO,fontSize:12,color:T.cyan,marginBottom:5,letterSpacing:0.5}}>
          <span style={{color:T.dim,marginRight:8}}>[{String(i).padStart(2,"0")}]</span>{l}
        </div>
      ))}
      {lines.length>0 && <div style={{color:T.cyan,fontFamily:MONO,marginTop:8}}>█</div>}
    </div>
  );

  return (
    <div style={{background:T.void,minHeight:"100vh",color:T.text}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"20px 16px 80px"}}>
        <div style={{paddingBottom:16,borderBottom:"1px solid "+T.border,marginBottom:24}}>
          <span style={{color:T.cyan,fontSize:22,fontWeight:"bold",letterSpacing:5,fontFamily:DISPLAY}}>FANZ</span>
          <span style={{color:T.green,fontSize:22,fontWeight:"bold",letterSpacing:5,fontFamily:DISPLAY}}>OS</span>
          <span style={{color:T.dim,fontFamily:MONO,fontSize:11,marginLeft:12}}>MASTER BRAIN v5.0 · by FanzoftheOne</span>
        </div>
        <Chat />
        <div style={{marginTop:16,color:T.dim,fontFamily:MONO,fontSize:9,letterSpacing:3,textAlign:"center"}}>
          BUILD · DISPATCH · LEARN · SHIP · REPEAT · TRAVIS APPROVES EVERY STEP
        </div>
      </div>
    </div>
  );
}
