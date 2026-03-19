"use client"

import { useState, useEffect, useCallback } from 'react'
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/shared/EmptyState"
import NotificationItem from "@/components/notifications/NotificationItem"
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton"
import { toast } from "sonner"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1)
      const res = await fetch(`/api/notifications?page=${pageNum}&limit=20`)
      const data = await res.json()
      
      if (res.ok) {
        if (pageNum === 1) {
          setNotifications(data.notifications)
        } else {
          setNotifications(prev => [...prev, ...data.notifications])
        }
        setUnreadCount(data.unreadCount)
        setHasMore(data.hasMore)
      } else {
        toast.error(data.message || 'Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Fetch notifications error:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/read', { method: 'POST' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
        // Dispatch event to update sidebar badge
        window.dispatchEvent(new CustomEvent('update-notification-count', { detail: 0 }))
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(1)
  }, [fetchNotifications])

  // Mark as read after initial load if there are unread notifications
  useEffect(() => {
    if (!loading && unreadCount > 0) {
      markAllRead()
    }
  }, [loading, unreadCount, markAllRead])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary hover:text-primary/80">
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-border">
        {loading && page === 1 ? (
          Array(10).fill(0).map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <EmptyState 
            icon={Bell} 
            title="No notifications yet" 
            description="When someone likes or comments on your posts, or follows you, you'll see it here." 
          />
        ) : (
          <>
            {notifications.map(n => (
              <NotificationItem key={n._id} notification={n} />
            ))}
            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchNotifications(nextPage)
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
