"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, X, Upload, ArrowRight } from "lucide-react"
import Link from "next/link"
import useUser from "@/hooks/useUser"

export default function VerificationBanner() {
  const { user } = useUser()
  const [dismissed, setDismissed] = useState(false)

  // Check localStorage for previous dismissal (per-session dismiss)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedUntil = localStorage.getItem('cx_verify_banner_dismissed')
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        setDismissed(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    // Dismiss for 24 hours — gently remind again later
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'cx_verify_banner_dismissed',
        String(Date.now() + 24 * 60 * 60 * 1000)
      )
    }
  }

  // Don't show if: no user, already verified, already pending review, or dismissed
  if (!user) return null
  if (user.isVerified) return null
  if (user.verificationStatus === 'pending') return null
  if (dismissed) return null

  // Contextual messaging based on verification state
  const isRejected = user.verificationStatus === 'rejected'

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: isRejected
          ? 'linear-gradient(135deg, #ef444418, #f9731618, #ef444418)'
          : 'linear-gradient(135deg, #22c55e10, #10b98118, #06b6d418)',
        borderBottom: isRejected
          ? '1px solid #ef444430'
          : '1px solid #22c55e25',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isRejected
            ? 'linear-gradient(90deg, transparent, #ef444480, #f9731680, transparent)'
            : 'linear-gradient(90deg, transparent, #22c55e60, #10b98180, transparent)',
        }}
      />

      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Badge */}
          <span
            className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={
              isRejected
                ? { background: '#ef444420', color: '#f87171', border: '1px solid #ef444440' }
                : { background: '#22c55e15', color: '#4ade80', border: '1px solid #22c55e30' }
            }
          >
            <ShieldCheck className="w-3 h-3" />
            {isRejected ? 'Rejected' : 'Unverified'}
          </span>

          <p className="text-sm text-foreground/90 truncate">
            {isRejected
              ? 'Your verification was rejected. You can try again with a different method.'
              : 'Get your Verified Student badge! Upload your college ID or verify your college email.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* CTA */}
          <Link
            href="/verify-student"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isRejected
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              boxShadow: isRejected
                ? '0 2px 8px #ef444440'
                : '0 2px 8px #22c55e30',
            }}
          >
            <Upload className="w-3 h-3" />
            Verify Now
            <ArrowRight className="w-3 h-3" />
          </Link>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            title="Dismiss for 24 hours"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
