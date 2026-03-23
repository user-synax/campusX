"use client"

import { useState, useEffect } from 'react'
import {
  MoreVertical,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  AlertCircle,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import UserAvatar from "@/components/user/UserAvatar"
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function AdminReportedContent() {
  const [reportedPosts, setReportedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportedContent()
  }, [])

  const fetchReportedContent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/content/reported')
      const data = await res.json()
      setReportedPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch reported content:', error)
      toast.error('Failed to load reported posts')
    } finally {
      setLoading(false)
    }
  }

  const handleContentAction = async (postId, action) => {
    try {
      const res = await fetch(`/api/admin/content/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: 'Admin moderation' })
      })

      if (res.ok) {
        toast.success(`Action ${action} performed successfully`)
        fetchReportedContent() // Refresh
      } else {
        const data = await res.json()
        toast.error(data.error || 'Action failed')
      }
    } catch (error) {
      console.error('Content action failed:', error)
      toast.error('Network error')
    }
  }

  if (loading && reportedPosts.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4 border-b border-border sticky top-[105px] bg-background z-10 flex items-center justify-between">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Reported Posts ({reportedPosts.length})
        </h2>
        <Button variant="ghost" size="sm" onClick={fetchReportedContent}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {reportedPosts.length > 0 ? (
          reportedPosts.map((post) => (
            <div key={post._id} className="border border-border/50 rounded-xl m-3 overflow-hidden bg-accent/10 hover:bg-accent/20 transition-colors">
              {/* Report count badge */}
              <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px] text-red-400 font-black uppercase tracking-wider">
                  🚨 {post.reportCount} report{post.reportCount !== 1 ? 's' : ''}
                </span>
                {post.isHidden && (
                  <span className="text-[10px] text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full bg-amber-400/10 font-bold uppercase tracking-tight">
                    Hidden
                  </span>
                )}
              </div>

              {/* Post content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <UserAvatar user={post.author} size="xs" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{post.author?.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/30">
                  <p className="text-sm line-clamp-4 whitespace-pre-wrap">{post.content}</p>
                </div>
                {post.images?.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-muted-foreground bg-accent/20 px-2 py-1 rounded w-fit">
                    📷 {post.images.length} image{post.images.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-[10px] font-bold h-9 bg-background border-border/50 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 uppercase tracking-tight"
                  onClick={() => handleContentAction(post._id, 'clear_reports')}
                >
                  ✅ Safe
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`flex-1 text-[10px] font-bold h-9 bg-background border-border/50 uppercase tracking-tight ${
                    post.isHidden 
                      ? 'text-blue-400 border-blue-400/30 hover:bg-blue-400/10' 
                      : 'text-amber-400 border-amber-400/30 hover:bg-amber-400/10'
                  }`}
                  onClick={() => handleContentAction(post._id, post.isHidden ? 'unhide' : 'hide')}
                >
                  {post.isHidden ? '👁 Unhide' : '🙈 Hide'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 text-[10px] font-bold h-9 uppercase tracking-tight"
                  onClick={() => handleContentAction(post._id, 'delete')}
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center">
            <div className="flex flex-col items-center gap-2 opacity-40">
              <CheckCircle className="w-12 h-12" />
              <p className="text-sm font-medium">Inbox zero! No reported content to review.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
