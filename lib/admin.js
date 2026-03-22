/**
 * Admin Helper Utilities
 */

/**
 * Checks if a user has admin privileges.
 * 
 * @param {Object} user - The user object from the database (lean or hydrated)
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user) return false;
  
  // 1. Role-based check
  if (user.role === 'admin') return true;
  
  // 2. Explicit username check (for the initial admin/founder)
  const adminUsernames = ['admin', process.env.NEXT_PUBLIC_FOUNDER_USERNAME].filter(Boolean);
  if (adminUsernames.includes(user.username)) return true;
  
  return false;
}
