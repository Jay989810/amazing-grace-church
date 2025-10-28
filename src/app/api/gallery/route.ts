import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { GalleryImageDocument, galleryImageDocumentToApi } from '@/lib/models'

export async function GET() {
  try {
    const galleryCollection = await getCollection('gallery_images')
    const images = await galleryCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray() as GalleryImageDocument[]

    const apiImages = images.map(galleryImageDocumentToApi)
    return NextResponse.json(apiImages)
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, imageUrl, album, photographer } = body

    const galleryCollection = await getCollection('gallery_images')
    const now = new Date().toISOString()
    
    const imageDoc: GalleryImageDocument = {
      title,
      description,
      image_url: imageUrl,
      album,
      photographer,
      date: now,
      created_at: now,
      updated_at: now
    }

    const result = await galleryCollection.insertOne(imageDoc)
    const insertedImage = await galleryCollection.findOne({ _id: result.insertedId }) as GalleryImageDocument

    return NextResponse.json(galleryImageDocumentToApi(insertedImage), { status: 201 })
  } catch (error) {
    console.error('Error creating gallery image:', error)
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
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

    const galleryCollection = await getCollection('gallery_images')
    const { ObjectId } = await import('mongodb')
    
    const updateDoc = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    const result = await galleryCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }

    const updatedImage = await galleryCollection.findOne({ _id: new ObjectId(id) }) as GalleryImageDocument
    return NextResponse.json(galleryImageDocumentToApi(updatedImage))
  } catch (error) {
    console.error('Error updating gallery image:', error)
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 })
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
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const galleryCollection = await getCollection('gallery_images')
    const { ObjectId } = await import('mongodb')

    const result = await galleryCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Gallery image deleted successfully' })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}
