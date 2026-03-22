"use client"

import { useState, useEffect, useCallback } from 'react'
import { Bookmark, BookOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import useUser from '@/hooks/useUser'
import ResourceCard from '@/components/resources/ResourceCard'
import ResourceSkeleton from '@/components/resources/ResourceSkeleton'
import EmptyState from '@/components/shared/EmptyState'

export default function SavedResourcesPage() {
  const { user } = useUser()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSavedResources = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/resources/browse?saved=true&limit=100')
      const data = await res.json()
      if (res.ok) {
        setResources(data.resources)
      } else {
        toast.error(data.error || 'Failed to fetch saved resources')
      }
    } catch (err) {
      toast.error('Connection error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchSavedResources()
  }, [user, fetchSavedResources])

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <header className="mb-8">
          <div className="h-8 w-48 bg-accent/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-accent/10 rounded animate-pulse" />
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <ResourceSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <header className="mb-8">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500/20" />
          Saved Resources
        </h1>
        <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">
          Your personal library of study materials
        </p>
      </header>

      {resources.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your library is empty"
          description="Browse resources and save the ones you find helpful for later."
          actionLabel="Browse Resources"
          onAction={() => window.location.href = '/resources'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resources.map(resource => (
            <ResourceCard 
              key={resource._id} 
              resource={resource} 
              currentUserId={user?._id} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
