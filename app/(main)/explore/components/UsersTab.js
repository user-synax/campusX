"use client"

import { useState, useEffect } from "react"
import { Users, RefreshCw, UserPlus } from "lucide-react"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"
import VerifiedBadge from '@/components/shared/VerifiedBadge'
import EmptyState from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersTab({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/explore/users')
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users || [])
      } else {
        throw new Error(data.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Explore users error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  const handleRefresh = () => {
    fetchUsers()
  }

  if (loading && users.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-border">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">People you might know</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Users list */}
      <div className="flex-1">
        {users.length === 0 && !loading ? (
          <div className="pt-20">
            <EmptyState
              icon={Users}
              title="No recommendations yet"
              description="Update your profile with your college, course, and interests to get better suggestions!"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map(user => (
              <div key={user._id} className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors group">
                <UserAvatar user={user} size="md" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold truncate">{user.name}</p>
                    {user.isVerified && (
                      <VerifiedBadge size="sm" verificationType={user.verificationType} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                  
                  {user.college && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      🎓 {user.college}
                      {user.course && ` • ${user.course}`}
                    </p>
                  )}
                  
                  {user.interests && user.interests.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {user.interests.slice(0, 3).map((interest, i) => (
                        <span key={interest} className="inline-block">
                          {i > 0 && ' • '}{interest}
                        </span>
                      ))}
                      {user.interests.length > 3 && ` +${user.interests.length - 3}`}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{user.followersCount || 0} followers</span>
                    <span>{user.followingCount || 0} following</span>
                  </div>
                </div>

                {currentUser?._id !== user._id && (
                  <FollowButton
                    targetUserId={user._id}
                    username={user.username}
                    initialIsFollowing={currentUser?.following?.includes(user._id)}
                    initialFollowersCount={user.followersCount || 0}
                    compact
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
