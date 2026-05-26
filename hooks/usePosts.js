"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

// Module-level in-memory cache to persist feed states
const postsCache = {}

export function usePosts(queryParams = {}, initialPosts = []) {
  const cacheKey = JSON.stringify(queryParams)
  const cachedData = postsCache[cacheKey]

  const [posts, setPosts] = useState(cachedData ? cachedData.posts : initialPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(cachedData ? cachedData.hasMore : true)
  const [cursor, setCursor] = useState(cachedData ? cachedData.cursor : null)
  const [isPrefetching, setIsPrefetching] = useState(false)
  
  const prefetchData = useRef(null)

  const fetchPosts = useCallback(async (currentCursor = null, append = false) => {
    if (loading && !append) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: 15,
        ...queryParams
      })
      if (currentCursor) params.set('cursor', currentCursor)

      const res = await fetch(`/api/posts/cursor-feed?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message || 'Failed to fetch posts')
      }

      const { posts: newPosts, pagination } = await res.json()

      setPosts(prev => {
        if (!append) return newPosts
        const existingIds = new Set(prev.map(p => p._id))
        const filteredNew = newPosts.filter(p => !existingIds.has(p._id))
        return [...prev, ...filteredNew]
      })

      setHasMore(pagination.hasNextPage)
      setCursor(pagination.nextCursor)
      
      // Cache the result
      postsCache[cacheKey] = { 
        posts: append ? [...posts, ...newPosts] : newPosts, 
        cursor: pagination.nextCursor, 
        hasMore: pagination.hasNextPage 
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [loading, cacheKey, queryParams, posts])

  // Initial load
  useEffect(() => {
    if (!postsCache[cacheKey] && initialPosts.length === 0) {
      fetchPosts(null, false)
    }
  }, [cacheKey])

  // Prefetch logic
  const prefetchNextPage = useCallback(async () => {
    if (!hasMore || loading || isPrefetching || !cursor || prefetchData.current) return
    
    setIsPrefetching(true)
    try {
      const params = new URLSearchParams({
        limit: 15,
        cursor,
        ...queryParams
      })
      
      const res = await fetch(`/api/posts/cursor-feed?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        prefetchData.current = {
          posts: data.posts,
          nextCursor: data.pagination.nextCursor,
          hasNextPage: data.pagination.hasNextPage
        }
      }
    } catch (err) {
      console.error('Prefetch failed:', err)
    } finally {
      setIsPrefetching(false)
    }
  }, [hasMore, loading, isPrefetching, cursor, queryParams])

  // Load more
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return

    // If we have prefetched data, use it
    if (prefetchData.current) {
      const { posts: prefetchedPosts, nextCursor, hasNextPage } = prefetchData.current
      prefetchData.current = null
      
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id))
        const filteredNew = prefetchedPosts.filter(p => !existingIds.has(p._id))
        return [...prev, ...filteredNew]
      })
      
      setCursor(nextCursor)
      setHasMore(hasNextPage)
    } else {
      fetchPosts(cursor, true)
    }
  }, [cursor, hasMore, loading, fetchPosts])

  const refresh = useCallback(async () => {
    setLoading(false)
    setCursor(null)
    return fetchPosts(null, false)
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    prefetchNextPage,
    addPost: (post) => setPosts(prev => [post, ...prev]),
    removePost: (id) => setPosts(prev => prev.filter(p => p._id !== id)),
    updatePostLike: async (postId) => {
      try {
        const res = await fetch('/api/posts/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })

        if (!res.ok) throw new Error('Failed to like post')

        const data = await res.json()

        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              likesCount: data.likesCount,
              _isLiked: data.liked
            }
          }
          return p
        }))

        return data
      } catch (err) {
        console.error('Like error:', err)
        throw err
      }
    }
  }
}

