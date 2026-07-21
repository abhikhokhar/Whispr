'use client'
import { useSession, signOut } from "next-auth/react"
import { User } from "next-auth"
import Link from "next/link"

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

 .navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #080b10;  /* fully opaque — no bleed-through */
  border-bottom: 1px solid rgba(99,102,241,0.12);
}
  .nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }
  .nav-logo-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem;
    font-weight: 300;
    letter-spacing: 0.08em;
    color: #f1f5f9;
  }
  .nav-logo-text span {
    background: linear-gradient(135deg, #818cf8, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .nav-user {
  font-size: 0.72rem;
  color: #94a3b8;  /* bumped from #475569 to slate-400 — much more readable */
  letter-spacing: 0.08em;
}
  .signout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #64748b;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .signout-btn:hover {
    color: #f87171;
    border-color: rgba(248,113,113,0.3);
    background: rgba(248,113,113,0.05);
  }
`

const Navbar = () => {
  const { data: session } = useSession()
  const user = session?.user as User
  const username = user?.username

  return (
    <>
      <style>{globalStyles}</style>
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/dashboard" className="nav-brand">
            <svg viewBox="0 0 72 72" fill="none" width="32" height="32">
              <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#nav-grad)" opacity="0.95"/>
              <polygon points="22,50 14,60 30,50" fill="url(#nav-grad)" opacity="0.95"/>
              <defs>
                <linearGradient id="nav-grad" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
              <circle cx="28" cy="32" r="3.5" fill="white" opacity="0.9"/>
              <circle cx="36" cy="32" r="3.5" fill="white" opacity="0.9"/>
              <circle cx="44" cy="32" r="3.5" fill="white" opacity="0.9"/>
            </svg>
            <span className="nav-logo-text">Whi<span>spr</span></span>
          </Link>

          <div className="nav-right">
            {session ? (
              <>
                {username && <span className="nav-user">@{username}</span>}
                <button
                  className="signout-btn"
                  onClick={() =>
  signOut({
    redirect: true,
    callbackUrl: `${window.location.origin}/sign-in`,
  })
}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={15} height={15}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/sign-in" className="signout-btn" style={{ textDecoration: 'none' }}>
                Sign in →
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar