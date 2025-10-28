# Environment Setup Guide

## Create .env.local File

Create a file named `.env.local` in the `amazing-grace-church` directory with the following content:

```env
# Supabase Configuration (Optional - for full functionality)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials (Optional - defaults are already set)
ADMIN_EMAIL=admin@amazinggracechurch.org
ADMIN_PASSWORD=grace1234
```

## Quick Setup (Minimal)

For basic functionality without Supabase, create `.env.local` with just:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Default Admin Login

The admin dashboard will work with these default credentials:
- **Email**: `admin@amazinggracechurch.org`
- **Password**: `grace1234`

## Steps to Create .env.local

1. Open your file explorer
2. Navigate to `C:\Users\DELL\Desktop\AMAZING GRACE\amazing-grace-church`
3. Create a new file named `.env.local`
4. Copy the content from above
5. Save the file
6. Restart the development server

## Generate NextAuth Secret

You can generate a secure secret by running:
```bash
openssl rand -base64 32
```

Or use any random string like: `my-super-secret-nextauth-key-2024`

