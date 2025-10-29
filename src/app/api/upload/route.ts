import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Route segment config for larger body size
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Check if this is a confirmation request (has fileId)
    if (body.fileId) {
      // Handle upload confirmation
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
    }

    // If no fileId, this is a presigned URL request - redirect to presigned route
    return NextResponse.json({ 
      error: 'Use /api/upload/presigned for presigned URL generation',
      message: 'This endpoint handles upload confirmation only. Use /api/upload/presigned for getting presigned URLs.'
    }, { status: 400 })

  } catch (error) {
    console.error('Upload confirmation error:', error)
    return NextResponse.json({ error: 'Failed to confirm upload' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    const filesCollection = await getCollection('uploaded_files')
    let query = {}
    
    if (type) {
      query = { type }
    }
    
    const files = await filesCollection.find(query).sort({ uploadedAt: -1 }).toArray()
    
    return NextResponse.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

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
    const { ObjectId } = await import('mongodb')
    
    const file = await filesCollection.findOne({ _id: new ObjectId(fileId) })
    
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete file from AWS S3
    if (file.s3Key) {
      try {
        const s3Client = getS3Client()
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: file.s3Key,
        })
        await s3Client.send(deleteCommand)
        console.log('Successfully deleted file from S3:', file.s3Key)
      } catch (s3Error) {
        console.error('Failed to delete file from S3:', {
          error: s3Error,
          s3Key: file.s3Key,
          bucket: process.env.AWS_S3_BUCKET
        })
        // Don't throw error - we still want to delete from database
      }
    }

    // Delete from database
    await filesCollection.deleteOne({ _id: new ObjectId(fileId) })

    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
