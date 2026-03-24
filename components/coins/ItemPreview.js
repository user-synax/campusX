"use client" 
 
import { cn } from "@/lib/utils"
import * as LucideIcons from 'lucide-react'

/**
 * Visual preview of how each item looks.
 * Used in shop cards, wallet inventory, and purchase dialogs.
 */
export default function ItemPreview({ item }) { 
  if (!item) return null
  const { category, visual } = item 
 
  if (category === 'avatar_frame') { 
    const frameStyle = { 
      background: visual.gradient || visual.color, 
      backgroundSize: visual.backgroundSize || '300% 300%', 
      animation: visual.animation || 'none', 
      padding: visual.padding || '2px', 
      borderRadius: '50%', 
      width: 52, 
      height: 52, 
      display: 'inline-flex',
      flexShrink: 0
    } 
    return ( 
      <div style={frameStyle}> 
        <div style={{ 
          width: '100%', height: '100%', 
          borderRadius: '50%', overflow: 'hidden', 
          background: '#1a1a1a', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: 18, fontWeight: 700, color: '#f0f0f0' 
        }}>A</div> 
      </div> 
    ) 
  } 
 
  if (category === 'username_color') { 
    const style = visual.type === 'gradient' ? { 
      background: visual.gradient, 
      backgroundSize: visual.backgroundSize || 'auto', 
      WebkitBackgroundClip: 'text', 
      WebkitTextFillColor: 'transparent', 
      backgroundClip: 'text', 
      animation: visual.animation, 
      // Fallback for unsupported browsers 
      color: 'transparent' 
    } : { color: visual.color } 
    return ( 
      <span className="text-base font-bold px-2 truncate max-w-full" style={style}> 
        Username 
      </span> 
    ) 
  } 
 
  if (category === 'profile_banner') { 
    return ( 
      <div className="w-full h-full rounded-xl min-h-[48px] overflow-hidden" 
           style={{ 
             background: visual.gradient || visual.color || visual.background, 
             backgroundColor: visual.backgroundColor,
             backgroundSize: visual.backgroundSize, 
             animation: visual.animation,
             borderBottom: visual.borderBottom,
             boxShadow: visual.boxShadow,
             opacity: visual.opacity
           }} /> 
    ) 
  } 
 
  if (category === 'post_badge' || category === 'special_badge') { 
    const Icon = visual.icon ? LucideIcons[visual.icon] : null
    return ( 
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" 
           style={{ 
             background: (visual.color || '#f59e0b') + '20', 
             color: visual.color || '#f59e0b', 
             border: `1px solid ${(visual.color || '#f59e0b')}40` 
           }}> 
        {Icon ? <Icon className="w-3.5 h-3.5" /> : visual.emoji} 
        {visual.label || item.name} 
      </div> 
    ) 
  } 
 
  if (category === 'chat_bubble') { 
    return ( 
      <div className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap" 
           style={{ 
             background: visual.background || visual.gradient, 
             color: visual.textColor || '#fff' 
           }}> 
        Hello 👋 
      </div> 
    ) 
  } 
 
  const Icon = visual.icon ? LucideIcons[visual.icon] : null
  return Icon ? <Icon className="w-8 h-8" /> : <span className="text-3xl">{visual.emoji || '🎁'}</span> 
} 
