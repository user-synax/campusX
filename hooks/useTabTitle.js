"use client"

import { useEffect } from 'react'
import { useNotifications } from '@/context/NotificationContext'

export function useTabTitle() {
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const updateTitle = () => {
      const defaultTitle = 'CampusX'
      
      // Only update title when tab is visible
      if (document.hidden) return
      
      // Check if on notifications page
      const isOnNotificationsPage = window.location.pathname === '/notifications'
      
      if (unreadCount > 0 && !isOnNotificationsPage) {
        const count = unreadCount > 99 ? '99+' : unreadCount
        document.title = `CampusX (${count})`
      } else {
        document.title = defaultTitle
      }
    }

    updateTitle()

    // Update when unread count changes
    if (unreadCount > 0) {
      updateTitle()
    }

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTitle()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.title = 'CampusX'
    }
  }, [unreadCount])
}