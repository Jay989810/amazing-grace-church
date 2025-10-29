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
    // IMPORTANT: This endpoint should NOT be used for file uploads anymore
    // All file uploads should use /api/upload/presigned for direct S3 uploads
    // This prevents Vercel's 4.5MB body size limit
    
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

    // DEPRECATED: Direct file uploads are no longer supported
    // This endpoint is kept for backward compatibility but will reject all uploads
    // All uploads must use /api/upload/presigned for direct S3 uploads
    return NextResponse.json({ 
      error: 'Direct file uploads are deprecated',
      message: 'This endpoint no longer accepts direct file uploads. Please use the presigned URL endpoint for all file uploads.',
      solution: 'Use POST /api/upload/presigned to get a presigned URL for direct S3 upload',
      reason: 'Vercel has a 4.5MB body size limit. All files must upload directly to S3 using presigned URLs.'
    }, { status: 410 }) // 410 Gone - indicates the resource is no longer available

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
