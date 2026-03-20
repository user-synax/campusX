"use client"

import { FileText } from "lucide-react"
import PostComposer from "@/components/post/PostComposer"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { usePosts } from "@/hooks/usePosts"
import useUser from "@/hooks/useUser"
import { Button } from "@/components/ui/button"

export default function FeedPage() {
  const { user: currentUser } = useUser()
  const { 
    posts, 
    loading, 
    hasMore, 
    loadMore, 
    addPost, 
    removePost, 
    updatePostLike 
  } = usePosts()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Feed header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-20">
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight truncate">
          Welcome back, {currentUser?.name || 'User'}
        </h1>
      </div>
      
      {/* Post composer */}
      <PostComposer onPostCreated={addPost} />
      
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
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUserId={currentUser?._id} 
                onDelete={removePost} 
                onLike={updatePostLike} 
              />
            ))}
            
            {hasMore && (
              <div className="p-8 text-center">
                <Button 
                  variant="ghost" 
                  onClick={loadMore} 
                  disabled={loading}
                  className="text-primary hover:bg-primary/5 rounded-full px-8"
                >
                  {loading ? 'Loading...' : 'Show more posts'}
                </Button>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div className="p-12 text-center text-sm text-muted-foreground border-t border-border mt-4">
                You&apos;ve reached the end of the feed.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
