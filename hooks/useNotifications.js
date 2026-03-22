"use client"

import { useNotifications as useNotificationContext } from '@/context/NotificationContext'

/**
 * Hook to access notification state and actions.
 * Now a wrapper around NotificationContext for app-wide sync.
 */
export function useNotifications() {
  return useNotificationContext()
}
