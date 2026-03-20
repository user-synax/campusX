"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import useUser from "@/hooks/useUser"

export default function HashtagPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const tag = decodeURIComponent(resolvedParams.tag)
  const { user: currentUser } = useUser()
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/hashtags/${encodeURIComponent(tag)}?page=${page}&limit=20`)
        const data = await res.json()
        
        if (res.ok) {
          if (page === 1) {
            setPosts(data.posts)
          } else {
            setPosts(prev => [...prev, ...data.posts])
          }
          setTotal(data.total)
          setHasMore(data.hasMore)
        }
      } catch (error) {
        console.error("Failed to fetch hashtag posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [tag, page])

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  return (
    <div className="flex-1 max-w-2xl border-r border-border min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">#{tag}</h1>
          <p className="text-sm text-muted-foreground">{total} posts</p>
        </div>
      </div>

      {/* Posts feed */}
      <div className="divide-y divide-border">
        {loading && page === 1 ? (
          Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="py-20">
            <EmptyState
              icon={Hash}
              title={`No posts for #${tag}`}
              description="Be the first to use this hashtag!"
            />
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                currentUserId={currentUser?._id} 
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
