import { isFounder } from './founder' 
 
 // Founder's exclusive visual config 
 // These override ANY shop-purchased items 
 export const FOUNDER_VISUALS = { 
   avatarFrame: { 
     slug: 'founder-frame', 
     type: 'animated-gradient', 
     gradient: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #f59e0b, #ec4899, #3b82f6)', 
     backgroundSize: '300% 300%', 
     animation: 'founder-frame-spin 4s ease infinite', 
     padding: '2.5px' 
   }, 
   usernameColor: { 
     slug: 'founder-username', 
     type: 'animated-gradient', 
     gradient: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b, #8b5cf6, #3b82f6)', 
     backgroundSize: '200% auto', 
     animation: 'founder-name-shift 3s linear infinite' 
   }, 
   postBadge: { 
     slug: 'founder-badge', 
     emoji: '⚡', 
     label: 'Founder', 
     color: '#f59e0b', 
     gradient: 'linear-gradient(90deg, #f59e0b, #f97316)', 
     animated: true 
   }, 
   chatBubble: { 
     slug: 'founder-bubble', 
     background: 'linear-gradient(135deg, #1e1b4b, #312e81)', 
     textColor: '#e0e7ff', 
     border: '1px solid #4f46e5' 
   }, 
   profileBanner: { 
     slug: 'founder-banner', 
     type: 'animated', 
     gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', 
     animation: 'founder-banner-pulse 6s ease infinite' 
   } 
 } 
 
 // Returns founder visuals if user is founder 
 // Otherwise returns null (use shop equipped instead) 
 export function getFounderVisuals(username) { 
   if (!isFounder(username)) return null 
   return FOUNDER_VISUALS 
 } 
 
 // For API responses — check founder BEFORE wallet 
 export function resolveEquipped(username, walletEquipped) { 
   const founderVisuals = getFounderVisuals(username) 
   if (founderVisuals) return founderVisuals 
   return walletEquipped  // regular user → their shop items 
 } 
