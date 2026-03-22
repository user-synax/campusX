import nodemailer from 'nodemailer'

// Validate env variables on startup
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
  console.warn('[Mailer] ⚠️ GMAIL_USER or GMAIL_APP_PASS not set in .env.local')
}

// Singleton — prevent multiple connections
let transporter = null

export function getTransporter() {
  if (transporter) return transporter
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS?.replace(/\s/g, '') // Remove spaces
    }
  })
  
  return transporter
}

// Test connection — call once on server start (optional)
export async function verifyMailer() {
  try {
    const t = getTransporter()
    await t.verify()
    console.log('[Mailer] ✅ Gmail SMTP connected')
    return true
  } catch (err) {
    console.error('[Mailer] ❌ Gmail SMTP connection failed:', err.message)
    return false
  }
}
