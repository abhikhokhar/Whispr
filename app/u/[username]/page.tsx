'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'


import { getAnonymousId } from "@/lib/getAnonymousId";
import { getAnonymousName } from "@/lib/getAnonymousName";
import { useSocket } from '@/context/SocketProvider'

type Mood = 'funny' | 'flirty' | 'deep' | 'savage' | 'random' | 'supportive' | 'angry'

interface MoodConfig {
  label: string; emoji: string
  activeBg: string; activeBorder: string; activeText: string; activeGlow: string
  inactiveBorder: string; inactiveText: string
}

interface ChatMessage {
    _id: string;
    sender: "anonymous" | "owner";
    content: string;
    createdAt: Date;
}

const MAX_CHARS = 500
const MAX_CHAT  = 300

const MOODS: Record<Mood, MoodConfig> = {
  funny:      { label:'Funny',      emoji:'😂', activeBg:'rgba(234,179,8,0.12)',  activeBorder:'rgba(234,179,8,0.55)',  activeText:'#facc15', activeGlow:'0 0 18px rgba(234,179,8,0.28)',  inactiveBorder:'rgba(234,179,8,0.2)',  inactiveText:'#a16207' },
  flirty:     { label:'Flirty',     emoji:'😍', activeBg:'rgba(236,72,153,0.12)', activeBorder:'rgba(236,72,153,0.55)', activeText:'#f472b6', activeGlow:'0 0 18px rgba(236,72,153,0.28)', inactiveBorder:'rgba(236,72,153,0.2)', inactiveText:'#9d174d' },
  deep:       { label:'Deep',       emoji:'🌊', activeBg:'rgba(59,130,246,0.12)', activeBorder:'rgba(59,130,246,0.55)', activeText:'#60a5fa', activeGlow:'0 0 18px rgba(59,130,246,0.28)', inactiveBorder:'rgba(59,130,246,0.2)', inactiveText:'#1e40af' },
  savage:     { label:'Savage',     emoji:'🔥', activeBg:'rgba(239,68,68,0.12)',  activeBorder:'rgba(239,68,68,0.55)',  activeText:'#f87171', activeGlow:'0 0 18px rgba(239,68,68,0.28)',  inactiveBorder:'rgba(239,68,68,0.2)',  inactiveText:'#991b1b' },
  random:     { label:'Random',     emoji:'🎲', activeBg:'rgba(139,92,246,0.12)', activeBorder:'rgba(139,92,246,0.55)', activeText:'#a78bfa', activeGlow:'0 0 18px rgba(139,92,246,0.28)', inactiveBorder:'rgba(139,92,246,0.2)', inactiveText:'#5b21b6' },
  supportive: { label:'Supportive', emoji:'🤗', activeBg:'rgba(16,185,129,0.12)', activeBorder:'rgba(16,185,129,0.55)', activeText:'#34d399', activeGlow:'0 0 18px rgba(16,185,129,0.28)', inactiveBorder:'rgba(16,185,129,0.2)', inactiveText:'#065f46' },
  angry:      { label:'Angry',      emoji:'😤', activeBg:'rgba(249,115,22,0.12)', activeBorder:'rgba(249,115,22,0.55)', activeText:'#fb923c', activeGlow:'0 0 18px rgba(249,115,22,0.28)', inactiveBorder:'rgba(249,115,22,0.2)', inactiveText:'#7c2d12' },
}

