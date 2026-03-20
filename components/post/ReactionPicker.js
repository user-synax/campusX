"use client"

import { useEffect, useRef } from "react"

export const REACTIONS = [ 
  { type: 'like', emoji: '❤️', label: 'Like' }, 
  { type: 'funny', emoji: '😂', label: 'Funny' }, 
  { type: 'wow', emoji: '😮', label: 'Wow' }, 
  { type: 'sad', emoji: '😢', label: 'Sad' }, 
  { type: 'respect', emoji: '👏', label: 'Respect' }, 
  { type: 'fire', emoji: '🔥', label: 'Fire' }, 
]

export default function ReactionPicker({ onSelect, currentReaction, onClose }) {
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 z-50 bg-card border border-border rounded-full px-2 py-1.5 flex gap-1 shadow-lg animate-in fade-in-0 zoom-in-95"
      onClick={(e) => e.stopPropagation()}
    > 
      {REACTIONS.map(r => ( 
        <button 
          key={r.type} 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelect(r.type)
            onClose()
          }} 
          title={r.label} 
          className={`text-xl hover:scale-125 transition-transform px-1 rounded-full ${ 
            currentReaction === r.type ? 'bg-accent scale-110' : 'hover:bg-accent/50' 
          }`} 
        > 
          {r.emoji} 
        </button> 
      ))} 
    </div>
  )
}
