/**
 * Role-Based Access Control (RBAC) System
 */

export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  FOUNDER: 'founder'
}

export const PERMISSIONS = {
  // Post permissions
  'post:create': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:read': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:update:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:delete:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:delete:any': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:hide': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'post:pin': [ROLES.FOUNDER],

  // User permissions
  'user:read:public': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'user:read:private': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'user:update:own': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'user:update:any': [ROLES.ADMIN, ROLES.FOUNDER],
  'user:ban': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'user:delete': [ROLES.ADMIN, ROLES.FOUNDER],

  // Admin/Moderation
  'admin:access': [ROLES.ADMIN, ROLES.FOUNDER],
  'moderator:access': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'analytics:view': [ROLES.ADMIN, ROLES.FOUNDER],

  // Coins/Economy
  'coins:send:gift': [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'coins:admin:award': [ROLES.ADMIN, ROLES.FOUNDER],
  'shop:manage': [ROLES.ADMIN, ROLES.FOUNDER],

  // Content Management
  'content:report:view': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],
  'content:report:handle': [ROLES.MODERATOR, ROLES.ADMIN, ROLES.FOUNDER],

  // Broadcast
  'broadcast:send': [ROLES.FOUNDER],
  'broadcast:manage': [ROLES.FOUNDER]
}

export function getUserRole(user) {
  if (!user) return null

  if (user.role && Object.values(ROLES).includes(user.role)) {
    return user.role
  }

  if (user.username === process.env.NEXT_PUBLIC_FOUNDER_USERNAME) {
    return ROLES.FOUNDER
  }

  return ROLES.USER
}

export function hasPermission(user, permission) {
  const userRole = getUserRole(user)
  if (!userRole) return false

  const allowedRoles = PERMISSIONS[permission]
  if (!allowedRoles) {
    console.warn(`Permission "${permission}" not defined`)
    return false
  }

  return allowedRoles.includes(userRole)
}

export function hasAnyPermission(user, permissions) {
  return permissions.some(permission => hasPermission(user, permission))
}

export function hasAllPermissions(user, permissions) {
  return permissions.every(permission => hasPermission(user, permission))
}

export function requirePermission(user, permission) {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied: "${permission}" permission required`)
  }
  return true
}

export function requireAnyPermission(user, permissions) {
  if (!hasAnyPermission(user, permissions)) {
    throw new Error(`Access denied: one of [${permissions.join(', ')}] permissions required`)
  }
  return true
}

export function withPermission(permission) {
  return (user) => {
    requirePermission(user, permission)
    return true
  }
}

export function getRoleLevel(role) {
  const levels = {
    [ROLES.USER]: 1,
    [ROLES.MODERATOR]: 2,
    [ROLES.ADMIN]: 3,
    [ROLES.FOUNDER]: 4
  }
  return levels[role] || 0
}

export function isAtLeastRole(user, minRole) {
  const userRole = getUserRole(user)
  if (!userRole) return false
  return getRoleLevel(userRole) >= getRoleLevel(minRole)
}

export const isFounder = (user) => isAtLeastRole(user, ROLES.FOUNDER)
export const isAdmin = (user) => isAtLeastRole(user, ROLES.ADMIN)
export const isModerator = (user) => isAtLeastRole(user, ROLES.MODERATOR)
