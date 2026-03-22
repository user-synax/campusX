import webpush from 'web-push' 
import connectDB from './db' 
import PushSubscription from '@/models/PushSubscription' 
 
// Configure web-push with VAPID keys (once) 
webpush.setVapidDetails( 
  process.env.VAPID_SUBJECT || 'mailto:your@gmail.com', 
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '', 
  process.env.VAPID_PRIVATE_KEY || '' 
) 
 
// ━━━ MAIN SEND FUNCTION ━━━ 
// Call this from createNotification() — fire and forget 
export async function sendPushToUser(userId, payload) { 
  if (!process.env.VAPID_PRIVATE_KEY) { 
    // VAPID not configured — skip silently 
    return 
  } 
 
  try { 
    await connectDB() 
 
    // Get all active subscriptions for this user 
    const subscriptions = await PushSubscription.find({ 
      userId, 
      isActive: true 
    }).lean() 
 
    if (subscriptions.length === 0) return 
 
    // Send to all devices in parallel 
    const results = await Promise.allSettled( 
      subscriptions.map(sub => 
        sendToSubscription(sub, payload) 
      ) 
    ) 
 
    // Log results in development 
    if (process.env.NODE_ENV === 'development') { 
      const sent = results.filter(r => r.status === 'fulfilled').length 
      const failed = results.filter(r => r.status === 'rejected').length 
      if (sent > 0) console.log(`[WebPush] ✅ Sent to ${sent} device(s) for user ${userId}`) 
      if (failed > 0) console.log(`[WebPush] ❌ Failed for ${failed} device(s)`) 
    } 
 
  } catch (err) { 
    // NEVER throw — push failure must not break anything 
    console.error('[WebPush] Send failed:', err.message) 
  } 
} 
 
async function sendToSubscription(sub, payload) { 
  const pushSubscription = { 
    endpoint: sub.endpoint, 
    keys: { 
      p256dh: sub.p256dh, 
      auth: sub.auth 
    } 
  } 
 
  try { 
    await webpush.sendNotification( 
      pushSubscription, 
      JSON.stringify(payload), 
      { 
        TTL: 24 * 60 * 60,  // 24 hours — deliver within 24hrs if offline 
        urgency: 'normal'    // 'very-low' | 'low' | 'normal' | 'high' 
      } 
    ) 
 
    // Update lastUsedAt 
    PushSubscription.findOneAndUpdate( 
      { endpoint: sub.endpoint }, 
      { lastUsedAt: new Date() } 
    ).catch(() => {}) 
 
  } catch (err) { 
    // Handle specific errors 
    if (err.statusCode === 410 || err.statusCode === 404) { 
      // Subscription expired/invalid — mark inactive 
      PushSubscription.findOneAndUpdate( 
        { endpoint: sub.endpoint }, 
        { isActive: false } 
      ).catch(() => {}) 
    } else { 
      throw err  // rethrow other errors 
    } 
  } 
} 
