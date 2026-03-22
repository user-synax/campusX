"use client" 
 
import { useEffect, useRef } from 'react' 
import { getPusherClient } from '@/lib/pusher-client' 
 
export function useGroupChat(groupId, handlers = {}) { 
  const channelRef = useRef(null) 
  const handlersRef = useRef(handlers)

  // Update handlers ref on every render so events always use latest logic 
  // without triggering re-subscription
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])
 
  useEffect(() => { 
    if (!groupId) return 
 
    const pusher = getPusherClient() 
    if (!pusher) return 
 
    // Subscribe to private channel for this group 
    const channelName = `private-group-${groupId}`
    console.log(`[Pusher] Attempting to subscribe to ${channelName}`)
    const channel = pusher.subscribe(channelName) 
    channelRef.current = channel 

    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`[Pusher] Successfully subscribed to ${channelName}`)
    })

    channel.bind('pusher:subscription_error', (status) => {
      console.error(`[Pusher] Subscription error for ${channelName}:`, status)
      if (status === 403 || status === 401) {
        console.error('[Pusher] Auth failed. Check if you are a member of this group.')
      }
    })
 
    // Bind all events with a wrapper that calls the current handler ref
    const bindEvent = (event, handlerKey) => {
      channel.bind(event, (data) => {
        console.log(`[Pusher] Received event "${event}" on ${channelName}:`, data)
        if (handlersRef.current[handlerKey]) {
          handlersRef.current[handlerKey](data)
        } else {
          console.warn(`[Pusher] No handler found for key: ${handlerKey}`)
        }
      })
    }

    bindEvent('new-message', 'onNewMessage')
    bindEvent('message-deleted', 'onMessageDeleted')
    bindEvent('typing-start', 'onTypingStart')
    bindEvent('typing-stop', 'onTypingStop')
    bindEvent('member-added', 'onMemberAdded')
    bindEvent('member-removed', 'onMemberRemoved')
    bindEvent('group-deleted', 'onGroupDeleted')
    bindEvent('message-reaction', 'onReaction')
 
    // Cleanup on unmount or groupId change 
    return () => { 
      channel.unbind_all() 
      pusher.unsubscribe(channelName) 
      channelRef.current = null 
    } 
  }, [groupId]) 
 
  return channelRef 
} 
