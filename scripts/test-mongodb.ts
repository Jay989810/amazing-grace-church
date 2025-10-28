import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
dotenv.config({ path: envPath })

// Also try loading from process.env directly
console.log('Environment check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n')
  
  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables')
    console.log('\n📝 Please create a .env.local file with:')
    console.log('MONGODB_URI="mongodb://localhost:27017/amazing-grace-church"')
    console.log('NEXTAUTH_SECRET="amazing-grace-church-secret-key-2024"')
    console.log('NEXTAUTH_URL="http://localhost:3000"')
    console.log('ADMIN_EMAIL="admin@amazinggracechurch.org"')
    console.log('ADMIN_PASSWORD="grace1234"')
    return
  }

  console.log(`📡 Connecting to: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`)
  
  let client: MongoClient | null = null
  
  try {
    // Create MongoDB client
    client = new MongoClient(process.env.MONGODB_URI)
    
    // Test connection
    console.log('⏳ Attempting to connect...')
    await client.connect()
    
    // Test database access
    const db = client.db('amazing-grace-church')
    console.log('✅ Successfully connected to MongoDB!')
    
    // List collections
    const collections = await db.listCollections().toArray()
    console.log(`📊 Database: amazing-grace-church`)
    console.log(`📁 Collections found: ${collections.length}`)
    
    if (collections.length > 0) {
      console.log('   Collections:')
      collections.forEach(col => {
        console.log(`   - ${col.name}`)
      })
    } else {
      console.log('   (No collections yet - database is empty)')
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...')
    
    // Test users collection
    const usersCollection = db.collection('users')
    const userCount = await usersCollection.countDocuments()
    console.log(`👥 Users: ${userCount}`)
    
    // Test sermons collection
    const sermonsCollection = db.collection('sermons')
    const sermonCount = await sermonsCollection.countDocuments()
    console.log(`📖 Sermons: ${sermonCount}`)
    
    // Test events collection
    const eventsCollection = db.collection('events')
    const eventCount = await eventsCollection.countDocuments()
    console.log(`📅 Events: ${eventCount}`)
    
    console.log('\n🎉 MongoDB connection test completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Run "npm run init-db" to initialize the database')
    console.log('2. Run "npm run dev" to start the development server')
    console.log('3. Visit http://localhost:3000/admin to test the admin dashboard')
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!')
    console.error('Error:', error.message)
    
    console.log('\n🔧 Troubleshooting tips:')
    console.log('1. Make sure MongoDB is running locally (mongod)')
    console.log('2. Check your MONGODB_URI in .env.local')
    console.log('3. For MongoDB Atlas, verify your connection string')
    console.log('4. Check your network connection')
    console.log('5. Verify database user permissions')
    
  } finally {
    if (client) {
      await client.close()
      console.log('\n🔌 Connection closed')
    }
  }
}

// Run the test
testMongoDBConnection().catch(console.error)
