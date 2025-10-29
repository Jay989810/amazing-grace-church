import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    const mediaUrl = `https://amazing-grace-church.s3.eu-north-1.amazonaws.com/${path}`
    
    // Fetch the media file from S3
    const response = await fetch(mediaUrl)
    
    if (!response.ok) {
      return new NextResponse('Media not found', { status: 404 })
    }
    
    // Get the content type from S3 response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = response.headers.get('content-length')
    
    // Create response with proper headers for media playback
    const headers = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    })
    
    if (contentLength) {
      headers.set('Content-Length', contentLength)
    }
    
    // Handle range requests for video/audio seeking
    const range = request.headers.get('range')
    if (range) {
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/)
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1])
        const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(contentLength || '0') - 1
        
        headers.set('Content-Range', `bytes ${start}-${end}/${contentLength}`)
        headers.set('Content-Length', (end - start + 1).toString())
        
        return new NextResponse(response.body, {
          status: 206,
          headers
        })
      }
    }
    
    return new NextResponse(response.body, {
      status: 200,
      headers
    })
    
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
    const mediaUrl = `https://amazing-grace-church.s3.eu-north-1.amazonaws.com/${path}`
    
    const response = await fetch(mediaUrl, { method: 'HEAD' })
    
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
