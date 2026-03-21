"use client"

import { useRef, useState } from 'react'
import { gsap, shouldAnimate } from '@/lib/gsap-config'
import { Heart } from 'lucide-react'

export default function LikeButton({ postId, initialLiked, initialCount, onLike }) {

  const [isLiked, setIsLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)

  // Refs for animation targets
  const buttonRef = useRef(null)
  const countRef = useRef(null)
  const burstContainerRef = useRef(null)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isAnimating) return  // prevent spam clicking during animation

    const nowLiked = !isLiked
    setIsLiked(nowLiked)
    setCount(prev => nowLiked ? prev + 1 : prev - 1)

    if (shouldAnimate()) {
      if (nowLiked) {
        playLikeAnimation()
      } else {
        playUnlikeAnimation()
      }
    }

    // API call
    try {
      if (onLike) {
        await onLike(postId)
      }
    } catch (err) {
      // Revert optimistic update on error
      setIsLiked(!nowLiked)
      setCount(prev => nowLiked ? prev - 1 : prev + 1)
    }
  }

  const playLikeAnimation = () => {
    setIsAnimating(true)
    const tl = gsap.timeline({
      onComplete: () => setIsAnimating(false)
    })

    // STEP 1: Button spring bounce
    tl.to(buttonRef.current, {
      scale: 1.4,
      duration: 0.15,
      ease: 'power2.out'
    })
    .to(buttonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'elastic.out(1.2, 0.4)'  // springy bounce back
    })

    // STEP 2: Big heart burst (runs parallel with button bounce)
    tl.call(() => {
      createHeartBurst()
    }, null, '<')  // '<' means start at same time as previous

    // STEP 3: Count number bounce
    tl.fromTo(countRef.current,
      { scale: 1 },
      {
        scale: 1.5,
        duration: 0.15,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1
      },
      '<0.1'  // slight delay
    )
  }

  const playUnlikeAnimation = () => {
    // Simple deflate on unlike — no burst
    gsap.to(buttonRef.current, {
      scale: 0.85,
      duration: 0.1,
      ease: 'power2.in',
      yoyo: true,
      repeat: 1
    })
  }

  const createHeartBurst = () => {
    if (!burstContainerRef.current) return

    // Create 8 mini hearts that fly outward
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]

    angles.forEach((angle, i) => {
      const heart = document.createElement('div')
      heart.innerHTML = '❤️'
      heart.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: ${8 + Math.random() * 8}px;
        pointer-events: none;
        z-index: 50;
        line-height: 1;
      `
      burstContainerRef.current.appendChild(heart)

      // Calculate direction
      const rad = (angle * Math.PI) / 180
      const distance = 30 + Math.random() * 20
      const x = Math.cos(rad) * distance
      const y = Math.sin(rad) * distance

      gsap.fromTo(heart,
        { x: 0, y: 0, opacity: 1, scale: 0 },
        {
          x,
          y,
          opacity: 0,
          scale: 1,
          duration: 0.6 + Math.random() * 0.2,
          ease: 'power2.out',
          delay: i * 0.02,
          onComplete: () => heart.remove()
        }
      )
    })
  }

  return (
    <div className="relative inline-flex items-center">
      {/* Burst container — hearts fly from here */}
      <div
        ref={burstContainerRef}
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ zIndex: 10 }}
      />

      <button
        ref={buttonRef}
        onClick={handleLike}
        className={`flex items-center gap-1.5 text-sm transition-colors origin-center ${
          isLiked
            ? 'text-red-500'
            : 'text-muted-foreground hover:text-red-400'
        }`}
        style={{ willChange: 'transform' }}  // GPU acceleration
      >
        <Heart
          className="w-4 h-4"
          fill={isLiked ? 'currentColor' : 'none'}
          strokeWidth={isLiked ? 0 : 1.5}
        />
        <span ref={countRef} className="tabular-nums">
          {count > 0 ? count : 0}
        </span>
      </button>
    </div>
  )
}
