// ━━━ Centralized Environment Configuration ━━━
// All environment variables should be accessed through this file
// This provides validation, type safety, and a single source of truth

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET']

const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Web Push (VAPID)
  webpush: {
    subject: process.env.VAPID_SUBJECT || 'mailto:your@gmail.com',
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
  },

  // Pusher
  pusher: {
    appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  },

  // UploadThing
  uploadthing: {
    apiKey: process.env.UPLOADTHING_SECRET,
  },

  // Email (Resend)
  email: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL || 'noreply@campuszen.com',
  },

  // Environment
  env: {
    node: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
    isProd: process.env.NODE_ENV === 'production',
  },
}

// ━━━ Validation ━━━
function validateConfig() {
  const missing = []
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    console.error(`[Config] Missing required environment variables: ${missing.join(', ')}`)
    if (config.env.isProd) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}

// Run validation on import
validateConfig()

export default config