const PLACEHOLDERS = ['Type something mysterious… 🌙','Send your secret thoughts 👀','What have you been dying to say?','Drop an anonymous vibe ✨']

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; min-height: 100vh; background: #080b10; }

  .f-cormorant { font-family: 'Cormorant Garamond', serif; }
  .f-mono      { font-family: 'DM Mono', monospace; }

  .grid-bg::before {
    content:''; position:fixed; inset:0;
    background-image: linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px);
    background-size:52px 52px; pointer-events:none; z-index:0;
  }

  .grad-text { background:linear-gradient(135deg,#818cf8,#f472b6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .grad-gold { background:linear-gradient(135deg,#fbbf24,#f472b6 60%,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .grad-teal { background:linear-gradient(135deg,#22d3ee,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  .accent-line::before      { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(236,72,153,0.4),transparent); }
  .accent-line-gold::before { content:''; position:absolute; top:0; left:10%; right:10%; height:1px; background:linear-gradient(90deg,transparent,rgba(251,191,36,0.5),rgba(244,114,182,0.35),transparent); }
  .accent-line-teal::before { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(34,211,238,0.55),rgba(129,140,248,0.4),transparent); }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes glowPulse{ 0%,100%{box-shadow:0 0 24px rgba(99,102,241,0.2)} 50%{box-shadow:0 0 48px rgba(99,102,241,0.45),0 0 80px rgba(236,72,153,0.12)} }
  @keyframes msgIn    { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes typeDot  { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

  .anim-0{animation:fadeUp .75s cubic-bezier(.16,1,.3,1) both}
  .anim-1{animation:fadeUp .75s .1s cubic-bezier(.16,1,.3,1) both}
  .anim-2{animation:fadeUp .75s .2s cubic-bezier(.16,1,.3,1) both}
  .anim-3{animation:fadeUp .75s .3s cubic-bezier(.16,1,.3,1) both}
  .anim-4{animation:fadeUp .75s .4s cubic-bezier(.16,1,.3,1) both}

  .spin      { animation:spin .8s linear infinite }
  .floating  { animation:float 4s ease-in-out infinite }
  .glow-pulse{ animation:glowPulse 3s ease-in-out infinite }
  .msg-in    { animation:msgIn .35s cubic-bezier(.16,1,.3,1) both }

  .shimmer-bg {
    background:linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 100%);
    background-size:200% 100%; animation:shimmer 1.6s ease-in-out infinite;
  }

  .msg-area  { resize:none; background:transparent; outline:none; border:none; width:100%; }
  .msg-area::placeholder { color:#1e293b; transition:color .3s; }
  .msg-area:focus::placeholder { color:#334155; }

  .chat-input { resize:none; background:transparent; outline:none; border:none; width:100%; }
  .chat-input::placeholder { color:#1e293b; }

  .sugg-card { transition:transform .2s,border-color .2s,background .2s,box-shadow .2s; cursor:pointer; text-align:left; width:100%; }
  .sugg-card:hover { transform:translateY(-2px); border-color:rgba(99,102,241,.35)!important; background:rgba(99,102,241,.06)!important; box-shadow:0 10px 28px rgba(0,0,0,.35); }

  .typing-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#64748b; animation:typeDot 1.2s ease-in-out infinite; }
  .typing-dot:nth-child(2){ animation-delay:.2s }
  .typing-dot:nth-child(3){ animation-delay:.4s }

  ::-webkit-scrollbar { width:4px }
  ::-webkit-scrollbar-track { background:transparent }
  ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.25); border-radius:2px }

  /* ── Responsive ── */
  .page-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
  @media(max-width:768px){
    .page-grid { grid-template-columns:1fr!important; gap:16px!important; }
    .main-pad  { padding:36px 16px 80px!important; }
    .nav-pad   { padding:0 16px!important; }
    .hero-title{ font-size:clamp(2rem,8vw,3rem)!important; }
  }
`

/* ── Logo ── */
const LogoSvg = ({ size=30 }:{ size?:number }) => (
  <svg viewBox="0 0 72 72" fill="none" width={size} height={size} style={{flexShrink:0}}>
    <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#lg)" opacity=".95"/>
    <polygon points="22,50 14,60 30,50" fill="url(#lg)" opacity=".95"/>
    <defs><linearGradient id="lg" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#ec4899"/></linearGradient></defs>
    <circle cx="28" cy="32" r="3.5" fill="white" opacity=".9"/>
    <circle cx="36" cy="32" r="3.5" fill="white" opacity=".9"/>
    <circle cx="44" cy="32" r="3.5" fill="white" opacity=".9"/>
  </svg>
)

const SkeletonCard = () => (
  <div style={{background:'rgba(15,19,28,.8)',border:'1px solid rgba(99,102,241,.08)',borderRadius:14,padding:'20px 18px'}}>
    <div className="shimmer-bg" style={{height:10,width:'82%',borderRadius:6,marginBottom:12}}/>
    <div className="shimmer-bg" style={{height:10,width:'58%',borderRadius:6,marginBottom:12}}/>
    <div className="shimmer-bg" style={{height:10,width:'38%',borderRadius:6}}/>
  </div>
)

/* ── Anonymous Chat Component ── */
function AnonymousChat({ username }: { username: string }) {
 const socket = useSocket()

const anonymousId = getAnonymousId();
const anonymousName = getAnonymousName();

const [msgs, setMsgs] = useState<any[]>([]);
const [input, setInput] = useState("");
const [sending, setSending] = useState(false);
const [started, setStarted] = useState(false);
const [isTyping, setIsTyping] = useState(false);

const [chatSessionId, setChatSessionId] = useState("");

const inputRef = useRef<HTMLTextAreaElement>(null);
const messagesRef = useRef<HTMLDivElement>(null);



useEffect(() => {
  if (!messagesRef.current) return;

  messagesRef.current.scrollTo({
    top: messagesRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [msgs]);

useEffect(() => {
  if (!socket || !chatSessionId) return;

  const typingHandler = ({
    chatSessionId: roomId,
    sender,
  }: {
    chatSessionId: string;
    sender: "anonymous" | "owner";
  }) => {
    if (roomId !== chatSessionId) return;

    // Anonymous only cares if owner is typing
    if (sender === "owner") {
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  socket.on("typing", typingHandler);

  return () => {
    socket.off("typing", typingHandler);
  };
}, [socket, chatSessionId]);

const fmtTime = (d: Date) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const startChat = async () => {
  try {
    const res = await axios.post("/api/chat-session", {
      ownerUsername: username,
      anonymousId,
      anonymousName,
    });

    const id = res.data.session._id;

    setChatSessionId(id);
    setStarted(true);

    console.log("Created session:", id);
  } catch (err) {
    console.error(err);
    toast.error("Unable to start chat");
  }
};

useEffect(() => {
  if (!chatSessionId) return;

  const fetchMessages = async () => {
    const res = await axios.get(
      `/api/fetchChat-message/${chatSessionId}`
    );

    setMsgs(res.data.messages);
  };

  fetchMessages();
}, [chatSessionId]);

useEffect(() => {
  if (!socket || !chatSessionId) return;

  socket.emit("join-chat", chatSessionId);
  return () => {
    socket.off("new-message");
  };
}, [socket, chatSessionId]);

useEffect(() => {
  if (!socket) return;

  socket.on("new-message", (message) => {
    console.log("Received socket message:", message);
    setMsgs((prev) => {
      const exists = prev.some((m) => m._id === message._id);

      if (exists) return prev;

      const updated = [...prev, message];
        console.log(updated);
        return updated;
    });
  });

  return () => {
    socket.off("new-message");
  };
}, [socket]);

const sendMsg = () => {
    const text = input.trim();

    if (!text) return;

    if (!chatSessionId) {
        toast.error("Chat session not created");
        return;
    }

    if (!socket) return;

    socket.emit("send-message", {
        chatSessionId,
        sender: "anonymous",
        content: text,
    });

    setInput("");
};

const handleKey = (
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMsg();
  }
};
  if (!started) return (
    <div className="accent-line-teal" style={{position:'relative',background:'rgba(15,19,28,.88)',border:'1px solid rgba(34,211,238,.13)',borderRadius:20,padding:'36px 28px',backdropFilter:'blur(24px)',boxShadow:'0 20px 48px rgba(0,0,0,.4)',overflow:'hidden',textAlign:'center'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% -10%,rgba(34,211,238,.04),transparent 65%)',pointerEvents:'none'}}/>
      <div style={{position:'relative'}}>
        <div style={{width:56,height:56,background:'rgba(34,211,238,.08)',border:'1px solid rgba(34,211,238,.2)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 20px'}}>💬</div>
        <h2 className="f-cormorant" style={{fontSize:'clamp(1.5rem,4vw,2rem)',fontWeight:300,color:'#f1f5f9',lineHeight:1.2,marginBottom:10}}>
          Start an <span className="grad-teal" style={{fontStyle:'italic'}}>anonymous</span> conversation
        </h2>
        <p className="f-mono" style={{fontSize:'0.72rem',color:'#748697',letterSpacing:'0.04em',lineHeight:1.7,maxWidth:340,margin:'0 auto 28px'}}>
          Chat freely with <span style={{color:'#818cf8'}}>@{username}</span> without revealing your identity. No sign-up required.
        </p>
        <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10,marginBottom:28}}>
          {[['🕵️','100% Anonymous'],['⚡','Real-time'],['🔒','No sign-up']].map(([icon,label]) => (
            <div key={label} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'rgba(34,211,238,.06)',border:'1px solid rgba(34,211,238,.15)',borderRadius:100,color:'#22d3ee',fontFamily:"'DM Mono',monospace",fontSize:'0.65rem',letterSpacing:'0.08em'}}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
        <button onClick={() => startChat()}
          style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 32px',background:'linear-gradient(135deg,#22d3ee,#818cf8)',border:'none',borderRadius:12,color:'#fff',fontFamily:"'DM Mono',monospace",fontSize:'0.76rem',letterSpacing:'0.1em',cursor:'pointer',boxShadow:'0 4px 20px rgba(34,211,238,.28)',transition:'opacity .2s,transform .15s'}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          Start chatting anonymously
        </button>
      </div>
    </div>
  )

  return (
    <div className="accent-line-teal" style={{position:'relative',background:'rgba(15,19,28,.88)',border:'1px solid rgba(34,211,238,.15)',borderRadius:20,overflow:'hidden',backdropFilter:'blur(24px)',boxShadow:'0 20px 48px rgba(0,0,0,.4)',display:'flex',flexDirection:'column'}}>
      {/* Chat header */}
      <div style={{padding:'18px 22px',borderBottom:'1px solid rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(34,211,238,.04)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:38,height:38,background:'linear-gradient(135deg,#22d3ee,#818cf8)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,boxShadow:'0 4px 12px rgba(34,211,238,.25)'}}>💬</div>
          <div>
            <p className="f-mono" style={{fontSize:'0.78rem',color:'#e2e8f0',letterSpacing:'0.03em'}}>Anonymous Chat</p>
            <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#34d399'}}/>
              <span className="f-mono" style={{fontSize:'0.6rem',color:'#748697',letterSpacing:'0.08em'}}>sending to @{username}</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:'rgba(34,211,238,.06)',border:'1px solid rgba(34,211,238,.15)',borderRadius:100}}>
          <span style={{fontSize:10}}>🕵️</span>
          <span className="f-mono" style={{fontSize:'0.58rem',color:'#22d3ee',letterSpacing:'0.1em'}}>ANONYMOUS</span>
        </div>
      </div>

      {/* Messages area */}
      <div ref={messagesRef} style={{padding:'20px 20px 12px',minHeight:280,maxHeight:380,overflowY:'auto',display:'flex',flexDirection:'column',gap:10}}>
        {msgs.length === 0 && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'32px 16px'}}>
            <div style={{fontSize:32,marginBottom:12}}>👋</div>
            <p className="f-mono" style={{fontSize:'0.72rem',color:'#334155',letterSpacing:'0.06em',lineHeight:1.65}}>
              Say something to <span style={{color:'#818cf8'}}>@{username}</span><br/>they won't know who you are
            </p>
          </div>
        )}

        {msgs.map(msg => (
          <div key={msg._id} className="msg-in"
            style={{display:'flex',justifyContent: msg.sender === "anonymous" ? 'flex-end' : 'flex-start',gap:8,alignItems:'flex-end'}}>
            {msg.sender === "owner" && (
              <div style={{width:28,height:28,background:'linear-gradient(135deg,#22d3ee,#818cf8)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0,marginBottom:2}}>💬</div>
            )}
            <div style={{maxWidth:'75%'}}>
              <div style={{
                padding:'10px 14px',
                borderRadius: msg.sender === "anonymous" ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.sender === "anonymous"
                  ? 'linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))'
                  : 'rgba(34,211,238,.07)',
                border: msg.sender === "anonymous"
                  ? '1px solid rgba(99,102,241,.3)'
                  : '1px solid rgba(34,211,238,.18)',
                boxShadow: msg.sender==='anonymous' ? '0 4px 16px rgba(99,102,241,.15)' : 'none',
              }}>
                <p className="f-mono" style={{fontSize:'0.78rem',color: msg.sender==='anonymous'?'#e2e8f0':'#94a3b8',lineHeight:1.6,letterSpacing:'0.01em'}}>{msg.content}</p>
              </div>
              <p className="f-mono" style={{fontSize:'0.55rem',color:'#748697',letterSpacing:'0.06em',marginTop:4,textAlign: msg.sender==='anonymous'?'right':'left'}}>{fmtTime(msg.createdAt)}</p>
            </div>
            {msg.sender === 'anonymous' && (
              <div style={{width:28,height:28,background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.25)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0,marginBottom:2}}>🕵️</div>
            )}
          </div>
        ))}        


      </div>

      {isTyping && (
          <div className="msg-in" style={{display:'flex',justifyContent:'flex-start',alignItems:'flex-end',gap:8}}>
            <div style={{width:28,height:28,background:'linear-gradient(135deg,#22d3ee,#818cf8)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>💬</div>
            <div style={{padding:'10px 16px',background:'rgba(34,211,238,.07)',border:'1px solid rgba(34,211,238,.18)',borderRadius:'14px 14px 14px 4px',display:'flex',gap:4,alignItems:'center'}}>
              <span className="typing-dot"/>
              <span className="typing-dot"/>
              <span className="typing-dot"/>
            </div>
          </div>
        )}
      {/* Input row */}
      <div style={{padding:'14px 18px 18px',borderTop:'1px solid rgba(255,255,255,.05)',background:'rgba(34,211,238,.02)'}}>
        <div style={{display:'flex',alignItems:'flex-end',gap:10,background:'rgba(15,19,28,.7)',border:`1px solid ${input ? 'rgba(34,211,238,.3)' : 'rgba(255,255,255,.07)'}`,borderRadius:14,padding:'12px 14px',transition:'border-color .25s'}}>
          <textarea
            ref={inputRef}
            className="chat-input f-mono"
            value={input}
            onChange={(e) => {
  setInput(e.target.value.slice(0, MAX_CHAT));

  socket?.emit("typing", {
    chatSessionId,
    sender: "anonymous",
  });
}}
            onKeyDown={handleKey}
            placeholder="Type anonymously… (Enter to send)"
            rows={1}
            style={{fontSize:'0.8rem',color:'#cbd5e1',letterSpacing:'0.02em',lineHeight:1.6,flex:1,maxHeight:120,overflowY:'auto'}}
          />
          <button onClick={sendMsg} disabled={sending || !input.trim()}
            style={{width:36,height:36,borderRadius:10,background: input.trim() ? 'linear-gradient(135deg,#22d3ee,#818cf8)' : 'rgba(255,255,255,.05)',border:'none',cursor: input.trim() ? 'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity: input.trim() ? 1 : 0.4,transition:'all .2s',boxShadow: input.trim() ? '0 4px 14px rgba(34,211,238,.25)' : 'none'}}>
            {sending
              ? <span className="spin" style={{display:'block',width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff'}}/>
              : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={14} height={14} style={{color:'#fff'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                </svg>
            }
          </button>
        </div>
        <p className="f-mono" style={{fontSize:'0.58rem',color:'#1e293b',letterSpacing:'0.08em',textAlign:'center',marginTop:8}}>
          {MAX_CHAT - input.length} chars · your identity is hidden 🕵️
        </p>
      </div>
      
    </div>
  )
}

/* ── Main Page ── */
export default function PublicProfilePage() {
  const params   = useParams()
  const username = params?.username as string

  const [message,    setMessage]    = useState('')
  const [sending,    setSending]    = useState(false)
  const [focused,    setFocused]    = useState(false)
  const [phIdx,      setPhIdx]      = useState(0)
  const [activeMood, setActiveMood] = useState<Mood>('random')
  const [suggestions,setSuggestions]= useState<string[]>([])
  const [loadingAI,  setLoadingAI]  = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3200)
    return () => clearInterval(id)
  }, [])

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Write something first 👀'); textRef.current?.focus(); return }
    setSending(true)
    try {
      await axios.post('/api/send-message', { username, content: message.trim() })
      toast.success('Message sent anonymously ✨')
      setMessage('')
    } catch (err) {
      const e = err as AxiosError<{ message: string }>
      toast.error(e.response?.data?.message || 'Failed to send — try again')
    } finally { setSending(false) }
  }

  const fetchSuggestions = async () => {
    setLoadingAI(true); setHasFetched(true); setSuggestions([])
    try {
      const res = await axios.post('/api/suggest-messages', { mood: activeMood })
      const raw: string = res.data.questions || ''
      setSuggestions(raw.split('||').map((s:string) => s.trim()).filter(Boolean))
    } catch { toast.error('AI is taking a nap 😴 Try again!') }
    finally { setLoadingAI(false) }
  }

  const charsLeft    = MAX_CHARS - message.length
  const charPct      = (message.length / MAX_CHARS) * 100
  const ringColor    = charPct > 90 ? '#f87171' : charPct > 70 ? '#fbbf24' : '#6366f1'
  const circumference = 2 * Math.PI * 14

  return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" style={{minHeight:'100vh',width:'100%',background:'#080b10',fontFamily:"'DM Mono',monospace",position:'relative',overflowX:'hidden'}}>

        {/* Blobs */}
        <div style={{position:'fixed',width:700,height:700,top:-200,left:-200,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 65%)',filter:'blur(100px)',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'fixed',width:500,height:500,bottom:-150,right:-150,borderRadius:'50%',background:'radial-gradient(circle,rgba(236,72,153,.11) 0%,transparent 65%)',filter:'blur(90px)',pointerEvents:'none',zIndex:0}}/>
        <div style={{position:'fixed',width:380,height:380,top:'45%',left:'55%',borderRadius:'50%',background:'radial-gradient(circle,rgba(34,211,238,.06) 0%,transparent 65%)',filter:'blur(80px)',pointerEvents:'none',zIndex:0}}/>

        {/* Navbar */}
        <nav style={{position:'sticky',top:0,zIndex:100,background:'#080b10',borderBottom:'1px solid rgba(99,102,241,.1)'}}>
          <div className="nav-pad" style={{maxWidth:1100,margin:'0 auto',padding:'0 32px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <Link href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
              <LogoSvg size={30}/>
              <span className="f-cormorant" style={{fontSize:'1.5rem',fontWeight:300,letterSpacing:'0.08em',color:'#f1f5f9'}}>
                Whi<span className="grad-text" style={{fontStyle:'italic'}}>spr</span>
              </span>
            </Link>
            <Link
  href="/sign-up"
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: "12px",
    textDecoration: "none",

    border: "1px solid rgba(8, 18, 103, 0.25)",  


    transition: "all .2s ease",

    color: "#e2e8f0",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1rem",
    letterSpacing: ".08em",
    fontWeight: 500,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 12px 40px rgba(99,102,241,.28)";
    e.currentTarget.style.border =
      "1px solid rgba(129,140,248,.45)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 0 0 1px rgba(255,255,255,.03) inset, 0 8px 30px rgba(99,102,241,.18)";
    e.currentTarget.style.border =
      "1px solid rgba(129,140,248,.25)";
  }}
>
  <span>Sign up</span>

  <span
    className="grad-text"
    style={{
      fontStyle: "italic",
      fontWeight: 600,
    }}
  >
    free →
  </span>
</Link>
          </div>
        </nav>

        {/* Main */}
        <main className="main-pad" style={{position:'relative',zIndex:1,maxWidth:1100,margin:'0 auto',padding:'52px 32px 100px'}}>

          {/* Hero */}
          <div className="anim-0" style={{textAlign:'center',marginBottom:44}}>
            <h1 className="f-cormorant hero-title" style={{fontSize:'clamp(2.2rem,6vw,4rem)',fontWeight:300,color:'#f1f5f9',lineHeight:1.1,letterSpacing:'0.01em',marginBottom:14}}>
              Send anonymous vibes <span className="grad-gold" style={{fontStyle:'italic'}}>✨</span>
            </h1>
            <p className="f-mono" style={{fontSize:'0.78rem',color:'#748697',letterSpacing:'0.04em',lineHeight:1.7,maxWidth:380,margin:'0 auto'}}>
              You're sending to{' '}
              <span style={{color:'#818cf8',borderBottom:'1px solid rgba(129,140,248,.35)',paddingBottom:1}}>@{username}</span>
              {' '}— they'll never know it's you
            </p>
          </div>

          {/* Two-column grid */}
          <div className="page-grid">

            {/* LEFT col */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>

              {/* Anonymous Chat */}
              <div className="anim-1 accent-line">
                <AnonymousChat username={username}/>
              </div>

              {/* Message box */}
              <div className="anim-4 accent-line" style={{position:'relative',background:'rgba(15,19,28,.88)',border:`1px solid ${focused?'rgba(99,102,241,.45)':'rgba(99,102,241,.14)'}`,borderRadius:20,padding:'26px 26px 20px',backdropFilter:'blur(24px)',boxShadow:focused?'0 0 0 1px rgba(99,102,241,.12),0 24px 64px rgba(99,102,241,.1)':'0 20px 48px rgba(0,0,0,.4)',transition:'border-color .3s,box-shadow .3s',overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#ec4899)'}}/>
                  <span className="f-mono" style={{fontSize:'0.62rem',letterSpacing:'0.18em',textTransform:'uppercase',color:'#748697'}}>Anonymous message</span>
                </div>
                <textarea ref={textRef} className="msg-area f-mono" value={message}
                  onChange={e=>setMessage(e.target.value.slice(0,MAX_CHARS))}
                  onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
                  placeholder={PLACEHOLDERS[phIdx]} rows={8}
                  style={{fontSize:'0.86rem',color:'#cbd5e1',letterSpacing:'0.02em',lineHeight:1.75}}/>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:16,borderTop:'1px solid rgba(255,255,255,.05)',marginTop:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <svg viewBox="0 0 36 36" width={32} height={32} style={{transform:'rotate(-90deg)'}}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none" stroke={ringColor} strokeWidth="3"
                        strokeDasharray={circumference} strokeDashoffset={circumference*(1-charPct/100)}
                        strokeLinecap="round" style={{transition:'stroke-dashoffset .2s,stroke .3s'}}/>
                    </svg>
                    <span className="f-mono" style={{fontSize:'0.62rem',letterSpacing:'0.08em',color:charPct>90?'#f87171':charPct>70?'#fbbf24':'#334155'}}>{charsLeft}</span>
                  </div>
                  <button onClick={handleSend} disabled={sending||!message.trim()}
                    style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: "12px",
    textDecoration: "none",

    background:
      "linear-gradient(135deg, rgba(99,102,241,.14), rgba(236,72,153,.10))",
    border: "1px solid rgba(129,140,248,.25)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",

    boxShadow:
      "0 0 0 1px rgba(255,255,255,.03) inset, 0 8px 30px rgba(99,102,241,.18)",

    transition: "all .3s ease",

    color: "#e2e8f0",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1rem",
    letterSpacing: ".08em",
    fontWeight: 500,
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow =
      "0 12px 40px rgba(99,102,241,.28)";
    e.currentTarget.style.border =
      "1px solid rgba(129,140,248,.45)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 0 0 1px rgba(255,255,255,.03) inset, 0 8px 30px rgba(99,102,241,.18)";
    e.currentTarget.style.border =
      "1px solid rgba(129,140,248,.25)";
  }}
                    >
                    {sending
                      ? <><span className="spin" style={{display:'block',width:13,height:13,borderRadius:'50%',border:'2px solid rgba(255,255,255,.25)',borderTopColor:'#fff'}}/>Sending…</>
                      : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={13} height={13}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg><span
    className="grad-text"
    style={{
      fontStyle: "italic",
      fontWeight: 600,
    }}
  >
    Send it
  </span></>
                    }
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT col */}
            <div style={{display:'flex',flexDirection:'column',gap:20}}>

              {/* AI Suggestions */}
              <div className="anim-2 accent-line" style={{position:'relative',background:'rgba(15,19,28,.85)',border:'1px solid rgba(99,102,241,.14)',borderRadius:20,padding:'26px',backdropFilter:'blur(24px)',boxShadow:'0 20px 48px rgba(0,0,0,.38)',overflow:'hidden'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:20}}>
                  <div style={{width:36,height:36,background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🤖</div>
                  <div>
                    <p className="f-mono" style={{fontSize:'0.9rem',color:'#cbd5e1',letterSpacing:'0.03em',marginBottom:3}}>Need ideas? Let AI help you</p>
                    <p className="f-mono" style={{fontSize:'0.65rem',color:'#748697',letterSpacing:'0.07em'}}>Pick a vibe and let the AI cook 🔥</p>
                  </div>
                </div>

                {/* Mood pills */}
                <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:18}}>
                  {(Object.entries(MOODS) as [Mood,MoodConfig][]).map(([key,cfg])=>{
                    const on = activeMood===key
                    return (
                      <button key={key} onClick={()=>{setActiveMood(key);setSuggestions([]);setHasFetched(false)}}
                        style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',background:on?cfg.activeBg:'rgba(255,255,255,.02)',border:`1px solid ${on?cfg.activeBorder:cfg.inactiveBorder}`,borderRadius:9,color:on?cfg.activeText:cfg.inactiveText,fontFamily:"'DM Mono',monospace",fontSize:'0.67rem',letterSpacing:'0.04em',cursor:'pointer',boxShadow:on?cfg.activeGlow:'none',transition:'all .2s'}}>
                        <span style={{fontSize:13}}>{cfg.emoji}</span>{cfg.label}
                      </button>
                    )
                  })}
                </div>

                <button onClick={fetchSuggestions} disabled={loadingAI}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'12px',background:'rgba(99,102,241,.09)',border:'1px solid rgba(99,102,241,.22)',borderRadius:11,color:'#818cf8',fontFamily:"'DM Mono',monospace",fontSize:'0.73rem',letterSpacing:'0.09em',cursor:loadingAI?'not-allowed':'pointer',opacity:loadingAI?.55:1,marginBottom:16,transition:'background .2s,border-color .2s,color .2s'}}
                  onMouseEnter={e=>{if(!loadingAI){const b=e.currentTarget as HTMLButtonElement;b.style.background='rgba(99,102,241,.15)';b.style.borderColor='rgba(99,102,241,.4)';b.style.color='#a5b4fc'}}}
                  onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background='rgba(99,102,241,.09)';b.style.borderColor='rgba(99,102,241,.22)';b.style.color='#818cf8'}}>
                  {loadingAI
                    ? <><span className="spin" style={{display:'block',width:13,height:13,borderRadius:'50%',border:'2px solid rgba(129,140,248,.25)',borderTopColor:'#818cf8'}}/>Generating…</>
                    : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={13} height={13}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>Generate {MOODS[activeMood].emoji} suggestions</>
                  }
                </button>

                <div style={{display:'grid',gap:9}}>
                  {loadingAI ? <><SkeletonCard/><SkeletonCard/><SkeletonCard/></>
                  : suggestions.length>0 ? suggestions.map((s,i)=>(
                    <button key={i} className="sugg-card"
                      onClick={()=>{setMessage(s.slice(0,MAX_CHARS));textRef.current?.focus();toast.success('Loaded! Edit or send ✏️')}}
                      style={{background:'rgba(15,19,28,.7)',border:'1px solid rgba(99,102,241,.1)',borderRadius:13,padding:'14px',display:'flex',alignItems:'flex-start',gap:10}}>
                      <span className="f-mono" style={{fontSize:'0.56rem',color:'rgba(99,102,241,.4)',marginTop:2,flexShrink:0}}>0{i+1}</span>
                      <p className="f-mono" style={{fontSize:'0.76rem',color:'#cbd5e1',letterSpacing:'0.02em',lineHeight:1.6,textAlign:'left',flex:1}}>{s}</p>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={12} height={12} style={{color:'#1e293b',flexShrink:0,marginTop:2}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.637c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/>
                      </svg>
                    </button>
                  ))
                  : hasFetched
                    ? <div style={{textAlign:'center',padding:'28px 0',color:'#334155',fontFamily:"'DM Mono',monospace",fontSize:'0.7rem',letterSpacing:'0.08em'}}>Nothing generated — try again ✨</div>
                    : <div style={{textAlign:'center',padding:'36px 20px',border:'1px dashed rgba(255,255,255,.05)',borderRadius:13}}>
                        <div style={{fontSize:32,marginBottom:10}}>🎭</div>
                        <p className="f-mono" style={{fontSize:'0.68rem',color:'#748697',letterSpacing:'0.08em',lineHeight:1.6}}>Pick a mood above<br/>and generate suggestions</p>
                      </div>
                  }
                </div>
              </div>

               {/* CTA card */}
              <div className="anim-3 accent-line-gold" style={{position:'relative',background:'rgba(15,19,28,.85)',border:'1px solid rgba(251,191,36,.13)',borderRadius:20,padding:'28px 26px',backdropFilter:'blur(20px)',boxShadow:'0 20px 48px rgba(0,0,0,.35)',overflow:'hidden',textAlign:'center'}}>
                <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% -10%,rgba(251,191,36,.04),transparent 65%)',pointerEvents:'none'}}/>
                <div style={{position:'relative'}}>
                  <span className="f-mono" style={{display:'inline-block',fontSize:'0.58rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#fbbf24',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.2)',borderRadius:100,padding:'4px 12px',marginBottom:14}}>🌟 Join the community</span>
                  <h2 className="f-cormorant" style={{fontSize:'clamp(1.4rem,3vw,1.85rem)',fontWeight:300,color:'#f1f5f9',lineHeight:1.2,marginBottom:10}}>
                    Want your own <span className="grad-gold" style={{fontStyle:'italic'}}>anonymous inbox?</span>
                  </h2>
                  <p className="f-mono" style={{fontSize:'0.7rem',color:'#475569',letterSpacing:'0.03em',lineHeight:1.7,maxWidth:300,margin:'0 auto 20px'}}>
                    Create your Whispr profile and start receiving honest anonymous messages powered by AI.
                  </p>
                  <div style={{display:'flex',flexDirection:'column',gap:9,alignItems:'center'}}>
                    <Link href="/sign-up" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 28px',width:'100%',maxWidth:240,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:12,color:'#fff',fontFamily:"'DM Mono',monospace",fontSize:'0.72rem',letterSpacing:'0.1em',textDecoration:'none',boxShadow:'0 4px 18px rgba(99,102,241,.3)'}}>Create free account</Link>
                    <Link href="/sign-in" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px 28px',width:'100%',maxWidth:240,background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,color:'#64748b',fontFamily:"'DM Mono',monospace",fontSize:'0.72rem',letterSpacing:'0.1em',textDecoration:'none'}}>Sign in →</Link>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:18}}>
                    <div style={{display:'flex'}}>
                      {['#6366f1','#ec4899','#34d399','#fbbf24'].map((c,i)=>(
                        <div key={i} style={{width:24,height:24,borderRadius:'50%',background:c,border:'2px solid #080b10',marginLeft:i===0?0:-8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>{['😊','🔥','✨','👀'][i]}</div>
                      ))}
                    </div>
                    <span className="f-mono" style={{fontSize:'0.6rem',color:'#334155',letterSpacing:'0.06em'}}>Join students already using Whispr</span>
                  </div>
                </div>
              </div>

              
            </div>
          </div>

          {/* Footer */}
          <div style={{textAlign:'center',marginTop:48}}>
              <p className="f-mono" style={{fontSize:'0.8rem',color:'#748697',letterSpacing:'0.12em'}}>
              Messages are 100% anonymous · powered by <span className="grad-text">Whispr AI</span> · Developed by <a className="grad-text" href="https://abhikhokhar.tech/instagram">Abhi Khokhar</a>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}