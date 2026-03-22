"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  Loader2, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react'
import { toast } from 'sonner'
import useUser from '@/hooks/useUser'
import { isAdmin } from '@/lib/admin'
import EmptyState from '@/components/shared/EmptyState'
import AdminResourceCard from '@/components/admin/AdminResourceCard'

export default function AdminResourcesPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // ━━━ Auth Check ━━━
  useEffect(() => {
    if (!userLoading && (!user || !isAdmin(user))) {
      router.replace('/feed')
    }
  }, [user, userLoading, router])

  // ━━━ Fetch Data ━━━
  const fetchData = async (pageNum = 1) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/resources?page=${pageNum}`)
      const data = await res.json()

      if (res.ok) {
        if (pageNum === 1) {
          setResources(data.resources)
        } else {
          setResources(prev => [...prev, ...data.resources])
        }
        setStats(data.stats)
        setHasMore(data.hasMore)
      } else {
        toast.error(data.error || 'Failed to fetch queue')
      }
    } catch (err) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin(user)) {
      fetchData(1)
    }
  }, [user])

  const handleReviewComplete = (resourceId, action) => {
    setResources(prev => prev.filter(r => r._id !== resourceId))
    setStats(prev => ({
      ...prev,
      pending: prev.pending - 1,
      [action === 'approve' ? 'approved' : 'rejected']: 
        prev[action === 'approve' ? 'approved' : 'rejected'] + 1
    }))
    toast.success(`Resource ${action === 'approve' ? 'approved' : 'rejected'}`)
  }

  if (userLoading || (loading && page === 1)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium">Loading review queue...</p>
      </div>
    )
  }

  if (!user || !isAdmin(user)) return null

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Sticky header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Review Queue</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'amber', icon: Clock },
          { label: 'Approved', value: stats.approved, color: 'green', icon: CheckCircle2 },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle }
        ].map(s => (
          <div key={s.label} className={`
            rounded-2xl p-4 text-center border transition-all
            ${s.color === 'amber' ? 'bg-amber-500/5 border-amber-500/10' : ''}
            ${s.color === 'green' ? 'bg-green-500/5 border-green-500/10' : ''}
            ${s.color === 'red' ? 'bg-red-500/5 border-red-500/10' : ''}
          `}>
            <div className="flex flex-col items-center gap-1">
              <s.icon className={`w-4 h-4 mb-1 
                ${s.color === 'amber' ? 'text-amber-500' : ''}
                ${s.color === 'green' ? 'text-green-500' : ''}
                ${s.color === 'red' ? 'text-red-500' : ''}
              `} />
              <p className={`text-2xl font-black leading-none
                ${s.color === 'amber' ? 'text-amber-400' : ''}
                ${s.color === 'green' ? 'text-green-400' : ''}
                ${s.color === 'red' ? 'text-red-400' : ''}
              `}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resources list */}
      <div className="space-y-4 px-1">
        {resources.length === 0 ? (
          <div className="pt-10">
            <EmptyState
              icon={CheckCircle}
              title="Queue is empty!"
              description="All submitted resources have been reviewed. Good job!"
            />
          </div>
        ) : (
          <>
            {resources.map(resource => (
              <AdminResourceCard
                key={resource._id}
                resource={resource}
                onReview={handleReviewComplete}
              />
            ))}
            
            {hasMore && (
              <div className="p-4 flex justify-center">
                <button 
                  onClick={() => {
                    const nextPage = page + 1
                    setPage(nextPage)
                    fetchData(nextPage)
                  }}
                  disabled={loading}
                  className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more items'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
