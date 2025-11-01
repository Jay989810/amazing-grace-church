import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCollection } from '@/lib/mongodb'
import { givingTransactionDocumentToApi } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const transactionsCollection = await getCollection('giving_transactions')
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = parseInt(searchParams.get('skip') || '0')

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }

    // Fetch transactions
    const transactions = await transactionsCollection
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    // Get total count
    const total = await transactionsCollection.countDocuments(query)

    // Convert to API format
    const transactionsApi = transactions.map((doc: any) => givingTransactionDocumentToApi(doc))

    return NextResponse.json({
      transactions: transactionsApi,
      total,
      limit,
      skip
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

