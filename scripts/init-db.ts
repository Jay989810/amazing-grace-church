import { getCollection } from '../src/lib/mongodb'
import { UserDocument } from '../src/lib/models'

async function initializeDatabase() {
  try {
    console.log('Initializing MongoDB database...')
    
    // Create default admin user
    const usersCollection = await getCollection('users')
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ 
      email: 'admin@amazinggracechurch.org' 
    })
    
    if (!existingAdmin) {
      const adminUser: UserDocument = {
        email: 'admin@amazinggracechurch.org',
        name: 'Admin User',
        password: 'grace1234', // In production, hash this password
        role: 'admin',
        created_at: new Date().toISOString()
      }
      
      await usersCollection.insertOne(adminUser)
      console.log('✅ Default admin user created')
    } else {
      console.log('✅ Admin user already exists')
    }
    
    // Create indexes for better performance
    await usersCollection.createIndex({ email: 1 }, { unique: true })
    await usersCollection.createIndex({ role: 1 })
    
    console.log('✅ Database initialization completed')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  }
}

initializeDatabase()
