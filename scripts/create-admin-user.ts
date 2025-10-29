import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import { getCollection } from '../src/lib/mongodb'

// Load environment variables - try .env.local first (for local dev), then .env (for Vercel)
config({ path: '.env.local' })
config({ path: '.env' })

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...')
    
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@amazinggracechurch.org'
    const adminPassword = process.env.ADMIN_PASSWORD || 'grace1234'
    const adminName = 'Administrator'
    
    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)
    
    // Get users collection
    const usersCollection = await getCollection('users')
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ email: adminEmail })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log(`📧 Email: ${adminEmail}`)
      console.log(`🔑 Password: ${adminPassword}`)
      return
    }
    
    // Create admin user
    const adminUser = {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      created_at: new Date().toISOString(),
      last_login: null
    }
    
    const result = await usersCollection.insertOne(adminUser)
    
    if (result.insertedId) {
      console.log('✅ Admin user created successfully!')
      console.log(`📧 Email: ${adminEmail}`)
      console.log(`🔑 Password: ${adminPassword}`)
      console.log(`🆔 User ID: ${result.insertedId}`)
    } else {
      console.error('❌ Failed to create admin user')
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('🎉 Admin user setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
