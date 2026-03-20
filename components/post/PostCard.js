"use client"

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { Heart, MessageCircle, Trash2, Bookmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import CommentSection from "@/components/post/CommentSection"
import PollDisplay from "@/components/post/PollDisplay"
import ReactionPicker, { REACTIONS } from "@/components/post/ReactionPicker"
import { formatRelativeTime } from "@/utils/formatters"
import { renderContentWithHashtags } from "@/utils/hashtags"
import { cn } from "@/lib/utils"
import useUser from "@/hooks/useUser"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"
import FounderBadges from "@/components/founder/FounderBadges"

export default function PostCard({ post, currentUserId, onDelete, onLike, onBookmark }) {
  const { user: currentUser } = useUser()
  const [userReaction, setUserReaction] = useState(post._userReaction || null)
  const [reactionSummary, setReactionSummary] = useState(post._reactionSummary || { total: 0, byType: {}, topEmojis: [] })
  const [showPicker, setShowPicker] = useState(false)
  const pickerTimerRef = useRef(null)
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return count
  }

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

  const handleReact = async (reactionType) => {
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
    
    const REACTION_EMOJIS = {
      like: '❤️', funny: '😂', wow: '😮', sad: '😢', respect: '👏', fire: '🔥'
    }
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
      if (onBookmark) onBookmark(post._id, data.bookmarked);
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

  const isPostFounder = !post.isAnonymous && post.author && isFounder(post.author.username)

  return (
    <div className="border-b border-border p-4 hover:bg-accent/10 transition-colors cursor-pointer group">
      <div className="flex gap-3">
        {isPostFounder ? (
          <FounderAvatar user={post.author} size="md" />
        ) : (
          <UserAvatar user={post.isAnonymous ? null : post.author} size="md" />
        )}
        
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
                {isPostFounder && <FounderBadges size="sm" />}
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
            {renderContentWithHashtags(post.content || '').map((segment, i) => (
              segment.type === 'hashtag' ? (
                <Link 
                  key={i} 
                  href={`/hashtag/${segment.value}`}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{segment.value}
                </Link>
              ) : (
                <span key={i}>{segment.value}</span>
              )
            ))}
          </p>

          {post.poll?.options?.length > 0 && (
            <PollDisplay 
              poll={post.poll} 
              postId={post._id} 
              currentUserId={currentUser?._id || currentUserId} 
              isExpired={post.poll.expiresAt && new Date(post.poll.expiresAt) < new Date()} 
            />
          )}
          
          <div className="flex items-center justify-between mt-3 text-muted-foreground">
            <div className="flex items-center gap-4 sm:gap-6">
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
                      {REACTIONS.find(r => r.type === userReaction)?.emoji} 
                    </span> 
                  ) : ( 
                    <Heart className="w-4 h-4" /> 
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
                <button 
                  onClick={handleDelete}
                  className="p-2 rounded-full hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
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
