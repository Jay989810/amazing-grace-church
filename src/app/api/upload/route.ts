import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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
      const missingVars = []
      if (!process.env.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID')
      if (!process.env.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY')
      if (!process.env.AWS_S3_BUCKET) missingVars.push('AWS_S3_BUCKET')
      
      console.error('Missing AWS environment variables:', {
        missing: missingVars,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'not set'
      })
      
      return NextResponse.json({ 
        error: 'AWS configuration missing',
        message: `Missing required environment variables: ${missingVars.join(', ')}. Please add them to Vercel environment variables.`,
        missingVariables: missingVars
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
    const s3Client = getS3Client()
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // ACL removed - bucket policy should handle public access
      // If bucket has ACLs disabled (recommended), use bucket policy instead
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
    
    // Provide more detailed error information
    let errorMessage = 'Upload failed'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Check for specific AWS errors
      if (error.message.includes('AWS credentials')) {
        errorMessage = 'AWS credentials not configured'
      } else if (error.message.includes('AccessDenied')) {
        errorMessage = 'Access denied to S3 bucket. Check IAM permissions.'
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = 'S3 bucket not found. Check bucket name.'
      } else if (error.message.includes('InvalidAccessKeyId')) {
        errorMessage = 'Invalid AWS access key. Check credentials.'
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        errorMessage = 'Invalid AWS secret key. Check credentials.'
      } else if (error.message.includes('ACL') || error.message.includes('Access Control List')) {
        errorMessage = 'Bucket ACLs are disabled. Ensure bucket policy allows public read access.'
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: errorDetails,
      // Include helpful debugging info (but not sensitive data)
      debug: process.env.NODE_ENV === 'development' ? {
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        hasBucket: !!process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION,
        bucketName: process.env.AWS_S3_BUCKET,
      } : undefined
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
        const s3Client = getS3Client()
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
