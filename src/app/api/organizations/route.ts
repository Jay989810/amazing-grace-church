import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { OrganizationDocument, organizationDocumentToApi } from '@/lib/models'

// GET - Fetch all organizations (public)
export async function GET() {
  try {
    const organizationsCollection = await getCollection('organizations')
    const organizations = await organizationsCollection
      .find({})
      .sort({ dateCreated: -1 })
      .toArray() as OrganizationDocument[]

    const apiOrganizations = organizations.map(organizationDocumentToApi)
    
    return NextResponse.json(apiOrganizations)
  } catch (error: any) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

// POST - Create new organization (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, leaderName, leaderRole, contactEmail, imageUrl } = body

    // Validate required fields
    if (!name || !description || !leaderName || !leaderRole) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, leaderName, leaderRole' },
        { status: 400 }
      )
    }

    const organizationsCollection = await getCollection('organizations')
    const now = new Date().toISOString()
    
    const organizationDoc: OrganizationDocument = {
      name,
      description,
      leaderName,
      leaderRole,
      contactEmail: contactEmail || '',
      imageUrl: imageUrl || '',
      dateCreated: now,
      created_at: now,
      updated_at: now
    }

    const result = await organizationsCollection.insertOne(organizationDoc)
    const insertedOrg = await organizationsCollection.findOne({ _id: result.insertedId }) as OrganizationDocument

    return NextResponse.json(organizationDocumentToApi(insertedOrg))
  } catch (error: any) {
    console.error('Error creating organization:', error)
    return NextResponse.json(
      { error: 'Failed to create organization', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update organization (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, name, description, leaderName, leaderRole, contactEmail, imageUrl } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const organizationsCollection = await getCollection('organizations')
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (name) updateData.name = name
    if (description) updateData.description = description
    if (leaderName) updateData.leaderName = leaderName
    if (leaderRole) updateData.leaderRole = leaderRole
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl

    const { ObjectId } = await import('mongodb')
    await organizationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    const updatedOrg = await organizationsCollection.findOne({ _id: new ObjectId(id) }) as OrganizationDocument

    if (!updatedOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(organizationDocumentToApi(updatedOrg))
  } catch (error: any) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Failed to update organization', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete organization (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    const organizationsCollection = await getCollection('organizations')
    const { ObjectId } = await import('mongodb')
    
    const result = await organizationsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Organization deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization', details: error.message },
      { status: 500 }
    )
  }
}

