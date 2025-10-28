import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { ContactMessageDocument, contactMessageDocumentToApi } from '@/lib/models'

export async function GET() {
  try {
    const messagesCollection = await getCollection('contact_messages')
    const messages = await messagesCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray() as ContactMessageDocument[]

    const apiMessages = messages.map(contactMessageDocumentToApi)
    return NextResponse.json(apiMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    const messagesCollection = await getCollection('contact_messages')
    const now = new Date().toISOString()
    
    const messageDoc: ContactMessageDocument = {
      name,
      email,
      phone,
      subject,
      message,
      date: now,
      status: 'new',
      created_at: now,
      updated_at: now
    }

    const result = await messagesCollection.insertOne(messageDoc)
    const insertedMessage = await messagesCollection.findOne({ _id: result.insertedId }) as ContactMessageDocument

    return NextResponse.json(contactMessageDocumentToApi(insertedMessage), { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    const messagesCollection = await getCollection('contact_messages')
    const { ObjectId } = await import('mongodb')

    const result = await messagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updated_at: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const updatedMessage = await messagesCollection.findOne({ _id: new ObjectId(id) }) as ContactMessageDocument
    return NextResponse.json(contactMessageDocumentToApi(updatedMessage))
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
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
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const messagesCollection = await getCollection('contact_messages')
    const { ObjectId } = await import('mongodb')

    const result = await messagesCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
