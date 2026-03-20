"use client"

import Link from "next/link"
import { X } from "lucide-react"
import UserAvatar from "@/components/user/UserAvatar"
import { formatRelativeTime } from "@/utils/formatters"

/**
 * Reusable CommentItem component.
 * 
 * @param {Object} props
 * @param {Object} props.comment - Comment data
 * @param {string} props.currentUserId - ID of the logged-in user
 * @param {Function} props.onDelete - Callback to delete the comment
 */
export default function CommentItem({ comment, currentUserId, onDelete }) {
  const isOwner = comment.author?._id === currentUserId || comment.author === currentUserId

  return (
    <div className="flex gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-300">
      <UserAvatar user={comment.author} size="sm" className="mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="bg-secondary/40 rounded-2xl px-4 py-2 inline-block max-w-full">
          <div className="flex items-center gap-2 mb-0.5">
            <Link 
              href={`/profile/${comment.author?.username}`} 
              className="text-xs font-bold hover:underline"
            >
              {comment.author?.name || 'User'}
            </Link>
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(new Date(comment.createdAt))}
            </span>
          </div>
          <p className="text-sm break-words leading-relaxed text-foreground/90">
            {comment.content}
          </p>
        </div>
      </div>
      
      {/* Delete button — visible on hover for own comments */}
      {!comment.isOptimistic && isOwner && (
        <button 
          onClick={() => onDelete?.(comment._id)} 
          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all self-start mt-1" 
          title="Delete comment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
