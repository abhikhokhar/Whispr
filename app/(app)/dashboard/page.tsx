'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { message } from '@/model/User'
import Navbar from '@/components/navbar'

/* ── Types ── */
interface ChatSession {
  _id: string
  anonymousId: string
  anonymousName: string
  lastMessage: string
  lastMessageAt: string
  createdAt: string
}

/* ── Helpers ── */
function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  return `${days}d ago`
}

const AVATAR_GRADIENTS = [
  ['rgba(99,102,241,0.15)','rgba(34,211,238,0.12)','rgba(34,211,238,0.22)'],
  ['rgba(236,72,153,0.15)','rgba(139,92,246,0.12)','rgba(236,72,153,0.22)'],
  ['rgba(16,185,129,0.15)','rgba(59,130,246,0.12)','rgba(16,185,129,0.22)'],
  ['rgba(251,191,36,0.15)','rgba(249,115,22,0.12)','rgba(251,191,36,0.22)'],
]

function avatarStyle(idx: number) {
  const [bg1, bg2, border] = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
  return { background: `linear-gradient(135deg, ${bg1}, ${bg2})`, border: `1px solid ${border}` }
}

/* ── Logo ── */
const LogoSvg = ({ size = 48 }: { size?: number }) => (
  <svg viewBox="0 0 72 72" fill="none" width={size} height={size}>
    <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#dash-grad)" opacity="0.95"/>
    <polygon points="22,50 14,60 30,50" fill="url(#dash-grad)" opacity="0.95"/>
    <defs>
      <linearGradient id="dash-grad" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <circle cx="28" cy="32" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="36" cy="32" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="44" cy="32" r="3.5" fill="white" opacity="0.9"/>
  </svg>
)

