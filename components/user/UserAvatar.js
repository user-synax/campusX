"use client"

import { memo } from 'react'
import AvatarWithFrame from '@/components/coins/AvatarWithFrame'
import { cn } from "@/lib/utils"

const UserAvatar = memo(function UserAvatar({ user, size = 'md', className }) {
  // If the user object already has equipped data, use it
  const equipped = user?.equipped || null

  return (
    <AvatarWithFrame 
      user={user} 
      size={size} 
      equipped={equipped} 
      className={className} 
    />
  )
})

export default UserAvatar
