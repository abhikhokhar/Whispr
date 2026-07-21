"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useSocket } from "@/context/SocketProvider";


interface ChatSession {
  _id: string;
  anonymousName: string;
  lastMessage: string;
  lastMessageAt: string;
}

interface ChatMessage {
  _id: string;
  chatSessionId: string;
  sender: "anonymous" | "owner";
  content: string;
  createdAt: string;
}

/* ── Helpers ── */
function timeAgo(d: string) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m  = Math.floor(diff / 60000);
  const h  = Math.floor(diff / 3600000);
  const dy = Math.floor(diff / 86400000);
  if (m < 1)  return "now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${dy}d ago`;
}
 
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
 
const GRAD_SETS = [
  { bg: "linear-gradient(135deg,rgba(99,102,241,.22),rgba(34,211,238,.14))",  border: "rgba(34,211,238,.28)",  text: "linear-gradient(135deg,#22d3ee,#818cf8)" },
  { bg: "linear-gradient(135deg,rgba(236,72,153,.2),rgba(139,92,246,.14))",   border: "rgba(236,72,153,.28)",  text: "linear-gradient(135deg,#f472b6,#a78bfa)" },
  { bg: "linear-gradient(135deg,rgba(16,185,129,.2),rgba(59,130,246,.14))",   border: "rgba(16,185,129,.28)",  text: "linear-gradient(135deg,#34d399,#60a5fa)" },
  { bg: "linear-gradient(135deg,rgba(251,191,36,.18),rgba(249,115,22,.14))",  border: "rgba(251,191,36,.26)",  text: "linear-gradient(135deg,#fbbf24,#fb923c)" },
];
 
function avatarSet(name: string) {
  return GRAD_SETS[name.charCodeAt(0) % GRAD_SETS.length];
}

/* ── Logo SVG ── */
const Logo = () => (
  <svg viewBox="0 0 72 72" fill="none" width={26} height={26} style={{ flexShrink: 0 }}>
    <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#cpg)" opacity=".95" />
    <polygon points="22,50 14,60 30,50" fill="url(#cpg)" opacity=".95" />
    <defs>
      <linearGradient id="cpg" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle cx="28" cy="32" r="3.5" fill="white" opacity=".9" />
    <circle cx="36" cy="32" r="3.5" fill="white" opacity=".9" />
    <circle cx="44" cy="32" r="3.5" fill="white" opacity=".9" />
  </svg>
);

function SessItem({ session, active, onClick }: { session: ChatSession; active: boolean; onClick: () => void }) {
  const av = avatarSet(session.anonymousName);
  return (
    <div className={`sess-item${active ? " active" : ""}`} onClick={onClick}>
      <div className="sess-avatar" style={{ background: av.bg, border: `1px solid ${av.border}` }}>
        <span className="sess-avatar-text" style={{ background: av.text, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {getInitials(session.anonymousName)}
        </span>
        <div className="sess-dot" />
      </div>
      <div className="sess-body">
        <div className="sess-name f-m">{session.anonymousName}</div>
        <div className="sess-preview f-m">{session.lastMessage || "No messages yet…"}</div>
      </div>
      <span className="sess-time f-m">{timeAgo(session.lastMessageAt)}</span>
    </div>
  );
}

/* ── Skeleton rows ── */
function Skeletons() {
  return (
    <>
      {[80, 65, 75, 55].map((w, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px" }}>
          <div className="sk" style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="sk" style={{ height: 9, width: `${w}%`, marginBottom: 8 }} />
            <div className="sk" style={{ height: 8, width: `${w + 10 > 95 ? 90 : w + 10}%` }} />
          </div>
          <div className="sk" style={{ height: 7, width: 26 }} />
        </div>
      ))}
    </>
  );
}

/* ── Styles ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; background: #080b10; overflow: hidden; }
 
.f-c { font-family: 'Cormorant Garamond', serif; }
.f-m { font-family: 'DM Mono', monospace; }
 
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,.2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.4); }
 
/* ── Root ── */
.chat-root {
  width: 100vw; height: 100vh;
  background: #080b10;
  display: flex; flex-direction: column;
  font-family: 'DM Mono', monospace;
  position: relative; overflow: hidden;
}
.chat-root::before {
  content: ''; position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,.025) 1px, transparent 1px),
    linear-gradient(90deg,rgba(99,102,241,.025) 1px, transparent 1px);
  background-size: 52px 52px; pointer-events: none; z-index: 0;
}
 
