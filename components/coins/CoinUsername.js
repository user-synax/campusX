"use client" 
 
import { memo } from 'react' 
 
const CoinUsername = memo(function CoinUsername({ 
  name, 
  equipped = null, 
  className = '' 
}) { 
  const colorVisual = equipped?.usernameColor 
 
  if (!colorVisual) { 
    return <span className={className}>{name}</span> 
  } 
 
  if (colorVisual.type === 'animated-gradient') { 
    return ( 
      <span 
        className={`${className} font-semibold`} 
        style={{ 
          background: colorVisual.gradient, 
          backgroundSize: colorVisual.backgroundSize || '200% auto', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          backgroundClip: 'text', 
          animation: colorVisual.animation, 
          // Fallback for unsupported browsers 
          color: '#f59e0b' 
        }} 
      > 
        {name} 
      </span> 
    ) 
  } 
 
  if (colorVisual.type === 'gradient') { 
    return ( 
      <span 
        className={`${className} font-semibold`} 
        style={{ 
          background: colorVisual.gradient, 
          backgroundSize: colorVisual.backgroundSize || 'auto', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          backgroundClip: 'text', 
          animation: colorVisual.animation, 
          // Fallback for unsupported browsers 
          color: 'transparent' 
        }} 
      > 
        {name} 
      </span> 
    ) 
  } 
 
  // Solid color 
  return ( 
    <span className={className} style={{ color: colorVisual.color }}> 
      {name} 
    </span> 
  ) 
}) 
 
export default CoinUsername 
