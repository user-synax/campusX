"use client"

import { useState, useEffect, useCallback } from 'react'

export function usePosts(queryParams = {}, initialPosts = []) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(initialPosts.length === 0)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const fetchPosts = useCallback(async (pageNum = 1) => {
    // If we have initial posts and we're on page 1, don't fetch
    if (pageNum === 1 && initialPosts.length > 0) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNum,
        ...queryParams
      })
      
      const res = await fetch(`/api/posts/get?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Failed to fetch posts')

      if (pageNum === 1) {
        setPosts(data.posts)
      } else {
        setPosts(prev => [...prev, ...data.posts])
      }

      setHasMore(data.hasMore)
      setPage(data.page)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(queryParams)])

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1)
    }
  }

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev])
  }

  const removePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId))
  }

  const updatePostLike = (postId, liked, count) => {
    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          likesCount: count,
        }
      }
      return p
    }))
  }

  return { 
    posts, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    addPost, 
    removePost, 
    updatePostLike 
  }
}
