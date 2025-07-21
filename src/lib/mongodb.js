import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO_URI

if (!MONGODB_URI) {
  throw new Error('❌ MONGO_URI is not defined in .env file')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
