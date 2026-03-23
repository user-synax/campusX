"use client" 
 
import { memo } from 'react' 
import * as LucideIcons from 'lucide-react'

const CoinBadge = memo(function CoinBadge({ equipped = null }) { 
  const badge = equipped?.postBadge 
  if (!badge?.icon && !badge?.emoji) return null 

  const Icon = badge.icon ? LucideIcons[badge.icon] : null
 
  return ( 
    <span 
      className="inline-flex items-center gap-1 text-[10px] font-bold 
                 px-1.5 py-0.5 rounded-full ml-1 shrink-0" 
      style={{ 
        background: (badge.color || '#f59e0b') + '20', 
        color: badge.color || '#f59e0b', 
        border: `1px solid ${(badge.color || '#f59e0b')}40` 
      }} 
    > 
      {Icon ? <Icon className="w-3 h-3" /> : badge.emoji} 
      {badge.label} 
    </span> 
  ) 
}) 
 
export default CoinBadge 
