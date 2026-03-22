"use client" 
 
import { useState, useEffect, useCallback } from 'react' 
 
/**
 * Convert VAPID public key to Uint8Array (required by subscribe API)
 * @param {string} base64String 
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) { 
  if (!base64String) return new Uint8Array(0);
  const padding = '='.repeat((4 - base64String.length % 4) % 4) 
  const base64 = (base64String + padding) 
    .replace(/-/g, '+') 
    .replace(/_/g, '/') 
  const rawData = window.atob(base64) 
  const outputArray = new Uint8Array(rawData.length) 
  for (let i = 0; i < rawData.length; ++i) { 
    outputArray[i] = rawData.charCodeAt(i) 
  } 
  return outputArray 
} 
 
export function usePushNotifications() { 
  const [permission, setPermission] = useState('default') 
  // 'default' | 'granted' | 'denied' | 'unsupported' 
  const [isSubscribed, setIsSubscribed] = useState(false) 
  const [isLoading, setIsLoading] = useState(false) 
  const [swRegistration, setSwRegistration] = useState(null) 
 
  // Check if push is supported 
  const isSupported = typeof window !== 'undefined' && 
    'Notification' in window && 
    'serviceWorker' in navigator && 
    'PushManager' in window 
 
  // Initialize on mount — register SW + check current state 
  useEffect(() => { 
    if (!isSupported) { 
      setPermission('unsupported') 
      return 
    } 
 
    const init = async () => { 
      try { 
        // Register service worker 
        const reg = await navigator.serviceWorker.register('/sw.js', { 
          scope: '/' 
        }) 
        setSwRegistration(reg) 
        console.log('[Push] Service Worker registered') 
 
        // Check current permission 
        const currentPermission = Notification.permission 
        setPermission(currentPermission) 
 
        // Check if already subscribed 
        if (currentPermission === 'granted') { 
          const existingSub = await reg.pushManager.getSubscription() 
          setIsSubscribed(!!existingSub) 
        } 
 
      } catch (err) { 
        console.error('[Push] SW registration failed:', err.message) 
      } 
    } 
 
    init() 
  }, [isSupported]) 
 
  // ━━━ SUBSCRIBE FUNCTION ━━━ 
  // Call this when user clicks "Enable Notifications" 
  const subscribe = useCallback(async () => { 
    if (!isSupported || !swRegistration) {
      console.warn('[Push] Not supported or SW not ready')
      return false 
    }
    if (isLoading) return false 
 
    setIsLoading(true) 
 
    try { 
      // Request permission 
      const permResult = await Notification.requestPermission() 
      setPermission(permResult) 
 
      if (permResult !== 'granted') { 
        console.warn('[Push] Permission not granted:', permResult)
        setIsLoading(false) 
        return false 
      } 
 
      // Subscribe to push 
      const subscription = await swRegistration.pushManager.subscribe({ 
        userVisibleOnly: true,  // Required: must show notification to user 
        applicationServerKey: urlBase64ToUint8Array( 
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY 
        ) 
      }) 
 
      // Extract keys 
      const subscriptionJSON = subscription.toJSON()
      const keys = subscriptionJSON.keys 
 
      // Save to server 
      const res = await fetch('/api/push/subscribe', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          endpoint: subscription.endpoint, 
          p256dh: keys.p256dh, 
          auth: keys.auth, 
          userAgent: navigator.userAgent 
        }) 
      }) 
 
      if (res.ok) { 
        setIsSubscribed(true) 
        setIsLoading(false) 
        return true 
      } 
 
      console.error('[Push] Failed to save subscription to server')
      setIsLoading(false) 
      return false 
 
    } catch (err) { 
      console.error('[Push] Subscribe failed:', err.message) 
      setIsLoading(false) 
      return false 
    } 
  }, [isSupported, swRegistration, isLoading]) 
 
  // ━━━ UNSUBSCRIBE FUNCTION ━━━ 
  const unsubscribe = useCallback(async () => { 
    if (!swRegistration) return false 
 
    try { 
      const subscription = await swRegistration.pushManager.getSubscription() 
      if (subscription) { 
        // Remove from browser 
        await subscription.unsubscribe() 
 
        // Remove from server 
        await fetch('/api/push/unsubscribe', { 
          method: 'DELETE', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ endpoint: subscription.endpoint }) 
        }) 
      } 
 
      setIsSubscribed(false) 
      return true 
    } catch (err) { 
      console.error('[Push] Unsubscribe failed:', err.message) 
      return false 
    } 
  }, [swRegistration]) 
 
  return { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe 
  } 
} 
