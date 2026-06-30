# Push Notifications Documentation

This guide covers how to use and customize push notifications in the CampusZen app.

## Setup

### 1. Generate VAPID Keys

To use push notifications, you need to generate VAPID keys:

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 2. Add to Environment Variables

Add these keys to your `.env.local`:

```env
VAPID_PUBLIC_KEY="Your public key here"
VAPID_PRIVATE_KEY="Your private key here"
VAPID_SUBJECT="mailto:your-email@example.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="Same as VAPID_PUBLIC_KEY"
```

## Notification Customization Options

### Basic Notification

```javascript
const payload = {
    title: "New Message",
    body: "John Doe sent you a message",
    icon: "/android-chrome-192x192.png",
};
```

### Full Customization

Here are all the available options:

```javascript
const payload = {
    title: "Custom Notification",
    body: "This is a detailed notification with all options",

    // Visual
    icon: "/favicon.ico",
    image: "/images/image-url.jpg", // Large image

    // Grouping & Deduplication
    tag: "notification-group",
    renotify: true, // Re-notify even if tag is same
    requireInteraction: false, // Keep until user acts

    // Priority (Chrome only)
    priority: "high", // "default", "high", "low", "min"

    // Behavior
    vibrate: [200, 100, 200], // Vibrate pattern: on-off-on
    silent: false, // Play sound?
    sound: "/sounds/notification.mp3", // Custom sound

    // Actions
    actions: [
        { action: "reply", title: "Reply", icon: "/icons/reply.png" },
        { action: "dismiss", title: "Dismiss", icon: "/icons/close.png" },
    ],

    // Data to pass to app
    data: {
        url: "/chats/dm/123",
        messageId: "abc-123",
        type: "dm",
    },

    // Timing
    timestamp: Date.now(),
    showTrigger: null, // Show at specific time
};
```

## Customization Examples

### 1. Urgent Notification

```javascript
const urgentPayload = {
    title: "Urgent Message",
    body: "Please read this right away",
    priority: "high",
    requireInteraction: true,
    vibrate: [100, 50, 100, 50, 100],
    actions: [{ action: "view", title: "View Now" }],
};
```

### 2. Image Preview Notification

```javascript
const imagePayload = {
    title: "Photo Shared",
    body: "John sent you a photo",
    image: "/images/photo.jpg",
    icon: "/icons/camera.png",
};
```

### 3. Interactive Reply Notification

```javascript
const replyPayload = {
    title: "New Message",
    body: "Jane: Hey, how are you?",
    actions: [
        {
            action: "quick_reply",
            title: "Reply",
            type: "text",
            placeholder: "Type your reply...",
        },
        {
            action: "like",
            title: "👍 Like",
        },
    ],
};
```

### 4. Silent Notification (For Updates)

```javascript
const silentPayload = {
    title: "App Updated",
    body: "New features are available",
    silent: true,
    badge: "/icons/update.png",
};
```

## Service Worker Event Handling

You can customize behavior in `public/sw.js`:

```javascript
self.addEventListener("push", (event) => {
    const payload = event.data?.json() || { title: "New Notification" };

    // Custom logic based on payload.type
    if (payload.data?.type === "dm") {
        // Special DM handling
    }

    event.waitUntil(self.registration.showNotification(payload.title, payload));
});

self.addEventListener("notificationclick", (event) => {
    const action = event.action;
    event.notification.close();

    switch (action) {
        case "reply":
            // Open reply UI
            event.waitUntil(
                clients.openWindow(
                    "/chats/dm/" + event.notification.data.conversationId,
                ),
            );
            break;
        case "mark_read":
            // Mark message as read
            break;
        default:
            event.waitUntil(
                clients.openWindow(event.notification.data?.url || "/"),
            );
    }
});

self.addEventListener("notificationclose", (event) => {
    // Handle dismissal
});
```

## Browser Support

| Feature             | Chrome | Firefox | Safari | Edge |
| ------------------- | ------ | ------- | ------ | ---- |
| Basic Notifications | ✅     | ✅      | ✅     | ✅   |
| Custom Icons        | ✅     | ✅      | ✅     | ✅   |
| Actions             | ✅     | ✅      | ❌     | ✅   |
| Custom Vibrations   | ✅     | ✅      | ❌     | ✅   |
| Require Interaction | ✅     | ✅      | ✅     | ✅   |

## Troubleshooting

### Notification Not Showing Up

1. Check browser permissions
2. Verify VAPID keys are correctly set
3. Check that the service worker is registered
4. Look for errors in browser's dev tools > Application > Service Workers

### Subscription Issues

```javascript
// Check subscription state
const reg = await navigator.serviceWorker.getRegistration();
const sub = await reg.pushManager.getSubscription();
console.log("Subscription:", sub);
```
