import nodemailer from 'nodemailer'
import { GivingTransactionDocument } from './models'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

export async function sendReceiptEmail(transaction: GivingTransactionDocument) {
  try {
    const transporter = createTransporter()

    const churchName = process.env.NEXT_PUBLIC_CHURCH_NAME || 'Amazing Grace Baptist Church'
    const churchEmail = process.env.NEXT_PUBLIC_CHURCH_EMAIL || process.env.SMTP_USER || 'info@amazinggracechurch.org'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Giving Receipt - ${churchName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">${churchName}</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Giving Receipt</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${transaction.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your generous ${transaction.giving_type.toLowerCase()} to ${churchName}. 
              We are grateful for your support and partnership in advancing the work of God.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea;">Transaction Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Payment Reference:</td>
                  <td style="padding: 8px 0;">${transaction.payment_reference}</td>
                </tr>
                ${transaction.transaction_id ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Transaction ID:</td>
                  <td style="padding: 8px 0;">${transaction.transaction_id}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                  <td style="padding: 8px 0;">${transaction.currency} ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Giving Type:</td>
                  <td style="padding: 8px 0;">${transaction.giving_type}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0;">${new Date(transaction.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0; color: #22c55e; font-weight: bold;">✓ Successful</td>
                </tr>
              </table>
            </div>
            
            ${transaction.message ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0;"><strong>Your Message:</strong></p>
              <p style="margin: 10px 0 0 0;">${transaction.message}</p>
            </div>
            ` : ''}
            
            <p style="font-size: 16px; margin-top: 30px;">
              May the Lord bless you abundantly for your cheerful giving. As it is written in 2 Corinthians 9:7, 
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, 
              for God loves a cheerful giver."
            </p>
            
            <p style="font-size: 16px; margin-top: 20px;">
              With gratitude,<br>
              <strong>${churchName}</strong>
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">This is an automated receipt. Please keep this for your records.</p>
              <p style="margin: 5px 0;">If you have any questions, please contact us at ${churchEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: `"${churchName}" <${churchEmail}>`,
      to: transaction.email,
      subject: `Giving Receipt - ${transaction.payment_reference}`,
      html: emailHtml
    }

    await transporter.sendMail(mailOptions)
    console.log('Receipt email sent to:', transaction.email)
    return true
  } catch (error) {
    console.error('Error sending receipt email:', error)
    throw error
  }
}

