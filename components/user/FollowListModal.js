"use client"

import { useState, useEffect, useCallback } from "react"
import { Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import FollowListItem from "./FollowListItem"

export default function FollowListModal({ 
  username, 
  initialTab = 'followers', 
  followersCount, 
  followingCount, 
  open, 
  onOpenChange, 
  currentUserId 
}) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchList = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (!username) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${username}/${activeTab}?page=${pageNum}&limit=20`)
      const data = await res.json()
      
      if (res.ok) {
        setList(prev => isLoadMore ? [...prev, ...data.users] : data.users)
        setHasMore(data.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error)
    } finally {
      setLoading(false)
    }
  }, [username, activeTab])

  useEffect(() => {
    if (open) {
      setList([])
      setPage(1)
      fetchList(1, false)
    }
  }, [open, activeTab, fetchList])

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchList(page + 1, true)
    }
  }

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return count || 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl">
        <DialogTitle className="sr-only">
          {activeTab === 'followers' ? 'Followers' : 'Following'} List
        </DialogTitle>

        {/* Header with tabs */}
        <div className="flex border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-10">
          {['followers', 'following'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-sm font-semibold capitalize transition-all relative ${
                activeTab === tab
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>
                  {tab === 'followers' 
                    ? `Followers` 
                    : `Following`
                  }
                </span>
                <span className="text-[10px] opacity-70">
                  {tab === 'followers' ? formatCount(followersCount) : formatCount(followingCount)}
                </span>
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
              )}
            </button>
          ))}
        </div>

        {/* List Container */}
        <div className="overflow-y-auto max-h-[60vh] min-h-75 scrollbar-thin scrollbar-thumb-border">
          {loading && list.length === 0 ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))
          ) : list.length === 0 ? (
            <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {activeTab === 'followers' 
                  ? 'No followers yet' 
                  : 'Not following anyone yet' 
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                When people follow {activeTab === 'followers' ? 'this user' : 'others'}, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map(user => (
                <FollowListItem
                  key={user._id}
                  user={user}
                  currentUserId={currentUserId}
                  isOwnProfile={user._id === currentUserId}
                  onClose={() => onOpenChange(false)}
                />
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="p-4 text-center border-t-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadMore}
                    disabled={loading}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
