"use client"

import { useEffect, useRef } from "react"
import { REACTIONS as REACTION_EMOJIS } from "@/lib/reaction-utils"

const REACTION_LIST = Object.entries(REACTION_EMOJIS).map(([type, emoji]) => ({
  type,
  emoji,
  label: type.charAt(0).toUpperCase() + type.slice(1)
}))

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
      {REACTION_LIST.map(r => ( 
        <button 
          key={r.type} 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelect(r.type)
          }}
          className={`text-xl hover:scale-125 transition-transform p-1.5 rounded-full ${currentReaction === r.type ? 'bg-accent' : 'hover:bg-accent/50'}`}
          title={r.label}
        >
          {r.emoji}
        </button>
      ))} 
    </div>
  )
}
