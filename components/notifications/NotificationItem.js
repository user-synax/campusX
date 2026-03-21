"use client"

import Link from 'next/link'
import { Bell, Heart, MessageCircle, UserPlus, TrendingUp, Calendar, FileText } from 'lucide-react'
import { formatRelativeTime } from '@/utils/formatters'
import UserAvatar from '@/components/user/UserAvatar'

export default function NotificationItem({ notification }) {
  const { type, read, createdAt } = notification
  const actor = notification.actor || notification.sender
  const post = notification.postId || notification.post
  const event = notification.eventId
  const resource = notification.resourceId

  const getActionText = () => {
    switch (type) {
      case 'like': return 'liked your post'
      case 'comment': return 'commented on your post'
      case 'follow': return 'started following you'
      case 'mention': return 'mentioned you in a post'
      case 'level_up': return 'reached a new level!'
      case 'event_reminder': return `Upcoming event: ${event?.title || 'An event'}`
      case 'resource_approved': return `Your resource "${resource?.title || 'Resource'}" was approved!`
      case 'resource_rejected': return `Your resource "${resource?.title || 'Resource'}" was rejected.`
      default: return 'interacted with you'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-400 fill-blue-400" />
      case 'follow': return <UserPlus className="w-4 h-4 text-green-400" />
      case 'mention': return <Bell className="w-4 h-4 text-purple-400" />
      case 'level_up': return <TrendingUp className="w-4 h-4 text-yellow-500" />
      case 'event_reminder': return <Calendar className="w-4 h-4 text-orange-400" />
      case 'resource_approved': return <FileText className="w-4 h-4 text-green-500" />
      case 'resource_rejected': return <FileText className="w-4 h-4 text-red-500" />
      default: return <Bell className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Edge case: deleted actor (except for system notifications)
  if (!actor && !['level_up', 'event_reminder', 'resource_approved', 'resource_rejected'].includes(type)) {
    return (
      <div className="flex gap-3 p-4 border-b border-border bg-accent/10">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="flex-1">
          <p className="text-sm italic text-muted-foreground">A deleted user triggered this notification.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 p-4 border-b border-border hover:bg-accent/30 transition-colors ${!read ? 'bg-accent/10 border-l-2 border-l-primary' : ''}`}>
      {actor ? (
        <UserAvatar user={actor} size="md" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm">
            {actor && (
              <Link href={`/profile/${actor.username}`} className="font-semibold hover:underline">
                {actor.name}
              </Link>
            )}
            {' '}{getActionText()}
            {post && (
              <span className="text-muted-foreground">
                {' · '}
                <Link href={`/post/${post._id}`} className="hover:text-foreground transition-colors">
                  {post.content ? (
                    `"${post.content.substring(0, 40)}${post.content.length > 40 ? '...' : ''}"`
                  ) : (
                    <span className="italic text-xs">(view post)</span>
                  )}
                </Link>
              </span>
            )}
            {event && (
              <span className="text-muted-foreground">
                {' · '}
                <Link href={`/events/${event._id}`} className="hover:text-foreground transition-colors">
                  <span className="italic text-xs">(view event)</span>
                </Link>
              </span>
            )}
            {resource && (
              <span className="text-muted-foreground">
                {' · '}
                <Link href={`/resources/${resource._id}`} className="hover:text-foreground transition-colors">
                  <span className="italic text-xs">(view resource)</span>
                </Link>
              </span>
            )}
          </div>
          {!read && (
            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(new Date(createdAt))}</p>
      </div>
      
      <div className="flex-shrink-0 mt-1">
        {getIcon()}
      </div>
    </div>
  )
}
