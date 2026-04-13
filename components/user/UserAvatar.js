"use client"

import { memo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const UserAvatar = memo(function UserAvatar({ user, size = 'md', className }) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <Avatar className={cn(sizeClasses[size] || sizeClasses.md, className)}>
      <AvatarImage src={user?.avatar} alt={user?.name} />
      <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
    </Avatar>
  )
})

export default UserAvatar
