"use client"

import { useState, useEffect } from 'react'

export function useBroadcast() {
  const [broadcast, setBroadcast] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchBroadcast = async () => {
      try {
        const res = await fetch(`/api/founder/broadcast?t=${Date.now()}`)
        const data = await res.json()
        const fetchedBroadcast = data.broadcast

        if (!fetchedBroadcast) return

        // Check if this specific broadcast was dismissed 
        const dismissedIds = JSON.parse(localStorage.getItem('cx_dismissed_broadcasts') || '[]')
        if (dismissedIds.includes(fetchedBroadcast.id)) {
          setDismissed(true)
          return
        }
        setBroadcast(fetchedBroadcast)
      } catch (error) {
        console.error('Failed to fetch broadcast:', error)
      }
    }
    fetchBroadcast()
  }, [])

  const dismiss = () => {
    if (!broadcast) return
    // Save dismissed ID to localStorage 
    const dismissedIds = JSON.parse(localStorage.getItem('cx_dismissed_broadcasts') || '[]')
    dismissedIds.push(broadcast.id)
    // Keep only last 10 dismissed IDs (cleanup) 
    localStorage.setItem('cx_dismissed_broadcasts', JSON.stringify(dismissedIds.slice(-10)))
    setBroadcast(null)
    setDismissed(true)
  }

  return { broadcast, dismissed, dismiss }
}
