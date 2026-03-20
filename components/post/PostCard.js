"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import CommentSection from "@/components/post/CommentSection"
import { formatRelativeTime } from "@/utils/formatters"
import { cn } from "@/lib/utils"
import useUser from "@/hooks/useUser"

export default function PostCard({ post, currentUserId, onDelete, onLike }) {
  const { user: currentUser } = useUser()
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId))
  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes.length)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const checkBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks/check?postId=${post._id}`);
        const data = await res.json();
        if (res.ok) {
          setIsBookmarked(data.bookmarked);
        }
      } catch (error) {
        console.error('Failed to check bookmark status', error);
      }
    };
    checkBookmark();
  }, [currentUser, post._id]);

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic update
    const wasLiked = isLiked
    const originalLikesCount = likesCount
    const newIsLiked = !wasLiked
    const newLikesCount = newIsLiked ? originalLikesCount + 1 : originalLikesCount - 1
    
    setIsLiked(newIsLiked)
    setLikesCount(newLikesCount)

    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Sync with server response
      setIsLiked(data.liked)
      setLikesCount(data.likesCount)
      if (onLike) onLike(post._id, data.liked, data.likesCount)
    } catch (error) {
      // Revert optimistic update
      setIsLiked(wasLiked)
      setLikesCount(originalLikesCount)
      toast.error("Couldn't like post", {
        description: error.message,
      })
    }
  }

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setIsBookmarked(data.bookmarked);
      toast.success(data.message);
    } catch (error) {
      setIsBookmarked(wasBookmarked);
      toast.error(error.message || 'Failed to update bookmark');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }

      if (onDelete) onDelete(post._id)
      toast.success("Post deleted")
    } catch (error) {
      toast.error("Couldn't delete post", {
        variant: "destructive",
      })
    }
  }

  return (
    <div className="border-b border-border p-4 hover:bg-accent/10 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        <UserAvatar user={post.isAnonymous ? null : post.author} size="md" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {post.isAnonymous ? (
              <span className="font-bold text-foreground">Anonymous</span>
            ) : (
              <>
                <Link 
                  href={`/profile/${post.author.username}`} 
                  className="font-bold text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.author.name}
                </Link>
                <span className="text-muted-foreground truncate">@{post.author.username}</span>
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatRelativeTime(new Date(post.createdAt))}</span>
            {post.community && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border bg-secondary/30">
                🎓 {post.community}
              </Badge>
            )}
          </div>
          
          <p className="mt-1 text-[15px] leading-normal whitespace-pre-wrap wrap-break-words">
            {post.content}
          </p>
          
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors group/like",
                isLiked ? "text-red-500" : "hover:text-red-500"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                isLiked ? "bg-red-500/10" : "group-hover/like:bg-red-500/10"
              )}>
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </div>
              <span className="font-medium">{likesCount}</span>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowComments(!showComments)
              }}
              className="flex items-center gap-1.5 text-xs hover:text-blue-400 transition-colors group/comment"
            >
              <div className="p-2 rounded-full group-hover/comment:bg-blue-400/10">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="font-medium">{commentsCount}</span>
            </button>
            
            {currentUserId === post.author?._id?.toString() && (
              <button 
                onClick={handleDelete}
                className="ml-auto p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleBookmark} className={`flex items-center gap-1 text-sm transition-colors ml-auto ${ isBookmarked ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400' }`} title={isBookmarked ? 'Remove bookmark' : 'Save post'} >
              <span className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}>🔖</span>
            </button>
          </div>
          
          {/* CommentSection */}
          {showComments && (
            <CommentSection 
              postId={post._id} 
              currentUser={currentUser} 
              onCountChange={(diff) => setCommentsCount(prev => prev + diff)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