/* Blobs */
.blob { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
.b1 { width: 500px; height: 500px; top: -150px; left: -150px; background: radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 65%); }
.b2 { width: 400px; height: 400px; bottom: -100px; right: -100px; background: radial-gradient(circle,rgba(236,72,153,.08) 0%,transparent 65%); }
 
/* ── Top bar ── */
.top-bar {
  position: relative; z-index: 10; height: 56px; flex-shrink: 0;
  background: #080b10;
  border-bottom: 1px solid rgba(99,102,241,.1);
  display: flex; align-items: center; padding: 0 20px; gap: 12px;
}
.top-bar-logo-text { font-family: 'Cormorant Garamond',serif; font-size: 1.3rem; font-weight: 300; letter-spacing: .08em; color: #f1f5f9; }
.top-bar-logo-text span { background: linear-gradient(135deg,#818cf8,#f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-style: italic; }
.top-bar-badge { font-size: .58rem; letter-spacing: .14em; text-transform: uppercase; color: #6366f1; background: rgba(99,102,241,.1); border: 1px solid rgba(99,102,241,.2); border-radius: 100px; padding: 2px 9px; }
.top-bar-back { display: none; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 9px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); color: #64748b; cursor: pointer; transition: color .2s, border-color .2s; flex-shrink: 0; }
.top-bar-back:hover { color: #818cf8; border-color: rgba(129,140,248,.3); }
.dashboard-btn {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
  border-radius: 9px; color: #475569; font-family: 'DM Mono',monospace;
  font-size: .68rem; letter-spacing: .07em; cursor: pointer;
  transition: color .2s, border-color .2s; white-space: nowrap;
}
.dashboard-btn:hover { color: #818cf8; border-color: rgba(129,140,248,.3); }
 
/* ── Body layout ── */
.chat-body { position: relative; z-index: 1; flex: 1; overflow: hidden; display: flex; }
 
/* ── Sidebar ── */
.sidebar {
  width: 320px; flex-shrink: 0;
  background: rgba(10,13,20,.97);
  border-right: 1px solid rgba(99,102,241,.1);
  display: flex; flex-direction: column;
  height: 100%; overflow: hidden;
  transition: transform .32s cubic-bezier(.16,1,.3,1);
}
 
.sidebar-header {
  flex-shrink: 0; padding: 18px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,.04);
}
.sidebar-header-label { font-size: .62rem; letter-spacing: .2em; text-transform: uppercase; color: #334155; margin-bottom: 3px; }
.sidebar-header-count { font-size: .78rem; color: #818cf8; letter-spacing: .03em; }
 
.sidebar-list { flex: 1; overflow-y: auto; padding: 6px; display: flex; flex-direction: column; gap: 2px; }
 
/* ── Session item ── */
.sess-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; border-radius: 12px; cursor: pointer;
  border: 1px solid transparent; position: relative;
  transition: background .2s, border-color .2s;
}
.sess-item::before {
  content: ''; position: absolute; left: 0; top: 22%; bottom: 22%;
  width: 0; border-radius: 2px;
  background: linear-gradient(180deg,#6366f1,#ec4899);
  transition: width .2s;
}
.sess-item:hover { background: rgba(99,102,241,.06); border-color: rgba(99,102,241,.1); }
.sess-item:hover::before { width: 2px; }
.sess-item.active { background: rgba(99,102,241,.11); border-color: rgba(99,102,241,.22); }
.sess-item.active::before { width: 2px; }
 
.sess-avatar {
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; position: relative;
}
.sess-avatar-text {
  font-family: 'Cormorant Garamond',serif; font-size: 1rem; font-weight: 300;
}
.sess-dot { position: absolute; bottom: -1px; right: -1px; width: 9px; height: 9px; border-radius: 50%; background: #34d399; border: 2px solid #0a0d14; }
 
.sess-body { flex: 1; min-width: 0; }
.sess-name { font-size: .75rem; color: #cbd5e1; letter-spacing: .02em; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sess-preview { font-size: .64rem; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; }
 
.sess-time { font-size: .56rem; color: #1e293b; letter-spacing: .05em; flex-shrink: 0; }
 
/* ── Skeleton ── */
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk {
  background: linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%);
  background-size: 200% 100%; animation: shimmer 1.6s ease-in-out infinite; border-radius: 6px;
}
 
/* ── Right panel ── */
.right-panel {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  height: 100%; overflow: hidden; background: rgba(8,11,16,.55);
}
 
/* Welcome screen */
.welcome-screen {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 48px 32px;
}
.welcome-icon {
  width: 76px; height: 76px; border-radius: 22px;
  background: rgba(99,102,241,.07); border: 1px solid rgba(99,102,241,.14);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 22px;
  box-shadow: 0 0 40px rgba(99,102,241,.08);
}
.welcome-title { font-family: 'Cormorant Garamond',serif; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 300; color: #334155; letter-spacing: .03em; margin-bottom: 10px; }
.welcome-sub { font-size: .7rem; color: #1e293b; letter-spacing: .07em; line-height: 1.75; max-width: 320px; margin: 0 auto 32px; }
.welcome-features { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.welcome-feat {
  display: flex; align-items: center; gap: 6px; padding: 6px 14px;
  background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05);
  border-radius: 100px; font-size: .6rem; color: #334155; letter-spacing: .08em;
}
 
/* Animations */
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

.typing-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#64748b; animation:typeDot 1.2s ease-in-out infinite; }
.typing-dot:nth-child(2){ animation-delay:.2s }
.typing-dot:nth-child(3){ animation-delay:.4s }
::-webkit-scrollbar { width:4px }
::-webkit-scrollbar-track { background:transparent }
::-webkit-scrollbar-thumb { background:rgba(99,102,241,.25); border-radius:2px }
/* Empty + loading states */
.sidebar-empty { text-align: center; padding: 52px 20px; }
.sidebar-empty-icon { font-size: 30px; margin-bottom: 12px; }
.sidebar-empty-text { font-size: .67rem; color: #1e293b; letter-spacing: .06em; line-height: 1.7; }
 
/* ── MOBILE (<= 768px) ── */
@media (max-width: 768px) {
  html, body { overflow: auto; }
  .chat-root { height: 100dvh; }
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 100%; z-index: 50; transform: translateX(-100%); }
  .sidebar.mobile-open { transform: translateX(0); box-shadow: 4px 0 48px rgba(0,0,0,.7); }
  .right-panel { width: 100%; }
  .top-bar-back { display: flex !important; }
  .mobile-menu-btn { display: flex !important; }
}
`;

export default function ChatPage() {
  console.log("THIS IS THE [id] PAGE");
  const params = useParams();
  console.log(params);

const id = params._id as string;

console.log(id);

  const router = useRouter();


  const socket = useSocket();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  bottomRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);



  console.log("Component Rendered");
console.log("socket =", socket);
console.log("id =", id);


// fetch sidebar

useEffect(() => {
  axios.get("/api/ownerchat-sessions").then((res) => {
    const sorted = res.data.sessions.sort(
      (a: ChatSession, b: ChatSession) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );

    setSessions(sorted);
  });
}, []);

// fetch messages

useEffect(() => {
  if (!id) return;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `/api/fetchChat-message/${id}`
      );

      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  fetchMessages();
}, [id]);

// Chat Socket

useEffect(() => {
  if (!socket || !id) return;

  socket.emit("join-chat", id);

  const messageHandler = (message: ChatMessage) => {
    if (message.chatSessionId !== id) return;

    setMessages((prev) => {
      if (prev.some((m) => m._id === message._id)) return prev;
      return [...prev, message];
    });
  };

  socket.on("new-message", messageHandler);

  return () => {
    socket.off("new-message", messageHandler);
  };

  
}, [socket, id]);


// Sidebar Socket

useEffect(() => {
  if (!socket) return;

  const sidebarHandler = (message: ChatMessage) => {
    setSessions((prev) => {
      const chat = prev.find(
        (c) => c._id === message.chatSessionId
      );

      if (!chat) return prev;

      const updatedChat = {
        ...chat,
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
      };

      return [
        updatedChat,
        ...prev.filter((c) => c._id !== message.chatSessionId),
      ];
    });
  };

  socket.on("sidebar-update", sidebarHandler);

  return () => {
    socket.off("sidebar-update", sidebarHandler);
  };
}, [socket]);

// Typing Indicator

useEffect(() => {
  if (!socket) return;

 const typingHandler = ({
  chatSessionId,
  sender,
}: {
  chatSessionId: string;
  sender: "anonymous" | "owner";
}) => {

  console.log("Owner received typing:", {
    chatSessionId,
    sender,
  });

  if (chatSessionId !== id) return;

  if (sender === "anonymous") {
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
}, [socket]);

  
// send

  const send = () => {
    if (!socket || !input.trim()) return;

    socket.emit("send-message", {
      chatSessionId: id,
      sender: "owner",
      content: input,
    });

    setInput("");
  };
  
  const activeSession = sessions.find((chat) => chat._id === id);
const activeAvatar = activeSession
  ? avatarSet(activeSession.anonymousName)
  : null;

  const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
  <>
    <style>{CSS}</style>

    <div className="chat-root">

      <div className="blob b1" />
      <div className="blob b2" />


      <div className="top-bar">
        <button
  className="top-bar-back mobile-menu-btn"
  style={{ display: "none" }}
  onClick={() => setSidebarOpen(true)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    width={15}
    height={15}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
    />
  </svg>
</button>

<Logo />

<span className="top-bar-logo-text f-c">
  Whi<span>spr</span>
</span>

<span className="top-bar-badge f-m">
  Chat
</span>

<div style={{ flex: 1 }} />

<button
  className="dashboard-btn f-m"
  onClick={() => router.push("/dashboard")}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    width={13}
    height={13}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>

  Dashboard
</button>
</div>

<div className="chat-body">
  {sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.55)",
      backdropFilter: "blur(4px)",
      zIndex: 40,
    }}
  />
)}
<div className={`sidebar${sidebarOpen ? " mobile-open" : ""}`}>
  <div className="sidebar-header">

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >

    <div>

      <p className="sidebar-header-label f-m">
        Conversations
      </p>

      <p className="sidebar-header-count f-m">
        {sessions.length} anonymous
      </p>

    </div>

    <button
      onClick={() => setSidebarOpen(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 8,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.07)",
        color: "#475569",
        cursor: "pointer",
      }}
    >
      ✕
    </button>

  </div>

</div>

<div className="sidebar-list">

  {sessions.map((chat) => (

    <SessItem
      key={chat._id}
      session={chat}
      active={chat._id === id}
      onClick={() => {

        router.push(`/chat/${chat._id}`);

        setSidebarOpen(false);

      }}
    />

  ))}

</div>

 </div>

<div className="right-panel">
  <div
  style={{
    height: 72,
    flexShrink: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 28px",
    borderBottom: "1px solid rgba(255,255,255,.05)",
    background: "rgba(8,11,16,.65)",
    backdropFilter: "blur(20px)",
  }}
>

  <div>

   <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
  }}
>
  {activeSession && activeAvatar && (
    <div
      className="sess-avatar"
      style={{
        background: activeAvatar.bg,
        border: `1px solid ${activeAvatar.border}`,
      }}
    >
      <span
        className="sess-avatar-text"
        style={{
          background: activeAvatar.text,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {getInitials(activeSession.anonymousName)}
      </span>

      <div className="sess-dot" />
    </div>
  )}

  <div>
    <p
      className="f-mono"
      style={{
        fontSize: "0.78rem",
        color: "#e2e8f0",
        letterSpacing: "0.03em",
      }}
    >
      {activeSession?.anonymousName || "Anonymous User"}
    </p>

    <p
      style={{
        fontSize: "11px",
        color: "#64748b",
        marginTop: 2,
      }}
    >
      Anonymous User
    </p>
  </div>
</div>



  </div>

</div>

<div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  <div
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  }}
>
 {messages.map((msg) => (
  <div
    key={msg._id}
    className="msg-in"
    style={{
      display: "flex",
      justifyContent:
        msg.sender === "owner" ? "flex-end" : "flex-start",
      gap: 8,
      alignItems: "flex-end",
    }}
  >
    {/* Anonymous Avatar (Left) */}
    {msg.sender === "anonymous" && (
      <div
        style={{
          width: 28,
          height: 28,
          background: "rgba(99,102,241,.15)",
          border: "1px solid rgba(99,102,241,.25)",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          flexShrink: 0,
          marginBottom: 2,
        }}
      >
        🕵️
      </div>
    )}

    <div style={{ maxWidth: "75%" }}>
      <div
        style={{
          padding: "10px 14px",

          borderRadius:
            msg.sender === "owner"
              ? "14px 14px 4px 14px"
              : "14px 14px 14px 4px",

          background:
            msg.sender === "owner"
              ? "linear-gradient(135deg,rgba(99,102,241,.25),rgba(139,92,246,.2))"
              : "rgba(34,211,238,.07)",

          border:
            msg.sender === "owner"
              ? "1px solid rgba(99,102,241,.3)"
              : "1px solid rgba(34,211,238,.18)",

          boxShadow:
            msg.sender === "owner"
              ? "0 4px 16px rgba(99,102,241,.15)"
              : "none",
        }}
      >
        <p
          className="f-mono"
          style={{
            fontSize: "0.78rem",
            color:
              msg.sender === "owner"
                ? "#e2e8f0"
                : "#94a3b8",
            lineHeight: 1.6,
            letterSpacing: "0.01em",
          }}
        >
          {msg.content}
        </p>
      </div>

      <p
        className="f-mono"
        style={{
          fontSize: "0.55rem",
          color: "#1e293b",
          letterSpacing: "0.06em",
          marginTop: 4,
          textAlign:
            msg.sender === "owner"
              ? "right"
              : "left",
        }}
      >
        {fmtTime(msg.createdAt)}
      </p>
    </div>

    {msg.sender === "owner" && (
      <div
        style={{
          width: 28,
          height: 28,
          background:
            "linear-gradient(135deg,#22d3ee,#818cf8)",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          flexShrink: 0,
          marginBottom: 2,
        }}
      >
        💬
      </div>
    )}
  </div>
))}


<div ref={bottomRef} />
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

<div
  style={{
    padding: 22,
    borderTop: "1px solid rgba(255,255,255,.05)",
    background: "rgba(8,11,16,.8)",
    backdropFilter: "blur(20px)",
  }}
>
  <div
  style={{
    display: "flex",
    gap: 14,
    alignItems: "center",
  }}
>
  <input
  value={input}
  placeholder="Type your reply..."

  onChange={(e) => {
    setInput(e.target.value);

    socket?.emit("typing", {
      chatSessionId: id,
      sender: "owner",
    });
  }}

  onKeyDown={(e) => {
    if (e.key === "Enter") send();
  }}

  style={{
    flex: 1,
    height: 52,
    padding: "0 18px",
    borderRadius: 15,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.06)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  }}
/>
<button onClick={send}
            style={{width:36,height:36,borderRadius:10,background: input.trim() ? 'linear-gradient(135deg,#22d3ee,#818cf8)' : 'rgba(255,255,255,.05)',border:'none',cursor: input.trim() ? 'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,opacity: input.trim() ? 1 : 0.4,transition:'all .2s',boxShadow: input.trim() ? '0 4px 14px rgba(34,211,238,.25)' : 'none'}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={14} height={14} style={{color:'#fff'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                </svg>
            
          </button>
</div>
</div>
</div>
</div>
</div>

<style>{`
@media (max-width:768px){
.mobile-menu-btn{
display:flex!important;
}
}
`}</style>

</div>
</>
)};
