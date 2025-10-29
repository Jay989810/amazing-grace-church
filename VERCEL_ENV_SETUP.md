# Vercel Environment Variables Setup

This guide explains how to configure environment variables for both local development and Vercel deployment.

## For Local Development

Create a `.env.local` file in the root directory with your variables:

```env
MONGODB_URI="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@amazinggracechurch.org"
ADMIN_PASSWORD="your-password"
```

**Note:** `.env.local` is gitignored and should NOT be committed to the repository.

## For Vercel Deployment

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

```
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
ADMIN_EMAIL
ADMIN_PASSWORD
```

### Option 2: Using Vercel CLI

```bash
vercel env add MONGODB_URI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
```

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (generate a random string) | `your-super-secret-key-here` |
| `NEXTAUTH_URL` | Your production URL | `https://your-app.vercel.app` |
| `ADMIN_EMAIL` | Admin user email | `admin@amazinggracechurch.org` |
| `ADMIN_PASSWORD` | Admin user password | `your-secure-password` |

## How It Works

- **Local Development**: The app loads variables from `.env.local` file
- **Vercel Production**: Vercel automatically injects environment variables set in the dashboard
- **Both**: The code checks for both `.env.local` (local) and `.env` files, but Vercel uses dashboard variables first

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use strong, unique secrets for production
- ✅ Rotate secrets regularly
- ✅ Use Vercel's environment variable encryption

## Troubleshooting

If authentication fails on Vercel:
1. Verify all environment variables are set in Vercel dashboard
2. Check that `NEXTAUTH_URL` matches your production domain
3. Ensure `MONGODB_URI` is correct and accessible from Vercel
4. Redeploy after adding/updating environment variables

