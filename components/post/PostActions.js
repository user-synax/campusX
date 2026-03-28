import { memo } from 'react'
import Link from "next/link"
import { Heart, MessageCircle, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCount } from "@/utils/formatters"

const PostActions = memo(function PostActions({
  postId,
  likesCount,
  isLiked,
  commentsCount,
  isBookmarked,
  onLike,
  onBookmark,
  onCommentClick
}) {
  return (
    <div className="flex items-center justify-between mt-3 text-muted-foreground">
      <div className="flex items-center gap-4 sm:gap-6">
        <LikeButton
          postId={postId}
          initialLiked={isLiked}
          initialCount={likesCount}
          onLike={onLike}
        />

        <PostReactionsButton />

        <button 
          onClick={onCommentClick}
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
          onClick={onBookmark}
          className={cn(
            "p-2 rounded-full transition-colors",
            isBookmarked ? "text-yellow-400 bg-yellow-400/10" : "hover:text-yellow-400 hover:bg-yellow-400/10"
          )}
          title={isBookmarked ? 'Remove bookmark' : 'Save post'}
        >
          <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
        </button>

        <PostMoreMenu postId={postId} />
      </div>
    </div>
  )
})

const LikeButton = memo(function LikeButton({
  postId,
  initialLiked,
  initialCount,
  onLike
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onLike?.(postId)
      }}
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors hover:text-red-500 group/like",
        initialLiked && "text-red-500"
      )}
    >
      <div className={cn(
        "p-2 rounded-full transition-colors",
        initialLiked ? "bg-red-500/10 group-hover/like:bg-red-500/20" : "group-hover/like:bg-red-500/10"
      )}>
        <Heart className={cn(
          "w-4 h-4 transition-transform",
          initialLiked && "fill-current scale-110"
        )} />
      </div>
      <span className="font-medium text-[10px] sm:text-xs">
        {formatCount(initialCount || 0)}
      </span>
    </button>
  )
})

const PostReactionsButton = memo(function PostReactionsButton() {
  return (
    <div className="relative">
      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground p-2 rounded-full transition-colors">
        <span className="text-base leading-none">😀</span>
      </button>
    </div>
  )
})

const PostMoreMenu = memo(function PostMoreMenu({ postId }) {
  return null
})

export { PostActions, LikeButton, PostReactionsButton, PostMoreMenu }
