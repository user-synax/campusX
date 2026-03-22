import Pusher from 'pusher' 
 
let pusherInstance = null 
 
export function getPusherServer() { 
  if (pusherInstance) return pusherInstance 
 
  if (!process.env.PUSHER_APP_ID || 
      !process.env.NEXT_PUBLIC_PUSHER_KEY || 
      !process.env.PUSHER_SECRET || 
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) { 
    throw new Error('Pusher env vars missing — check .env.local') 
  } 
 
  pusherInstance = new Pusher({ 
    appId: process.env.PUSHER_APP_ID, 
    key: process.env.NEXT_PUBLIC_PUSHER_KEY, 
    secret: process.env.PUSHER_SECRET, 
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER, 
    useTLS: true   // always encrypt 
  }) 
 
  return pusherInstance 
} 
 
// Trigger helper — use everywhere instead of getPusherServer().trigger() 
export async function triggerPusher(channel, event, data) { 
  try { 
    const pusher = getPusherServer() 
    await pusher.trigger(channel, event, data) 
  } catch (err) { 
    // Silent fail in production
  } 
} 
