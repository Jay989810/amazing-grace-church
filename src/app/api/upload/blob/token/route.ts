import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get upload token from environment
    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 })
    }

    return NextResponse.json({ token })

  } catch (error) {
    console.error('Token error:', error)
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 })
  }
}
