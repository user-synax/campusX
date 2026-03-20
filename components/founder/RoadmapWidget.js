"use client"

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_CONFIG = { 
  done: { 
    label: 'Done', 
    icon: '✅', 
    className: 'text-green-400 bg-green-400/10 border-green-400/20' 
  }, 
  inprogress: { 
    label: 'In Progress', 
    icon: '🔄', 
    className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' 
  }, 
  upcoming: { 
    label: 'Coming Soon', 
    icon: '⏳', 
    className: 'text-muted-foreground bg-accent border-border' 
  } 
} 

export default function RoadmapWidget({ isOwnProfile }) {
  const [roadmap, setRoadmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editingRoadmap, setEditingRoadmap] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/founder/roadmap')
      const data = await res.json()
      if (res.ok) {
        setRoadmap(data.roadmap || [])
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/founder/roadmap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmap: editingRoadmap }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setRoadmap(data.roadmap)
      setEditMode(false)
      toast.success('Roadmap updated!')
    } catch (error) {
      toast.error('Failed to update roadmap', {
        description: error.message || 'An unknown error occurred',
      })
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (index, field, value) => {
    const updated = [...editingRoadmap]
    updated[index] = { ...updated[index], [field]: value }
    setEditingRoadmap(updated)
  }

  const addItem = () => {
    if (editingRoadmap.length >= 20) {
      toast.error('Maximum 20 roadmap items allowed')
      return
    }
    setEditingRoadmap([...editingRoadmap, { title: '', status: 'upcoming', emoji: '📌', order: editingRoadmap.length }])
  }

  const removeItem = (index) => {
    setEditingRoadmap(editingRoadmap.filter((_, i) => i !== index))
  }

  if (editMode && isOwnProfile) {
    return (
      <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid #f59e0b40' }}> 
        <div className="flex justify-between items-center px-4 py-3" 
          style={{ background: '#0d0d0d', borderBottom: '1px solid #1f1f1f' }}> 
          <span className="text-sm font-semibold">✏️ Edit Roadmap</span> 
          <div className="flex gap-2"> 
            <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancel</Button> 
            <Button size="sm" onClick={handleSave} disabled={saving}> 
              {saving ? 'Saving...' : 'Save'} 
            </Button> 
          </div> 
        </div> 
      
        <div className="p-3 space-y-2"> 
          {editingRoadmap.map((item, i) => ( 
            <div key={i} className="flex gap-2 items-center"> 
              <Input 
                value={item.emoji} 
                onChange={(e) => updateItem(i, 'emoji', e.target.value)} 
                placeholder="🚀" 
                className="w-12 text-center" 
                maxLength={2} 
              /> 
              <Input 
                value={item.title} 
                onChange={(e) => updateItem(i, 'title', e.target.value)} 
                placeholder="Feature name..." 
                className="flex-1" 
                maxLength={60} 
              /> 
              <select 
                value={item.status} 
                onChange={(e) => updateItem(i, 'status', e.target.value)} 
                className="bg-accent border border-border rounded-md px-2 py-1.5 text-xs text-foreground" 
              > 
                <option value="done">✅ Done</option> 
                <option value="inprogress">🔄 In Progress</option> 
                <option value="upcoming">⏳ Upcoming</option> 
              </select> 
              <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive"> 
                <X className="w-4 h-4" /> 
              </button> 
            </div> 
          ))} 
      
          <Button variant="ghost" size="sm" onClick={addItem} className="w-full border border-dashed border-border mt-2"> 
            <Plus className="w-4 h-4 mr-1" /> Add item 
          </Button> 
        </div> 
      </div> 
    )
  }

  return (
    <div className="mt-4 rounded-xl overflow-hidden" 
      style={{ border: '1px solid #2a2a2a', background: '#111' }}> 
    
      {/* Widget header */} 
      <div className="flex items-center justify-between px-4 py-3" 
        style={{ borderBottom: '1px solid #1f1f1f', background: '#0d0d0d' }}> 
        <div className="flex items-center gap-2"> 
          <span className="text-sm">🛠️</span> 
          <h3 className="text-sm font-semibold">What I&apos;m Building</h3>
        </div> 
        {isOwnProfile && ( 
          <button 
            onClick={() => { setEditingRoadmap([...roadmap]); setEditMode(true) }} 
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-accent transition-colors" 
          > 
            Edit 
          </button> 
        )} 
      </div> 
    
      {/* Roadmap items */} 
      <div className="p-3 space-y-1.5"> 
        {loading ? ( 
          Array(5).fill(0).map((_, i) => ( 
            <div key={i} className="flex gap-2 p-2"> 
              <Skeleton className="w-5 h-5 rounded" /> 
              <Skeleton className="h-4 flex-1" /> 
              <Skeleton className="h-4 w-16 rounded-full" /> 
            </div> 
          )) 
        ) : roadmap.length === 0 ? ( 
          <p className="text-xs text-muted-foreground text-center py-4">No roadmap yet</p> 
        ) : ( 
          roadmap.map((item, i) => ( 
            <div key={i} 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/3 transition-colors group"> 
              <span className="text-base flex-shrink-0">{item.emoji || '📌'}</span> 
              <span className={`flex-1 text-sm ${item.status === 'done' ? 'line-through opacity-60' : ''}`}> 
                {item.title} 
              </span> 
              <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_CONFIG[item.status]?.className}`}> 
                {STATUS_CONFIG[item.status]?.icon} {STATUS_CONFIG[item.status]?.label} 
              </span> 
            </div> 
          )) 
        )} 
      </div> 
    
      {/* Footer */} 
      <div className="px-4 py-2 text-[10px] text-muted-foreground flex items-center gap-1" 
        style={{ borderTop: '1px solid #1f1f1f' }}> 
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> 
        Live updates from the founder 
      </div> 
    </div> 
  )
}
