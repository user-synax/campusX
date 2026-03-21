"use client"

import { FileText } from "lucide-react"
import { useCallback } from "react"
import dynamic from 'next/dynamic'
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { usePosts } from "@/hooks/usePosts"
import useUser from "@/hooks/useUser"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel"

// Lazy load heavy components
const PostComposer = dynamic( 
  () => import('@/components/post/PostComposer'), 
  { 
    ssr: false,
    loading: () => ( 
      <div className="border-b border-border p-4 animate-pulse"> 
        <div className="flex gap-3"> 
          <div className="w-10 h-10 rounded-full bg-accent" /> 
          <div className="flex-1 h-10 bg-accent rounded-lg" /> 
        </div> 
      </div> 
    ) 
  } 
)

export default function FeedPage() {
  const { user: currentUser, refetch: refetchCurrentUser } = useUser()
  const { 
    posts, 
    loading, 
    error,
    hasMore, 
    loadMore, 
    addPost, 
    removePost, 
    updatePostLike 
  } = usePosts()

  const { sentinelRef } = useInfiniteScroll({
    fetchMore: loadMore,
    hasMore,
    loading
  })

  const handlePostCreated = useCallback((newPost) => {
    addPost(newPost)
    if (newPost.xpAwarded) {
      refetchCurrentUser()
      // Dispatch update event for sidebar/mobile XP bars
      window.dispatchEvent(new CustomEvent('cx-xp-updated'))
    }
  }, [addPost, refetchCurrentUser])

  const handleDeletePost = useCallback((postId) => {
    removePost(postId)
  }, [removePost])

  const handleLikePost = useCallback((postId, isLiked) => {
    updatePostLike(postId, isLiked)
  }, [updatePostLike])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Feed header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-20">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
          Welcome back, {currentUser?.name || 'User'}
        </h1>
      </div>
      
      {/* Post composer */}
      <PostComposer onPostCreated={handlePostCreated} />
      
      {/* Posts list */}
      <div className="flex-1">
        {loading && posts.length === 0 ? (
          Array(5).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="No posts yet" 
            description="Be the first to post what's happening on campus!" 
          />
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
