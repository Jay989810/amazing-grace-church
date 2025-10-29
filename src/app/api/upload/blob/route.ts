import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put, del } from '@vercel/blob'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'sermon'
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {}

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // Validate file type based on category
    if (type === 'gallery' && !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed for gallery' }, { status: 400 })
    }

    if (type === 'sermon' && !file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Only audio or video files allowed for sermons' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const blobPath = `amazing-grace-church/${type}/${filename}`

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log('File uploaded to Vercel Blob:', blob.url)

    // Save to database
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName: file.name,
      filename: filename,
      type: type,
      size: file.size,
      mimeType: file.type,
      url: blob.url,
      blobPath: blob.pathname,
      metadata: metadata,
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
          title: metadata?.title || file.name,
          description: metadata?.description || '',
          image_url: blob.url,
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
      file: {
        id: result.insertedId.toString(),
        originalName: file.name,
        filename: filename,
        type: type,
        size: file.size,
        mimeType: file.type,
        url: blob.url,
        uploadedAt: fileDoc.uploadedAt,
        metadata: metadata
      }
    })

  } catch (error) {
    console.error('Vercel Blob upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    const filesCollection = await getCollection('uploaded_files')
    const file = await filesCollection.findOne({ _id: new ObjectId(fileId) })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      if (file.url) {
        // Delete by URL
        await del(file.url)
        console.log('Deleted file from Blob by URL:', file.url)
      } else if (file.blobPath) {
        // Delete by path
        await del(file.blobPath)
        console.log('Deleted file from Blob by path:', file.blobPath)
      }
    } catch (blobError) {
      console.error('Error deleting from Blob:', blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await filesCollection.deleteOne({ _id: new ObjectId(fileId) })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
