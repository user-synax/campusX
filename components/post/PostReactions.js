import { memo } from 'react'
import { cn } from "@/lib/utils"
import { REACTIONS as REACTION_EMOJIS } from "@/lib/reaction-utils"

const PostReactions = memo(function PostReactions({
  userReaction,
  reactionSummary,
  showPicker,
  onTogglePicker,
  onHoverEnter,
  onHoverLeave,
  onReact
}) {
  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return count
  }

  return (
    <div 
      className="relative"
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <ReactionPickerPanel onSelect={onReact} />
        </div>
      )}

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (userReaction) {
            onReact(userReaction)
          } else {
            onTogglePicker()
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
  )
})

const ReactionPickerPanel = memo(function ReactionPickerPanel({ onSelect }) {
  const reactions = [
    { type: 'like', emoji: '❤️', label: 'Like' },
    { type: 'funny', emoji: '😂', label: 'Funny' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'respect', emoji: '👏', label: 'Respect' },
    { type: 'fire', emoji: '🔥', label: 'Fire' }
  ]

  return (
    <div className="bg-background border rounded-full px-2 py-1.5 shadow-lg flex gap-1">
      {reactions.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelect(type)
          }}
          className="p-1.5 hover:bg-accent rounded-full transition-all hover:scale-125"
          title={label}
        >
          <span className="text-lg">{emoji}</span>
        </button>
      ))}
    </div>
  )
})

export { PostReactions, ReactionPickerPanel }
