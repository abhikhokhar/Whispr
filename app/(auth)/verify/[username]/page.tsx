'use client'
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from "zod"
import { verifySchema } from "@/schemas/verifySchema"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react"

const OTP_LENGTH = 6

const VerifyAccount = () => {
  const router = useRouter()
  const param = useParams<{ username: string }>()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  const onSubmit = async () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      toast.error("Please enter all 6 digits")
      return
    }
    setIsSubmitting(true)
    try {
      await axios.post("/api/verify-code", {
        username: param.username,
        code,
      })
      toast.success("Account verified successfully")
      router.push("/sign-in")
    } catch (error) {
      console.error("Error during verification:", error)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message || "An error occurred during account verification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = otp.every(d => d !== '')

  return (
    <>
      <div className="whispr-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="card">
          <div className="corner-tl" />
          <div className="corner-br" />

          {/* Brand — same as signup */}
          <div className="brand">
            <div className="brand-top">
              <div className="logo-wrap">
                <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
                  <rect x="10" y="14" width="52" height="36" rx="12" fill="url(#bubbleGradV)" opacity="0.95"/>
                  <rect x="10" y="14" width="52" height="36" rx="12"
                    fill="none" stroke="rgba(129,140,248,0.4)" strokeWidth="0.5"/>
                  <polygon points="22,50 14,60 30,50" fill="url(#bubbleGradV)" opacity="0.95"/>
                  <defs>
                    <linearGradient id="bubbleGradV" x1="10" y1="14" x2="62" y2="50" gradientUnits="userSpaceOnUse">
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

          {/* Verify header */}
          <div className="verify-header">
            <p className="verify-title">Check your inbox</p>
            <p className="verify-sub">
              Enter the 6-digit code sent to your email
              {param.username && <><br />for <strong>@{param.username}</strong></>}
            </p>
          </div>

          {/* OTP inputs */}
          <div className="otp-row">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
  <div key={i} style={{ display: 'contents' }}>
    {i === 3 && <span className="otp-dash">—</span>}
    <input
      ref={el => { inputsRef.current[i] = el }}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={otp[i]}
      className={`otp-cell${otp[i] ? ' filled' : ''}`}
      placeholder="·"
      onChange={e => handleChange(i, e.target.value)}
      onKeyDown={e => handleKeyDown(i, e)}
      autoFocus={i === 0}
    />
  </div>
))}
          </div>

          <div className="divider"><span>secure verification</span></div>

          <button
            className="submit-btn"
            disabled={isSubmitting || !isComplete}
            onClick={onSubmit}
          >
            <span className="btn-inner">
              {isSubmitting ? (
                <><span className="spinner" /> Verifying...</>
              ) : (
                <>Verify account →</>
              )}
            </span>
          </button>
        </div>
      </div>

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
          max-width: 420px;
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

        /* Brand — identical to signup */
        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
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

        /* Verify section */
        .verify-header {
          text-align: center;
          margin-bottom: 28px;
          animation: fadeUp 0.6s 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        .verify-title {
          font-size: 1rem;
          font-weight: 400;
          color: #cbd5e1;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .verify-sub {
          font-size: 0.7rem;
          color: #334155;
          letter-spacing: 0.06em;
          line-height: 1.6;
        }
        .verify-sub strong {
          color: #475569;
          font-weight: 400;
        }

        /* OTP inputs */
        .otp-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 28px;
          animation: fadeUp 0.6s 0.24s cubic-bezier(0.16,1,0.3,1) both;
        }

        .otp-cell {
          width: 48px;
          height: 56px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #e2e8f0;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 400;
          text-align: center;
          outline: none;
          caret-color: #818cf8;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
          -webkit-appearance: none;
        }
        .otp-cell::placeholder { color: #1e293b; }
        .otp-cell:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.07);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.13), 0 0 18px rgba(99,102,241,0.07);
          transform: translateY(-2px);
        }
        .otp-cell.filled {
          border-color: rgba(129,140,248,0.35);
          background: rgba(99,102,241,0.05);
        }

        /* Separator dash */
        .otp-dash {
          display: flex;
          align-items: center;
          color: #1e293b;
          font-size: 1.2rem;
          padding-bottom: 2px;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          animation: fadeUp 0.6s 0.28s cubic-bezier(0.16,1,0.3,1) both;
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

        /* Submit */
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
          animation: fadeUp 0.6s 0.32s cubic-bezier(0.16,1,0.3,1) both;
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
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

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

        /* Resend */
        .resend-row {
          text-align: center;
          margin-top: 18px;
          font-size: 0.7rem;
          color: #334155;
          letter-spacing: 0.05em;
          animation: fadeUp 0.6s 0.36s cubic-bezier(0.16,1,0.3,1) both;
        }
        .resend-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          border-bottom: 1px solid rgba(129,140,248,0.3);
          padding: 0 0 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .resend-btn:hover { color: #a5b4fc; border-color: rgba(165,180,252,0.6); }
      `}</style>
    </>
  )
}

export default VerifyAccount