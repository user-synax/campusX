import { JSDOM } from 'jsdom' 
import DOMPurify from 'dompurify' 
 
const window = new JSDOM('').window 
const purify = DOMPurify(window) 
 
// Sanitize text — removes HTML tags, XSS attempts 
export function sanitizeText(input) { 
  if (!input || typeof input !== 'string') return '' 
  // Remove HTML entirely (posts are plain text) 
  return purify.sanitize(input, { ALLOWED_TAGS: [] }).trim() 
} 
 
// Sanitize URL — ensure it's a valid http/https URL 
export function sanitizeURL(url) { 
  if (!url || typeof url !== 'string') return '' 
  try { 
    const parsed = new URL(url) 
    if (!['http:', 'https:'].includes(parsed.protocol)) return '' 
    return parsed.href 
  } catch { 
    return '' 
  } 
} 
 
// Sanitize username — alphanumeric + underscore only 
export function sanitizeUsername(username) { 
  if (!username) return '' 
  return username.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20) 
} 

// Strip MongoDB operators from user input 
export function sanitizeMongoInput(obj) { 
  if (typeof obj === 'string') { 
    // Remove $ prefix which MongoDB uses for operators 
    return obj.replace(/^\$/, '') 
  } 
  if (typeof obj === 'object' && obj !== null) { 
    const clean = {} 
    for (const [key, value] of Object.entries(obj)) { 
      // Skip keys starting with $ (MongoDB operators) 
      if (!key.startsWith('$')) { 
        clean[key] = sanitizeMongoInput(value) 
      } 
    } 
    return clean 
  } 
  return obj 
} 

const SENSITIVE_USER_FIELDS = [ 
  'password', 'blockedUsers', 'blockedBy', 
  'founderData', '__v', 'bookmarks' 
] 
 
export function sanitizeUser(userDoc) { 
  if (!userDoc) return null 
  const obj = typeof userDoc.toObject === 'function' 
    ? userDoc.toObject() 
    : { ...userDoc } 
 
  SENSITIVE_USER_FIELDS.forEach(field => delete obj[field]) 
  return obj 
} 
