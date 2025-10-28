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

async function testAuthSetup() {
  try {
    console.log('🔍 Testing NextAuth Setup...\n')
    
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
    
    // Test admin user exists
    const usersCollection = db.collection('users')
    const adminUser = await usersCollection.findOne({ 
      email: 'admin@amazinggracechurch.org' 
    })
    
    if (adminUser) {
      console.log('✅ Admin user found in database:')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Name: ${adminUser.name}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Password: ${adminUser.password}`)
    } else {
      console.log('❌ Admin user not found in database')
    }
    
    await client.close()
    
    console.log('\n🎉 NextAuth setup test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Visit http://localhost:3000/admin')
    console.log('2. Login with: admin@amazinggracechurch.org / grace1234')
    console.log('3. The admin dashboard should now work properly!')
    
  } catch (error) {
    console.error('❌ NextAuth setup test failed:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run the test
testAuthSetup()
