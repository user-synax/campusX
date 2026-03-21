"use client"

import { useState, useEffect, useCallback } from "react"
import { Bookmark, Lock } from "lucide-react"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"
import { toast } from "sonner"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel"

export default function BookmarksPage() {
  const { user: currentUser, loading: userLoading } = useUser()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchBookmarks = useCallback(async (pageNum, append = false) => {
    if (userLoading || loading) return;
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/bookmarks?page=${pageNum}&limit=20`)
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookmarks")
      
      if (append) {
        setPosts(prev => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      
      setHasMore(data.hasMore)
      setTotal(data.total)
      setPage(pageNum)
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err)
      setError(err.message)
      toast.error("Failed to load bookmarks")
    } finally {
      setLoading(false)
    }
  }, [userLoading, loading])

  useEffect(() => {
    if (!userLoading) {
      setPage(1)
      fetchBookmarks(1, false)
    }
  }, [userLoading])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchBookmarks(page + 1, true)
  }, [page, hasMore, loading, fetchBookmarks])

  const { sentinelRef } = useInfiniteScroll({
    fetchMore: loadMore,
    hasMore,
    loading
  })

  // Handle unbookmarking on the bookmarks page
  const handleBookmarkToggle = (postId, bookmarked) => {
    if (!bookmarked) {
      // If unbookmarked, remove from list immediately (optimistic)
      setPosts(prev => prev.filter(p => p._id !== postId))
      setTotal(prev => Math.max(0, prev - 1))
    }
  }

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId))
    setTotal(prev => Math.max(0, prev - 1))
  }

  const handleLikePost = useCallback(async (postId) => {
    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!res.ok) throw new Error('Failed to like post')
      
      const data = await res.json()
      
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            likesCount: data.likesCount,
            _isLiked: data.liked
          }
        }
        return p
      }))
      
      return data
    } catch (err) {
      console.error('Like error:', err)
      throw err
    }
  }, [])

  return (
    <div className="flex-1 max-w-2xl border-r border-border min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10">
        <h1 className="text-xl font-bold">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Only visible to you</p>
      </div>

      {/* Private notice */}
      <div className="mx-4 mt-4 p-3 rounded-lg bg-accent/50 border border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Your bookmarks are private. No one else can see this page.
        </p>
      </div>

      {/* Bookmarked posts */}
      <div className="mt-2">
        {loading && page === 1 ? (
          Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="mt-20">
            <EmptyState
              icon={Bookmark}
              title="No saved posts yet"
              description="Tap the bookmark icon on any post to save it here for later."
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUserId={currentUser?._id} 
                  onBookmarkToggle={handleBookmarkToggle}
                  onDelete={handleDeletePost}
                  onLike={handleLikePost}
                />
              ))}
            </div>
            
            <div ref={sentinelRef}>
              <InfiniteScrollSentinel 
                loading={loading} 
                hasMore={hasMore} 
                error={error} 
                onRetry={loadMore} 
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
