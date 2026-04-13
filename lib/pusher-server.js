import Pusher from 'pusher'

import config from './config'



let pusherInstance = null



export function getPusherServer() {

  if (pusherInstance) return pusherInstance



  if (!config.pusher.appId ||

      !config.pusher.key ||

      !config.pusher.secret ||

      !config.pusher.cluster) {

    throw new Error('Pusher env vars missing — check .env.local')

  }



  pusherInstance = new Pusher({

    appId: config.pusher.appId,

    key: config.pusher.key,

    secret: config.pusher.secret,

    cluster: config.pusher.cluster,

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

    // Retry once on failure
    const pusher = getPusherServer()

    await pusher.trigger(channel, event, data)

  } 

} 

