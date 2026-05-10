"use client"

import { useState, useEffect } from "react"
import { Calendar, RefreshCw, MapPin, Users, Clock, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function EventsTab({ currentUser }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [rsvpLoading, setRsvpLoading] = useState({})

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/explore/events')
      const data = await res.json()

      if (res.ok) {
        setEvents(data.events || [])
      } else {
        throw new Error(data.message || "Failed to fetch events")
      }
    } catch (error) {
      console.error("Explore events error:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchEvents()
    }
  }, [currentUser])

  const handleRefresh = () => {
    fetchEvents()
  }

  const handleRSVP = async (eventId, isCurrentlyRSVPed) => {
    setRsvpLoading(prev => ({ ...prev, [eventId]: true }))
    
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })

      if (!res.ok) throw new Error('Failed to update RSVP')
      
      const data = await res.json()
      
      // Update local state
      setEvents(prev => prev.map(event => {
        if (event._id === eventId) {
          return {
            ...event,
            isUserRSVPed: !isCurrentlyRSVPed,
            rsvpCount: isCurrentlyRSVPed ? event.rsvpCount - 1 : event.rsvpCount + 1
          }
        }
        return event
      }))
      
    } catch (error) {
      console.error('RSVP error:', error)
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && events.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="p-4 border-b border-border">
            <div className="flex gap-4">
              <Skeleton className="w-20 h-20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Upcoming events</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1">
        {events.length === 0 && !loading ? (
          <div className="pt-20">
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Events from your college and matching your interests will appear here!"
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map(event => (
              <div key={event._id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex gap-4">
                  {/* Event cover image or placeholder */}
                  <div className="flex-shrink-0">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                        <Calendar className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base mb-1 truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(event.eventDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>

                        {/* Tags */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {event.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {event.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{event.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Event info */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.rsvpCount} attending
                          </span>
                          {event.capacity > 0 && (
                            <span>
                              {event.capacity - event.rsvpCount} spots left
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            🎓 {event.college}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RSVP Button */}
                    <div className="mt-3">
                      {event.isUserRSVPed ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRSVP(event._id, true)}
                          disabled={rsvpLoading[event._id]}
                          className="h-8 px-3"
                        >
                          {rsvpLoading[event._id] ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <UserPlus className="w-3 h-3 mr-1" />
                          )}
                          Cancel RSVP
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRSVP(event._id, false)}
                          disabled={rsvpLoading[event._id] || event.isFull}
                          className="h-8 px-3"
                        >
                          {rsvpLoading[event._id] ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <UserPlus className="w-3 h-3 mr-1" />
                          )}
                          {event.isFull ? 'Full' : 'RSVP'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
