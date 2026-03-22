"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  FileText, 
  ExternalLink, 
  AlertCircle,
  BarChart3,
  Loader2,
  BookOpen
} from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from 'sonner'
import useUser from '@/hooks/useUser'
import { formatFileSize, CATEGORY_CONFIG } from '@/utils/resource-helpers'
import { formatRelativeTime } from '@/utils/formatters'
import EmptyState from '@/components/shared/EmptyState'
import ResourceSkeleton from '@/components/resources/ResourceSkeleton'

const STATUS_CONFIG = {
  pending: {
    label: 'Under Review',
    icon: Clock,
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  approved: {
    label: 'Published',
    icon: CheckCircle,
    className: 'text-green-400 bg-green-500/10 border-green-500/20'
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'text-red-400 bg-red-500/10 border-red-500/20'
  }
}

export default function MyUploadsPage() {
  const { user } = useUser()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchMyResources = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/resources/my')
      const data = await res.json()
      if (res.ok) {
        setResources(data.resources)
      } else {
        toast.error(data.error || 'Failed to fetch uploads')
      }
    } catch (err) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchMyResources()
  }, [user, fetchMyResources])

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource? This cannot be undone.')) return

    try {
      setDeletingId(resourceId)
      const res = await fetch(`/api/resources/${resourceId}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setResources(prev => prev.filter(r => r._id !== resourceId))
        toast.success('Resource deleted')
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (err) {
      toast.error('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex flex-col gap-1 mb-6">
          <div className="h-6 w-32 bg-accent/20 rounded animate-pulse" />
          <div className="h-4 w-48 bg-accent/10 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 w-full bg-accent/5 border border-border/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          My Uploads
        </h1>
        <p className="text-sm font-bold text-muted-foreground mt-1">
          Track and manage your submitted study materials
        </p>
      </header>

      {resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No uploads yet"
          description="Share your notes or PYQs to help the community grow!"
          actionLabel="Upload Resource"
          onAction={() => window.location.href = '/resources'}
        />
      ) : (
        <div className="space-y-4">
          {resources.map(resource => {
            const status = STATUS_CONFIG[resource.status] || STATUS_CONFIG.pending
            const category = CATEGORY_CONFIG[resource.category] || CATEGORY_CONFIG.other

            return (
              <Card key={resource._id} className="overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all rounded-2xl">
                <div className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] font-black uppercase px-2 py-0.5 border-none ${status.className}`}>
                          <status.icon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                          {category.emoji} {category.label}
                        </span>
                      </div>
                      <h3 className="font-black text-base tracking-tight leading-tight mb-1 truncate">{resource.title}</h3>
                      <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                        <span>{formatFileSize(resource.fileSize)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(new Date(resource.createdAt))}</span>
                      </p>
                    </div>

                    {/* Delete button (only for pending/rejected) */}
                    {resource.status !== 'approved' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(resource._id)}
                        disabled={deletingId === resource._id}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        {deletingId === resource._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Rejected Note */}
                  {resource.status === 'rejected' && resource.reviewNote && (
                    <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <div className="flex items-center gap-2 text-red-400 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Reviewer Note</p>
                      </div>
                      <p className="text-xs font-medium text-red-300/80 leading-snug">
                        {resource.reviewNote}
                      </p>
                    </div>
                  )}

                  {/* Approved Stats */}
                  {resource.status === 'approved' && (
                    <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BarChart3 className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Performance:</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{resource.downloadCount}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Downloads</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{resource.viewCount}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Views</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{resource.saveCount}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Saves</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Notice */}
                  {resource.status === 'pending' && (
                    <p className="mt-4 text-[10px] font-bold text-amber-400/60 italic flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Our team will review this within 24 hours. Hang tight!
                    </p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
