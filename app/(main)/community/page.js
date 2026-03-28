"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, Search, Plus } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/shared/EmptyState"
import CreateCommunityDialog from "@/components/post/CreateCommunityDialog"
import { useDebounce } from "@/hooks/useDebounce"

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities')
      const data = await res.json()
      if (res.ok) {
        setCommunities(data)
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Communities</h1>
        <CreateCommunityDialog onCreated={fetchCommunities} />
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search communities..." 
            className="pl-9 bg-accent/20 border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 border-border">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={GraduationCap}
              title={search ? "No results found" : "No communities yet"}
              description={search ? `We couldn't find any community matching "${search}"` : "Be the first to post from your college to create a community!"}
            />
            {!search && <CreateCommunityDialog onCreated={fetchCommunities} />}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCommunities.map(community => (
              <Link key={community.slug} href={`/community/${community.slug}`}>
                <Card className="p-4 border-border hover:bg-accent/30 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        🎓 {community.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {community.postCount} posts · {community.memberCount} members
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full px-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      View
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
