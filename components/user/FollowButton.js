"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function FollowButton({ targetUserId, username, initialIsFollowing, initialFollowersCount, onToggle, compact = false }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsLoading(true)
    
    // Optimistic update
    const wasFollowing = isFollowing
    setIsFollowing(!wasFollowing)
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1)

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      // Sync with server
      setIsFollowing(data.following)
      setFollowersCount(data.followersCount)
      if (onToggle) onToggle(data.following, data.followersCount)

      if (data.following) {
        toast.success(`Following @${username}`, {
          description: "You're now connected with this user.",
        })
      } else {
        toast.success(`Unfollowed @${username}`, {
          description: "You've disconnected with this user.",
        })
      }
    } catch (error) {
      // Revert optimistic update
      setIsFollowing(wasFollowing)
      setFollowersCount(initialFollowersCount)
      toast.error("Failed to update follow status", {
        description: error.message || 'An unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFollowing) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled={isLoading}
        onClick={handleFollow}
        className={cn(
          "rounded-full hover:bg-destructive hover:text-white hover:border-destructive group",
          compact ? "px-3 h-8 text-xs" : "px-6"
        )}
      >
        <span className="group-hover:hidden">Following</span>
        <span className="hidden group-hover:inline">Unfollow</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      disabled={isLoading}
      onClick={handleFollow}
      className={cn(
        "rounded-full",
        compact ? "px-4 h-8 text-xs font-bold" : "px-6"
      )}
    >
      Follow
    </Button>
  )
}
