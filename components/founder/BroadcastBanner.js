"use client"

import { useBroadcast } from '@/hooks/useBroadcast'
import { X } from 'lucide-react'

export default function BroadcastBanner() {
  const { broadcast, dismiss } = useBroadcast()

  if (!broadcast) return null

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f59e0b18, #8b5cf618, #3b82f618)',
        borderBottom: '1px solid #f59e0b30'
      }}
    >
      {/* Subtle shimmer line */} 
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, #f59e0b80, #8b5cf680, transparent)'
        }}
      />

      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Founder mini badge */} 
          <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}>
            ⚡ Founder
          </span>
          <p className="text-sm text-foreground/90 truncate">
            {broadcast.message}
          </p>
        </div>

        <button
          onClick={dismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
