import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

// Manually read .env.local file
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars: Record<string, string> = {}
  
  console.log('Raw file content:')
  console.log(JSON.stringify(envContent))
  console.log('---')
  
  envContent.split('\n').forEach((line, index) => {
    const trimmed = line.trim()
    console.log(`Line ${index}: "${trimmed}"`)
    
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim()
        let value = trimmed.substring(equalIndex + 1).trim()
        
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        
        console.log(`Parsed: ${key} = "${value}"`)
        envVars[key] = value
      }
    }
  })
  
  return envVars
}

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB Connection...\n')
  
  try {
    const envVars = loadEnvFile()
    console.log('📋 Loaded environment variables:')
    Object.keys(envVars).forEach(key => {
      if (key === 'MONGODB_URI') {
        console.log(`   ${key}: ${envVars[key].replace(/\/\/.*@/, '//***:***@')}`)
      } else {
        console.log(`   ${key}: ${envVars[key]}`)
      }
    })
    console.log()
    
    console.log('Debug - MONGODB_URI value:', JSON.stringify(envVars.MONGODB_URI))
    console.log('Debug - MONGODB_URI length:', envVars.MONGODB_URI?.length)
    
    if (!envVars.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env.local file')
      return
    }
    
    // Fix the MongoDB URI to include the database name
    let mongoUri = envVars.MONGODB_URI
    if (!mongoUri.includes('/amazing-grace-church')) {
      if (mongoUri.includes('?')) {
        mongoUri = mongoUri.replace('?', '/amazing-grace-church?')
      } else {
        mongoUri = mongoUri + '/amazing-grace-church'
      }
    }
    
    console.log(`📡 Connecting to: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`)
    
    let client: MongoClient | null = null
    
    try {
      // Create MongoDB client
      client = new MongoClient(mongoUri)
      
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
      console.error('Error:', error instanceof Error ? error.message : String(error))
      
      console.log('\n🔧 Troubleshooting tips:')
      console.log('1. Check your MongoDB Atlas connection string')
      console.log('2. Verify your database user has proper permissions')
      console.log('3. Check your network connection')
      console.log('4. Ensure your IP is whitelisted in MongoDB Atlas')
      
    } finally {
      if (client) {
        await client.close()
        console.log('\n🔌 Connection closed')
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to read .env.local file:', error instanceof Error ? error.message : String(error))
  }
}

// Run the test
testMongoDBConnection().catch(console.error)
