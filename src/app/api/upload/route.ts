import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  const sermonsDir = join(uploadDir, 'sermons')
  const galleryDir = join(uploadDir, 'gallery')
  
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
  if (!existsSync(sermonsDir)) await mkdir(sermonsDir, { recursive: true })
  if (!existsSync(galleryDir)) await mkdir(galleryDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureUploadDirs()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'sermon', 'gallery', 'settings'
    const metadata = formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : {}

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    
    let uploadPath = ''
    let publicUrl = ''
    
    if (type === 'sermon') {
      uploadPath = join(process.cwd(), 'public', 'uploads', 'sermons', filename)
      publicUrl = `/uploads/sermons/${filename}`
    } else if (type === 'gallery') {
      uploadPath = join(process.cwd(), 'public', 'uploads', 'gallery', filename)
      publicUrl = `/uploads/gallery/${filename}`
    } else if (type === 'settings') {
      uploadPath = join(process.cwd(), 'public', 'uploads', 'settings', filename)
      publicUrl = `/uploads/settings/${filename}`
    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    await writeFile(uploadPath, buffer)

    // Save file metadata to database
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName: file.name,
      filename,
      type,
      size: file.size,
      mimeType: file.type,
      url: publicUrl,
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
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
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

    // Delete file from filesystem
    const filePath = join(process.cwd(), 'public', file.url)
    try {
      await import('fs').then(fs => fs.promises.unlink(filePath))
    } catch (fsError) {
      console.warn('Could not delete file from filesystem:', fsError)
    }

    // Delete from database
    await filesCollection.deleteOne({ _id: new ObjectId(fileId) })

    return NextResponse.json({ success: true, message: 'File deleted successfully' })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
