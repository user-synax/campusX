"use client" 
 
import Link from 'next/link' 
import UserAvatar from '@/components/user/UserAvatar' 
import { formatRelativeTime } from '@/utils/formatters' 
 
export default function NotificationItem({ notification, onRead, compact }) { 
  return ( 
    <Link 
      href={notification.url || '/notifications'} 
      onClick={onRead} 
      className={` 
        flex items-start gap-3 px-4 py-3 
        hover:bg-accent/40 transition-colors 
        border-b border-border/50 last:border-0 
        cursor-pointer 
        ${!notification.read ? 'bg-accent/20' : ''} 
        ${compact ? 'py-2 px-3 gap-2' : ''} 
      `} 
    > 
      {/* Left: avatar or icon */} 
      <div className="relative flex-shrink-0 mt-0.5"> 
        {notification.sender ? ( 
          <div className="relative"> 
            <UserAvatar user={notification.sender} size={compact ? "sm" : "md"} /> 
            {/* Notification type icon overlay */} 
            <span className=" 
              absolute -top-1 -right-1 
              w-5 h-5 rounded-full 
              bg-card border border-border 
              flex items-center justify-center 
              text-[10px] 
            "> 
              {notification.icon} 
            </span> 
          </div> 
        ) : ( 
          // System notification — just icon 
          <div className={` 
            rounded-full bg-accent border border-border 
            flex items-center justify-center text-lg 
            ${compact ? 'w-8 h-8 text-base' : 'w-10 h-10'} 
          `}> 
            {notification.icon} 
          </div> 
        )} 
      </div> 
 
      {/* Right: text + time */} 
      <div className="flex-1 min-w-0"> 
        <p className={`text-sm leading-snug ${!notification.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}> 
          {notification.text} 
        </p> 
 
        {/* Post preview if available */} 
        {notification.postId && notification.meta?.postPreview && ( 
          <p className="text-xs text-muted-foreground mt-0.5 truncate italic"> 
            &ldquo;{notification.meta.postPreview}&rdquo;
          </p> 
        )} 
 
        <p className="text-[11px] text-muted-foreground mt-1"> 
          {formatRelativeTime(new Date(notification.createdAt))} 
        </p> 
      </div> 
 
      {/* Unread dot */} 
      {!notification.read && ( 
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" /> 
      )} 
    </Link> 
  ) 
} 
