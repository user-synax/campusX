import mongoose from 'mongoose'

let lastConnectedAt = null
let lastError = null

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (mongoose.connection.readyState === 1) return

  try {
    await mongoose.connect(uri)
    lastConnectedAt = new Date()
    lastError = null
  } catch (error) {
    lastError = error
    throw error
  }
}

export function getDBStatus() {
  const readyState = mongoose.connection.readyState
  const state =
    readyState === 0 ? 'disconnected' :
    readyState === 1 ? 'connected' :
    readyState === 2 ? 'connecting' :
    readyState === 3 ? 'disconnecting' :
    'unknown'

  return {
    state,
    readyState,
    lastConnectedAt: lastConnectedAt ? lastConnectedAt.toISOString() : null,
    lastError: lastError ? (lastError.message || String(lastError)) : null
  }
}

export default connectDB
