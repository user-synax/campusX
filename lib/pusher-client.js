import PusherClient from 'pusher-js' 
 
let clientInstance = null 
 
export function getPusherClient() { 
  if (clientInstance) return clientInstance 
 
  // Only run on client side 
  if (typeof window === 'undefined') return null 

  if (process.env.NODE_ENV === 'development') {
    PusherClient.logToConsole = true
    console.log('[Pusher] Initializing with:', {
      key: process.env.NEXT_PUBLIC_PUSHER_KEY ? 'Present' : 'MISSING',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? process.env.NEXT_PUBLIC_PUSHER_CLUSTER : 'MISSING'
    })
  }
 
  clientInstance = new PusherClient( 
    process.env.NEXT_PUBLIC_PUSHER_KEY, 
    { 
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, 
      authEndpoint: '/api/pusher/auth', 
      forceTLS: true,
    } 
  ) 
 
  // Log connection state in development 
  if (process.env.NODE_ENV === 'development') { 
    clientInstance.connection.bind('state_change', ({ current }) => { 
      console.log('[Pusher] Connection:', current) 
    }) 
  } 
 
  return clientInstance 
} 
