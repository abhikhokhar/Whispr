"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/SocketProvider";

interface ChatSession {
  _id: string;
  anonymousId: string;
  anonymousName: string;
  lastMessage: string;
  lastMessageAt: string;
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
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
.anim-0 { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) both; }
.anim-1 { animation: fadeUp .7s .08s cubic-bezier(.16,1,.3,1) both; }
.anim-2 { animation: fadeUp .7s .16s cubic-bezier(.16,1,.3,1) both; }
.anim-3 { animation: fadeUp .7s .24s cubic-bezier(.16,1,.3,1) both; }
.spin   { animation: spin .8s linear infinite; }

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

/* ── Session row ── */
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

/* ── Welcome panel ── */
function WelcomePanel() {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon anim-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} width={36} height={36} style={{ color: "#334155" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <h1 className="welcome-title f-c anim-1">
        Welcome to Anonymous Chats
      </h1>
      <p className="welcome-sub f-m anim-2">
        Select a conversation from the sidebar to start reading and replying to your anonymous visitors.
      </p>
      <div className="welcome-features anim-3">
        {[["🕵️", "100% Anonymous"], ["⚡", "Real-time"], ["🔒", "Secure"], ["✨", "AI Powered"]].map(([icon, label]) => (
          <div key={label} className="welcome-feat f-m">
            <span>{icon}</span>{label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ChatPage() {
  const router = useRouter();
  const socket = useSocket();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── fetch sessions (unchanged logic) ── */
  const fetchSessions = async () => {
    try {
      const res = await axios.get("/api/ownerchat-sessions");
      setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (message: any) => {
      setSessions((prev) => {
        const updated = prev.map((chat) =>
          chat._id === message.chatSessionId
            ? { ...chat, lastMessage: message.content, lastMessageAt: message.createdAt }
            : chat
        );
        updated.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        return [...updated];
      });
    };
    socket.on("sidebar-update", handler);
    return () => {
      socket.off("sidebar-update", handler);
    }
  }, [socket]);

  const handleSelectSession = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false); // close on mobile after picking
    router.push(`/chat/${id}`);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="chat-root">
        <div className="blob b1" /><div className="blob b2" />

        <div className="top-bar">
          <button
            className="top-bar-back mobile-menu-btn"
            style={{ display: "none" }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open conversations"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={15} height={15}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>

          <Logo />
          <span className="top-bar-logo-text f-c">Whi<span>spr</span></span>
          <span className="top-bar-badge f-m">Chat</span>
          <div style={{ flex: 1 }} />
          <button className="dashboard-btn f-m" onClick={() => router.push("/dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="chat-body">

          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 40, backdropFilter: "blur(4px)" }}
            />
          )}

          <div className={`sidebar${sidebarOpen ? " mobile-open" : ""}`}>
            <div className="sidebar-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p className="sidebar-header-label f-m">Conversations</p>
                  <p className="sidebar-header-count f-m">
                    {loading ? "…" : `${sessions.length} anonymous`}
                  </p>
                </div>
                {/* Mobile close */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)", color: "#475569", cursor: "pointer" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="sidebar-list">
              {loading ? (
                <Skeletons />
              ) : sessions.length === 0 ? (
                <div className="sidebar-empty">
                  <div className="sidebar-empty-icon">💬</div>
                  <p className="sidebar-empty-text f-m">
                    No conversations yet.<br />Share your public link to start<br />receiving anonymous chats.
                  </p>
                </div>
              ) : (
                sessions.map((s) => (
                  <SessItem
                    key={s._id}
                    session={s}
                    active={activeId === s._id}
                    onClick={() => handleSelectSession(s._id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="right-panel">
            <WelcomePanel />
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .mobile-menu-btn { display: flex !important; }
          }
        `}</style>
      </div>
    </>
  );
}