"use client" 
 
import { useState, useEffect } from 'react' 
import { usePushNotifications } from '@/hooks/usePushNotifications' 
import PushPermissionBanner from './PushPermissionBanner' 
import PushDeniedBanner from './PushDeniedBanner' 
 
export default function PushPromptManager({ newNotification }) { 
  const [showBanner, setShowBanner] = useState(false) 
  const [showDenied, setShowDenied] = useState(false) 
  const [hasPrompted, setHasPrompted] = useState(false) 
 
  const { 
    isSupported, 
    permission, 
    isSubscribed, 
    isLoading, 
    subscribe 
  } = usePushNotifications() 
 
  // Check if already dismissed (localStorage) 
  useEffect(() => { 
    const dismissed = localStorage.getItem('cx_push_dismissed') 
    if (dismissed) {
      // If it was "Not now", check if it's been more than 7 days
      if (dismissed !== 'subscribed') {
        const dismissedTime = parseInt(dismissed)
        const sevenDays = 7 * 24 * 60 * 60 * 1000
        if (Date.now() - dismissedTime > sevenDays) {
          localStorage.removeItem('cx_push_dismissed')
          return
        }
      }
      // Defer state update to avoid synchronous setState in effect
      queueMicrotask(() => setHasPrompted(true))
    }
  }, []) 
 
  // Trigger: Show banner after first in-app notification 
  useEffect(() => { 
    if (!newNotification) return 
    if (!isSupported) return 
    if (isSubscribed) return 
    if (hasPrompted) return 
    if (permission === 'denied') return 
 
    // Small delay — let in-app notification show first 
    const timer = setTimeout(() => setShowBanner(true), 2000) 
    return () => clearTimeout(timer) 
  }, [newNotification, isSupported, isSubscribed, hasPrompted, permission]) 
 
  // Trigger: Show banner after 3 minutes of usage 
  useEffect(() => { 
    if (!isSupported) return 
    if (isSubscribed) return 
    if (hasPrompted) return 
    if (permission === 'denied') return 
 
    const timer = setTimeout(() => { 
      setShowBanner(true) 
    }, 3 * 60 * 1000)  // 3 minutes 
 
    return () => clearTimeout(timer) 
  }, [isSupported, isSubscribed, hasPrompted, permission]) 
 
  const handleSubscribe = async () => { 
    const success = await subscribe() 
    if (success) { 
      setShowBanner(false) 
      setHasPrompted(true) 
      localStorage.setItem('cx_push_dismissed', 'subscribed') 
    } else if (Notification.permission === 'denied') { 
      setShowBanner(false) 
      setShowDenied(true) 
    } 
  } 
 
  const handleDismiss = () => { 
    setShowBanner(false) 
    setHasPrompted(true) 
    // Remember for 7 days 
    localStorage.setItem('cx_push_dismissed', Date.now().toString()) 
  } 
 
  // Don't show if not supported or already subscribed 
  if (!isSupported || isSubscribed || permission === 'granted') return null 
 
  if (showDenied) { 
    return <PushDeniedBanner onDismiss={() => setShowDenied(false)} /> 
  } 
 
  if (showBanner) { 
    return ( 
      <PushPermissionBanner 
        onSubscribe={handleSubscribe} 
        onDismiss={handleDismiss} 
        isLoading={isLoading} 
      /> 
    ) 
  } 
 
  return null 
} 
