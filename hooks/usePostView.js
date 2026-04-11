"use client"

import { useEffect, useRef } from 'react'

export default function usePostView(postId, targetRef) {
  const hasViewed = useRef(false)

  useEffect(() => {
    if (!targetRef?.current || !postId || typeof window === 'undefined' || hasViewed.current) return

    const element = targetRef.current
    hasViewed.current = true

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetch(`/api/posts/${postId}/view`, { method: 'POST' })
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [postId, targetRef])
}