import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Draggable)
}

// Global GSAP defaults
gsap.defaults({
  ease: 'power2.out',
  duration: 0.4
})

// Respect user's motion preferences
// If user has "reduce motion" on in OS settings — disable animations
export function shouldAnimate() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export { gsap, Draggable }
