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
import { useFeedUpdates } from "@/hooks/useFeedUpdates"
import InfiniteScrollSentinel from "@/components/shared/InfiniteScrollSentinel"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    updatePostLike,
    refresh: refreshPosts 
  } = usePosts()

  const { newPostsAvailable, resetNewPosts } = useFeedUpdates()

  const handleRefreshFeed = useCallback(() => {
    refreshPosts()
    resetNewPosts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [refreshPosts, resetNewPosts])

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

  const handleLikePost = useCallback(async (postId) => {
    return await updatePostLike(postId)
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

      {/* New posts toast/button */}
      {newPostsAvailable > 0 && (
        <div className="sticky top-[73px] z-10 flex justify-center py-2 animate-in fade-in slide-in-from-top-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full shadow-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 gap-2 font-bold"
            onClick={handleRefreshFeed}
          >
            <RefreshCw className="w-4 h-4" />
            {newPostsAvailable} new post{newPostsAvailable > 1 ? 's' : ''}
          </Button>
        </div>
      )}
      
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
