import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useGSAP(animationFn, deps = []) {
  const ctx = useRef(null)

  useEffect(() => {
    // Create GSAP context — all animations inside are tracked
    ctx.current = gsap.context(() => {
      animationFn()
    })

    // Cleanup on unmount — kills all animations in context
    return () => ctx.current?.revert()
  }, deps)

  return ctx
}
