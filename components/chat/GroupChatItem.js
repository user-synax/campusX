"use client"

import { formatRelativeTime } from '@/utils/formatters'
import Image from 'next/image'
import FormattedTime from '@/components/shared/FormattedTime'

export default function GroupChatItem({ group, currentUserId, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 
                 transition-colors cursor-pointer border-b border-border/50 active:bg-accent/50"
    >
      {/* Group avatar or initials */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500/30 to-blue-500/30 
                        border border-border flex items-center justify-center font-bold text-lg overflow-hidden">
          {group.avatar 
            ? <Image src={group.avatar} alt={group.name} className="w-full h-full object-cover" /> 
            : group.name.charAt(0).toUpperCase() 
          }
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold truncate pr-2 group-hover:text-primary transition-colors">
            {group.name}
          </h3>
          <FormattedTime 
            date={group.lastMessage?.sentAt || group.updatedAt} 
            className="text-[10px] text-muted-foreground whitespace-nowrap" 
          />
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {group.lastMessage 
              ? group.lastMessage.type === 'system' 
                ? <span className="italic">{group.lastMessage.content}</span> 
                : `${group.lastMessage.senderName}: ${group.lastMessage.content}` 
              : 'No messages yet' 
            }
          </p>

          {/* Unread badge */}
          {group.unreadCount > 0 && (
            <div className="shrink-0 ml-2 w-5 h-5 rounded-full bg-primary 
                            flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">
                {group.unreadCount > 99 ? '99' : group.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
