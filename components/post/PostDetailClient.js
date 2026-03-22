"use client"

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  FileX, 
  Loader2,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import PollDisplay from "@/components/post/PollDisplay"
import CommentItem from "@/components/post/CommentItem"
import LikeButton from './LikeButton'
import ReactionPicker from './ReactionPicker'
import { renderContentWithMentions, extractUrls } from "@/utils/hashtags"
import UserMention from "@/components/shared/UserMention"
import LinkPreview from "@/components/shared/LinkPreview"
import useUser from "@/hooks/useUser"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"
import FounderBadges from "@/components/founder/FounderBadges"
import { REACTIONS as REACTION_EMOJIS } from "@/lib/reaction-utils"
import { cn } from "@/lib/utils"
import { useRef } from 'react'

export default function PostDetailClient({ postId }) {
  const router = useRouter()
  const { user: currentUser } = useUser()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comments') // 'comments' or 'reactions'
  const [reactions, setReactions] = useState([])
  const [loadingReactions, setLoadingReactions] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Post action states
  const [userReaction, setUserReaction] = useState(null)
  const [reactionSummary, setReactionSummary] = useState({ total: 0, byType: {}, topEmojis: [] })
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const pickerTimerRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/posts/${postId}`),
        fetch(`/api/posts/${postId}/comments`)
      ])

      if (postRes.status === 404) {
        setPost(null)
        setLoading(false)
        return
      }

      const postData = await postRes.json()
      const commentsData = await commentsRes.json()

      if (postRes.ok) {
        setPost(postData)
        setUserReaction(postData._userReaction || null)
        setReactionSummary(postData._reactionSummary || { total: 0, byType: {}, topEmojis: [] })
        setIsLiked(postData._isLiked || false)
        setLikesCount(postData.likesCount || 0)
      }
      
      if (commentsRes.ok) {
        setComments(commentsData.comments || [])
      }
    } catch (error) {
      console.error('Error fetching post detail:', error)
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const fetchReactions = useCallback(async () => {
    setLoadingReactions(true)
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`)
      if (res.ok) {
        const data = await res.json()
        setReactions(data.reactions || [])
      }
    } catch (error) {
      console.error('Error fetching reactions:', error)
    } finally {
      setLoadingReactions(false)
    }
  }, [postId])

  useEffect(() => {
    if (activeTab === 'reactions') {
      fetchReactions()
    }
  }, [activeTab, fetchReactions])

  const urls = post?.content ? extractUrls(post.content) : []

  const handleLike = async () => {
    try {
      const res = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (!res.ok) throw new Error('Failed to like post')
      
      const data = await res.json()
      setIsLiked(data.liked)
      setLikesCount(data.likesCount)
      return data
    } catch (err) {
      console.error('Like error:', err)
      toast.error("Failed to like post")
      throw err
    }
  }

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

    // Update top emojis
    const REACTION_KEYS = Object.keys(REACTION_EMOJIS);
    const sortedTypes = REACTION_KEYS
      .filter(key => nextSummary.byType[key] > 0)
      .sort((a, b) => nextSummary.byType[b] - nextSummary.byType[a])
      .slice(0, 3);
    
    nextSummary.topEmojis = sortedTypes.map(type => REACTION_EMOJIS[type])

    setUserReaction(nextReaction)
    setReactionSummary(nextSummary)
    setShowPicker(false)

    try {
      const res = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post._id, reactionType }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setUserReaction(data.reactionType)
      setReactionSummary(data.summary)
    } catch (error) {
      setUserReaction(prevReaction)
      setReactionSummary(prevSummary)
      toast.error("Couldn't update reaction", {
        description: error.message,
      })
    }
  }

  const handleShare = () => {
    if (typeof window === 'undefined') return
    
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `Check out this post on CampusX`,
        url
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmittingComment || !currentUser) return

    setIsSubmittingComment(true)
    const commentText = newComment.trim()
    
    // Optimistic add
    const optimisticComment = {
      _id: Date.now().toString(),
      content: commentText,
      author: currentUser,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    }
    
    setComments(prev => [...prev, optimisticComment])
    setNewComment('')

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setComments(prev => prev.map(c => c._id === optimisticComment._id ? data : c))
      setPost(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null)
    } catch (error) {
      setComments(prev => prev.filter(c => c._id !== optimisticComment._id))
      setNewComment(commentText)
      toast.error(error.message || 'Failed to post comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    const originalComments = [...comments]
    setComments(prev => prev.filter(c => c._id !== commentId))

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (!res.ok) throw new Error("Failed to delete")
      
      setPost(prev => prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 0) - 1) } : null)
      toast.success('Comment deleted')
    } catch (error) {
      setComments(originalComments)
      toast.error('Failed to delete comment')
    }
  }

  if (loading) return null // Handled by loading.js

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-bold">Post</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <FileX className="w-12 h-12 text-muted-foreground" />
          <p className="font-semibold">Post not found</p>
          <p className="text-sm text-muted-foreground">This post may have been deleted.</p>
          <Link href="/feed">
            <Button variant="outline" size="sm" className="rounded-full">Back to Feed</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isPostFounder = !post.isAnonymous && post.author && isFounder(post.author.username)

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="font-bold">Post</h1>
      </div>

      {/* Post Detail */}
      <div className="p-4 border-b border-border">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          {post.isAnonymous ? (
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-muted-foreground">
              ?
            </div>
          ) : isPostFounder ? (
            <Link href={`/profile/${post.author.username}`}>
              <FounderAvatar user={post.author} size="lg" />
            </Link>
          ) : (
            <Link href={`/profile/${post.author.username}`}>
              <UserAvatar user={post.author} size="lg" />
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2">
              {post.isAnonymous ? (
                <span className="font-bold text-lg">Anonymous</span>
              ) : (
                <>
                  <Link href={`/profile/${post.author.username}`} className="font-bold text-lg hover:underline">
                    {post.author.name}
                  </Link>
                  {isPostFounder && <FounderBadges size="sm" />}
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {!post.isAnonymous && `@${post.author.username} · `}
              {new Date(post.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="text-xl leading-relaxed whitespace-pre-wrap word-break-words mb-6">
          {renderContentWithMentions(post.content || '').map((segment, i) => {
            if (segment.type === 'hashtag') {
              return (
                <Link 
                  key={i} 
                  href={`/hashtag/${segment.value}`}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  #{segment.value}
                </Link>
              )
            } else if (segment.type === 'mention') {
              return (
                <UserMention key={i} username={segment.value} />
              )
            } else if (segment.type === 'url') {
              return (
                <a 
                  key={i} 
                  href={segment.value}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {segment.value}
                </a>
              )
            } else {
              return <span key={i}>{segment.value}</span>
            }
          })}
        </div>

        {/* Link Previews */}
        <div className="mb-6 space-y-4">
          {urls.length > 0 ? (
            // New rich previews for all links found in text
            urls.map((url, i) => (
              <LinkPreview key={i} url={url} />
            ))
          ) : post.linkPreview ? (
            // Fallback to attached link preview if no links in text
            <LinkPreview url={post.linkPreview.url} />
          ) : null}
        </div>

        {/* Poll */}
        {post.poll?.options?.length > 0 && (
          <div className="mb-6">
            <PollDisplay 
              poll={post.poll} 
              postId={post._id} 
              currentUserId={currentUser?._id} 
              isExpired={post.poll.expiresAt && new Date(post.poll.expiresAt) < new Date()} 
            />
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex flex-col gap-4 py-4 border-t border-b border-border">
          <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <strong className="text-foreground">{likesCount}</strong> Likes
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-foreground">{comments.length}</strong> Comments
            </span>
            {reactionSummary.total > 0 && (
              <span className="flex items-center gap-1">
                <strong className="text-foreground">{reactionSummary.total}</strong> Reactions
              </span>
            )}
            {post.community && (
              <Badge variant="secondary" className="ml-auto bg-secondary/50">
                🎓 {post.community}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-around">
            <LikeButton 
              postId={postId} 
              initialLiked={isLiked} 
              initialCount={likesCount} 
              onLike={handleLike} 
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
                }, 300)
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
                onClick={() => { 
                  if (userReaction) { 
                    handleReact(userReaction) 
                  } else { 
                    setShowPicker(!showPicker) 
                  } 
                }} 
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors p-2 px-4 rounded-lg hover:bg-accent",
                  userReaction ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
              > 
                {userReaction ? ( 
                  <span className="text-lg leading-none"> 
                    {REACTION_EMOJIS[userReaction]} 
                  </span> 
                ) : ( 
                  <span className="text-lg leading-none grayscale hover:grayscale-0 transition-all">😀</span>
                )} 
                <span>React</span>
              </button> 
            </div>

            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-blue-400">
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
            </Button>
            
            <Button variant="ghost" onClick={handleShare} className="flex items-center gap-2 text-muted-foreground hover:text-green-400">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-background sticky top-[64px] z-10">
        <button 
          onClick={() => setActiveTab('comments')}
          className={cn(
            "flex-1 py-4 text-sm font-bold transition-colors relative",
            activeTab === 'comments' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Comments ({comments.length})
          {activeTab === 'comments' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('reactions')}
          className={cn(
            "flex-1 py-4 text-sm font-bold transition-colors relative",
            activeTab === 'reactions' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Reactions ({reactionSummary.total})
          {activeTab === 'reactions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'comments' ? (
          <>
            {/* Comment input */}
            <div className="flex gap-3 mb-8">
              <UserAvatar user={currentUser} size="md" />
              <div className="flex-1 flex flex-col gap-2">
                <Input 
                  placeholder="Post your reply" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                  className="bg-accent/20 border-border h-12 text-base focus-visible:ring-1"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="rounded-full px-6"
                  >
                    {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reply'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments list */}
            {comments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No comments yet. Be the first to reply!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map(comment => (
                  <CommentItem 
                    key={comment._id} 
                    comment={comment} 
                    currentUserId={currentUser?._id} 
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Reactions Tab Content */
          <div className="space-y-4 min-h-[300px]">
            {loadingReactions ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading reactions...</p>
              </div>
            ) : reactions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No reactions yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {reactions.map((react, i) => (
                  <Link 
                    key={i} 
                    href={`/profile/${react.user.username}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-accent/10 hover:bg-accent/30 border border-transparent hover:border-border transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={react.user} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate leading-tight">{react.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{react.user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl shadow-sm border border-border group-hover:scale-110 transition-transform">
                        {react.type === 'like' || react.type === 'LIKE' ? '❤️' : REACTION_EMOJIS[react.type]}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
