"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"
import useUser from "@/hooks/useUser"

export default function RightPanel() {
  const { user: currentUser, loading: userLoading } = useUser()
  const [trending, setTrending] = useState([])
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trendRes, suggestRes, hashtagRes] = await Promise.all([
          fetch('/api/communities?limit=5'),
          fetch('/api/users/suggestions'),
          fetch('/api/hashtags/trending?limit=6')
        ])
        
        const trendData = await trendRes.json()
        const suggestData = await suggestRes.json()
        const hashtagData = await hashtagRes.json()
        
        if (trendRes.ok) setTrending(trendData)
        if (suggestRes.ok) setSuggestions(suggestData)
        if (hashtagRes.ok) setTrendingHashtags(hashtagData.hashtags || [])
      } catch (error) {
        console.error('Right panel fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCount = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
    return count
  }

  return (
    <aside className="hidden xl:flex flex-col sticky top-0 h-screen w-[350px] p-4 space-y-6 overflow-y-auto">
      {/* Trending */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Trending on CampusX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-32 bg-secondary" />
                <Skeleton className="h-3 w-16 bg-secondary" />
              </div>
            ))
          ) : trending.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No trending communities yet.</p>
          ) : (
            trending.slice(0, 5).map((item) => (
              <Link key={item.slug} href={`/community/${item.slug}`} className="group block">
                <p className="text-sm font-semibold group-hover:underline">🎓 {item.name}</p>
                <p className="text-xs text-muted-foreground">{item.postCount} posts · {item.memberCount} members</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Trending Hashtags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24 bg-secondary" />
                <Skeleton className="h-3 w-12 bg-secondary" />
              </div>
            ))
          ) : trendingHashtags.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No trending hashtags yet.</p>
          ) : (
            trendingHashtags.map((ht) => (
              <Link key={ht.tag} href={`/hashtag/${ht.tag}`} className="group block">
                <p className="text-sm font-semibold group-hover:underline text-primary">#{ht.tag}</p>
                <p className="text-xs text-muted-foreground">{formatCount(ht.postCount)} posts</p>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Who to Follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24 bg-secondary" />
                  <Skeleton className="h-3 w-16 bg-secondary" />
                </div>
              </div>
            ))
          ) : suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No suggestions found.</p>
          ) : (
            suggestions.map((user) => (
              <div key={user._id} className="flex items-center gap-3">
                <UserAvatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.username}`} className="text-sm font-semibold hover:underline truncate block">
                    {user.name}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
                <FollowButton 
                  targetUserId={user._id} 
                  username={user.username}
                  initialIsFollowing={currentUser?.following?.includes(user._id)} 
                  initialFollowersCount={0} // Not showing on suggestions
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <footer className="px-4 text-[11px] text-muted-foreground space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Cookie Policy</span>
          <span className="hover:underline cursor-pointer">Accessibility</span>
        </div>
        <p>© 2026 CampusX · Built for students</p>
      </footer>
    </aside>
  )
}
