"use client"

import { useState } from 'react'
import { 
  AlertTriangle, 
  ExternalLink, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  FileText, 
  Info 
} from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner'
import { CATEGORY_CONFIG, formatFileSize } from '@/utils/resource-helpers'
import { formatRelativeTime } from '@/utils/formatters'
import UserAvatar from "@/components/user/UserAvatar"

/**
 * Admin Resource Review Card
 * Handles the approval and rejection of resources by administrators.
 */
export default function AdminResourceCard({ resource, onReview }) {
  const [reviewNote, setReviewNote] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [action, setAction] = useState(null)

  const handleReview = async (actionType) => {
    if (actionType === 'reject' && reviewNote.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters')
      return
    }

    try {
      setIsReviewing(true)
      setAction(actionType)
      
      const res = await fetch('/api/admin/resources/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resourceId: resource._id, 
          action: actionType, 
          reviewNote: reviewNote.trim() 
        })
      })
      
      const data = await res.json()

      if (res.ok) {
        onReview(resource._id, actionType)
      } else {
        toast.error(data.error || 'Review action failed')
      }
    } catch (err) {
      toast.error('Connection error during review')
    } finally {
      setIsReviewing(false)
      setAction(null)
    }
  }

  const category = CATEGORY_CONFIG[resource.category] || CATEGORY_CONFIG.other

  return (
    <Card className="m-3 overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm shadow-xl"> 
      {/* Copyright warning — shown if auto-flagged by keywords */} 
      {resource.copyrightFlag && ( 
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2.5 
                        flex items-center gap-2"> 
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" /> 
          <p className="text-[11px] text-red-400 font-bold uppercase tracking-tight"> 
            ⚠️ Auto-Flagged: Possible Copyright Risk 
          </p> 
        </div> 
      )} 
 
      <div className="p-4 space-y-4"> 
        {/* Resource info */} 
        <div className="flex items-start justify-between gap-3"> 
          <div className="flex-1 min-w-0"> 
            <div className="flex items-center gap-2 mb-2 flex-wrap"> 
              <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-none uppercase" 
                style={{ 
                  backgroundColor: category.bgColor, 
                  color: category.color 
                }}> 
                {category.emoji} {category.label} 
              </Badge> 
              <span className="text-[9px] font-black border border-border/50 rounded-md px-1.5 py-0.5 text-muted-foreground uppercase bg-accent/30"> 
                {resource.fileType} 
              </span> 
            </div> 
            <h3 className="font-black text-sm leading-tight tracking-tight text-foreground/90">{resource.title}</h3> 
            {resource.subject && ( 
              <p className="text-[11px] text-muted-foreground mt-0.5 font-bold flex items-center gap-1"> 
                <FileText className="w-3 h-3 opacity-50" />
                {resource.subject} 
                {resource.semester && ` · Semester ${resource.semester}`} 
              </p> 
            )} 
            {resource.description && ( 
              <p className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2 leading-snug"> 
                {resource.description} 
              </p> 
            )} 
            {resource.tags?.length > 0 && ( 
              <div className="flex flex-wrap gap-1 mt-2"> 
                {resource.tags.map(t => ( 
                  <span key={t} className="text-[9px] font-black bg-primary/5 text-primary/80 border border-primary/10 px-1.5 py-0.5 rounded-md"> 
                    #{t} 
                  </span> 
                ))} 
              </div> 
            )} 
          </div> 
          <div className="text-right text-[10px] text-muted-foreground flex-shrink-0 font-bold"> 
            <p className="font-mono text-primary/80">{formatFileSize(resource.fileSize)}</p> 
            <p className="text-muted-foreground/40 mt-0.5 uppercase"> 
              {formatRelativeTime(new Date(resource.createdAt))} 
            </p> 
          </div> 
        </div> 
 
        {/* Uploader info */} 
        <div className="flex items-center gap-2.5 pt-3 border-t border-border/50"> 
          <UserAvatar user={resource.uploadedBy} size="sm" /> 
          <div> 
            <p className="text-xs font-black flex items-center gap-1 tracking-tight"> 
              {resource.uploadedBy.name} 
              {resource.uploadedBy.isVerified && ' ✅'} 
            </p> 
            <p className="text-[10px] text-muted-foreground font-bold"> 
              @{resource.uploadedBy.username} 
              {resource.uploadedBy.college && ` · ${resource.uploadedBy.college}`} 
            </p> 
          </div> 
        </div> 
 
        {/* Preview link */} 
        {resource.fileUrl && ( 
          <a 
            href={resource.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 text-[11px] font-black text-primary hover:underline w-fit transition-all bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10" 
          > 
            <ExternalLink className="w-3.5 h-3.5" /> 
            Open file to review 
          </a> 
        )} 
 
        {/* Review section */} 
        <div className="space-y-3 pt-3 border-t border-border/50 bg-accent/5 -mx-4 px-4 pb-2"> 
          <div className="flex items-center gap-1.5 mb-1 opacity-60">
            <Info className="w-3 h-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">Decision Section</p>
          </div>
          
          <Textarea 
            placeholder="Rejection requires reason (min 10 chars)..." 
            value={reviewNote} 
            onChange={(e) => setReviewNote(e.target.value)} 
            rows={2} 
            className="resize-none text-xs font-medium border-border/50 bg-background/50 focus:bg-background" 
            maxLength={300} 
          /> 
 
          <div className="flex gap-2"> 
            <Button 
              onClick={() => handleReview('approve')} 
              disabled={isReviewing} 
              className="flex-1 bg-green-600 hover:bg-green-700 h-10 text-xs font-black tracking-tight" 
            > 
              {isReviewing && action === 'approve' 
                ? <Loader2 className="w-4 h-4 animate-spin" /> 
                : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</> 
              } 
            </Button> 
            <Button 
              onClick={() => handleReview('reject')} 
              disabled={isReviewing || reviewNote.trim().length < 10} 
              variant="destructive" 
              className="flex-1 h-10 text-xs font-black tracking-tight" 
              title={reviewNote.trim().length < 10 
                ? 'Add rejection reason first (min 10 chars)' 
                : '' 
              } 
            > 
              {isReviewing && action === 'reject' 
                ? <Loader2 className="w-4 h-4 animate-spin" /> 
                : <><XCircle className="w-4 h-4 mr-2" /> Reject</> 
              } 
            </Button> 
          </div> 
          <p className="text-[9px] text-muted-foreground font-bold text-center italic opacity-60"> 
            Warning: Rejection permanently deletes the file from storage. 
          </p> 
        </div> 
      </div> 
    </Card> 
  )
}
