"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, RefreshCw, TrendingUp } from "lucide-react"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel"
import { Button } from "@/components/ui/button"

export default function PostsTab({ currentUser }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/explore/posts?page=${pageNum}&limit=20`)
      const data = await res.json()

      if (res.ok) {
        if (append) {
          setPosts(prev => [...prev, ...data.posts])
        } else {
          setPosts(data.posts || [])
        }
        setHasMore(data.hasMore)
        setPage(pageNum)
      } else {
        throw new Error(data.message || "Failed to fetch posts")
      }
    } catch (error) {
      console.error("Explore posts error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchPosts(1, false)
    }
  }, [currentUser, fetchPosts])

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    fetchPosts(page + 1, true)
  }, [page, hasMore, loading, fetchPosts])

  const { sentinelRef } = useInfiniteScroll({
    fetchMore: loadMore,
    hasMore,
    loading
  })

  const handleRefresh = useCallback(() => {
    setPage(1)
    fetchPosts(1, false)
  }, [fetchPosts])

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

  const handleDeletePost = useCallback((postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId))
  }, [])

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Refresh button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Recommended for you</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Posts list */}
      <div className="flex-1">
        {loading && posts.length === 0 ? (
          <div className="p-4 space-y-4">
            {Array(5).fill(0).map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 && !loading ? (
          <div className="pt-20">
            <EmptyState
              icon={FileText}
              title="No posts to explore"
              description="Start following more people and update your interests to get personalized recommendations!"
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
