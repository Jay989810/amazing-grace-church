import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { GivingTransactionDocument } from '@/lib/models'
import Flutterwave from 'flutterwave-node-v3'

// Initialize payment providers
const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  process.env.FLUTTERWAVE_SECRET_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, amount, givingType, message, paymentProvider, currency = 'NGN' } = body

    // Validate required fields
    if (!name || !email || !amount || !givingType || !paymentProvider) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Generate unique reference
    const paymentReference = `GIVING-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

    // Create transaction record
    const transactionsCollection = await getCollection('giving_transactions')
    const now = new Date().toISOString()
    
    const transactionDoc: GivingTransactionDocument = {
      name,
      email,
      amount: amountNum,
      currency,
      giving_type: givingType,
      message: message || '',
      payment_provider: paymentProvider,
      payment_reference: paymentReference,
      status: 'pending',
      receipt_sent: false,
      created_at: now,
      updated_at: now
    }

    const result = await transactionsCollection.insertOne(transactionDoc)
    const transactionId = result.insertedId.toString()

    // Initialize payment based on provider
    let paymentData: any = {}

    if (paymentProvider === 'flutterwave') {
      try {
        const flwResponse = await flw.PaymentLink.create({
          tx_ref: paymentReference,
          amount: amountNum,
          currency,
          redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/give?status=success&ref=${paymentReference}`,
          payment_options: 'card,ussd,banktransfer',
          customer: {
            email,
            name
          },
          customizations: {
            title: `Giving - ${givingType}`,
            description: `Thank you for your ${givingType.toLowerCase()}`
          }
        })

        paymentData = {
          paymentLink: flwResponse.data.link,
          paymentReference: flwResponse.data.tx_ref
        }
      } catch (error: any) {
        console.error('Flutterwave error:', error)
        return NextResponse.json(
          { error: 'Failed to initialize Flutterwave payment', details: error.message },
          { status: 500 }
        )
      }
    } else if (paymentProvider === 'paystack') {
      try {
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || ''
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            amount: amountNum * 100, // Paystack uses kobo (smallest currency unit)
            reference: paymentReference,
            currency,
            metadata: {
              name,
              givingType,
              message: message || ''
            },
            callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/give?status=success&ref=${paymentReference}`
          })
        })

        const paystackData = await paystackResponse.json()

        if (!paystackData.status) {
          throw new Error(paystackData.message || 'Failed to initialize Paystack payment')
        }

        paymentData = {
          authorizationUrl: paystackData.data.authorization_url,
          accessCode: paystackData.data.access_code,
          paymentReference: paystackData.data.reference
        }
      } catch (error: any) {
        console.error('Paystack error:', error)
        return NextResponse.json(
          { error: 'Failed to initialize Paystack payment', details: error.message },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid payment provider' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId,
      paymentReference,
      paymentData
    })
  } catch (error: any) {
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

