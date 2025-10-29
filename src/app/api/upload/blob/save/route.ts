import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { originalName, filename, type, size, mimeType, url, blobPath, metadata } = body

    // Save to database
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName,
      filename,
      type,
      size,
      mimeType,
      url,
      blobPath,
      metadata: metadata || {},
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString(),
      status: 'completed'
    }
    
    const result = await filesCollection.insertOne(fileDoc)

    // If this is a gallery image, also create an entry in gallery_images collection
    if (type === 'gallery') {
      try {
        const galleryCollection = await getCollection('gallery_images')
        const galleryDoc = {
          title: metadata?.title || originalName,
          description: metadata?.description || '',
          image_url: url,
          album: metadata?.album || metadata?.category || 'Other',
          photographer: metadata?.photographer || '',
          date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        await galleryCollection.insertOne(galleryDoc)
      } catch (galleryError) {
        console.error('Error creating gallery entry:', galleryError)
      }
    }

    return NextResponse.json({ 
      success: true,
      fileId: result.insertedId.toString()
    })

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
