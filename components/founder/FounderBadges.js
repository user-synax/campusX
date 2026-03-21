"use client"

import { memo } from 'react'
import { FOUNDER_BADGES } from '@/lib/founder' 

const FounderBadges = memo(function FounderBadges({ size = 'sm' }) {
  return (
    <div className="flex items-center gap-1 flex-wrap"> 
      {FOUNDER_BADGES.map(badge => ( 
        <span 
          key={badge.id} 
          title={badge.tooltip} 
          className={` 
            inline-flex items-center gap-1 rounded-full font-semibold 
            border cursor-default select-none 
            ${size === 'sm' 
              ? 'text-[10px] px-1.5 py-0.5' 
              : 'text-xs px-2 py-0.5' 
            } 
          `} 
          style={{ 
            backgroundColor: badge.color + '15',  // 15 = ~8% opacity hex 
            borderColor: badge.color + '40',       // 40 = ~25% opacity hex 
            color: badge.color 
          }} 
        > 
          <span>{badge.emoji}</span> 
          {size === 'md' && <span>{badge.label}</span>} 
        </span> 
      ))} 
    </div> 
  )
})

export default FounderBadges
