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

    // If this is a gallery image (not organization or settings), create an entry in gallery_images collection
    // Only gallery type images should appear in the public gallery
    if (type === 'gallery') {
      try {
        // Validate image format - only allow JPG and PNG
        const urlLower = url.toLowerCase()
        const mimeLower = mimeType.toLowerCase()
        const isValidFormat = 
          urlLower.endsWith('.jpg') || 
          urlLower.endsWith('.jpeg') || 
          urlLower.endsWith('.png') ||
          mimeLower === 'image/jpeg' || 
          mimeLower === 'image/jpg' || 
          mimeLower === 'image/png'
        
        if (!isValidFormat) {
          console.warn('Invalid image format uploaded:', { originalName, mimeType, url })
          // Still save to uploaded_files but mark as invalid
          // Don't add to gallery_images collection
        } else {
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
        }
      } catch (galleryError) {
        console.error('Error creating gallery entry:', galleryError)
      }
    }
    // Note: organization and settings type images are NOT added to gallery_images collection
    // This prevents them from appearing in the public gallery

    return NextResponse.json({ 
      success: true,
      fileId: result.insertedId.toString()
    })

  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