/* ── Dashboard ── */
const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [messages,        setMessages]        = useState<message[]>([])
  const [chatSessions,    setChatSessions]    = useState<ChatSession[]>([])
  const [isAccepting,     setIsAccepting]     = useState(false)
  const [toggleLoading,   setToggleLoading]   = useState(false)
  const [fetchingMessages,setFetchingMessages]= useState(true)
  const [fetchingSessions,setFetchingSessions]= useState(true)
  const [fetchingStatus,  setFetchingStatus]  = useState(true)
  const [copied,          setCopied]          = useState(false)
  const [deletingId,      setDeletingId]      = useState<string | null>(null)

  const username   = session?.user?.username
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${username}` : `/u/${username}`


  const fetchStatus = useCallback(async () => {
    setFetchingStatus(true)
    try {
      const res = await axios.get('/api/accept-messages')
      setIsAccepting(res.data.isAcceptingMessages)
    } catch { toast.error('Could not fetch message status') }
    finally { setFetchingStatus(false) }
  }, [])

  const fetchMessages = useCallback(async () => {
    setFetchingMessages(true)
    try {
      const res = await axios.get('/api/get-messages')
      setMessages(res.data.messages || [])
    } catch { toast.error('Could not fetch messages') }
    finally { setFetchingMessages(false) }
  }, [])

  const fetchChatSessions = useCallback(async () => {
    setFetchingSessions(true)
    try {
      const res = await axios.get('/api/ownerchat-sessions')
      setChatSessions(res.data.sessions || [])
    } catch { toast.error('Could not fetch conversations') }
    finally { setFetchingSessions(false) }
  }, [])

  useEffect(() => {
    if (!session) return
    fetchStatus()
    fetchMessages()
    fetchChatSessions()
  }, [session, fetchStatus, fetchMessages, fetchChatSessions])

  const handleToggle = async () => {
    setToggleLoading(true)
    const newVal = !isAccepting
    setIsAccepting(newVal)
    try {
      const res = await axios.post('/api/accept-messages', { acceptingMessages: newVal })
      toast.success(res.data.message || (newVal ? 'Now accepting messages' : 'Messages paused'))
    } catch (error) {
      setIsAccepting(!newVal)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || 'Failed to update status')
    } finally { setToggleLoading(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await axios.delete(`/api/delete-message/${id}`)
      setMessages(prev => prev.filter((m: any) => m._id !== id))
      toast.success('Message deleted')
    } catch { toast.error('Failed to delete message') }
    finally { setDeletingId(null) }
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  /* ── Loading ── */
  if (status === 'loading') return (
    <>
      <style>{globalStyles}</style>
      <div className="whispr-root">
        <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>
        <div className="page-loader">
          <LogoSvg size={48} />
          <div className="loader-ring"/>
        </div>
      </div>
    </>
  )

  return (
    <>
    <Navbar/>
      <style>{globalStyles}</style>
      <div className="whispr-root">
        <div className="blob blob-1"/><div className="blob blob-2"/><div className="blob blob-3"/>

        <main className="main-content">
           <div className="hero-row">
            <div className="hero-text">
              <p className="hero-label">Dashboard</p>
              <h1 className="hero-title">Your Anonymous<br /><span>Inbox</span></h1>
              <p className="hero-sub">Receive and manage anonymous messages from anyone, anywhere.</p>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-num">{fetchingMessages ? '—' : messages.length}</span>
                <span className="stat-label">Anonymous Messages</span>
              </div>
              <div className="stat-card accent">
                <span className="stat-num">{fetchingSessions ? 'Loading…' : `${chatSessions.length}`}</span>
                <span className="stat-label">Active Conversations</span>
              </div>
            </div>
          </div>

          {/* ── Control cards ── */}
          <div className="control-row" style={{ marginBottom: 36 }}>
            {/* Share link */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                </div>
                <div>
                  <p className="card-title">Your public link</p>
                  <p className="card-sub">Share to receive anonymous messages</p>
                </div>
              </div>
              <div className="link-row">
                <div className="link-box"><span className="link-text">{profileUrl}</span></div>
                <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                  {copied
                    ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={15} height={15}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.637c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>
                  }
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Toggle */}
            <div className="glass-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                </div>
                <div>
                  <p className="card-title">Message intake</p>
                  <p className="card-sub">Control who can reach you</p>
                </div>
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className={`toggle-status-label ${isAccepting ? 'on' : 'off'}`}>
                    {fetchingStatus ? 'Loading...' : isAccepting ? 'Accepting messages' : 'Not accepting'}
                  </span>
                  <span className="toggle-hint">
                    {isAccepting ? 'People can send you anonymous messages' : 'Your inbox is currently closed'}
                  </span>
                </div>
                <button className={`premium-toggle ${isAccepting ? 'active' : ''} ${toggleLoading ? 'loading' : ''}`}
                  onClick={handleToggle} disabled={toggleLoading || fetchingStatus} aria-label="Toggle">
                  <span className="toggle-track">
                    <span className="toggle-thumb">{toggleLoading && <span className="thumb-spinner"/>}</span>
                    <span className="toggle-glow"/>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Chat Sessions ── */}
          <div className="sessions-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Anonymous Conversations</h2>
                <p className="section-sub">
                  {fetchingSessions ? 'Loading…' : `${chatSessions.length} active conversation${chatSessions.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <button className="refresh-btn" onClick={fetchChatSessions} disabled={fetchingSessions}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={14} height={14}
                  style={{ animation: fetchingSessions ? 'spin 1s linear infinite' : 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                Refresh
              </button>
            </div>

            {fetchingSessions ? (
              <div className="skeleton-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-avatar shimmer-sk" style={{ background: 'linear-gradient(90deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 100%)', backgroundSize:'200% 100%', animation:'shimmer 1.6s ease-in-out infinite', borderRadius:14 }}/>
                    <div className="skeleton-body">
                      <div className="skeleton-line long"/>
                      <div className="skeleton-line medium"/>
                      <div className="skeleton-line short"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} width={40} height={40}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                  </svg>
                </div>
                <p className="empty-title">No conversations yet</p>
                <p className="empty-sub">Share your link and anonymous users can start chatting with you</p>
                <button className="empty-copy-btn" onClick={handleCopy}>Copy your link →</button>
              </div>
            ) : (
              <div className="sessions-grid">
                {chatSessions.map((s, idx) => (
                  <div key={s._id} className="session-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                    onClick={() => router.push(`/chat`)}>

                    {/* Avatar */}
                    <div className="session-avatar" style={avatarStyle(idx)}>
                      <span className="session-avatar-initials">{getInitials(s.anonymousName)}</span>
                      <div className="session-online-dot"/>
                    </div>

                    {/* Body */}
                    <div className="session-body">
                      <div className="session-name">
                        {s.anonymousName}
                        <span className="session-badge">anonymous</span>
                      </div>
                      <p className="session-preview">
                        {s.lastMessage ? s.lastMessage : 'No messages yet…'}
                      </p>
                      <span className="session-time">
                        {s.lastMessageAt ? timeAgo(s.lastMessageAt) : timeAgo(s.createdAt)}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="session-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Anonymous Messages ── */}
          <div className="messages-section" style={{ marginTop: 40 }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">Anonymous Messages</h2>
                <p className="section-sub">{messages.length} message{messages.length !== 1 ? 's' : ''} received</p>
              </div>
              <button className="refresh-btn" onClick={fetchMessages} disabled={fetchingMessages}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={14} height={14}
                  style={{ animation: fetchingMessages ? 'spin 1s linear infinite' : 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                Refresh
              </button>
            </div>

            {fetchingMessages ? (
              <div className="skeleton-grid">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card" style={{ display: 'block', padding: 22 }}>
                    <div className="skeleton-line long" style={{ marginBottom: 10 }}/>
                    <div className="skeleton-line medium" style={{ marginBottom: 10 }}/>
                    <div className="skeleton-line short"/>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} width={40} height={40}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
                  </svg>
                </div>
                <p className="empty-title">No messages yet</p>
                <p className="empty-sub">Share your link and start receiving anonymous messages</p>
                <button className="empty-copy-btn" onClick={handleCopy}>Copy your link →</button>
              </div>
            ) : (
              <div className="messages-grid">
                {messages.map((msg: any, idx) => (
                  <div key={msg._id} className="message-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="msg-top-bar"/>
                    <p className="msg-content">{msg.content || msg.message}</p>
                    <div className="msg-footer">
                      <span className="msg-date">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={11} height={11}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {formatDate(msg.createdAt)}
                      </span>
                      <button className="delete-btn" onClick={() => handleDelete(msg._id)} disabled={deletingId === msg._id} aria-label="Delete">
                        {deletingId === msg._id
                          ? <span className="delete-spinner"/>
                          : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={13} height={13}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  )
  
}
/* ── Styles ── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .whispr-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'DM Mono', monospace;
    position: relative;
    overflow-x: hidden;
  }

  .blob { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
  .blob-1 { width: 520px; height: 520px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: -160px; left: -120px; }
  .blob-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%); bottom: -100px; right: -80px; }
  .blob-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%); top: 40%; left: 60%; }

  .whispr-root::before {
    content: ''; position: fixed; inset: 0;
    background-image: linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
    background-size: 48px 48px; pointer-events: none; z-index: 0;
  }

  .main-content { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }

  /* HERO */
  .hero-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 40px;
    flex-wrap: wrap;
    animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hero-label {
    font-size: 0.68rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 10px;
  }
  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 300;
    color: #f1f5f9;
    line-height: 1.1;
    letter-spacing: 0.02em;
    margin-bottom: 12px;
  }
  .hero-title span {
    background: linear-gradient(135deg, #818cf8, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-style: italic;
  }
  .hero-sub {
    font-size: 0.75rem;
    color: #475569;
    letter-spacing: 0.05em;
    line-height: 1.7;
  }
  .stats-row {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }
  .stat-card {
    background: rgba(15,19,28,0.8);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 14px;
    padding: 20px 28px;
    text-align: center;
    backdrop-filter: blur(12px);
    min-width: 100px;
  }
  .stat-card.accent {
    border-color: rgba(236,72,153,0.2);
    background: rgba(236,72,153,0.04);
  }
  .stat-num {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 300;
    color: #f1f5f9;
    line-height: 1;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #475569;
  }

  /* ── CONTROL ROW ── */
  .control-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
  @media (max-width: 700px) { .control-row { grid-template-columns: 1fr; } }

  /* ── GLASS CARD ── */
  .glass-card {
    position: relative; background: rgba(15,19,28,0.85);
    border: 1px solid rgba(99,102,241,0.18); border-radius: 16px; padding: 24px;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset, 0 20px 40px rgba(0,0,0,0.4); overflow: hidden;
  }
  .glass-card::before {
    content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(236,72,153,0.3), transparent);
  }
  .card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
  .card-icon { width: 34px; height: 34px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #818cf8; flex-shrink: 0; }
  .card-title { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.04em; margin-bottom: 3px; }
  .card-sub { font-size: 0.67rem; color: #334155; letter-spacing: 0.06em; }

  /* ── LINK ROW ── */
  .link-row { display: flex; gap: 10px; align-items: center; }
  .link-box { flex: 1; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; overflow: hidden; }
  .link-text { font-size: 0.68rem; color: #475569; letter-spacing: 0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
  .copy-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 9px; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.72rem; letter-spacing: 0.08em; cursor: pointer; white-space: nowrap; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(99,102,241,0.25); }
  .copy-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .copy-btn.copied { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 16px rgba(16,185,129,0.25); }

  /* ── TOGGLE ── */
  .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .toggle-info { flex: 1; }
  .toggle-status-label { display: block; font-size: 0.78rem; letter-spacing: 0.04em; margin-bottom: 4px; transition: color 0.3s; }
  .toggle-status-label.on { color: #34d399; }
  .toggle-status-label.off { color: #f87171; }
  .toggle-hint { font-size: 0.65rem; color: #334155; letter-spacing: 0.05em; line-height: 1.5; }
  .premium-toggle { background: none; border: none; cursor: pointer; padding: 0; flex-shrink: 0; }
  .premium-toggle:disabled { cursor: not-allowed; opacity: 0.6; }
  .toggle-track { position: relative; display: block; width: 60px; height: 32px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; transition: background 0.35s, border-color 0.35s, box-shadow 0.35s; overflow: hidden; }
  .premium-toggle.active .toggle-track { background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4)); border-color: rgba(99,102,241,0.5); box-shadow: 0 0 20px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.15); }
  .toggle-glow { position: absolute; inset: 0; background: linear-gradient(135deg, #6366f1, #ec4899); opacity: 0; transition: opacity 0.35s; border-radius: 100px; }
  .premium-toggle.active .toggle-glow { opacity: 0.15; }
  .toggle-thumb { position: absolute; top: 3px; left: 3px; width: 24px; height: 24px; background: #fff; border-radius: 50%; transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.35s, box-shadow 0.35s; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; }
  .premium-toggle.active .toggle-thumb { transform: translateX(28px); background: linear-gradient(135deg, #818cf8, #f472b6); box-shadow: 0 2px 12px rgba(99,102,241,0.5); }
  .thumb-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(99,102,241,0.3); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.7s linear infinite; display: block; }
  .premium-toggle.active .thumb-spinner { border-color: rgba(255,255,255,0.3); border-top-color: #fff; }

  /* ── SESSIONS SECTION ── */
  .sessions-section { animation: fadeUp 0.7s 0.05s cubic-bezier(0.16,1,0.3,1) both; margin-bottom: 40px; }
  .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 300; color: #e2e8f0; letter-spacing: 0.04em; margin-bottom: 4px; }
  .section-sub { font-size: 0.68rem; color: #334155; letter-spacing: 0.08em; }
  .refresh-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; color: #475569; font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .refresh-btn:hover { color: #818cf8; border-color: rgba(129,140,248,0.3); }
  .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── SESSION CARDS ── */
  .sessions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  @media (max-width: 600px) { .sessions-grid { grid-template-columns: 1fr; } }

  .session-card {
    position: relative; background: rgba(15,19,28,0.85);
    border: 1px solid rgba(99,102,241,0.12); border-radius: 16px; padding: 20px;
    backdrop-filter: blur(12px); cursor: pointer; overflow: hidden;
    transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s, background 0.2s;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
    display: flex; align-items: center; gap: 16px;
  }
  .session-card::before {
    content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(34,211,238,0.35), rgba(99,102,241,0.25), transparent);
    transition: opacity 0.25s;
  }
  .session-card:hover { border-color: rgba(34,211,238,0.3); transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(34,211,238,0.08); background: rgba(15,19,28,0.95); }
  .session-card:hover .session-arrow { opacity: 1; transform: translateX(0); }

  .session-avatar {
    width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 400; position: relative;
    background: linear-gradient(135deg, rgba(34,211,238,0.12), rgba(99,102,241,0.12));
    border: 1px solid rgba(34,211,238,0.2);
  }
  .session-avatar-initials {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 300; letter-spacing: 0.04em;
    background: linear-gradient(135deg, #22d3ee, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .session-online-dot {
    position: absolute; bottom: -2px; right: -2px;
    width: 10px; height: 10px; border-radius: 50%;
    background: #34d399; border: 2px solid #080b10;
  }

  .session-body { flex: 1; min-width: 0; }
  .session-name { font-size: 0.82rem; color: #cbd5e1; letter-spacing: 0.04em; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
  .session-badge { font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase; color: #22d3ee; background: rgba(34,211,238,0.08); border: 1px solid rgba(34,211,238,0.18); border-radius: 100px; padding: 2px 7px; }
  .session-preview { font-size: 0.7rem; color: #475569; letter-spacing: 0.02em; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
  .session-time { font-size: 0.6rem; color: #1e293b; letter-spacing: 0.08em; }

  .session-arrow { opacity: 0; transform: translateX(-4px); transition: opacity 0.2s, transform 0.2s; color: #22d3ee; flex-shrink: 0; }

  /* ── MESSAGES SECTION ── */
  .messages-section { animation: fadeUp 0.7s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
  .messages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .message-card { position: relative; background: rgba(15,19,28,0.85); border: 1px solid rgba(99,102,241,0.14); border-radius: 14px; padding: 20px; backdrop-filter: blur(12px); transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; overflow: hidden; }
  .message-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1); }
  .msg-top-bar { position: absolute; top: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), rgba(236,72,153,0.3), transparent); }
  .msg-content { font-size: 0.82rem; color: #cbd5e1; line-height: 1.7; letter-spacing: 0.02em; margin-bottom: 16px; word-break: break-word; }
  .msg-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 12px; }
  .msg-date { display: flex; align-items: center; gap: 5px; font-size: 0.62rem; color: #334155; letter-spacing: 0.05em; }
  .delete-btn { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background: rgba(248,113,113,0.06); border: 1px solid rgba(248,113,113,0.12); border-radius: 7px; color: #64748b; cursor: pointer; transition: color 0.2s, background 0.2s, border-color 0.2s; }
  .delete-btn:hover { color: #f87171; background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); }
  .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .delete-spinner { width: 10px; height: 10px; border: 1.5px solid rgba(248,113,113,0.3); border-top-color: #f87171; border-radius: 50%; animation: spin 0.7s linear infinite; display: block; }

  /* ── SKELETON ── */
  .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .skeleton-card { background: rgba(15,19,28,0.8); border: 1px solid rgba(99,102,241,0.1); border-radius: 14px; padding: 22px; display: flex; align-items: center; gap: 14px; }
  .skeleton-avatar { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; }
  .skeleton-body { flex: 1; }
  .skeleton-line { height: 9px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%); background-size: 200% 100%; border-radius: 5px; margin-bottom: 9px; animation: shimmer 1.6s ease-in-out infinite; }
  .skeleton-line.long { width: 70%; }
  .skeleton-line.medium { width: 50%; }
  .skeleton-line.short { width: 35%; margin-bottom: 0; }

  /* ── EMPTY ── */
  .empty-state { text-align: center; padding: 64px 24px; background: rgba(15,19,28,0.6); border: 1px solid rgba(99,102,241,0.1); border-radius: 16px; }
  .empty-icon { width: 72px; height: 72px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #475569; }
  .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300; color: #cbd5e1; margin-bottom: 8px; }
  .empty-sub { font-size: 0.7rem; color: #334155; letter-spacing: 0.06em; margin-bottom: 24px; line-height: 1.7; }
  .empty-copy-btn { padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 8px; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.72rem; letter-spacing: 0.1em; cursor: pointer; box-shadow: 0 4px 16px rgba(99,102,241,0.25); transition: transform 0.15s, opacity 0.2s; }
  .empty-copy-btn:hover { transform: translateY(-1px); opacity: 0.9; }

  /* ── PAGE LOADER ── */
  .page-loader { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
  .loader-ring { width: 48px; height: 48px; border: 1.5px solid rgba(99,102,241,0.15); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; position: absolute; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .main-content { padding: 32px 16px 60px; }
    .messages-grid { grid-template-columns: 1fr; }
    .skeleton-grid { grid-template-columns: 1fr; }
    .link-row { flex-direction: column; }
    .copy-btn { width: 100%; justify-content: center; }
  }
`

export default Dashboard