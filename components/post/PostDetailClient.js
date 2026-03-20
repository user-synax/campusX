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
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import PollDisplay from "@/components/post/PollDisplay"
import CommentItem from "@/components/post/CommentItem"
import { renderContentWithHashtags } from "@/utils/hashtags"
import useUser from "@/hooks/useUser"
import { isFounder } from "@/lib/founder"
import FounderAvatar from "@/components/founder/FounderAvatar"
import FounderBadges from "@/components/founder/FounderBadges"

export default function PostDetailClient({ postId }) {
  const router = useRouter()
  const { user: currentUser } = useUser()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Post action states
  const [userReaction, setUserReaction] = useState(null)
  const [reactionSummary, setReactionSummary] = useState({ total: 0, byType: {}, topEmojis: [] })

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

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please login to react")
      return
    }

    const reactionType = 'like'
    const prevReaction = userReaction
    const prevSummary = { ...reactionSummary }
    
    let nextReaction = reactionType
    let nextSummary = { ...prevSummary }

    if (prevReaction === reactionType) {
      nextReaction = null
      nextSummary.total--
      nextSummary.byType[reactionType]--
    } else {
      nextReaction = reactionType
      if (prevReaction) {
        nextSummary.byType[prevReaction]--
      } else {
        nextSummary.total++
      }
      nextSummary.byType[reactionType] = (nextSummary.byType[reactionType] || 0) + 1
    }

    setUserReaction(nextReaction)
    setReactionSummary(nextSummary)

    try {
      const res = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reactionType }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setUserReaction(data.reactionType)
      setReactionSummary(data.summary)
    } catch (error) {
      setUserReaction(prevReaction)
      setReactionSummary(prevSummary)
      toast.error("Couldn't update reaction")
    }
  }

  const handleShare = () => {
    const url = window.location.href
    const title = post.isAnonymous ? 'CampusX Post' : `${post.author.name} on CampusX`
    const text = post.content.slice(0, 100)

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard! 🔗")
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
  const isLiked = userReaction === 'like'

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
        <div className="text-xl leading-relaxed whitespace-pre-wrap break-words mb-6">
          {renderContentWithHashtags(post.content || '').map((segment, i) => (
            segment.type === 'hashtag' ? (
              <Link 
                key={i} 
                href={`/hashtag/${segment.value}`}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                #{segment.value}
              </Link>
            ) : (
              <span key={i}>{segment.value}</span>
            )
          ))}
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

        {/* Stats */}
        <div className="flex gap-6 py-4 border-t border-border text-sm text-muted-foreground">
          <span><strong className="text-foreground">{reactionSummary.total}</strong> Reactions</span>
          <span><strong className="text-foreground">{post.commentsCount || 0}</strong> Comments</span>
          {post.community && (
            <Badge variant="secondary" className="ml-auto bg-secondary/50">
              🎓 {post.community}
            </Badge>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 py-2 border-t border-border">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-accent transition-colors ${
              isLiked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">Like</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
            <MessageCircle className="w-6 h-6" />
            <span className="font-medium">Comment</span>
          </div>

          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-muted-foreground hover:bg-accent transition-colors ml-auto"
          >
            <Share2 className="w-6 h-6" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-4">Comments</h3>
        
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
      </div>
    </div>
  )
}
