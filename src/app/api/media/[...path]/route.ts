import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
function getS3Client() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials not configured')
  }
  
  return new S3Client({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    
    // Generate presigned URL from S3
    const s3Client = getS3Client()
    const bucket = process.env.AWS_S3_BUCKET || 'amazing-grace-church'
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    })
    
    // Generate presigned URL valid for 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    // Redirect to presigned URL
    return NextResponse.redirect(presignedUrl)
    
  } catch (error) {
    console.error('Media proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    
    const s3Client = getS3Client()
    const bucket = process.env.AWS_S3_BUCKET || 'amazing-grace-church'
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    })
    
    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    const response = await fetch(presignedUrl, { method: 'HEAD' })
    
    if (!response.ok) {
      return new NextResponse('Media not found', { status: 404 })
    }
    
    const headers = new Headers({
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Content-Length': response.headers.get('content-length') || '0',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
    })
    
    return new NextResponse(null, { status: 200, headers })
    
  } catch (error) {
    console.error('Media HEAD error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    }
  })
}
