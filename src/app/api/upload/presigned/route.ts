import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Route segment config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Initialize S3 client lazily
function getS3Client() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured')
  }
  
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      return NextResponse.json({ 
        error: 'AWS configuration missing',
        message: 'Missing required AWS environment variables'
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType, fileSize, type, metadata } = body

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields: fileName, fileType, fileSize' }, { status: 400 })
    }

    // Check file size (100MB limit for AWS S3)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (fileSize > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 100MB.' 
      }, { status: 413 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const key = `amazing-grace-church/${type || 'sermon'}/${filename}`

    // Create presigned URL for PUT operation
    const s3Client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: fileType,
    })

    // Generate presigned URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Generate public URL
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`

    // Save file metadata to database (will be updated after successful upload)
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName: fileName,
      filename,
      type: type || 'sermon',
      size: fileSize,
      mimeType: fileType,
      url: publicUrl,
      s3Key: key,
      metadata: metadata || {},
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString(),
      status: 'pending' // Will be updated to 'completed' after upload
    }

    const result = await filesCollection.insertOne(fileDoc)

    return NextResponse.json({
      success: true,
      presignedUrl,
      fileId: result.insertedId.toString(),
      publicUrl,
      s3Key: key,
      uploadInstructions: {
        method: 'PUT',
        url: presignedUrl,
        headers: {
          'Content-Type': fileType,
        },
      }
    })

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    
    let errorMessage = 'Failed to generate presigned URL'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      if (error.message.includes('AWS credentials')) {
        errorMessage = 'AWS credentials not configured'
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
    }, { status: 500 })
  }
}

// Endpoint to confirm upload completion and update database
export async function PUT(request: NextRequest) {
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

    // If this is a gallery image, also create an entry in gallery_images collection
    if (type === 'gallery') {
      try {
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
      } catch (galleryError) {
        // Log error but don't fail the upload confirmation
        console.error('Error creating gallery entry:', galleryError)
      }
    }

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
