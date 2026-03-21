"use client"

import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const UserAvatar = memo(function UserAvatar({ user, size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  if (!user) {
    return (
      <div className={cn(
        "rounded-full bg-secondary flex items-center justify-center text-muted-foreground",
        sizeClasses[size],
        className
      )}>
        <UserIcon className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
      </div>
    )
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="bg-secondary text-xs">
        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
})

export default UserAvatar
