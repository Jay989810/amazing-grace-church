import { MongoClient, Db } from 'mongodb'
import { config } from 'dotenv'

// Load environment variables - try .env.local first (for local dev), then .env (for Vercel)
// In production, Vercel sets these as environment variables, so dotenv won't override them
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' })
  config({ path: '.env' })
}

// Check for MongoDB URI in multiple possible environment variable names
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

if (!mongoUri) {
  throw new Error('Please add your MongoDB URI to .env.local (local) or set MONGODB_URI in Vercel environment variables')
}

const uri = mongoUri
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('amazing-grace-church')
}

export async function getCollection(collectionName: string) {
  const db = await getDatabase()
  return db.collection(collectionName)
}
