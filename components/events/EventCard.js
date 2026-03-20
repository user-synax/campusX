"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Clock, MapPin, GraduationCap, Users, MoreVertical, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function EventCard({ event, currentUserId, onRsvpChange, onDelete }) {
  const [isRsvped, setIsRsvped] = useState(false)
  const [rsvpCount, setRsvpCount] = useState(event.rsvpCount || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStatusLoading, setIsStatusLoading] = useState(true)

  const isOrganizer = currentUserId && event.organizer?._id?.toString() === currentUserId.toString()

  useEffect(() => {
    if (!currentUserId) {
      setIsStatusLoading(false)
      return
    }

    const checkRsvpStatus = async () => {
      try {
        const res = await fetch(`/api/events/${event._id}/rsvp-status`)
        const data = await res.json()
        if (res.ok) {
          setIsRsvped(data.rsvped)
        }
      } catch (error) {
        console.error("Failed to check RSVP status:", error)
      } finally {
        setIsStatusLoading(false)
      }
    }

    checkRsvpStatus()
  }, [event._id, currentUserId])

  const handleRsvp = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      toast.error("Please login to RSVP")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/events/${event._id}/rsvp`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setIsRsvped(data.rsvped)
      setRsvpCount(data.rsvpCount)
      
      if (onRsvpChange) {
        onRsvpChange(event._id, data.rsvped, data.rsvpCount)
      }

      toast.success(data.rsvped ? "RSVP successful!" : "RSVP cancelled")
    } catch (error) {
      toast.error(error.message || "Failed to RSVP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to cancel this event? This will notify all attendees.")) return

    try {
      const res = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success("Event cancelled")
        if (onDelete) onDelete(event._id)
      } else {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete event")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const eventDate = new Date(event.eventDate)

  return (
    <Card className="overflow-hidden hover:bg-accent/20 transition-colors"> 
      {/* Date banner — colored strip */} 
      <div className="bg-linear-to-r from-accent to-muted h-1.5" /> 
      
      <div className="p-4"> 
        {/* Header */} 
        <div className="flex justify-between items-start gap-2"> 
          <div className="flex-1">  
            <Link href={`/events/${event._id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-base leading-tight">{event.title}</h3> 
            </Link>
            <p className="text-xs text-muted-foreground mt-1"> 
              by <Link href={`/profile/${event.organizer?.username}`} className="hover:underline font-medium text-foreground/80">{event.organizer?.name}</Link> 
            </p> 
          </div> 
          
          {/* Date badge */} 
          <div className="text-center bg-accent rounded-lg px-3 py-1.5 shrink-0"> 
            <p className="text-xs text-muted-foreground uppercase tracking-wide"> 
              {format(eventDate, 'MMM')} 
            </p> 
            <p className="text-xl font-bold leading-none"> 
              {format(eventDate, 'd')} 
            </p> 
          </div> 
        </div> 
        
        {/* Details row */} 
        <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground"> 
          <span className="flex items-center gap-1"> 
            <Clock className="w-3.5 h-3.5" /> 
            {format(eventDate, 'h:mm a')} 
          </span> 
          <span className="flex items-center gap-1"> 
            <MapPin className="w-3.5 h-3.5" /> 
            {event.location} 
          </span> 
          <span className="flex items-center gap-1"> 
            <GraduationCap className="w-3.5 h-3.5" /> 
            {event.college} 
          </span> 
        </div> 
        
        {/* Description preview */} 
        {event.description && ( 
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p> 
        )} 
        
        {/* Footer */} 
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border gap-2"> 
          <div className="flex items-center gap-1 text-muted-foreground"> 
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
            <span className="text-[10px] sm:text-sm"> 
              {rsvpCount} going 
              <span className="hidden xs:inline">{event.capacity > 0 && ` · ${event.capacity - rsvpCount} left`}</span>
            </span> 
          </div> 
          
          <div className="flex items-center gap-1 sm:gap-2">
            {isOrganizer && !event.isPast && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            )}

            {event.isPast ? ( 
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0 sm:py-0.5">Ended</Badge> 
            ) : event.isFull && !isRsvped ? ( 
              <Badge variant="destructive" className="text-[10px] sm:text-xs px-2 py-0 sm:py-0.5">Full</Badge> 
            ) : ( 
              <Button 
                size="sm" 
                variant={isRsvped ? "outline" : "default"} 
                onClick={handleRsvp} 
                disabled={isLoading || isStatusLoading || (!isRsvped && event.isFull)} 
                className={cn(
                  "h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs",
                  isRsvped ? 'hover:border-destructive hover:text-destructive' : ''
                )} 
              > 
                {isLoading ? '...' : isRsvped ? 'Cancel' : 'RSVP'} 
              </Button> 
            )} 
          </div>
        </div> 
      </div> 
    </Card> 
  )
}
