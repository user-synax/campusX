"use client"

import { useState, useEffect } from 'react'
import Link from "next/link"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import UserAvatar from "@/components/user/UserAvatar"
import { formatRelativeTime } from "@/utils/formatters"
import CommentItem from "./CommentItem"

export default function CommentSection({ postId, currentUser, onCountChange }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`)
        const data = await res.json()
        if (res.ok) {
          setComments(data.comments)
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    // Optimistic add (temporary object)
    const optimisticComment = {
      _id: Date.now().toString(),
      content: newComment,
      author: currentUser,
      createdAt: new Date().toISOString(),
      isOptimistic: true
    }
    
    setComments(prev => [...prev, optimisticComment])
    const currentText = newComment
    setNewComment('')

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentText }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Replace optimistic with real
      setComments(prev => prev.map(c => c._id === optimisticComment._id ? data : c))
      if (onCountChange) onCountChange(1)
    } catch (error) {
      setComments(prev => prev.filter(c => c._id !== optimisticComment._id))
      setNewComment(currentText)
      toast.error(error.message || 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    // Optimistic remove
    const originalComments = [...comments]
    setComments(prev => prev.filter(c => c._id !== commentId))

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message)
      }
      
      if (onCountChange) onCountChange(-1)
      toast.success('Comment deleted')
    } catch (error) {
      setComments(originalComments)
      toast.error(error.message || 'Failed to delete comment')
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      {/* Comment input */}
      <div className="flex gap-2 mb-4">
        <UserAvatar user={currentUser} size="sm" />
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input 
            placeholder="Write a comment..." 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            maxLength={280} 
            className="flex-1 h-9 text-sm bg-accent/20 border-border focus-visible:ring-1" 
          />
          <Button 
            type="submit"
            size="sm" 
            disabled={!newComment.trim() || isSubmitting}
            className="h-9 px-4 rounded-full"
          >
            {isSubmitting ? '...' : 'Reply'}
          </Button>
        </form>
      </div>
      
      {/* Comments list */}
      {loading ? (
        <div className="space-y-3">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4 italic">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              currentUserId={currentUser?._id} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
