// In-memory subscriber map — userId → SSE controller 
// Works in single Node.js process (Render, Railway etc.) 

const subscribers = new Map();

export function addSubscriber(userId, controller) { 
  subscribers.set(userId.toString(), controller);
} 

export function removeSubscriber(userId) { 
  subscribers.delete(userId.toString());
} 

export function pushNotification(userId, notification) { 
  const controller = subscribers.get(userId.toString());
  if (!controller) return false; // user not connected 
  try { 
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
    return true;
  } catch (err) { 
    // Controller closed — remove stale subscriber 
    removeSubscriber(userId);
    return false;
  } 
}
