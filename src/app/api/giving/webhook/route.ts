import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { sendReceiptEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const transactionsCollection = await getCollection('giving_transactions')

    // Check if it's a Flutterwave webhook
    if (body.event === 'charge.completed' && body.data) {
      const { tx_ref, status, transaction_id } = body.data

      if (status === 'successful') {
        // Update transaction status
        await transactionsCollection.updateOne(
          { payment_reference: tx_ref },
          {
            $set: {
              status: 'successful',
              transaction_id: transaction_id?.toString() || '',
              updated_at: new Date().toISOString()
            }
          }
        )

        // Get transaction details and send receipt
        const transaction = await transactionsCollection.findOne({ payment_reference: tx_ref }) as any
        if (transaction && !transaction.receipt_sent) {
          await sendReceiptEmail(transaction as any)
          await transactionsCollection.updateOne(
            { payment_reference: tx_ref },
            { $set: { receipt_sent: true } }
          )
        }
      } else {
        await transactionsCollection.updateOne(
          { payment_reference: tx_ref },
          {
            $set: {
              status: 'failed',
              updated_at: new Date().toISOString()
            }
          }
        )
      }

      return NextResponse.json({ success: true })
    }

    // Check if it's a Paystack webhook
    if (body.event === 'charge.success' && body.data) {
      const { reference, id, status } = body.data

      if (status === 'success') {
        await transactionsCollection.updateOne(
          { payment_reference: reference },
          {
            $set: {
              status: 'successful',
              transaction_id: id?.toString() || '',
              updated_at: new Date().toISOString()
            }
          }
        )

        // Get transaction details and send receipt
        const transaction = await transactionsCollection.findOne({ payment_reference: reference }) as any
        if (transaction && !transaction.receipt_sent) {
          await sendReceiptEmail(transaction as any)
          await transactionsCollection.updateOne(
            { payment_reference: reference },
            { $set: { receipt_sent: true } }
          )
        }
      } else {
        await transactionsCollection.updateOne(
          { payment_reference: reference },
          {
            $set: {
              status: 'failed',
              updated_at: new Date().toISOString()
            }
          }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true, message: 'Webhook received but no action taken' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

