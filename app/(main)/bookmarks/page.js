"use client"

import { useState, useEffect } from "react"
import { Bookmark, Lock } from "lucide-react"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import useUser from "@/hooks/useUser"
import { toast } from "sonner"

export default function BookmarksPage() {
  const { user: currentUser, loading: userLoading } = useUser()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (userLoading) return;
    
    const fetchBookmarks = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/bookmarks?page=${page}&limit=20`)
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.message)
        
        if (page === 1) {
          setPosts(data.posts)
        } else {
          setPosts(prev => [...prev, ...data.posts])
        }
        
        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error)
        toast.error("Failed to load bookmarks")
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [page, userLoading])

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

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
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUserId={currentUser?._id}
                onDelete={handleDeletePost}
                onBookmark={handleBookmarkToggle}
              />
            ))}
            
            {hasMore && (
              <div className="p-4 flex justify-center">
                <Button 
                  variant="ghost" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
