"use client";

import PusherClient from 'pusher-js' 

let clientInstance = null 

export function getPusherClient() { 
  if (clientInstance) return clientInstance 

  // Only run on client side 
  if (typeof window === 'undefined') return null 

  console.log('[Pusher] Initializing new client')
  console.log('[Pusher] Key:', process.env.NEXT_PUBLIC_PUSHER_KEY)
  console.log('[Pusher] Cluster:', process.env.NEXT_PUBLIC_PUSHER_CLUSTER)

  clientInstance = new PusherClient( 
    process.env.NEXT_PUBLIC_PUSHER_KEY, 
    { 
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, 
      authEndpoint: '/api/pusher/auth', 
      forceTLS: true,
      enabledTransports: ['ws', 'wss'], // Force WebSocket only
    } 
  ) 

  clientInstance.connection.bind('connected', () => {
    console.log('[Pusher] Connected!');
  });

  clientInstance.connection.bind('disconnected', () => {
    console.log('[Pusher] Disconnected');
  });

  clientInstance.connection.bind('error', (error) => {
    console.error('[Pusher] Connection error:', error);
  });

  return clientInstance 
} 
