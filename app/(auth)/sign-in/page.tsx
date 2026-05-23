'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'

const SignInPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    }
  })

  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    const result = await signIn('credentials',{
      identifier: data.identifier,
      password: data.password,
      redirect: false,
    })
    if(result?.error){
      toast.error(result.error)
    }else{
      toast.success("Signed in successfully!")
    }
    if(result?.url){
      router.push('/dashboard')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .whispr-root {
          min-height: 100vh;
          background: #080b10;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .blob-1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          top: -120px; left: -100px;
        }
        .blob-2 {
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%);
          bottom: -80px; right: -60px;
        }
        .blob-3 {
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .whispr-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 440px;
          margin: 2rem;
          background: rgba(15, 19, 28, 0.85);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          padding: 48px 44px 44px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 40px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(99,102,241,0.06);
          animation: cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 20%; right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(236,72,153,0.6), transparent);
          border-radius: 0 0 4px 4px;
        }

        .corner-tl, .corner-br {
          position: absolute;
          width: 20px; height: 20px;
          pointer-events: none;
        }
        .corner-tl {
          top: -1px; left: -1px;
          border-top: 2px solid #6366f1;
          border-left: 2px solid #6366f1;
          border-radius: 20px 0 0 0;
        }
        .corner-br {
          bottom: -1px; right: -1px;
          border-bottom: 2px solid #ec4899;
          border-right: 2px solid #ec4899;
          border-radius: 0 0 20px 0;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 36px;
          animation: fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .brand-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          margin-bottom: 8px;
        }
        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.6rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #f1f5f9;
          line-height: 1;
          margin: 0;
        }
        .brand-name span {
          background: linear-gradient(135deg, #818cf8, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brand-tagline {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          color: #475569;
          text-transform: uppercase;
          margin: 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .field-group:nth-child(1) { animation-delay: 0.15s; }
        .field-group:nth-child(2) { animation-delay: 0.22s; }

        label {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          color: #64748b;
          text-transform: uppercase;
        }

        .input-wrap {
          position: relative;
        }
        .input-wrap .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          color: #475569;
          pointer-events: none;
          transition: color 0.2s;
        }
        .input-wrap.focused .field-icon { color: #818cf8; }

        .input-wrap .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px; height: 16px;
          color: #475569;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s;
        }
        .input-wrap .toggle-pw:hover { color: #818cf8; }

        input[type="text"],
        input[type="email"],
        input[type="password"] {
          width: 100%;
          padding: 13px 14px 13px 40px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          -webkit-appearance: none;
        }
        input::placeholder { color: #334155; }
        input:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12), 0 0 20px rgba(99,102,241,0.08);
        }
        input.error-state {
          border-color: rgba(239,68,68,0.45);
          background: rgba(239,68,68,0.04);
        }
        .pw-input { padding-right: 42px !important; }

        .field-error {
          font-size: 0.68rem;
          color: #f87171;
          letter-spacing: 0.04em;
          padding-left: 2px;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          animation: fadeUp 0.6s 0.26s cubic-bezier(0.16,1,0.3,1) both;
        }
        .forgot-link {
          font-size: 0.68rem;
          color: #475569;
          letter-spacing: 0.06em;
          text-decoration: none;
          border-bottom: 1px solid rgba(71,85,105,0.3);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .forgot-link:hover { color: #818cf8; border-color: rgba(129,140,248,0.5); }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .divider span {
          font-size: 0.65rem;
          color: #334155;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .submit-btn {
          position: relative;
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
          color: #fff;
          font-family: 'DM Mono', monospace;
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.25s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.3);
          animation: fadeUp 0.6s 0.34s cubic-bezier(0.16,1,0.3,1) both;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .submit-btn:hover:not(:disabled)::before { background: rgba(255,255,255,0.08); }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .signup-link {
          text-align: center;
          font-size: 0.72rem;
          color: #475569;
          letter-spacing: 0.04em;
          animation: fadeUp 0.6s 0.38s cubic-bezier(0.16,1,0.3,1) both;
        }
        .signup-link a {
          color: #818cf8;
          text-decoration: none;
          border-bottom: 1px solid rgba(129,140,248,0.3);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .signup-link a:hover { color: #a5b4fc; border-color: rgba(165,180,252,0.6); }
      `}</style>

      <div className="whispr-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="card">
          <div className="corner-tl" />
          <div className="corner-br" />

          {/* Brand */}
          <div className="brand">
            <div className="brand-top">
              <div className="logo-wrap">
                <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
                  <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#bubbleGradS)" opacity="0.95"/>
                  <rect x="10" y="14" width="52" height="36" rx="12"
                    fill="none" stroke="rgba(129,140,248,0.4)" strokeWidth="0.5"/>
                  <polygon points="22,50 14,60 30,50" fill="url(#bubbleGradS)" opacity="0.95"/>
                  <defs>
                    <linearGradient id="bubbleGradS" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#ec4899"/>
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="32" r="3.5" fill="white" opacity="0.9"/>
                  <circle cx="36" cy="32" r="3.5" fill="white" opacity="0.9"/>
                  <circle cx="44" cy="32" r="3.5" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div className="brand-name">Whi<span>spr</span></div>
            </div>
            <p className="brand-tagline">Your thoughts, refined by AI</p>
          </div>

          {/* Form */}
          <form className="signin-form" onSubmit={handleSubmit(onSubmit)}>

            {/* Identifier */}
            <div className="field-group">
              <label htmlFor="identifier">Email or Username</label>
              <div className={`input-wrap ${focusedField === 'identifier' ? 'focused' : ''}`}>
                <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input
                  id="identifier"
                  type="text"
                  placeholder="you@domain.com"
                  className={errors.identifier ? 'error-state' : ''}
                  onFocus={() => setFocusedField('identifier')}
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && (
                <span className="field-error">↳ {errors.identifier.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <div className={`input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="your password"
                  className={`pw-input${errors.password ? ' error-state' : ''}`}
                  onFocus={() => setFocusedField('password')}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">↳ {errors.password.message}</span>
              )}
            </div>

            {/* Forgot password */}
            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <div className="divider"><span>secure sign in</span></div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              <span className="btn-inner">
                {isSubmitting ? (
                  <><span className="spinner" /> Signing in...</>
                ) : (
                  <>Welcome back →</>
                )}
              </span>
            </button>

          </form>

          <p className="signup-link" style={{ marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link href="/sign-up">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default SignInPage