"use client"

import { useState, useEffect, useRef, memo, useCallback } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Trash2, Bookmark, MoreHorizontal, Pin, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import dynamic from 'next/dynamic'
import UserAvatar from "@/components/user/UserAvatar"
import LikeButton from './LikeButton'
import PostContent from './PostContent'

// Lazy load heavy dialogs/modals
const CommentSection = dynamic(() => import('@/components/post/CommentSection'), { ssr: false })
const PollDisplay = dynamic(() => import('@/components/post/PollDisplay'), { ssr: false })
const ReactionPicker = dynamic(() => import('@/components/post/ReactionPicker'), { ssr: false })

import { formatRelativeTime } from "@/utils/formatters"
import { formatCount } from "@/utils/formatters"
import { cn } from "@/lib/utils"
import useUser from "@/hooks/useUser"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"
import FounderBadges from "@/components/founder/FounderBadges"
import FormattedTime from "@/components/shared/FormattedTime"

import { REACTIONS as REACTION_EMOJIS } from "@/lib/reaction-utils"

const PostCard = memo(function PostCard({ post, currentUserId, onDelete, onLike, onBookmark, isPinned = false }) {
  const router = useRouter()
  const { user: currentUser } = useUser()
  const [userReaction, setUserReaction] = useState(post._userReaction || null)
  const [reactionSummary, setReactionSummary] = useState(post._reactionSummary || { total: 0, byType: {}, topEmojis: [] })
  const [showPicker, setShowPicker] = useState(false)
  const pickerTimerRef = useRef(null)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(post._isBookmarked || false);

  const formatCount = useCallback((count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return count
  }, [])

  // useEffect for bookmark checking removed (handled by API)

  const handleReact = useCallback(async (reactionType) => {
    if (!currentUser) {
      toast.error("Please login to react")
      return
    }

    // Optimistic update
    const prevReaction = userReaction
    const prevSummary = { ...reactionSummary }
    
    let nextReaction = reactionType
    let nextSummary = { ...prevSummary }

    if (prevReaction === reactionType) {
      // Toggle off
      nextReaction = null
      nextSummary.total--
      nextSummary.byType[reactionType]--
    } else {
      // Toggle on or change
      nextReaction = reactionType
      if (prevReaction) {
        nextSummary.byType[prevReaction]--
      } else {
        nextSummary.total++
      }
      nextSummary.byType[reactionType] = (nextSummary.byType[reactionType] || 0) + 1
    }

    // Update top emojis in nextSummary (simplified for optimism)
    const sortedTypes = Object.keys(nextSummary.byType)
      .filter(key => nextSummary.byType[key] > 0)
      .sort((a, b) => nextSummary.byType[b] - nextSummary.byType[a])
      .slice(0, 3);
    
    nextSummary.topEmojis = sortedTypes.map(type => REACTION_EMOJIS[type])

    setUserReaction(nextReaction)
    setReactionSummary(nextSummary)
    setShowPicker(false)
    if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)

    try {
      const res = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, reactionType }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Sync with server response
      setUserReaction(data.reactionType)
      setReactionSummary(data.summary)
    } catch (error) {
      // Revert optimistic update
      setUserReaction(prevReaction)
      setReactionSummary(prevSummary)
      toast.error("Couldn't update reaction", {
        description: error.message,
      })
    }
  }, [currentUser, post._id, reactionSummary, userReaction])

  const handleBookmark = useCallback(async (e) => {
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
      if (onBookmark) onBookmark(post._id, data.bookmarked);
    } catch (error) {
      setIsBookmarked(wasBookmarked);
      toast.error(error.message || 'Failed to update bookmark');
    }
  }, [isBookmarked, onBookmark, post._id])

  const handleDelete = useCallback(async (e) => {
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
  }, [onDelete, post._id])

  const handlePin = useCallback(async (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const res = await fetch('/api/founder/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: isPinned ? null : post._id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }

      toast.success(isPinned ? "Post unpinned" : "Post pinned to profile")
      // Force refresh current profile view if needed
      window.location.reload()
    } catch (error) {
      toast.error("Failed to pin post")
    }
  }, [isPinned, post._id])

  const isPostFounder = !post.isAnonymous && post.author && typeof post.author === 'object' && isFounder(post.author.username)

  return (
    <div 
      className="border-b border-border p-4 hover:bg-accent/10 transition-colors cursor-pointer group"
      onClick={() => router.push(`/post/${post._id}`)}
    >
      <div className="flex gap-3">
        {isPostFounder ? (
          <FounderAvatar user={post.author} size="md" />
        ) : (
          <UserAvatar user={post.isAnonymous || typeof post.author !== 'object' ? null : post.author} size="md" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {post.isAnonymous || !post.author || typeof post.author !== 'object' ? (
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
                {isPostFounder && (
                  <span className="flex-shrink-0">
                    <FounderBadges size="sm" />
                  </span>
                )}
                <span className="text-muted-foreground truncate">@{post.author.username}</span>
              </>
            )}
            <span className="text-muted-foreground">·</span>
            <Link 
              href={`/post/${post._id}`} 
              className="text-muted-foreground hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FormattedTime date={post.createdAt} />
            </Link>
            {post.community && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border bg-secondary/30">
                🎓 {post.community}
              </Badge>
            )}
          </div>
          
          <div className="mt-1">
            <PostContent content={post.content} />
          </div>

          {post.poll?.options?.length > 0 && (
            <div onClick={(e) => e.stopPropagation()}>
              <PollDisplay 
                poll={post.poll} 
                postId={post._id} 
                currentUserId={currentUser?._id || currentUserId} 
                isExpired={post.poll.expiresAt && new Date(post.poll.expiresAt) < new Date()} 
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3 text-muted-foreground">
            <div className="flex items-center gap-4 sm:gap-6">
              <LikeButton 
                postId={post._id} 
                initialLiked={post._isLiked} 
                initialCount={post.likesCount || 0} 
                onLike={onLike} 
              />

              <div 
                className="relative"
                onMouseEnter={() => {
                  if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
                  setShowPicker(true)
                }} 
                onMouseLeave={() => {
                  pickerTimerRef.current = setTimeout(() => {
                    setShowPicker(false)
                  }, 300) // Small delay to allow moving to picker
                }}
              >
                {showPicker && ( 
                  <ReactionPicker 
                    currentReaction={userReaction} 
                    onSelect={handleReact} 
                    onClose={() => setShowPicker(false)} 
                  /> 
                )} 

                <button 
                  onClick={(e) => { 
                    e.preventDefault()
                    e.stopPropagation()
                    if (userReaction) { 
                      handleReact(userReaction) 
                    } else { 
                      if (pickerTimerRef.current) clearTimeout(pickerTimerRef.current)
                      setShowPicker(!showPicker) 
                    } 
                  }} 
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors hover:text-foreground p-2 rounded-full",
                    userReaction ? "text-primary" : "text-muted-foreground"
                  )}
                > 
                  {userReaction ? ( 
                    <span className="text-base leading-none"> 
                      {REACTION_EMOJIS[userReaction]} 
                    </span> 
                  ) : ( 
                    <span className="text-base leading-none grayscale hover:grayscale-0 transition-all">😀</span>
                  )} 
                  
                  <div className="flex items-center gap-0.5 ml-0.5"> 
                    {reactionSummary.topEmojis.map((emoji, i) => ( 
                      <span key={i} className="text-xs leading-none">{emoji}</span> 
                    ))} 
                    {reactionSummary.total > 0 && ( 
                      <span className="ml-1 font-medium text-[10px] sm:text-xs">
                        {formatCount(reactionSummary.total)}
                      </span> 
                    )} 
                  </div> 
                </button> 
              </div>

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
                <span className="font-medium text-[10px] sm:text-xs">{commentsCount}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={handleBookmark}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isBookmarked ? "text-yellow-400 bg-yellow-400/10" : "hover:text-yellow-400 hover:bg-yellow-400/10"
                )}
                title={isBookmarked ? 'Remove bookmark' : 'Save post'}
              >
                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
              </button>

              {currentUserId === post.author?._id?.toString() && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded-full hover:bg-accent transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isPostFounder && (
                        <>
                          <DropdownMenuItem onClick={handlePin}>
                            <Pin className="w-4 h-4 mr-2" />
                            {isPinned ? 'Unpin from profile' : 'Pin to profile'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
          
          {/* CommentSection */}
          {showComments && (
            <div onClick={(e) => e.stopPropagation()}>
              <CommentSection 
                postId={post._id} 
                currentUser={currentUser} 
                onCountChange={(diff) => setCommentsCount(prev => prev + diff)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default PostCard
