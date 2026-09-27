import mongoose from 'mongoose'

let cached = (
  globalThis as typeof globalThis & {
    mongoose?: {
      conn: typeof mongoose | null
      promise: Promise<typeof mongoose> | null
    }
  }
).mongoose

if (!cached) {
  cached = {
    conn: null,
    promise: null,
  }

  ;(
    globalThis as typeof globalThis & {
      mongoose?: typeof cached
    }
  ).mongoose = cached
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not configured')
  }

  // Already connected
  if (cached!.conn) {
    return cached!.conn
  }

  // Connection already in progress
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, {
      bufferCommands: false,

      // Prefer IPv4 for Atlas connection
      family: 4,

      // Fail faster instead of hanging for a long time
      serverSelectionTimeoutMS: 10000,

      // Connection timeout
      connectTimeoutMS: 10000,

      // Keep development pool small
      maxPoolSize: 10,
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (error) {
    // Allow a fresh connection attempt next time
    cached!.promise = null

    throw error
  }

  return cached!.conn
}