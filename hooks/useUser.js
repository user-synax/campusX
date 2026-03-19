"use client"

import { useState, useEffect, useCallback } from "react"

export default function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users/me")
      
      if (res.status === 401) {
        setUser(null)
      } else if (!res.ok) {
        throw new Error("Failed to fetch user")
      } else {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}
