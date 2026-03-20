"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, X, Users, Bookmark, FileSearch, Flame, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import PostCard from "@/components/post/PostCard"
import PostSkeleton from "@/components/post/PostSkeleton"
import UserAvatar from "@/components/user/UserAvatar"
import FollowButton from "@/components/user/FollowButton"
import EmptyState from "@/components/shared/EmptyState"
import useUser from "@/hooks/useUser"
import { slugifyCollege } from "@/utils/formatters"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const { user: currentUser } = useUser()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('posts')
  const [postResults, setPostResults] = useState([])
  const [userResults, setUserResults] = useState([])
  const [trending, setTrending] = useState({ communities: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounce logic for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else if (query.trim().length === 0 && hasSearched) {
        setPostResults([])
        setUserResults([])
        setHasSearched(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Fetch trending data when tab changes to 'trending' or on mount
  useEffect(() => {
    if (activeTab === 'trending' && trending.communities.length === 0) {
      fetchTrending()
    }
  }, [activeTab])

  const performSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const [postsRes, usersRes] = await Promise.all([
        fetch(`/api/search/posts?q=${encodeURIComponent(query)}&limit=20`),
        fetch(`/api/search/users?q=${encodeURIComponent(query)}&limit=10`)
      ])

      const [postsData, usersData] = await Promise.all([
        postsRes.json(),
        usersRes.json()
      ])

      if (postsRes.ok) setPostResults(postsData.posts || [])
      if (usersRes.ok) setUserResults(usersData.users || [])
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/search/trending')
      const data = await res.json()
      if (res.ok) {
        setTrending({
          communities: data.trendingCommunities || [],
          users: data.activeUsers || []
        })
      }
    } catch (error) {
      console.error("Failed to fetch trending:", error)
    }
  }

  return (
    <div className="flex-1 max-w-2xl border-r border-border min-h-screen pb-20">
      {/* Sticky search header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b z-20">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts, people, colleges..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="pl-9 bg-accent border-0 focus-visible:ring-1" 
              autoFocus 
            /> 
            {query && ( 
              <button 
                onClick={() => setQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-background/20 rounded-full transition-colors"
              > 
                <X className="w-4 h-4 text-muted-foreground" /> 
              </button> 
            )} 
          </div> 
        </div> 
        
        {/* Tabs */} 
        <div className="flex border-b border-border"> 
          {['posts', 'people', 'trending'].map(tab => ( 
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={cn(
                "flex-1 py-3 text-sm font-medium capitalize transition-all border-b-2",
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/10' 
              )}
            > 
              {tab} 
            </button> 
          ))} 
        </div> 
      </div> 

      {/* Results area */} 
      <div className="min-h-[calc(100vh-120px)]"> 
        {/* POSTS TAB */} 
        {activeTab === 'posts' && ( 
          <div className="animate-in fade-in duration-300"> 
            {loading ? (
              <div className="p-4 space-y-4">
                {Array(3).fill(0).map((_, i) => <PostSkeleton key={i} />)}
              </div>
            ) : !hasSearched ? ( 
              <div className="p-12 text-center text-muted-foreground"> 
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 opacity-50" /> 
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Search CampusX</h3>
                <p className="text-sm">Search for posts by keyword or #topic</p> 
              </div> 
            ) : postResults.length === 0 ? ( 
              <div className="pt-20">
                <EmptyState 
                  icon={FileSearch} 
                  title="No posts found" 
                  description={`No posts matching "${query}"`} 
                /> 
              </div>
            ) : (
              postResults.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  currentUserId={currentUser?._id} 
                />
              ))
            )} 
          </div> 
        )} 
      
        {/* PEOPLE TAB */} 
        {activeTab === 'people' && ( 
          <div className="animate-in fade-in duration-300"> 
            {loading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-accent" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-accent rounded" />
                      <div className="h-3 w-1/4 bg-accent rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasSearched ? ( 
              <div className="p-12 text-center text-muted-foreground"> 
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 opacity-50" /> 
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">Find Students</h3>
                <p className="text-sm">Search for students by name or @username</p> 
              </div> 
            ) : userResults.length === 0 ? ( 
              <div className="pt-20">
                <EmptyState 
                  icon={Users} 
                  title="No people found" 
                  description={`No users matching "${query}"`} 
                /> 
              </div>
            ) : (
              userResults.map(user => ( 
                <div key={user._id} className="flex items-center gap-3 p-4 border-b border-border hover:bg-accent/30 transition-colors group"> 
                  <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                    <UserAvatar user={user} size="md" /> 
                  </Link>
                  <div className="flex-1 min-w-0"> 
                    <Link href={`/profile/${user.username}`}>
                      <p className="font-semibold hover:underline truncate">{user.name}</p> 
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p> 
                    </Link>
                    {user.college && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        🎓 {user.college}
                      </p>
                    )} 
                  </div> 
                  {currentUser?._id !== user._id && (
                    <FollowButton 
                      targetUserId={user._id} 
                      username={user.username}
                      initialIsFollowing={currentUser?.following?.includes(user._id)} 
                      initialFollowersCount={user.followersCount || 0} 
                    /> 
                  )}
                </div> 
              ))
            )} 
          </div> 
        )} 
      
        {/* TRENDING TAB */} 
        {activeTab === 'trending' && ( 
          <div className="p-4 space-y-8 animate-in slide-in-from-bottom-2 duration-500"> 
            <section> 
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-lg">Trending Communities</h2> 
              </div>
              <div className="grid gap-3"> 
                {trending.communities.length === 0 ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-accent/50 rounded-lg animate-pulse" />
                  ))
                ) : (
                  trending.communities.map((c, i) => ( 
                    <Link key={c.name} href={`/community/${slugifyCollege(c.name)}`}> 
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/20 hover:bg-accent/40 border border-border/50 transition-all hover:scale-[1.01] active:scale-[0.99]"> 
                        <span className="text-2xl font-black text-muted-foreground/20 w-8 italic">
                          {i + 1}
                        </span> 
                        <div className="flex-1"> 
                          <p className="font-bold text-foreground">🎓 {c.name}</p> 
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {c.count} posts this week
                          </p> 
                        </div> 
                      </div> 
                    </Link> 
                  ))
                )} 
              </div> 
            </section> 
            
            <Separator className="bg-border/50" /> 
            
            <section> 
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="font-bold text-lg">Most Active Students</h2> 
              </div>
              <div className="grid gap-3"> 
                {trending.users.length === 0 ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-accent/50 rounded-lg animate-pulse" />
                  ))
                ) : (
                  trending.users.map((item, i) => ( 
                    <Link key={item.username} href={`/profile/${item.username}`}> 
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/20 hover:bg-accent/40 border border-border/50 transition-all hover:scale-[1.01] active:scale-[0.99]"> 
                        <span className="text-2xl font-black text-muted-foreground/20 w-8 italic">
                          {i + 1}
                        </span> 
                        <UserAvatar user={item} size="sm" /> 
                        <div className="flex-1 min-w-0"> 
                          <p className="font-bold truncate">{item.name}</p> 
                          <p className="text-xs text-muted-foreground truncate">
                            @{item.username} · {item.postCount} posts
                          </p> 
                        </div> 
                      </div> 
                    </Link> 
                  ))
                )} 
              </div> 
            </section> 
          </div> 
        )} 
      </div> 
    </div>
  )
}
