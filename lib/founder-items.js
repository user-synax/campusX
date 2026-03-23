import { isFounder } from './founder.js'

/**
 * Returns premium visual overrides for the platform founder.
 * @param {string} username - The user's username.
 */
export function getFounderVisuals(username) {
  if (!isFounder(username)) return null

  return {
    avatarFrame: {
      type: 'animated',
      gradient: 'linear-gradient(45deg, #f59e0b, #fef3c7, #f59e0b)',
      backgroundSize: '200% 200%',
      animation: 'name-shift 3s linear infinite',
      padding: '3px'
    },
    usernameColor: {
      type: 'gradient',
      gradient: 'linear-gradient(90deg, #f59e0b, #fef3c7, #f59e0b)',
      backgroundSize: '200% auto',
      animation: 'name-shift 3s linear infinite'
    },
    postBadge: {
      emoji: '⚡',
      label: 'Founder',
      color: '#f59e0b'
    }
  }
}
