"use client"

import { memo } from 'react'

const FounderAvatar = memo(function FounderAvatar({ user, size = 'md' }) {
  const sizeMap = { 
    sm: 'w-9 h-9', 
    md: 'w-11 h-11', 
    lg: 'w-16 h-16', 
    xl: 'w-24 h-24' 
  } 

  return (
    <div className={`founder-ring ${sizeMap[size]} flex-shrink-0`}> 
      <div className="founder-ring-inner w-full h-full"> 
        <div className="w-full h-full rounded-full overflow-hidden bg-accent flex items-center justify-center"> 
          {user?.avatar ? ( 
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> 
          ) : ( 
            <span className={`font-bold ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-xl' : 'text-sm'}`}> 
              {user?.name?.charAt(0)?.toUpperCase()} 
            </span> 
          )} 
        </div> 
      </div> 
    </div> 
  )
})

export default FounderAvatar
