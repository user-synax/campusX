"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { User, MapPin, GraduationCap } from "lucide-react"

export default function UserMention({ username }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPopover, setShowPopover] = useState(false)
  const [popoverPos, setPopoverPos] = useState('bottom') // 'bottom' or 'top'

  // Fetch brief user info for popover
  const fetchUserBrief = async () => {
    if (user || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${username}`)
      if (res.ok) {
        const data = await res.json()
        // API returns the user object directly, not wrapped in { user: ... }
        setUser(data)
      }
    } catch (error) {
      console.error("Failed to fetch user brief:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="relative inline align-baseline">
      <Link
        href={`/profile/${username}`}
        className="text-primary font-bold hover:brightness-125 transition-all relative z-10"
        onMouseEnter={() => {
          setShowPopover(true)
          fetchUserBrief()
        }}
        onMouseLeave={() => setShowPopover(false)}
        onClick={(e) => e.stopPropagation()}
      >
        @{username}
      </Link>

      {/* Popover (Desktop only, visible on hover) */}
      <div 
        className={`hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 w-52 p-3 
                   bg-card border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-9999 transition-all duration-200
                   ${showPopover ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-2 scale-95 pointer-events-none'}`}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        {loading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-secondary text-xs">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-bold text-xs truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
              {user.college && (
                <div className="flex items-center gap-1 truncate">
                  <GraduationCap className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{user.college}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="w-2.5 h-2.5 shrink-0" />
                <span>{user.followersCount || 0} followers</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-1 text-[10px] text-muted-foreground">
            User not found
          </div>
        )}
        
        {/* Triangle arrow (Pointing left) */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-card" />
      </div>
    </span>
  )
}