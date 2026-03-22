"use client"

import { useState, useEffect, useCallback, Suspense } from 'react'
import { 
  Search, 
  X, 
  Upload, 
  BookOpen, 
  SlidersHorizontal, 
  LayoutGrid, 
  Filter 
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import useUser from '@/hooks/useUser'
import { useDebounce } from '@/hooks/useDebounce'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { CATEGORIES_LIST } from '@/utils/resource-helpers'
import ResourceCard from '@/components/resources/ResourceCard'
import ResourceSkeleton from '@/components/resources/ResourceSkeleton'
import ResourceUploadModal from '@/components/resources/ResourceUploadModal'
import EmptyState from '@/components/shared/EmptyState'
import InfiniteScrollSentinel from '@/components/shared/InfiniteScrollSentinel'

function ResourcesContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  
  // ━━━ State ━━━
  const [resources, setResources] = useState([])
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [search, setSearch] = useState('')
  const [college, setCollege] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const debouncedCollege = useDebounce(college, 400)

  // ━━━ Fetching Logic ━━━
  const fetchResources = useCallback(async (pageNum, append = false) => {
    try {
      if (append) setLoadingMore(true)
      else setLoading(true)

      const params = new URLSearchParams({
        page: pageNum,
        limit: 12,
        sort,
        ...(category !== 'all' && { category }),
        ...(debouncedSearch.length >= 2 && { search: debouncedSearch }),
        ...(debouncedCollege && { college: debouncedCollege })
      })

      const res = await fetch(`/api/resources/browse?${params}`)
      const data = await res.json()

      if (res.ok) {
        if (append) {
          setResources(prev => [...prev, ...data.resources])
        } else {
          setResources(data.resources)
        }
        setHasMore(data.hasMore)
      } else {
        toast.error(data.error || 'Failed to fetch resources')
      }
    } catch (err) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [category, debouncedSearch, debouncedCollege, sort])

  // Initial fetch + Filter changes
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchResources(1, false)
  }, [category, debouncedSearch, debouncedCollege, sort, fetchResources])

  // Infinite Scroll
  const { sentinelRef } = useInfiniteScroll({
    fetchMore: () => {
      const nextPage = page + 1
      setPage(nextPage)
      fetchResources(nextPage, true)
    },
    hasMore,
    loading: loadingMore
  })

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border/50 z-30 shadow-sm">
        {/* Title + Upload */}
        <div className="flex justify-between items-center px-4 py-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Resources
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
              Community Shared Notes
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => setUploadOpen(true)}
            className="h-9 rounded-xl font-black tracking-tight bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, subject or tags..."
              className="pl-9 h-10 text-sm bg-accent/30 border-border/50 focus-visible:ring-primary/20 rounded-xl font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div 
          className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full 
                text-xs whitespace-nowrap border transition-all duration-300
                ${category === cat.id 
                  ? 'bg-primary text-primary-foreground border-primary font-black shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-background border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground font-bold' 
                }
              `}
            >
              <span>{cat.emoji}</span>
              <span className="uppercase tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="flex gap-2 px-4 pb-4">
          <div className="relative flex-1">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="Filter by college name..."
              className="pl-8 h-8 text-[11px] font-bold bg-accent/20 border-border/50 rounded-lg uppercase tracking-tight"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-accent/30 border border-border/50 rounded-lg px-2.5 h-8 text-[11px] font-black uppercase tracking-tighter outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="newest">🕐 Newest</option>
            <option value="popular">🔥 Popular</option>
            <option value="saved">🔖 Bookmarked</option>
            <option value="oldest">⏳ Oldest</option>
          </select>
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex-1 p-4">
        {loading && resources.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)}
          </div>
        ) : resources.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={BookOpen}
              title={search ? `No results for "${search}"` : 'Resource repository is empty'}
              description={
                search 
                  ? 'Try different keywords or refine your filters' 
                  : 'Be the first to upload and help fellow students!'
              }
              actionLabel="Upload First Resource"
              onAction={() => setUploadOpen(true)}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map(r => (
                <ResourceCard 
                  key={r._id} 
                  resource={r} 
                  currentUserId={user?._id} 
                />
              ))}
            </div>
            
            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef}>
              <InfiniteScrollSentinel 
                loading={loadingMore} 
                hasMore={hasMore} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ResourceUploadModal 
        open={uploadOpen} 
        onOpenChange={setUploadOpen}
        onSuccess={() => {
          toast.success('Resource submitted for review!')
        }}
      />
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="p-4 space-y-4">
        <div className="h-20 w-full bg-accent/20 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => <ResourceSkeleton key={i} />)}
        </div>
      </div>
    }>
      <ResourcesContent />
    </Suspense>
  )
}
