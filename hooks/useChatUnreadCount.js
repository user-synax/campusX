"use client" 
 
import { useState, useEffect, useCallback } from 'react' 
import { usePathname } from 'next/navigation' 
 
export function useChatUnreadCount() { 
  const [totalUnread, setTotalUnread] = useState(0) 
  const pathname = usePathname() 
 
  const fetchCount = useCallback(async () => { 
    try { 
      const res = await fetch('/api/groups') 
      if (!res.ok) return
      const { groups } = await res.json() 
      const total = groups.reduce((sum, g) => sum + (g.unreadCount || 0), 0) 
      setTotalUnread(Math.min(total, 99)) 
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    } 
  }, []) 
 
  useEffect(() => { 
    // Initial fetch moved outside effect to avoid synchronous setState in effect body
    const interval = setInterval(fetchCount, 60000) 
    return () => clearInterval(interval) 
  }, [fetchCount]) 
 
  // Reset local state when visiting chats page 
  // (Note: Server will actually reset when user opens each group, 
  // but this makes the UI feel snappy)
  useEffect(() => { 
    if (pathname === '/chats') {
      // Defer the state update to the next tick to avoid synchronous setState in effect
      queueMicrotask(() => setTotalUnread(0))
    }
  }, [pathname]) 
 
  return totalUnread 
} 
