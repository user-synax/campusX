// CampusX Service Worker 
// Handles: Push notifications, notification clicks 
 
const CACHE_NAME = 'campusx-v1' 
const APP_URL = self.location.origin 
 
// ━━━ INSTALL EVENT ━━━ 
// Called when service worker is first installed 
self.addEventListener('install', (event) => { 
  console.log('[SW] Installing...') 
  // Skip waiting — activate immediately 
  self.skipWaiting() 
}) 
 
// ━━━ ACTIVATE EVENT ━━━ 
// Called when service worker takes control 
self.addEventListener('activate', (event) => { 
  console.log('[SW] Activated') 
  // Take control of all pages immediately 
  event.waitUntil(self.clients.claim()) 
}) 
 
// ━━━ PUSH EVENT ━━━ 
// This is the main event — fires when push notification arrives 
// Even if the app/tab is completely closed 
self.addEventListener('push', (event) => { 
  console.log('[SW] Push received') 
 
  // Default payload in case parsing fails 
  let data = { 
    title: 'CampusX', 
    body: 'You have a new notification', 
    icon: '/icons/notification-icon.png', 
    badge: '/icons/badge-icon.png', 
    tag: 'campusx-default', 
    data: { url: '/notifications' } 
  } 
 
  // Parse the push data 
  if (event.data) { 
    try { 
      data = { ...data, ...event.data.json() } 
    } catch (err) { 
      console.error('[SW] Failed to parse push data:', err) 
    } 
  } 
 
  // Show the notification 
  const notificationOptions = { 
    body: data.body, 
    icon: data.icon || '/icons/notification-icon.png', 
    badge: data.badge || '/icons/badge-icon.png', 
    image: data.image || null, // Large preview image
 
    // tag: groups notifications — same tag replaces old one 
    // prevents notification spam 
    tag: data.tag || 'campusx', 
 
    // renotify: true = play sound even if replacing same tag 
    renotify: true, 
 
    // data passed to notificationclick event 
    data: { 
      url: data.data?.url || '/notifications', 
      notificationId: data.data?.notificationId 
    }, 
 
    // Actions (buttons in notification) 
    actions: [ 
      { 
        action: 'view', 
        title: 'View', 
      }, 
      { 
        action: 'dismiss', 
        title: 'Dismiss', 
      } 
    ], 
 
    // Vibration pattern for mobile (Android) 
    // [vibrate, pause, vibrate, pause...] 
    vibrate: [100, 50, 100], 
 
    // Keep notification visible (don't auto-dismiss) 
    requireInteraction: false, 
 
    // Timestamp 
    timestamp: Date.now() 
  } 
 
  event.waitUntil( 
    self.registration.showNotification(data.title, notificationOptions) 
  ) 
}) 
 
// ━━━ NOTIFICATIONCLICK EVENT ━━━ 
// Fires when user clicks the notification 
self.addEventListener('notificationclick', (event) => { 
  console.log('[SW] Notification clicked:', event.action) 
 
  // Close the notification 
  event.notification.close() 
 
  // Handle dismiss action 
  if (event.action === 'dismiss') return 
 
  const targetUrl = event.notification.data?.url || '/notifications' 
  const fullUrl = APP_URL + targetUrl 
 
  event.waitUntil( 
    // Try to focus existing tab first 
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => { 
 
      // Check if CampusX is already open in a tab 
      for (const client of clientList) { 
        if (client.url.startsWith(APP_URL)) { 
          // Focus that tab and navigate to URL 
          return client.focus().then(() => { 
            return client.navigate(fullUrl) 
          }) 
        } 
      } 
 
      // No tab open — open a new one 
      return self.clients.openWindow(fullUrl) 
    }) 
  ) 
}) 
 
// ━━━ NOTIFICATIONCLOSE EVENT ━━━ 
// Fires when user dismisses notification (swipes away) 
self.addEventListener('notificationclose', (event) => { 
  console.log('[SW] Notification dismissed') 
  // Could track dismissal analytics here 
}) 
 
// ━━━ PUSH SUBSCRIPTION CHANGE ━━━ 
// Fires when subscription expires (rare but handle it) 
self.addEventListener('pushsubscriptionchange', (event) => { 
  console.log('[SW] Subscription changed — re-subscribing') 
  // Re-subscribe will be handled by the client 
  // Just log for now 
}) 
