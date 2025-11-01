# Giving System Setup Guide

This document provides instructions for setting up the new Giving system on the Amazing Grace Church website.

## 📋 Overview

The Giving system has been successfully integrated into the website with the following features:

- **Public Giving Page** (`/give`) - Allows members and visitors to make donations
- **Admin Dashboard** (`/admin/giving`) - View and track all giving transactions
- **Payment Integration** - Supports both Flutterwave and Paystack
- **Email Receipts** - Automatic email receipts sent via NodeMailer
- **MongoDB Storage** - All transactions stored in MongoDB

## 🚀 Setup Instructions

### 1. Install Dependencies

The Flutterwave SDK has been installed. If you need to reinstall:

```bash
npm install flutterwave-node-v3
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file (or Vercel environment variables):

```env
# Flutterwave
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST_your-flutterwave-public-key"
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST_your-flutterwave-secret-key"

# Paystack
PAYSTACK_PUBLIC_KEY="pk_test_your-paystack-public-key"
PAYSTACK_SECRET_KEY="sk_test_your-paystack-secret-key"

# Email Configuration (for receipts)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# NextAuth URL (for redirects)
NEXTAUTH_URL="http://localhost:3000"  # Change to your production URL
```

### 3. Get API Keys

#### Flutterwave:
1. Sign up at [https://flutterwave.com](https://flutterwave.com)
2. Go to Settings > API Keys
3. Copy your Public Key and Secret Key
4. Use test keys for development, production keys for live site

#### Paystack:
1. Sign up at [https://paystack.com](https://paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your Public Key and Secret Key
4. Use test keys for development, production keys for live site

### 4. Configure Webhooks

#### Flutterwave Webhook:
1. Go to Flutterwave Dashboard > Settings > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/giving/webhook`
3. Select events: `charge.completed`

#### Paystack Webhook:
1. Go to Paystack Dashboard > Settings > API Keys & Webhooks
2. Add webhook URL: `https://yourdomain.com/api/giving/webhook`
3. Select events: `charge.success`

### 5. Gmail SMTP Setup (for Email Receipts)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Generate an app password for "Mail"
5. Use this app password as `SMTP_PASS` (not your regular Gmail password)

## 📁 File Structure

All giving-related files are isolated under:
- `/src/app/give` - Public giving page
- `/src/app/admin/giving` - Admin dashboard
- `/src/app/api/giving` - API routes
  - `/transaction` - Initialize payment
  - `/webhook` - Handle payment webhooks
  - `/transactions` - Get all transactions (admin only)
- `/src/lib/email.ts` - Email receipt functionality
- `/src/lib/models.ts` - Database models (GivingTransactionDocument)

## 🎯 Features

### Public Giving Page (`/give`)
- Hero section with inspirational message
- Payment form with validation
- Support for multiple giving types:
  - Tithe
  - Offering
  - Building Fund
  - Missions
- Payment provider selection (Flutterwave or Paystack)
- Optional message/note field
- Secure payment processing
- Success confirmation

### Admin Dashboard (`/admin/giving`)
- View all transactions
- Filter by status (All, Successful, Pending, Failed)
- Statistics dashboard:
  - Total transactions
  - Successful count
  - Pending count
  - Total amount received
- Export transactions to CSV
- Transaction details:
  - Date and time
  - Donor name and email
  - Amount and currency
  - Giving type
  - Payment provider
  - Payment reference
  - Transaction status
  - Receipt sent status

### Email Receipts
- Automatically sent after successful payment
- Beautiful HTML email template
- Includes:
  - Transaction details
  - Payment reference
  - Amount and giving type
  - Date and time
  - Inspirational message

## 🔒 Security

- All payment processing handled by secure payment gateways
- API routes protected with authentication (admin only)
- Webhook verification (implement additional security if needed)
- No sensitive payment data stored in database
- Secure SMTP for email sending

## 🧪 Testing

### Test Payments

**Flutterwave Test Cards:**
- Card: `5531886652142950`
- CVV: `123`
- Expiry: Any future date
- PIN: `3310`
- OTP: `123456`

**Paystack Test Cards:**
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

## 📝 Database Schema

Transactions are stored in the `giving_transactions` collection with the following structure:

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  amount: number,
  currency: string,
  giving_type: 'Tithe' | 'Offering' | 'Building Fund' | 'Missions',
  message?: string,
  payment_provider: 'flutterwave' | 'paystack',
  payment_reference: string,
  transaction_id?: string,
  status: 'pending' | 'successful' | 'failed' | 'cancelled',
  receipt_sent: boolean,
  created_at: string,
  updated_at: string
}
```

## 🐛 Troubleshooting

### Payment Not Initializing
- Check API keys are correct
- Verify environment variables are set
- Check browser console for errors
- Ensure payment gateway accounts are active

### Email Receipts Not Sending
- Verify SMTP credentials
- Check Gmail app password is correct
- Ensure 2-Step Verification is enabled
- Check server logs for email errors

### Webhooks Not Working
- Verify webhook URLs are correct
- Check webhook events are configured
- Ensure webhook URL is publicly accessible
- Check server logs for webhook errors

## 📞 Support

For issues or questions:
1. Check the server logs
2. Verify all environment variables are set
3. Test with payment gateway test cards
4. Check MongoDB connection

## ✅ Next Steps

1. Add your payment gateway API keys
2. Configure webhooks
3. Set up Gmail SMTP
4. Test with test cards
5. Switch to production keys when ready
6. Update `NEXTAUTH_URL` to production URL

---

**Note:** All giving functionality is isolated and does not affect existing website features.

