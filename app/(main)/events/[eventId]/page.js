"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  GraduationCap, 
  Users, 
  Calendar,
  Share2,
  Trash2,
  Edit
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import UserAvatar from "@/components/user/UserAvatar"
import useUser from "@/hooks/useUser"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function EventDetailPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { eventId } = resolvedParams
  const { user: currentUser } = useUser()
  
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRsvped, setIsRsvped] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    fetchEventDetails()
    checkRsvpStatus()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}`)
      const data = await res.json()
      if (res.ok) {
        setEvent(data)
      } else {
        toast.error(data.message || "Failed to load event details")
        router.push('/events')
      }
    } catch (error) {
      console.error("Failed to fetch event:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkRsvpStatus = async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp-status`)
      const data = await res.json()
      if (res.ok) {
        setIsRsvped(data.rsvped)
      }
    } catch (error) {
      console.error("Failed to check RSVP status:", error)
    }
  }

  const handleRsvp = async () => {
    if (!currentUser) {
      toast.error("Please login to RSVP")
      return
    }

    setRsvpLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setIsRsvped(data.rsvped)
        setEvent(prev => ({ ...prev, rsvpCount: data.rsvpCount }))
        toast.success(data.rsvped ? "RSVP successful!" : "RSVP cancelled")
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message || "Failed to RSVP")
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to cancel this event? This will notify all attendees.")) return

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success("Event cancelled")
        router.push('/events')
      } else {
        const data = await res.json()
        throw new Error(data.message || "Failed to delete event")
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 max-w-2xl border-r border-border min-h-screen p-8 flex flex-col items-center justify-center">
        <Calendar className="w-12 h-12 text-accent animate-pulse mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading event details...</p>
      </div>
    )
  }

  if (!event) return null

  const eventDate = new Date(event.eventDate)
  const isOrganizer = currentUser && event.organizer?._id === currentUser._id
  const capacityProgress = event.capacity > 0 ? (event.rsvpCount / event.capacity) * 100 : 0

  return (
    <div className="flex-1 max-w-2xl border-r border-border min-h-screen pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur border-b p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md">Event Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {isOrganizer && !event.isPast && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied!")
          }}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-0">
        {/* Banner */}
        <div className="h-3 bg-gradient-to-r from-primary via-accent to-secondary" />
        
        <div className="p-6">
          {/* Main Title Section */}
          <div className="flex justify-between items-start gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-black leading-tight tracking-tight mb-4">{event.title}</h2>
              <div className="flex items-center gap-3">
                <Link href={`/profile/${event.organizer.username}`}>
                  <UserAvatar user={event.organizer} size="md" />
                </Link>
                <div>
                  <p className="text-sm font-bold">Hosted by {event.organizer.name}</p>
                  <p className="text-xs text-muted-foreground">@{event.organizer.username} · {event.organizer.college}</p>
                </div>
              </div>
            </div>
            
            {/* Date Square */}
            <div className="text-center bg-accent/30 rounded-2xl p-4 flex-shrink-0 border border-border/50 min-w-[80px]">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                {format(eventDate, 'MMM')}
              </p>
              <p className="text-4xl font-black leading-none mt-1">
                {format(eventDate, 'd')}
              </p>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Time</p>
                <p className="text-sm text-muted-foreground">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                <p className="text-sm text-muted-foreground">{format(eventDate, 'h:mm a')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-sm">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
                <p className="text-sm text-muted-foreground">{event.college}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">About this event</h3>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {event.description || "No description provided for this event."}
            </p>
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* RSVP Section */}
          <div className="bg-accent/5 border border-border/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-base">{event.rsvpCount} students going</p>
                  {event.capacity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, event.capacity - event.rsvpCount)} spots remaining
                    </p>
                  )}
                </div>
              </div>
              
              {event.isPast ? (
                <Badge variant="secondary" className="h-10 px-6 text-sm">Event Ended</Badge>
              ) : event.isFull && !isRsvped ? (
                <Badge variant="destructive" className="h-10 px-6 text-sm">Event Full</Badge>
              ) : (
                <Button 
                  size="lg" 
                  className={cn(
                    "px-8 font-bold shadow-lg transition-all active:scale-95",
                    isRsvped && "bg-background border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive text-foreground border"
                  )}
                  onClick={handleRsvp}
                  disabled={rsvpLoading || (!isRsvped && event.isFull)}
                >
                  {rsvpLoading ? "..." : isRsvped ? "Cancel RSVP" : "Join Event"}
                </Button>
              )}
            </div>

            {event.capacity > 0 && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-background border border-border rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      capacityProgress > 90 ? "bg-destructive" : capacityProgress > 70 ? "bg-orange-500" : "bg-primary"
                    )}
                    style={{ width: `${Math.min(100, capacityProgress)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  <span>0 RSVPs</span>
                  <span>{event.capacity} Capacity</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
