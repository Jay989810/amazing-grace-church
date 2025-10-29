import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      console.error('Missing AWS environment variables:', {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION
      })
      return NextResponse.json({ 
        error: 'AWS configuration missing. Please check environment variables.' 
      }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'sermon', 'gallery', 'settings'
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {}

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (100MB limit for AWS S3)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 100MB.' 
      }, { status: 413 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const key = `amazing-grace-church/${type}/${filename}`
    
    console.log('Uploading file:', {
      originalName: file.name,
      filename,
      type,
      size: file.size,
      mimeType: file.type,
      key,
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION
    })
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Upload to AWS S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make file publicly accessible
    })

    await s3Client.send(command)
    
    // Generate public URL
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
    
    console.log('File uploaded successfully:', publicUrl)

    // Save file metadata to database
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName: file.name,
      filename,
      type,
      size: file.size,
      mimeType: file.type,
      url: publicUrl, // AWS S3 URL
      s3Key: key, // Store S3 key for deletion
      metadata,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString()
    }

    const result = await filesCollection.insertOne(fileDoc)

    return NextResponse.json({
      success: true,
      file: {
        id: result.insertedId.toString(),
        ...fileDoc
      }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: file.s3Key,
        })
        await s3Client.send(deleteCommand)
      } catch (s3Error) {
        console.warn('Could not delete file from S3:', s3Error)
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
