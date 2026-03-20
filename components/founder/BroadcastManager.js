"use client"

import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function BroadcastManager({ currentBroadcast }) {
  const [message, setMessage] = useState(currentBroadcast?.message || '')
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(currentBroadcast?.active || false)

  const handleBroadcast = async (shouldActivate) => {
    setSaving(true)
    try {
      const res = await fetch('/api/founder/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, active: shouldActivate })
      })

      const data = await res.json()
      if (res.ok) {
        setActive(shouldActivate)
        if (shouldActivate) {
          toast.success("Broadcast sent to all users! 📡")
        } else {
          toast.success("Broadcast stopped")
          setMessage('')
        }
      } else {
        toast.error(data.message || "Failed to update broadcast")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 rounded-xl p-4"
      style={{ background: '#0d0d0d', border: '1px solid #f59e0b30' }}>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">📡</span>
        <h3 className="text-sm font-semibold text-foreground">Broadcast to All Users</h3>
        {active && (
          <span className="ml-auto text-[10px] text-green-400 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <Textarea
        placeholder="Announce something to all CampusX users..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={200}
        rows={2}
        className="text-sm resize-none bg-accent/5 border-border/50 focus-visible:ring-amber-500/50"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">{message.length}/200</span>
        <div className="flex gap-2">
          {active && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleBroadcast(false)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8"
              disabled={saving}
            >
              Stop broadcast
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={() => handleBroadcast(true)}
            disabled={!message.trim() || saving}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8"
          >
            {saving ? 'Broadcasting...' : '📡 Broadcast'}
          </Button>
        </div>
      </div>
    </div>
  )
}
