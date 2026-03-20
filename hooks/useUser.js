"use client"

import { useState, useEffect, useCallback } from "react"

// Simple global state to share user data across all hook instances
let globalUser = null
let globalLoading = true
let globalError = null
const subscribers = new Set()

const notifySubscribers = () => { 
  subscribers.forEach(callback => callback({ 
    user: globalUser, 
    loading: globalLoading, 
    error: globalError 
  }))
}

export default function useUser() {
  const [state, setState] = useState({ 
    user: globalUser, 
    loading: globalLoading, 
    error: globalError 
  })

  const fetchUser = useCallback(async (showLoading = true) => {
    if (showLoading) {
      globalLoading = true
      notifySubscribers()
    }
    
    try {
      const res = await fetch("/api/users/me")
      
      if (res.status === 401) {
        globalUser = null
      } else if (!res.ok) {
        throw new Error("Failed to fetch user")
      } else {
        const data = await res.json()
        globalUser = data.user
      }
      globalError = null
    } catch (err) {
      globalError = err.message
      globalUser = null
    } finally {
      globalLoading = false
      notifySubscribers()
    }
    return globalUser
  }, [])

  useEffect(() => {
    const callback = (newState) => setState(newState)
    subscribers.add(callback)
    
    // Initial fetch if not already loaded or if error
    if (globalUser === null && globalLoading && !globalError) {
      fetchUser()
    }

    return () => {
      subscribers.delete(callback)
    }
  }, [fetchUser])

  const refetch = useCallback(async () => {
    return await fetchUser(true)
  }, [fetchUser])

  return { 
    user: state.user, 
    loading: state.loading, 
    error: state.error, 
    refetch 
  }
}
