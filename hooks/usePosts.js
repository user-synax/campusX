"use client"

import { useState, useEffect, useCallback } from 'react'

export function usePosts(queryParams = {}, initialPosts = []) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (loading) return  // loading lock
    
    // If we have initial posts and we're on page 1, don't fetch unless explicitly told to
    if (pageNum === 1 && initialPosts.length > 0 && !append) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...queryParams
      })
      
      const res = await fetch(`/api/posts/get?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to fetch posts')
      }
      
      const { posts: newPosts, hasMore: more } = await res.json()

      if (append) {
        setPosts(prev => [...prev, ...newPosts])
      } else {
        setPosts(newPosts)
      }
      
      setHasMore(more)
      setPage(pageNum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [loading, JSON.stringify(queryParams)])

  // Initial load
  useEffect(() => {
    fetchPosts(1, false)
    setPage(1)
  }, [JSON.stringify(queryParams)])

  // Load more
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return
    const nextPage = page + 1
    fetchPosts(nextPage, true)  // append = true
  }, [page, hasMore, loading, fetchPosts])

  return { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
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
