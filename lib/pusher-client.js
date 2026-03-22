import PusherClient from 'pusher-js' 
 
let clientInstance = null 
 
export function getPusherClient() { 
  if (clientInstance) return clientInstance 
 
  // Only run on client side 
  if (typeof window === 'undefined') return null 

  if (process.env.NODE_ENV === 'development') {
    // Only log essential initialization status without sensitive data
    console.debug('[Pusher] Initializing...')
  }
 
  clientInstance = new PusherClient( 
    process.env.NEXT_PUBLIC_PUSHER_KEY, 
    { 
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, 
      authEndpoint: '/api/pusher/auth', 
      forceTLS: true,
    } 
  ) 
 
  // No connection state logs in console for security 
 
  return clientInstance 
} 
