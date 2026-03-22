"use client"

import { useState, useEffect } from "react"
import { formatRelativeTime } from "@/utils/formatters"

/**
 * Reusable component to render time/date safely on the client.
 * Prevents hydration mismatches by only rendering after mount.
 * 
 * @param {Object} props
 * @param {Date|string|number} props.date - The date to format
 * @param {string} [props.type='relative'] - 'relative', 'time', or 'full'
 * @param {string} [props.className] - Optional CSS class
 */
export default function FormattedTime({ date, type = 'relative', className = '' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
  // no-op: we only need the effect to run once after mount
  }, [])

  if (!mounted || !date) {
    return <span className={className}>...</span>
  }

  const dateObj = new Date(date)

  let content = ''
  if (type === 'relative') {
    content = formatRelativeTime(dateObj)
  } else if (type === 'time') {
    content = dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } else if (type === 'full') {
    content = dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return <span className={className}>{content}</span>
}
