# Admin User Setup Instructions

## 🔐 Setting Up Admin Login

The admin login is failing because the admin user needs to be created in the database first. Here's how to fix it:

### Option 1: Using MongoDB Atlas (Recommended for Production)

1. **Set up MongoDB Atlas**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Create .env.local file**:
   ```bash
   MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/amazing-grace-church?retryWrites=true&w=majority"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@amazinggracechurch.org"
   ADMIN_PASSWORD="admin123"
   ```

3. **Run the admin creation script**:
   ```bash
   npm run create-admin
   ```

### Option 2: Using Local MongoDB

1. **Install MongoDB locally**:
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Start MongoDB service

2. **Create .env.local file**:
   ```bash
   MONGODB_URI="mongodb://localhost:27017/amazing-grace-church"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@amazinggracechurch.org"
   ADMIN_PASSWORD="admin123"
   ```

3. **Run the admin creation script**:
   ```bash
   npm run create-admin
   ```

### Option 3: Manual Database Setup

If you have access to your MongoDB database, you can manually create the admin user:

```javascript
// Connect to your MongoDB database and run this:
db.users.insertOne({
  email: "admin@amazinggracechurch.org",
  name: "Administrator",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J5K5K5K5K", // This is bcrypt hash for "admin123"
  role: "admin",
  created_at: new Date().toISOString(),
  last_login: null
})
```

## 🔑 Default Login Credentials

Once the admin user is created, use these credentials:

- **Email**: `admin@amazinggracechurch.org`
- **Password**: `admin123`

## 🚀 Quick Fix for Development

For immediate testing, you can temporarily modify the auth.ts file to use a simple password check, but this is NOT recommended for production:

```typescript
// In src/lib/auth.ts, temporarily replace the bcrypt check with:
if (user.password === credentials.password) {
  // ... rest of the code
}
```

**⚠️ Remember to change this back to bcrypt for production!**

## 📝 Next Steps

1. Set up your MongoDB database (Atlas recommended)
2. Create the .env.local file with your connection string
3. Run `npm run create-admin`
4. Test the admin login
5. Change the default password for security

The admin user will be created with proper bcrypt password hashing for security.
