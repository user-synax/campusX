"use client"

import { useState, useEffect, useCallback } from 'react'

export default function useNotificationCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchCount = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    
    try {
      const res = await fetch('/api/notifications/count')
      if (res.ok) {
        const data = await res.json()
        setCount(data.count)
      }
    } catch (error) {
      console.error('Failed to fetch notification count:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCount()

    const interval = setInterval(fetchCount, 30000) // Poll every 30 seconds

    // Listen for manual count updates (e.g., when visiting notifications page)
    const handleUpdate = (e) => {
      if (typeof e.detail === 'number') {
        setCount(e.detail)
      } else {
        fetchCount()
      }
    }
    window.addEventListener('update-notification-count', handleUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('update-notification-count', handleUpdate)
    }
  }, [fetchCount])

  return { count, loading, refetch: fetchCount }
}
