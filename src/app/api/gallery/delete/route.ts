import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const galleryCollection = await getCollection('gallery_images')
    const filesCollection = await getCollection('uploaded_files')
    const { ObjectId } = await import('mongodb')

    // Find the gallery image
    const galleryImage = await galleryCollection.findOne({ _id: new ObjectId(imageId) })
    
    if (!galleryImage) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 })
    }

    // Find the corresponding file record
    const fileRecord = await filesCollection.findOne({ url: galleryImage.image_url })
    
    if (fileRecord && fileRecord.s3Key) {
      try {
        // Delete from S3
        const s3Client = getS3Client()
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: fileRecord.s3Key,
        })
        await s3Client.send(deleteCommand)
        console.log('Successfully deleted gallery image from S3:', fileRecord.s3Key)
      } catch (s3Error) {
        console.error('Failed to delete gallery image from S3:', {
          error: s3Error,
          s3Key: fileRecord.s3Key,
          bucket: process.env.AWS_S3_BUCKET
        })
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from both collections
    await Promise.all([
      galleryCollection.deleteOne({ _id: new ObjectId(imageId) }),
      fileRecord ? filesCollection.deleteOne({ _id: fileRecord._id }) : Promise.resolve()
    ])

    return NextResponse.json({ 
      success: true, 
      message: 'Gallery image deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ 
      error: 'Failed to delete gallery image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
