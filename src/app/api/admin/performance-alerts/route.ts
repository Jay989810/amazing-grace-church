import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

interface PerformanceAlert {
  type: 'slow_load' | 'large_file' | 'failed_load' | 'corrupted_file'
  resourceUrl: string
  resourceType: 'image' | 'video' | 'audio' | 'document'
  message: string
  loadTime?: number
  fileSize?: number
  timestamp: string
}

// POST - Store performance alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow anonymous alerts (from client-side monitoring)
    // but require admin for manual alerts
    
    const body: PerformanceAlert = await request.json()
    
    const alertsCollection = await getCollection('performance_alerts')
    const now = new Date().toISOString()
    
    const alertDoc = {
      ...body,
      created_at: now,
      updated_at: now,
      resolved: false,
      resolved_at: null,
      resolved_by: null
    }

    await alertsCollection.insertOne(alertDoc)
    
    // Limit alerts collection to last 1000 entries
    const count = await alertsCollection.countDocuments()
    if (count > 1000) {
      const oldestAlerts = await alertsCollection
        .find({})
        .sort({ created_at: 1 })
        .limit(count - 1000)
        .toArray()
      
      const idsToDelete = oldestAlerts.map(alert => alert._id)
      if (idsToDelete.length > 0) {
        await alertsCollection.deleteMany({ _id: { $in: idsToDelete } })
      }
    }

    return NextResponse.json({ success: true, message: 'Alert stored successfully' })
  } catch (error: any) {
    console.error('Error storing performance alert:', error)
    return NextResponse.json(
      { error: 'Failed to store alert', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Fetch performance alerts (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const alertsCollection = await getCollection('performance_alerts')
    
    const query: any = {}
    if (resolved === 'false') {
      query.resolved = false
    } else if (resolved === 'true') {
      query.resolved = true
    }
    
    const alerts = await alertsCollection
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ alerts })
  } catch (error: any) {
    console.error('Error fetching performance alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Mark alert as resolved (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, resolved } = body

    if (!id || typeof resolved !== 'boolean') {
      return NextResponse.json(
        { error: 'Alert ID and resolved status are required' },
        { status: 400 }
      )
    }

    const alertsCollection = await getCollection('performance_alerts')
    const { ObjectId } = await import('mongodb')
    
    const updateData: any = {
      resolved,
      updated_at: new Date().toISOString()
    }

    if (resolved) {
      updateData.resolved_at = new Date().toISOString()
      updateData.resolved_by = session.user.email
    } else {
      updateData.resolved_at = null
      updateData.resolved_by = null
    }

    await alertsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    return NextResponse.json({ success: true, message: 'Alert updated successfully' })
  } catch (error: any) {
    console.error('Error updating performance alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert', details: error.message },
      { status: 500 }
    )
  }
}

