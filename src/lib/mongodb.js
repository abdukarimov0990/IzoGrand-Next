import mongoose from 'mongoose'

const MONGODB_URI = "mongodb+srv://abdukarimovdevs:<db_password>@cluster0.nyklckf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

if (!MONGODB_URI) {
  throw new Error("MongoDB URI yo'q")
}

let cached = global.mongoose || { conn: null, promise: null }

async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
