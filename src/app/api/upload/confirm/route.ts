import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

// Route segment config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileId, type, metadata } = body

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 })
    }

    const filesCollection = await getCollection('uploaded_files')
    const { ObjectId } = await import('mongodb')

    // Validate ObjectId format
    let objectId: any
    try {
      objectId = new ObjectId(fileId)
    } catch (error) {
      console.error('Invalid fileId format:', fileId)
      return NextResponse.json({ error: 'Invalid file ID format' }, { status: 400 })
    }

    // First, find the file to ensure it exists
    const existingFile = await filesCollection.findOne({ _id: objectId })
    if (!existingFile) {
      console.error('File not found in database:', fileId)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Update file status to completed
    const updateResult = await filesCollection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          status: 'completed',
          updatedAt: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' }
    )

    // Check if update was successful and document was found
    if (!updateResult || !updateResult.value) {
      console.error('Failed to update file or file not found after update:', fileId)
      return NextResponse.json({ error: 'Failed to confirm upload - file not found' }, { status: 404 })
    }

    const updatedFile = updateResult.value

    // Ensure all required fields are present and properly formatted
    const fileResponse = {
      id: updatedFile._id.toString(),
      originalName: updatedFile.originalName || existingFile.originalName || 'unknown',
      filename: updatedFile.filename || existingFile.filename || 'unknown',
      type: updatedFile.type || existingFile.type || type || 'sermon',
      size: updatedFile.size || existingFile.size || 0,
      mimeType: updatedFile.mimeType || existingFile.mimeType || 'application/octet-stream',
      url: updatedFile.url || existingFile.url || '',
      uploadedAt: updatedFile.uploadedAt || existingFile.uploadedAt || new Date().toISOString(),
      metadata: updatedFile.metadata || existingFile.metadata || {}
    }

    // Validate required fields
    if (!fileResponse.mimeType || !fileResponse.url) {
      console.error('Missing required fields in file response:', fileResponse)
      return NextResponse.json({ 
        error: 'Invalid file data - missing required fields',
        details: 'File record is incomplete'
      }, { status: 500 })
    }

    // If this is a gallery image (not organization or settings), create an entry in gallery_images collection
    // Only gallery type images should appear in the public gallery
    if (type === 'gallery') {
      try {
        // Validate image format - only allow JPG and PNG
        const urlLower = fileResponse.url.toLowerCase()
        const mimeLower = fileResponse.mimeType.toLowerCase()
        const isValidFormat = 
          urlLower.endsWith('.jpg') || 
          urlLower.endsWith('.jpeg') || 
          urlLower.endsWith('.png') ||
          mimeLower === 'image/jpeg' || 
          mimeLower === 'image/jpg' || 
          mimeLower === 'image/png'
        
        if (!isValidFormat) {
          console.warn('Invalid image format uploaded:', { originalName: fileResponse.originalName, mimeType: fileResponse.mimeType, url: fileResponse.url })
          // Still save to uploaded_files but mark as invalid
          // Don't add to gallery_images collection
        } else {
          const galleryCollection = await getCollection('gallery_images')
          const galleryDoc = {
            title: metadata?.title || fileResponse.originalName,
            description: metadata?.description || '',
            image_url: fileResponse.url,
            album: metadata?.album || metadata?.category || 'Other',
            photographer: metadata?.photographer || '',
            date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          await galleryCollection.insertOne(galleryDoc)
        }
      } catch (galleryError) {
        // Log error but don't fail the upload confirmation
        console.error('Error creating gallery entry:', galleryError)
      }
    }
    // Note: organization and settings type images are NOT added to gallery_images collection
    // This prevents them from appearing in the public gallery

    console.log('Upload confirmed successfully:', {
      fileId: fileResponse.id,
      fileName: fileResponse.originalName,
      mimeType: fileResponse.mimeType,
      url: fileResponse.url
    })

    return NextResponse.json({
      success: true,
      message: 'Upload confirmed',
      file: fileResponse
    })

  } catch (error) {
    console.error('Error confirming upload:', error)
    return NextResponse.json({ error: 'Failed to confirm upload' }, { status: 500 })
  }
}
