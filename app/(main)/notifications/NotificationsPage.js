"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Bell, Loader2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import NotificationItem from '@/components/notifications/NotificationItem'
import NotificationItemSkeleton from '@/components/notifications/NotificationItemSkeleton'
import useUser from '@/hooks/useUser'

function groupByDate(notifications) {
  const groups = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today - 86400000)
  const weekAgo = new Date(today - 7 * 86400000)

  notifications.forEach(n => {
    const d = new Date(n.createdAt)
    let label

    if (d >= today) label = 'Today'
    else if (d >= yesterday) label = 'Yesterday'
    else if (d >= weekAgo) label = 'This Week'
    else label = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })

  return groups
}

export default function NotificationsPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialFilter = searchParams.get('filter') || 'all'
  const [filter, setFilter] = useState(initialFilter)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const loadingRef = useRef(false)
  const abortControllerRef = useRef(null)

  const { unreadCount, markAllRead, markOneRead } = useNotifications()

  const fetchNotifications = useCallback(async (pageNum, currentFilter, isLoadMore = false) => {
    if (loadingRef.current && isLoadMore) return 
    
    // Abort any existing request for a fresh fetch
    if (!isLoadMore && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller
    loadingRef.current = true
    
    if (!isLoadMore) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await fetch(
        `/api/notifications?page=${pageNum}&limit=20&filter=${currentFilter}`,
        { signal: controller.signal }
      )
      
      if (res.ok) {
        const data = await res.json()
        if (isLoadMore) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications)
        }
        setHasMore(data.hasMore)
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[NotificationsPage] Fetch error:', err)
      }
    } finally {
      if (!controller.signal.aborted) {
        loadingRef.current = false
        if (!isLoadMore) setLoading(false)
        else setLoadingMore(false)
      }
    }
  }, [])

  // Initial fetch and filter change
  useEffect(() => {
    if (!user?._id) return // Wait for user session
    
    setNotifications([])
    setPage(1)
    fetchNotifications(1, filter)
  }, [filter, fetchNotifications, user?._id])

  // Sync filter to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    const currentFilter = params.get('filter') || 'all'
    
    if (currentFilter !== filter) {
      if (filter === 'all') params.delete('filter')
      else params.set('filter', filter)
      router.replace(`/notifications?${params.toString()}`, { scroll: false })
    }
  }, [filter, router, searchParams])

  // Auto mark all read ONLY when on the 'all' tab and notifications exist
  useEffect(() => {
    if (filter === 'all' && unreadCount > 0) {
      const timer = setTimeout(() => {
        markAllRead()
        // Update local state to reflect read status without re-fetching
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [filter, unreadCount, markAllRead])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchNotifications(nextPage, filter, true)
  }, [page, filter, hasMore, loadingMore, fetchNotifications])

  const { sentinelRef } = useInfiniteScroll({
    fetchMore: loadMore,
    hasMore,
    loading: loadingMore
  })

  const groupedNotifications = useMemo(() => groupByDate(notifications), [notifications])

  const handleMarkAllRead = async () => {
    await markAllRead()
    if (filter === 'unread') {
      setNotifications([])
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur border-b z-20">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-border">
          {['all', 'unread'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={` 
                flex-1 py-2.5 text-sm font-medium capitalize 
                border-b-2 transition-all duration-200 
                ${filter === tab 
                  ? 'border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground' 
                } 
              `}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground 
                                rounded-full px-1.5 py-0.5 font-bold animate-in zoom-in">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list — grouped by date */}
      <div className="flex-1">
        {loading && notifications.length === 0 ? (
          <div className="divide-y divide-border/50">
            {Array(8).fill(0).map((_, i) => (
              <NotificationItemSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center animate-in fade-in zoom-in duration-500">
              <Bell className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                {filter === 'unread' 
                  ? "You've read all your notifications. Great job!" 
                  : 'When someone likes, comments, or follows you, you\'ll see it here.' 
                }
              </p>
            </div>
            {filter === 'unread' && (
              <button
                onClick={() => setFilter('all')}
                className="text-sm text-primary hover:underline font-medium"
              >
                View all notifications →
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              {/* Date group header */}
              <div className="px-4 py-2 bg-accent/30 border-b border-border/50 sticky top-[105px] z-10 backdrop-blur-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {dateLabel}
                </p>
              </div>

              {/* Notifications in this group */}
              <div className="divide-y divide-border/30">
                {items.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onRead={async () => {
                    if (!notification.read) {
                      await markOneRead(notification._id)
                      setNotifications(prev =>
                        filter === 'unread'
                          ? prev.filter(n => n._id !== notification._id)
                          : prev.map(n => n._id === notification._id
                            ? { ...n, read: true }
                            : n
                          )
                      )
                    }
                  }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center">
        {loadingMore ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-medium">Loading more...</span>
          </div>
        ) : !hasMore && notifications.length > 0 && (
          <div className="flex flex-col items-center gap-2 py-8 opacity-60">
            <p className="text-sm font-medium text-muted-foreground">
              You&apos;re all caught up ✨
            </p>
            <div className="w-1 h-1 rounded-full bg-border" />
          </div>
        )}
      </div>
    </div>
  )
}
