import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { 
  AboutPageDocument, 
  CoreBeliefDocument, 
  LeadershipMemberDocument,
  aboutPageDocumentToApi,
  coreBeliefDocumentToApi,
  leadershipMemberDocumentToApi
} from '@/lib/models'

export async function GET() {
  try {
    const aboutCollection = await getCollection('about_page')
    const beliefsCollection = await getCollection('core_beliefs')
    const leadershipCollection = await getCollection('leadership_team')

    // Fetch all sections
    const aboutSections = await aboutCollection.find({}).toArray() as AboutPageDocument[]
    const coreBeliefs = await beliefsCollection.find({}).sort({ order: 1 }).toArray() as CoreBeliefDocument[]
    const leadership = await leadershipCollection.find({}).sort({ order: 1 }).toArray() as LeadershipMemberDocument[]

    const response = NextResponse.json({
      sections: aboutSections.map(aboutPageDocumentToApi),
      coreBeliefs: coreBeliefs.map(coreBeliefDocumentToApi),
      leadership: leadership.map(leadershipMemberDocumentToApi)
    })
    
    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response
  } catch (error) {
    console.error('Error fetching about page content:', error)
    return NextResponse.json({ error: 'Failed to fetch about page content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    const now = new Date().toISOString()

    if (type === 'section') {
      // Update or create about page section
      const { sectionType, content } = data
      const aboutCollection = await getCollection('about_page')
      
      await aboutCollection.updateOne(
        { type: sectionType },
        { 
          $set: { 
            type: sectionType,
            content,
            updated_at: now
          },
          $setOnInsert: {
            created_at: now
          }
        },
        { upsert: true }
      )

      return NextResponse.json({ success: true, message: 'Section updated successfully' })
    } else if (type === 'core_belief') {
      // Create or update core belief
      const { id, title, description, icon, order } = data
      const beliefsCollection = await getCollection('core_beliefs')
      const { ObjectId } = await import('mongodb')

      if (id) {
        // Update existing
        await beliefsCollection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              title,
              description,
              icon,
              order: order || 0,
              updated_at: now
            }
          }
        )
      } else {
        // Create new
        await beliefsCollection.insertOne({
          title,
          description,
          icon,
          order: order || 0,
          created_at: now,
          updated_at: now
        })
      }

      return NextResponse.json({ success: true, message: 'Core belief saved successfully' })
    } else if (type === 'leadership') {
      // Create or update leadership member
      const { id, name, role, image, bio, email, order } = data
      const leadershipCollection = await getCollection('leadership_team')
      const { ObjectId } = await import('mongodb')

      if (id) {
        // Update existing
        await leadershipCollection.updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              name,
              role,
              image,
              bio,
              email,
              order: order || 0,
              updated_at: now
            }
          }
        )
      } else {
        // Create new
        await leadershipCollection.insertOne({
          name,
          role,
          image,
          bio,
          email,
          order: order || 0,
          created_at: now,
          updated_at: now
        })
      }

      return NextResponse.json({ success: true, message: 'Leadership member saved successfully' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error saving about page content:', error)
    return NextResponse.json({ error: 'Failed to save about page content' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 })
    }

    const { ObjectId } = await import('mongodb')

    if (type === 'core_belief') {
      const beliefsCollection = await getCollection('core_beliefs')
      await beliefsCollection.deleteOne({ _id: new ObjectId(id) })
    } else if (type === 'leadership') {
      const leadershipCollection = await getCollection('leadership_team')
      await leadershipCollection.deleteOne({ _id: new ObjectId(id) })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting about page content:', error)
    return NextResponse.json({ error: 'Failed to delete about page content' }, { status: 500 })
  }
}

