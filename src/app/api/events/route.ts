import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { EventDocument, eventDocumentToApi } from '@/lib/models'

export async function GET() {
  try {
    const eventsCollection = await getCollection('events')
    const events = await eventsCollection
      .find({})
      .sort({ date: 1 })
      .toArray() as EventDocument[]

    const apiEvents = events.map(eventDocumentToApi)
    return NextResponse.json(apiEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, time, venue, type, image, registrationRequired, registrationUrl } = body

    const eventsCollection = await getCollection('events')
    const now = new Date().toISOString()
    
    const eventDoc: EventDocument = {
      title,
      description,
      date,
      time,
      venue,
      type,
      image,
      registration_required: registrationRequired || false,
      registration_url: registrationUrl,
      created_at: now,
      updated_at: now
    }

    const result = await eventsCollection.insertOne(eventDoc)
    const insertedEvent = await eventsCollection.findOne({ _id: result.insertedId }) as EventDocument

    return NextResponse.json(eventDocumentToApi(insertedEvent), { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    const eventsCollection = await getCollection('events')
    const { ObjectId } = await import('mongodb')
    
    const updateDoc = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const updatedEvent = await eventsCollection.findOne({ _id: new ObjectId(id) }) as EventDocument
    return NextResponse.json(eventDocumentToApi(updatedEvent))
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const eventsCollection = await getCollection('events')
    const { ObjectId } = await import('mongodb')

    const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
