"use client"

import Link from 'next/link'
import { Heart, MessageCircle, UserPlus } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'
import UserAvatar from '@/components/user/UserAvatar'

export default function NotificationItem({ notification }) {
  const { sender, type, post, read, createdAt } = notification

  // Edge case: deleted sender
  if (!sender) {
    return (
      <div className="flex gap-3 p-4 border-b border-border bg-accent/10">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        <div className="flex-1">
          <p className="text-sm italic text-muted-foreground">A deleted user triggered this notification.</p>
        </div>
      </div>
    )
  }

  const getActionText = () => {
    switch (type) {
      case 'like': return 'liked your post'
      case 'comment': return 'commented on your post'
      case 'follow': return 'started following you'
      default: return 'interacted with you'
    }
  }

  const Icon = () => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-400 fill-blue-400" />
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />
      default: return null
    }
  }

  return (
    <div className={`flex gap-3 p-4 border-b border-border hover:bg-accent/30 transition-colors ${!read ? 'bg-accent/20' : ''}`}>
      <UserAvatar user={sender} size="md" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <Link href={`/profile/${sender.username}`} className="font-semibold hover:underline">
              {sender.name}
            </Link>
            {' '}{getActionText()}
            {post && (
              <span className="text-muted-foreground">
                {' · '}
                {post.content ? (
                  `"${post.content}"`
                ) : (
                  <span className="italic text-xs">(post deleted)</span>
                )}
              </span>
            )}
          </p>
          {!read && (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(new Date(createdAt))}</p>
      </div>
      
      <div className="flex-shrink-0 mt-1">
{type === 'like' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
{type === 'comment' && <MessageCircle className="w-4 h-4 text-blue-400 fill-blue-400" />}
{type === 'follow' && <UserPlus className="w-4 h-4 text-green-400" />}
      </div>
    </div>
  )
}
