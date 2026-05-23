'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import Link from 'next/link'

/* ─── Types ───────────────────────────────────────────────── */
type Mood = 'funny' | 'flirty' | 'deep' | 'savage' | 'random' | 'supportive' | 'angry'

interface MoodConfig {
  label: string
  emoji: string
  activeBg: string
  activeBorder: string
  activeText: string
  activeGlow: string
  inactiveBorder: string
  inactiveText: string
}

/* ─── Constants ───────────────────────────────────────────── */
const MAX_CHARS = 500

const MOODS: Record<Mood, MoodConfig> = {
  funny:      { label: 'Funny',      emoji: '😂', activeBg: 'rgba(234,179,8,0.12)',    activeBorder: 'rgba(234,179,8,0.55)',    activeText: '#facc15', activeGlow: '0 0 18px rgba(234,179,8,0.28)',    inactiveBorder: 'rgba(234,179,8,0.2)',   inactiveText: '#a16207' },
  flirty:     { label: 'Flirty',     emoji: '😍', activeBg: 'rgba(236,72,153,0.12)',   activeBorder: 'rgba(236,72,153,0.55)',   activeText: '#f472b6', activeGlow: '0 0 18px rgba(236,72,153,0.28)',   inactiveBorder: 'rgba(236,72,153,0.2)',  inactiveText: '#9d174d' },
  deep:       { label: 'Deep',       emoji: '🌊', activeBg: 'rgba(59,130,246,0.12)',   activeBorder: 'rgba(59,130,246,0.55)',   activeText: '#60a5fa', activeGlow: '0 0 18px rgba(59,130,246,0.28)',   inactiveBorder: 'rgba(59,130,246,0.2)',  inactiveText: '#1e40af' },
  savage:     { label: 'Savage',     emoji: '🔥', activeBg: 'rgba(239,68,68,0.12)',    activeBorder: 'rgba(239,68,68,0.55)',    activeText: '#f87171', activeGlow: '0 0 18px rgba(239,68,68,0.28)',    inactiveBorder: 'rgba(239,68,68,0.2)',   inactiveText: '#991b1b' },
  random:     { label: 'Random',     emoji: '🎲', activeBg: 'rgba(139,92,246,0.12)',   activeBorder: 'rgba(139,92,246,0.55)',   activeText: '#a78bfa', activeGlow: '0 0 18px rgba(139,92,246,0.28)',   inactiveBorder: 'rgba(139,92,246,0.2)',  inactiveText: '#5b21b6' },
  supportive: { label: 'Supportive', emoji: '🤗', activeBg: 'rgba(16,185,129,0.12)',   activeBorder: 'rgba(16,185,129,0.55)',   activeText: '#34d399', activeGlow: '0 0 18px rgba(16,185,129,0.28)',   inactiveBorder: 'rgba(16,185,129,0.2)',  inactiveText: '#065f46' },
  angry:      { label: 'Angry',      emoji: '😤', activeBg: 'rgba(249,115,22,0.12)',   activeBorder: 'rgba(249,115,22,0.55)',   activeText: '#fb923c', activeGlow: '0 0 18px rgba(249,115,22,0.28)',   inactiveBorder: 'rgba(249,115,22,0.2)',  inactiveText: '#7c2d12' },
}

const PLACEHOLDERS = [
  'Type something mysterious… 🌙',
  'Send your secret thoughts 👀',
  'What have you been dying to say?',
  'Drop an anonymous vibe ✨',
]

