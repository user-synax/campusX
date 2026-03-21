import mongoose from 'mongoose' 
 
// Connection states 
const STATES = { 
  0: 'disconnected', 
  1: 'connected', 
  2: 'connecting', 
  3: 'disconnecting' 
} 
 
// Global cache — survives Next.js hot reloads in dev 
let cached = global._mongoose || { conn: null, promise: null } 
global._mongoose = cached 
 
const MONGODB_URI = process.env.MONGODB_URI 
 
if (!MONGODB_URI) { 
  throw new Error('MONGODB_URI not set in environment variables') 
} 
 
const MONGOOSE_OPTIONS = { 
  // Connection pool settings 
  maxPoolSize: 10,        // max 10 connections in pool 
  minPoolSize: 2,         // keep minimum 2 alive 
  maxIdleTimeMS: 30000,   // close idle connections after 30s 
 
  // Timeout settings 
  serverSelectionTimeoutMS: 5000,  // fail fast if can't connect (5s) 
  socketTimeoutMS: 45000,          // socket timeout (45s) 
  connectTimeoutMS: 10000,         // initial connection timeout (10s) 
 
  // Auto-reconnect 
  heartbeatFrequencyMS: 10000,     // check connection every 10s 
 
  // Buffer commands while connecting (don't fail immediately) 
  bufferCommands: true, 
} 
 
export async function connectDB() { 
  // Already connected 
  if (cached.conn && mongoose.connection.readyState === 1) { 
    return cached.conn 
  } 
 
  // Connection in progress — wait for it 
  if (cached.promise) { 
    cached.conn = await cached.promise 
    return cached.conn 
  } 
 
  // Start new connection 
  cached.promise = mongoose.connect(MONGODB_URI, MONGOOSE_OPTIONS) 
 
  try { 
    cached.conn = await cached.promise 
    console.log(`✅ MongoDB connected [${STATES[mongoose.connection.readyState]}]`) 
  } catch (error) { 
    cached.promise = null 
    console.error('❌ MongoDB connection failed:', error.message) 
    throw error 
  } 
 
  // Event listeners for logging 
  mongoose.connection.on('disconnected', () => { 
    console.warn('⚠️ MongoDB disconnected') 
    cached.conn = null 
    cached.promise = null 
  }) 
 
  mongoose.connection.on('reconnected', () => { 
    console.log('✅ MongoDB reconnected') 
  }) 
 
  mongoose.connection.on('error', (err) => { 
    console.error('❌ MongoDB error:', err.message) 
  }) 
 
  return cached.conn 
} 
 
// Get connection status (for health endpoint) 
export function getDBStatus() { 
  return { 
    state: STATES[mongoose.connection.readyState] || 'unknown', 
    readyState: mongoose.connection.readyState, 
    host: mongoose.connection.host, 
    name: mongoose.connection.name, 
  } 
} 

// Graceful shutdown — close DB when process exits 
if (process.env.NODE_ENV !== 'production') { 
  // Development only — production handles this differently 
  process.on('SIGINT', async () => { 
    await mongoose.connection.close() 
    console.log('MongoDB connection closed (SIGINT)') 
    process.exit(0) 
  }) 
}

export default connectDB;
