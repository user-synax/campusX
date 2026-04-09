"use client"

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Search,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Mail
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UserAvatar from "@/components/user/UserAvatar"
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function AdminVerifications() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending, verified, rejected, all
  const [stats, setStats] = useState({
    totalVerified: 0,
    pendingCount: 0,
    rejectedCount: 0,
    collegeEmailAutoVerified: 0
  })

  // Action state
  const [processingId, setProcessingId] = useState(null)
  
  // Reject Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchVerifications()
  }, [filter])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/verifications?status=${filter}&limit=50`)
      const data = await res.json()
      
      if (res.ok) {
        setUsers(data.users || [])
        if (data.stats) setStats(data.stats)
      } else {
        toast.error(data.error || 'Failed to fetch verifications')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      setProcessingId(userId)
      const res = await fetch('/api/admin/verifications/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success('User verified successfully')
        fetchVerifications() // Refresh list and stats
      } else {
        toast.error(data.error || 'Failed to approve')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectDialog = (user) => {
    setSelectedUser(user)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error('Please provide a valid reason (min 5 characters)')
      return
    }

    try {
      setProcessingId(selectedUser._id)
      const res = await fetch('/api/admin/verifications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser._id,
          reason: rejectReason.trim()
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Verification rejected for ${selectedUser.username}`)
        setRejectDialogOpen(false)
        fetchVerifications() // Refresh
      } else {
        toast.error(data.error || 'Failed to reject')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-10">
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-background z-10 sticky top-[105px] border-b border-border">
        <StatCard title="Pending" value={stats.pendingCount} icon={<Clock className="w-4 h-4 text-yellow-500" />} color="amber" />
        <StatCard title="Total Verified" value={stats.totalVerified} icon={<ShieldCheck className="w-4 h-4 text-green-500" />} color="green" />
        <StatCard title="Auto (Email)" value={stats.collegeEmailAutoVerified} icon={<Mail className="w-4 h-4 text-blue-500" />} color="blue" />
        <StatCard title="Rejected" value={stats.rejectedCount} icon={<XCircle className="w-4 h-4 text-red-500" />} color="red" />
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-border">
        {['pending', 'verified', 'rejected', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === status 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent/50 text-muted-foreground hover:bg-accent'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted-foreground">
            No {filter} verifications found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {users.map(u => (
              <VerificationCard 
                key={u._id} 
                user={u} 
                onApprove={() => handleApprove(u._id)}
                onReject={() => openRejectDialog(u)}
                isProcessing={processingId === u._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Reject Verification
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting @{selectedUser?.username}'s college ID. This will be sent to them via email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="e.g., ID picture is too blurry, name doesn't match, not a valid college ID..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none h-24 bg-background border-border/50 focus-visible:ring-red-500/50"
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)} disabled={processingId === selectedUser?._id}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processingId === selectedUser?._id}
              className="gap-2"
            >
              {processingId === selectedUser?._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject & Notify User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VerificationCard({ user, onApprove, onReject, isProcessing }) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden flex flex-col">
      <CardHeader className="p-4 pb-0 flex flex-row items-start gap-3">
        <UserAvatar user={user} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate flex items-center gap-1.5">
            {user.name}
            {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          </p>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
            {getStatusBadge(user.verificationStatus, user.verificationType)}
            <span className="px-1.5 py-0.5 rounded bg-accent text-muted-foreground border border-border">
              Joined {formatDistanceToNow(new Date(user.createdAt))} ago
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-3 flex-1 flex flex-col">
        {user.college && (
          <p className="text-xs font-medium text-foreground mb-3 truncate">
            🏫 {user.college} {user.course ? `• ${user.course}` : ''} {user.year ? `• Year ${user.year}` : ''}
          </p>
        )}
        
        {/* ID Card Display */}
        {user.collegeIdUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-black/40 flex-1 min-h-[140px] flex items-center justify-center">
            {/* If it's a PDF, Cloudinary URL might end in .pdf, but let's assume image for preview */}
            <img 
              src={user.collegeIdUrl} 
              alt="College ID" 
              className="max-h-[200px] object-contain w-full"
              loading="lazy"
            />
            {/* Hover overlay to open full image */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <a 
                href={user.collegeIdUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Size
              </a>
            </div>
            
            <div className="absolute top-2 right-2 text-[10px] bg-black/70 text-white px-2 py-1 rounded backdrop-blur-md font-mono">
              {formatDistanceToNow(new Date(user.verificationRequestedAt), { addSuffix: true })}
            </div>
          </div>
        ) : user.verificationType === 'college_email' ? (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col items-center justify-center text-center flex-1 min-h-[140px]">
            <Mail className="w-8 h-8 text-blue-400 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-blue-400">Auto-Verified via Email</p>
            <p className="text-xs text-muted-foreground mt-1">{user.collegeEmail}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-accent/30 p-4 flex items-center justify-center text-xs text-muted-foreground flex-1 min-h-[140px]">
            No ID Card Provided
          </div>
        )}

        {/* Rejection Reason (if rejected) */}
        {user.verificationStatus === 'rejected' && user.verificationRejectedReason && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-muted-foreground">
            <span className="font-semibold text-red-400">Rejected: </span>
            {user.verificationRejectedReason}
          </div>
        )}

        {/* Action Buttons (Only for Pending) */}
        {user.verificationStatus === 'pending' && (
          <div className="flex gap-3 mt-4">
            <Button 
              variant="outline" 
              className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 h-10"
              onClick={onReject}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-500 text-white h-10"
              onClick={onApprove}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />}
              <span className="truncate">Approve</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    red: 'bg-red-500/10 border-red-500/20',
    amber: 'bg-yellow-500/10 border-yellow-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20'
  }
  return (
    <div className={`p-3 rounded-xl border flex items-center justify-between ${colors[color]}`}>
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground">{title}</p>
        <p className="text-xl font-black mt-0.5">{value}</p>
      </div>
      <div className="p-2 rounded-full bg-background border border-border/50 shadow-sm">
        {icon}
      </div>
    </div>
  )
}

function getStatusBadge(status, type) {
  switch(status) {
    case 'verified':
      return (
        <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/30 flex items-center gap-1">
          ✓ Verified {type === 'college_email' && '(Email)'}
        </span>
      )
    case 'pending':
      return (
        <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/30">
          ⏳ Pending Review
        </span>
      )
    case 'rejected':
      return (
        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
          ✕ Rejected
        </span>
      )
    default:
      return null
  }
}