/* ─── Minimal CSS ─────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body { width: 100%; min-height: 100vh; background: #080b10; }

  .f-cormorant { font-family: 'Cormorant Garamond', serif; }
  .f-mono      { font-family: 'DM Mono', monospace; }

  /* Grid texture */
  .grid-bg::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
    background-size: 52px 52px;
    pointer-events: none; z-index: 0;
  }

  /* Gradient text */
  .grad-text {
    background: linear-gradient(135deg, #818cf8, #f472b6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .grad-gold {
    background: linear-gradient(135deg, #fbbf24, #f472b6 60%, #818cf8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* Card top accent line */
  .accent-line::before {
    content: '';
    position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(236,72,153,0.4), transparent);
  }
  .accent-line-gold::before {
    content: '';
    position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(251,191,36,0.5), rgba(244,114,182,0.35), transparent);
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 24px rgba(99,102,241,0.2); }
    50%       { box-shadow: 0 0 48px rgba(99,102,241,0.45), 0 0 80px rgba(236,72,153,0.12); }
  }

  .anim-0 { animation: fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-1 { animation: fadeUp 0.75s 0.1s  cubic-bezier(0.16,1,0.3,1) both; }
  .anim-2 { animation: fadeUp 0.75s 0.2s  cubic-bezier(0.16,1,0.3,1) both; }
  .anim-3 { animation: fadeUp 0.75s 0.3s  cubic-bezier(0.16,1,0.3,1) both; }

  .spin     { animation: spin 0.8s linear infinite; }
  .floating { animation: float 4s ease-in-out infinite; }
  .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }

  .shimmer-bg {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
  }

  /* Textarea */
  .msg-area { resize: none; background: transparent; outline: none; border: none; width: 100%; }
  .msg-area::placeholder { color: #1e293b; transition: color 0.3s; }
  .msg-area:focus::placeholder { color: #334155; }

  /* Suggestion card hover */
  .sugg-card {
    transition: transform 0.2s, border-color 0.2s, background 0.2s, box-shadow 0.2s;
    cursor: pointer; text-align: left; width: 100%;
  }
  .sugg-card:hover {
    transform: translateY(-2px);
    border-color: rgba(99,102,241,0.35) !important;
    background: rgba(99,102,241,0.06) !important;
    box-shadow: 0 10px 28px rgba(0,0,0,0.35);
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 2px; }
`

/* ─── Sub-components ──────────────────────────────────────── */
const LogoSvg = ({ size = 30 }: { size?: number }) => (
  <svg viewBox="0 0 72 72" fill="none" width={size} height={size} style={{ flexShrink: 0 }}>
    <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#lg)" opacity="0.95"/>
    <polygon points="22,50 14,60 30,50" fill="url(#lg)" opacity="0.95"/>
    <defs>
      <linearGradient id="lg" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#ec4899"/>
      </linearGradient>
    </defs>
    <circle cx="28" cy="32" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="36" cy="32" r="3.5" fill="white" opacity="0.9"/>
    <circle cx="44" cy="32" r="3.5" fill="white" opacity="0.9"/>
  </svg>
)

const SkeletonCard = () => (
  <div style={{ background: 'rgba(15,19,28,0.8)', border: '1px solid rgba(99,102,241,0.08)', borderRadius: 14, padding: '20px 18px' }}>
    <div className="shimmer-bg" style={{ height: 10, width: '82%', borderRadius: 6, marginBottom: 12 }} />
    <div className="shimmer-bg" style={{ height: 10, width: '58%', borderRadius: 6, marginBottom: 12 }} />
    <div className="shimmer-bg" style={{ height: 10, width: '38%', borderRadius: 6 }} />
  </div>
)

/* ─── Page ────────────────────────────────────────────────── */
export default function PublicProfilePage() {
  const params   = useParams()
  const username = params?.username as string

  const [message,     setMessage]     = useState('')
  const [sending,     setSending]     = useState(false)
  const [focused,     setFocused]     = useState(false)
  const [phIdx,       setPhIdx]       = useState(0)

  const [activeMood,  setActiveMood]  = useState<Mood>('random')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingAI,   setLoadingAI]   = useState(false)
  const [hasFetched,  setHasFetched]  = useState(false)

  const textRef = useRef<HTMLTextAreaElement>(null)

  /* Rotate placeholder */
  useEffect(() => {
    const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3200)
    return () => clearInterval(id)
  }, [])

  /* Send message */
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

  /* Fetch AI suggestions */
  const fetchSuggestions = async () => {
    setLoadingAI(true); setHasFetched(true); setSuggestions([])
    try {
      const res = await axios.post('/api/suggest-messages', { mood: activeMood })
      const raw: string = res.data.questions || ''
      setSuggestions(raw.split('||').map((s: string) => s.trim()).filter(Boolean))
    } catch { toast.error('AI is taking a nap 😴 Try again!') }
    finally { setLoadingAI(false) }
  }

  const charsLeft = MAX_CHARS - message.length
  const charPct   = (message.length / MAX_CHARS) * 100
  const ringColor = charPct > 90 ? '#f87171' : charPct > 70 ? '#fbbf24' : '#6366f1'
  const circumference = 2 * Math.PI * 14

  return (
    <>
      <style>{styles}</style>

      <div className="grid-bg" style={{ minHeight: '100vh', width: '100%', background: '#080b10', fontFamily: "'DM Mono', monospace", position: 'relative', overflowX: 'hidden' }}>

        {/* Blobs */}
        <div style={{ position: 'fixed', width: 700, height: 700, top: -200, left: -200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 500, height: 500, bottom: -150, right: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.11) 0%, transparent 65%)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', width: 380, height: 380, top: '45%', left: '55%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

        {/* ── Navbar ── */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: '#080b10', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <LogoSvg size={30} />
              <span className="f-cormorant" style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', color: '#f1f5f9' }}>
                Whi<span className="grad-text" style={{ fontStyle: 'italic' }}>spr</span>
              </span>
            </Link>
            <Link href="/sign-up" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.1em', textDecoration: 'none', boxShadow: '0 4px 18px rgba(99,102,241,0.32)', transition: 'opacity 0.2s' }}>
              Sign up free →
            </Link>
          </div>
        </nav>

        {/* ── Main ── */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '60px 32px 100px' }}>

          {/* ── Hero ── */}
          <div className="anim-0" style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="floating" style={{ display: 'inline-block', marginBottom: 20 }}>
              <div className="glow-pulse" style={{ borderRadius: '50%', display: 'inline-block' }}>
                <LogoSvg size={60} />
              </div>
            </div>
            <h1 className="f-cormorant" style={{ fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 300, color: '#f1f5f9', lineHeight: 1.08, letterSpacing: '0.01em', marginBottom: 16 }}>
              Send anonymous vibes{' '}
              <span className="grad-gold" style={{ fontStyle: 'italic' }}>✨</span>
            </h1>
            <p className="f-mono" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.04em', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
              You're sending to{' '}
              <span style={{ color: '#818cf8', borderBottom: '1px solid rgba(129,140,248,0.35)', paddingBottom: 1 }}>@{username}</span>
              {' '}— they'll never know it's you
            </p>
          </div>

          {/* ── Two-column layout on desktop ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* LEFT — Message box */}
            <div className="anim-1">
              <div
                className="accent-line"
                style={{
                  position: 'relative',
                  background: 'rgba(15,19,28,0.88)',
                  border: `1px solid ${focused ? 'rgba(99,102,241,0.45)' : 'rgba(99,102,241,0.14)'}`,
                  borderRadius: 20,
                  padding: '28px 28px 22px',
                  backdropFilter: 'blur(24px)',
                  boxShadow: focused
                    ? '0 0 0 1px rgba(99,102,241,0.12), 0 24px 64px rgba(99,102,241,0.1)'
                    : '0 20px 48px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  overflow: 'hidden',
                }}
              >
                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
                  <span className="f-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#475569' }}>
                    Anonymous message
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textRef}
                  className="msg-area f-mono"
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, MAX_CHARS))}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={PLACEHOLDERS[phIdx]}
                  rows={9}
                  style={{ fontSize: '0.88rem', color: '#cbd5e1', letterSpacing: '0.02em', lineHeight: 1.75 }}
                />

                {/* Bottom bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8 }}>
                  {/* Char ring */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg viewBox="0 0 36 36" width={34} height={34} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="14" fill="none"
                        stroke={ringColor}
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - charPct / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.2s, stroke 0.3s' }}
                      />
                    </svg>
                    <span className="f-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: charPct > 90 ? '#f87171' : charPct > 70 ? '#fbbf24' : '#334155' }}>
                      {charsLeft}
                    </span>
                  </div>

                  {/* Send button */}
                  <button
                    onClick={handleSend}
                    disabled={sending || !message.trim()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '11px 24px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6 50%, #ec4899)',
                      border: 'none', borderRadius: 12,
                      color: '#fff', fontFamily: "'DM Mono', monospace",
                      fontSize: '0.75rem', letterSpacing: '0.1em',
                      cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                      opacity: sending || !message.trim() ? 0.45 : 1,
                      boxShadow: '0 4px 20px rgba(99,102,241,0.32)',
                      transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { if (!sending && message.trim()) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(99,102,241,0.45)' }}}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(99,102,241,0.32)' }}
                  >
                    {sending ? (
                      <>
                        <span className="spin" style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff' }} />
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} width={14} height={14}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send it ✨
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CTA card below message box */}
              <div className="anim-3 accent-line-gold" style={{ position: 'relative', marginTop: 20, background: 'rgba(15,19,28,0.85)', border: '1px solid rgba(251,191,36,0.13)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 48px rgba(0,0,0,0.35)', overflow: 'hidden', textAlign: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -10%, rgba(251,191,36,0.04), transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <span className="f-mono" style={{ display: 'inline-block', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 100, padding: '4px 12px', marginBottom: 16 }}>
                    🌟 Join the community
                  </span>
                  <h2 className="f-cormorant" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 300, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 10 }}>
                    Want your own{' '}
                    <span className="grad-gold" style={{ fontStyle: 'italic' }}>anonymous inbox?</span>
                  </h2>
                  <p className="f-mono" style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.04em', lineHeight: 1.7, marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
                    Create your Whispr profile and start receiving honest anonymous messages powered by AI.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    <Link href="/sign-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 28px', width: '100%', maxWidth: 260, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.1em', textDecoration: 'none', boxShadow: '0 4px 18px rgba(99,102,241,0.3)' }}>
                      Create free account
                    </Link>
                    <Link href="/sign-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 28px', width: '100%', maxWidth: 260, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#64748b', fontFamily: "'DM Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.1em', textDecoration: 'none' }}>
                      Sign in →
                    </Link>
                  </div>
                  {/* Social proof */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
                    <div style={{ display: 'flex' }}>
                      {['#6366f1','#ec4899','#34d399','#fbbf24'].map((c, i) => (
                        <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid #080b10', marginLeft: i === 0 ? 0 : -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                          {['😊','🔥','✨','👀'][i]}
                        </div>
                      ))}
                    </div>
                    <span className="f-mono" style={{ fontSize: '0.62rem', color: '#334155', letterSpacing: '0.06em' }}>
                      Join students already using Whispr
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — AI Suggestions */}
            <div className="anim-2">
              <div className="accent-line" style={{ position: 'relative', background: 'rgba(15,19,28,0.85)', border: '1px solid rgba(99,102,241,0.14)', borderRadius: 20, padding: '28px', backdropFilter: 'blur(24px)', boxShadow: '0 20px 48px rgba(0,0,0,0.38)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 38, height: 38, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🤖</div>
                  <div>
                    <p className="f-mono" style={{ fontSize: '0.84rem', color: '#cbd5e1', letterSpacing: '0.03em', marginBottom: 4 }}>Need ideas? Let AI help you</p>
                    <p className="f-mono" style={{ fontSize: '0.67rem', color: '#334155', letterSpacing: '0.07em' }}>Pick a vibe and let the AI cook 🔥</p>
                  </div>
                </div>

                {/* Mood pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {(Object.entries(MOODS) as [Mood, MoodConfig][]).map(([key, cfg]) => {
                    const isActive = activeMood === key
                    return (
                      <button key={key} onClick={() => { setActiveMood(key); setSuggestions([]); setHasFetched(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px',
                          background: isActive ? cfg.activeBg : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isActive ? cfg.activeBorder : cfg.inactiveBorder}`,
                          borderRadius: 10,
                          color: isActive ? cfg.activeText : cfg.inactiveText,
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '0.69rem', letterSpacing: '0.05em',
                          cursor: 'pointer',
                          boxShadow: isActive ? cfg.activeGlow : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>

                {/* Generate button */}
                <button
                  onClick={fetchSuggestions}
                  disabled={loadingAI}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    width: '100%', padding: '13px',
                    background: 'rgba(99,102,241,0.09)',
                    border: '1px solid rgba(99,102,241,0.22)',
                    borderRadius: 12,
                    color: '#818cf8', fontFamily: "'DM Mono', monospace",
                    fontSize: '0.75rem', letterSpacing: '0.1em',
                    cursor: loadingAI ? 'not-allowed' : 'pointer',
                    opacity: loadingAI ? 0.55 : 1,
                    marginBottom: 20,
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { if (!loadingAI) { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(99,102,241,0.15)'; b.style.borderColor = 'rgba(99,102,241,0.4)'; b.style.color = '#a5b4fc' }}}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(99,102,241,0.09)'; b.style.borderColor = 'rgba(99,102,241,0.22)'; b.style.color = '#818cf8' }}
                >
                  {loadingAI ? (
                    <>
                      <span className="spin" style={{ display: 'block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(129,140,248,0.25)', borderTopColor: '#818cf8' }} />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Generate {MOODS[activeMood].emoji} suggestions
                    </>
                  )}
                </button>

                {/* Suggestions list */}
                <div style={{ display: 'grid', gap: 10 }}>
                  {loadingAI ? (
                    <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((s, i) => (
                      <button key={i} className="sugg-card"
                        onClick={() => { setMessage(s.slice(0, MAX_CHARS)); textRef.current?.focus(); toast.success('Loaded! Edit or send ✏️') }}
                        style={{ background: 'rgba(15,19,28,0.7)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 14, padding: '16px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}
                      >
                        <span className="f-mono" style={{ fontSize: '0.58rem', color: 'rgba(99,102,241,0.4)', marginTop: 2, flexShrink: 0 }}>0{i+1}</span>
                        <p className="f-mono" style={{ fontSize: '0.78rem', color: '#94a3b8', letterSpacing: '0.02em', lineHeight: 1.65, textAlign: 'left', flex: 1 }}>{s}</p>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={13} height={13} style={{ color: '#1e293b', flexShrink: 0, marginTop: 2 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.637c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </button>
                    ))
                  ) : hasFetched ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#334155', fontFamily: "'DM Mono',monospace", fontSize: '0.72rem', letterSpacing: '0.08em' }}>
                      Nothing generated — try again ✨
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 14 }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>🎭</div>
                      <p className="f-mono" style={{ fontSize: '0.7rem', color: '#1e293b', letterSpacing: '0.08em', lineHeight: 1.6 }}>
                        Pick a mood above<br />and generate suggestions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>{/* end grid */}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <p className="f-mono" style={{ fontSize: '0.62rem', color: '#1e293b', letterSpacing: '0.12em' }}>
              Messages are 100% anonymous · powered by{' '}
              <span className="grad-text">Whispr AI</span>
            </p>
          </div>

        </main>

        {/* Mobile responsive override */}
        <style>{`
          @media (max-width: 768px) {
            .two-col { grid-template-columns: 1fr !important; }
            main { padding: 40px 18px 80px !important; }
            nav > div { padding: 0 18px !important; }
          }
        `}</style>

      </div>
    </>
  )
}