"use client"

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function useFeedUpdates() {
  const [newPostsAvailable, setNewPostsAvailable] = useState(0)
  const eventSourceRef = useRef(null)

  useEffect(() => {
    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // We use the same stream as notifications
      const es = new EventSource('/api/notifications/stream')
      eventSourceRef.current = es

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.isBroadcast && data.type === 'new_post') {
            setNewPostsAvailable(prev => prev + 1)
            
            // Optional: toast for new posts
            toast.info(`New post by ${data.author}`, {
              description: data.community ? `in ${data.community}` : 'on the feed',
              duration: 3000
            })
          }
        } catch (err) {
          console.error('SSE broadcast parse error:', err)
        }
      }

      es.onerror = () => {
        es.close()
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return { 
    newPostsAvailable, 
    resetNewPosts: () => setNewPostsAvailable(0) 
  }
}
