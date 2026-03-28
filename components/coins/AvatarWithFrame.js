"use client" 
 
import { memo } from 'react' 
import Image from 'next/image' 
import { cn } from "@/lib/utils"

const SIZE_MAP = { 
  xs:  { size: 24, text: 'text-[10px]', tw: 'w-6 h-6' }, 
  sm:  { size: 32, text: 'text-xs', tw: 'w-8 h-8' }, 
  md:  { size: 40, text: 'text-sm', tw: 'w-10 h-10' }, 
  lg:  { size: 56, text: 'text-base', tw: 'w-14 h-14' }, 
  xl:  { size: 80, text: 'text-xl', tw: 'w-20 h-20' } 
} 
 
function getFrameStyle(frameVisual) { 
  if (!frameVisual) return null 
 
  // Founder animated frame 
  if (frameVisual.type === 'animated-gradient') { 
    return { 
      background: frameVisual.gradient, 
      backgroundSize: frameVisual.backgroundSize || '300% 300%', 
      animation: frameVisual.animation, 
      padding: frameVisual.padding || '2px', 
      borderRadius: '50%', 
      display: 'inline-flex' 
    } 
  } 
 
  const base = { 
    padding: frameVisual.padding || '2px', 
    backgroundSize: frameVisual.backgroundSize || '300% 300%', 
    animation: frameVisual.animation || 'none' 
  } 
 
  return { 
    ...base, 
    background: frameVisual.gradient || frameVisual.color || 'transparent' 
  } 
} 

// Handle both object format (new) and string format (legacy) 
function getVisual(item) { 
  if (!item) return null 
  if (typeof item === 'string') return null // legacy string format 
  return item 
} 
 
const AvatarWithFrame = memo(function AvatarWithFrame({ 
  user, 
  size = 'md', 
  equipped = null, 
  className = '' 
}) { 
  const { size: outerSize, text, tw } = SIZE_MAP[size] || SIZE_MAP.md 
  const frameVisual = getVisual(equipped?.avatarFrame) 
  const bannerVisual = getVisual(equipped?.profileBanner) 
  const frameStyle = getFrameStyle(frameVisual)
 
  const avatar = ( 
    <div 
      className="w-full h-full rounded-full overflow-hidden relative shrink-0 bg-accent/20 flex items-center justify-center"
    > 
      {user?.avatar || user?.image ? ( 
        <Image 
          src={user.avatar || user.image} 
          alt={user.name || 'User'} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover" 
        /> 
      ) : ( 
        <div 
          className={cn(
            "w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold",
            text
          )}
        > 
          {user?.name?.charAt(0)?.toUpperCase() || '?'} 
        </div> 
      )} 
    </div> 
  ) 
 
  if (!frameStyle) {
    return (
      <div 
        className={cn(
          "rounded-full shrink-0 flex items-center justify-center", 
          !className.includes('w-') && tw,
          className
        )}
      >
        {avatar}
      </div>
    )
  }
 
  return ( 
    <div 
      style={frameStyle} 
      className={cn(
        "flex items-center justify-center shrink-0 rounded-full",
        !className.includes('w-') && tw,
        className
      )}
    > 
      {avatar} 
    </div> 
  ) 
}) 
 
export default AvatarWithFrame 
