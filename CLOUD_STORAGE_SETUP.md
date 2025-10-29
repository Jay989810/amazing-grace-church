# Cloud Storage Setup Guide

## Option 1: Vercel Blob Storage (Recommended)

### 1. Install Vercel Blob
```bash
npm install @vercel/blob
```

### 2. Add Environment Variables
Add to `.env.local` and Vercel environment variables:
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 3. Update Upload API
Replace the current upload logic with Vercel Blob:

```typescript
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`${type}/${file.name}`, file, {
      access: 'public',
    })

    // Save metadata to database
    const filesCollection = await getCollection('uploaded_files')
    const fileDoc = {
      originalName: file.name,
      filename: file.name,
      type,
      size: file.size,
      mimeType: file.type,
      url: blob.url, // Vercel Blob URL
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
```

## Option 2: AWS S3

### 1. Install AWS SDK
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Add Environment Variables
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 3. Update Upload API
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // ... auth checks ...

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const key = `${type}/${Date.now()}-${file.name}`
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)
    
    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    // Save to database...
    const fileDoc = {
      originalName: file.name,
      filename: key,
      type,
      size: file.size,
      mimeType: file.type,
      url,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString()
    }

    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
}
```

## Option 3: Cloudinary

### 1. Install Cloudinary
```bash
npm install cloudinary
```

### 2. Add Environment Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Update Upload API
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // ... auth checks ...

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `amazing-grace-church/${type}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const fileDoc = {
      originalName: file.name,
      filename: result.public_id,
      type,
      size: file.size,
      mimeType: file.type,
      url: result.secure_url,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString()
    }

    // ... save to database
  } catch (error) {
    // ... error handling
  }
}
```

## Recommendation

**Start with Vercel Blob Storage** because:
1. Easiest to set up
2. Native Vercel integration
3. Good pricing for small to medium apps
4. No additional AWS account needed

**Upgrade to AWS S3** if you need:
- More advanced features
- Better pricing for large volumes
- Integration with other AWS services

Would you like me to implement Vercel Blob Storage for you?
