"use client"

import { useEffect, useRef } from 'react'

/**
 * Reusable infinite scroll hook using Intersection Observer.
 * @param {Object} options
 * @param {Function} options.fetchMore - Function to call when sentinel enters viewport
 * @param {Boolean} options.hasMore - Whether more data is available to fetch
 * @param {Boolean} options.loading - Current loading state
 * @returns {Object} { sentinelRef } - Ref to attach to the sentinel element
 */
export function useInfiniteScroll({ fetchMore, hasMore, loading }) {
  const observerRef = useRef(null)    // the sentinel element ref
  const loadingRef = useRef(loading)  // keep loading in ref to avoid stale closure

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    // If no more data or already loading, don't set up observer for trigger
    // But we need the observer to stay active if we want it to trigger as soon as loading is false
    
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (
          first.isIntersecting && 
          hasMore && 
          !loadingRef.current && 
          document.visibilityState === 'visible'
        ) {
          fetchMore()
        }
      },
      {
        threshold: 0.1,      // trigger when 10% of sentinel is visible
        rootMargin: '200px'  // trigger 200px before sentinel is visible (pre-fetch)
      }
    )

    // Observe the sentinel element
    const sentinel = observerRef.current
    if (sentinel) observer.observe(sentinel)

    // Cleanup
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
      observer.disconnect()
    }
  }, [hasMore, fetchMore])

  // Return ref to attach to sentinel element
  return { sentinelRef: observerRef }
}
