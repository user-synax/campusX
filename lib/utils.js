import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function getEnvVar(key, defaultValue = null) {
  return process.env[key] || defaultValue
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}
