// Script to create database indexes for better query performance
// Run with: npm run create-indexes

import { getDatabase } from '../src/lib/mongodb'

async function createIndexes() {
  try {
    const db = await getDatabase()
    
    console.log('Creating database indexes for better performance...')
    
    // Sermons indexes
    const sermonsCollection = db.collection('sermons')
    await sermonsCollection.createIndex({ date: -1 })
    await sermonsCollection.createIndex({ category: 1 })
    await sermonsCollection.createIndex({ created_at: -1 })
    console.log('✓ Sermons indexes created')
    
    // Events indexes
    const eventsCollection = db.collection('events')
    await eventsCollection.createIndex({ date: 1 })
    await eventsCollection.createIndex({ type: 1 })
    await eventsCollection.createIndex({ created_at: -1 })
    console.log('✓ Events indexes created')
    
    // Gallery indexes
    const galleryCollection = db.collection('gallery_images')
    await galleryCollection.createIndex({ album: 1 })
    await galleryCollection.createIndex({ created_at: -1 })
    await galleryCollection.createIndex({ date: -1 })
    console.log('✓ Gallery indexes created')
    
    // Organizations indexes
    const organizationsCollection = db.collection('organizations')
    await organizationsCollection.createIndex({ dateCreated: -1 })
    await organizationsCollection.createIndex({ name: 1 })
    console.log('✓ Organizations indexes created')
    
    // Giving transactions indexes
    const givingCollection = db.collection('giving_transactions')
    await givingCollection.createIndex({ payment_reference: 1 }, { unique: true })
    await givingCollection.createIndex({ status: 1 })
    await givingCollection.createIndex({ created_at: -1 })
    await givingCollection.createIndex({ email: 1 })
    console.log('✓ Giving transactions indexes created')
    
    // Contact messages indexes
    const messagesCollection = db.collection('contact_messages')
    await messagesCollection.createIndex({ status: 1 })
    await messagesCollection.createIndex({ created_at: -1 })
    await messagesCollection.createIndex({ email: 1 })
    console.log('✓ Contact messages indexes created')
    
    // Settings indexes
    const settingsCollection = db.collection('settings')
    await settingsCollection.createIndex({ type: 1 }, { unique: true })
    console.log('✓ Settings indexes created')
    
    // About page indexes
    const aboutCollection = db.collection('about_page')
    await aboutCollection.createIndex({ type: 1 }, { unique: true })
    console.log('✓ About page indexes created')
    
    // Core beliefs indexes
    const beliefsCollection = db.collection('core_beliefs')
    await beliefsCollection.createIndex({ order: 1 })
    console.log('✓ Core beliefs indexes created')
    
    // Leadership indexes
    const leadershipCollection = db.collection('leadership_team')
    await leadershipCollection.createIndex({ order: 1 })
    console.log('✓ Leadership indexes created')
    
    console.log('\n✅ All indexes created successfully!')
    console.log('Your database queries will now be significantly faster.')
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()

