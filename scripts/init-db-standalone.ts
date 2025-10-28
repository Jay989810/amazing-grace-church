import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars: Record<string, string> = {}
  
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim()
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
        
        envVars[key] = value
      }
    }
  })
  
  return envVars
}

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing MongoDB database...\n')
    
    // Load environment variables
    const envVars = loadEnvFile()
    
    if (!envVars.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local file')
    }
    
    console.log('📡 Connecting to MongoDB...')
    const client = new MongoClient(envVars.MONGODB_URI)
    await client.connect()
    
    const db = client.db('amazing-grace-church')
    console.log('✅ Connected to MongoDB successfully!\n')
    
    // Create collections and indexes
    console.log('📁 Creating collections and indexes...')
    
    // Users collection
    const usersCollection = db.collection('users')
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ role: 1 })
    console.log('✅ Users collection ready')
    
    // Sermons collection
    const sermonsCollection = db.collection('sermons')
    await sermonsCollection.createIndex({ title: 1 })
    await sermonsCollection.createIndex({ date: -1 })
    console.log('✅ Sermons collection ready')
    
    // Events collection
    const eventsCollection = db.collection('events')
    await eventsCollection.createIndex({ title: 1 })
    await eventsCollection.createIndex({ date: -1 })
    console.log('✅ Events collection ready')
    
    // Gallery collection
    const galleryCollection = db.collection('gallery_images')
    await galleryCollection.createIndex({ title: 1 })
    await galleryCollection.createIndex({ created_at: -1 })
    console.log('✅ Gallery collection ready')
    
    // Contact messages collection
    const messagesCollection = db.collection('contact_messages')
    await messagesCollection.createIndex({ email: 1 })
    await messagesCollection.createIndex({ created_at: -1 })
    console.log('✅ Contact messages collection ready')
    
    // Create default admin user
    console.log('\n👤 Creating default admin user...')
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@amazinggracechurch.org' 
    })
    
    if (!existingAdmin) {
      const adminUser = {
        email: 'admin@amazinggracechurch.org',
        name: 'Admin User',
        password: 'grace1234', // In production, hash this password
        role: 'admin',
        created_at: new Date().toISOString()
      }
      
      await usersCollection.insertOne(adminUser)
      console.log('✅ Default admin user created')
      console.log('   Email: admin@amazinggracechurch.org')
      console.log('   Password: grace1234')
    } else {
      console.log('✅ Admin user already exists')
    }
    
    // Add some sample data
    console.log('\n📝 Adding sample data...')
    
    // Sample sermon
    const existingSermon = await sermonsCollection.findOne({ title: 'Welcome to Amazing Grace Church' })
    if (!existingSermon) {
      await sermonsCollection.insertOne({
        title: 'Welcome to Amazing Grace Church',
        speaker: 'Pastor John',
        date: new Date().toISOString(),
        description: 'A warm welcome to our church family and visitors.',
        audio_url: '',
        video_url: '',
        created_at: new Date().toISOString()
      })
      console.log('✅ Sample sermon added')
    }
    
    // Sample event
    const existingEvent = await eventsCollection.findOne({ title: 'Sunday Service' })
    if (!existingEvent) {
      await eventsCollection.insertOne({
        title: 'Sunday Service',
        description: 'Join us for our weekly Sunday service',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
        location: 'Main Sanctuary',
        created_at: new Date().toISOString()
      })
      console.log('✅ Sample event added')
    }
    
    await client.close()
    
    console.log('\n🎉 Database initialization completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Run "npm run dev" to start the development server')
    console.log('2. Visit http://localhost:3000/admin')
    console.log('3. Login with: admin@amazinggracechurch.org / grace1234')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the initialization
initializeDatabase()
