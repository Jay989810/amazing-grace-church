import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'

export async function GET() {
  try {
    const settingsCollection = await getCollection('settings')
    const settings = await settingsCollection.findOne({ type: 'website' })
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        churchName: "Amazing Grace Baptist Church",
        churchAddress: "U/Zawu, Gonin Gora, Kaduna State, Nigeria",
        churchPhone: "+234 XXX XXX XXXX",
        churchEmail: "info@amazinggracechurch.org",
        pastorName: "Pastor John Doe",
        churchDescription: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth.",
        heroImage: "/church-logo.png",
        aboutImage: "/church-logo.png",
        services: {
          sunday: "10:00 AM - 12:00 PM",
          wednesday: "6:00 PM - 7:30 PM",
          friday: "7:00 PM - 8:30 PM"
        },
        socialMedia: {
          facebook: "",
          instagram: "",
          youtube: "",
          twitter: ""
        },
        contactInfo: {
          address: "U/Zawu, Gonin Gora, Kaduna State, Nigeria",
          phone: "+234 XXX XXX XXXX",
          email: "info@amazinggracechurch.org",
          hours: "Monday - Friday: 9:00 AM - 5:00 PM"
        },
        seo: {
          title: "Amazing Grace Baptist Church - U/Zawu, Gonin Gora, Kaduna State",
          description: "Welcome to Amazing Grace Baptist Church. Join us for worship, fellowship, and spiritual growth.",
          keywords: "church, baptist, kaduna, nigeria, worship, fellowship, sermons, amazing grace"
        }
      }
      return NextResponse.json(defaultSettings)
    }
    
    return NextResponse.json(settings.data)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const settingsCollection = await getCollection('settings')
    
    // Update or create settings
    const result = await settingsCollection.updateOne(
      { type: 'website' },
      { 
        $set: { 
          type: 'website',
          data: body,
          updatedAt: new Date().toISOString(),
          updatedBy: session.user.email
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      updated: result.modifiedCount > 0,
      created: result.upsertedCount > 0
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { section, data } = body
    
    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 })
    }

    const settingsCollection = await getCollection('settings')
    
    // Update specific section
    const result = await settingsCollection.updateOne(
      { type: 'website' },
      { 
        $set: { 
          [`data.${section}`]: data,
          updatedAt: new Date().toISOString(),
          updatedBy: session.user.email
        }
      },
      { upsert: true }
    )

    return NextResponse.json({ 
      success: true, 
      message: `${section} updated successfully`,
      updated: result.modifiedCount > 0
    })
  } catch (error) {
    console.error('Error updating settings section:', error)
    return NextResponse.json({ error: 'Failed to update settings section' }, { status: 500 })
  }
}