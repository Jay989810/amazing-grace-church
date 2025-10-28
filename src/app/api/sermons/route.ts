import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { SermonDocument, sermonDocumentToApi } from '@/lib/models'

export async function GET() {
  try {
    const sermonsCollection = await getCollection('sermons')
    const sermons = await sermonsCollection
      .find({})
      .sort({ date: -1 })
      .toArray() as SermonDocument[]

    const apiSermons = sermons.map(sermonDocumentToApi)
    return NextResponse.json(apiSermons)
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json({ error: 'Failed to fetch sermons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, speaker, date, category, description, audioUrl, videoUrl, notesUrl, thumbnail, duration } = body

    const sermonsCollection = await getCollection('sermons')
    const now = new Date().toISOString()
    
    const sermonDoc: SermonDocument = {
      title,
      speaker,
      date,
      category,
      description,
      audio_url: audioUrl,
      video_url: videoUrl,
      notes_url: notesUrl,
      thumbnail,
      duration,
      created_at: now,
      updated_at: now
    }

    const result = await sermonsCollection.insertOne(sermonDoc)
    const insertedSermon = await sermonsCollection.findOne({ _id: result.insertedId }) as SermonDocument

    return NextResponse.json(sermonDocumentToApi(insertedSermon), { status: 201 })
  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json({ error: 'Failed to create sermon' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const sermonsCollection = await getCollection('sermons')
    const { ObjectId } = await import('mongodb')
    
    const updateDoc = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const result = await sermonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 })
    }

    const updatedSermon = await sermonsCollection.findOne({ _id: new ObjectId(id) }) as SermonDocument
    return NextResponse.json(sermonDocumentToApi(updatedSermon))
  } catch (error) {
    console.error('Error updating sermon:', error)
    return NextResponse.json({ error: 'Failed to update sermon' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Sermon ID is required' }, { status: 400 })
    }

    const sermonsCollection = await getCollection('sermons')
    const { ObjectId } = await import('mongodb')

    const result = await sermonsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Sermon deleted successfully' })
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json({ error: 'Failed to delete sermon' }, { status: 500 })
  }
}
