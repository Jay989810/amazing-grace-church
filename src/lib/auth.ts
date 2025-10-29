import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCollection } from './mongodb'
import { UserDocument } from './models'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const usersCollection = await getCollection('users')
          const user = await usersCollection.findOne({ 
            email: credentials.email 
          }) as UserDocument | null

          if (!user) {
            // For development: create a temporary admin user if none exists
            if (credentials.email === 'admin@amazinggracechurch.org' && credentials.password === 'grace1234') {
              console.warn('⚠️ Using temporary admin credentials. Please run "npm run create-admin" to set up proper database user.')
              return {
                id: 'temp-admin',
                email: credentials.email,
                name: 'Administrator',
                role: 'admin'
              }
            }
            return null
          }

          // Secure password check using bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          
          if (isValidPassword) {
            return {
              id: user._id?.toString() || '',
              email: user.email,
              name: user.name,
              role: user.role
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          
          // For development: fallback to temporary admin if database is not available
          if (credentials.email === 'admin@amazinggracechurch.org' && credentials.password === 'grace1234') {
            console.warn('⚠️ Database not available. Using temporary admin credentials.')
            console.warn('⚠️ Please set up MongoDB and run "npm run create-admin" for production.')
            return {
              id: 'temp-admin',
              email: credentials.email,
              name: 'Administrator',
              role: 'admin'
            }
          }
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        if (!session.user) {
          session.user = {
            id: '',
            email: '',
            name: '',
            role: ''
          }
        }
        const tokenId = typeof token.sub === 'string' ? token.sub : 
                        typeof token.id === 'string' ? token.id : ''
        session.user.id = tokenId
        if (token.role) {
          session.user.role = typeof token.role === 'string' ? token.role : ''
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Prevent infinite redirect loops
      // If redirecting to admin, ensure it's not nested
      if (url.includes('callbackUrl')) {
        // Extract the actual callback URL and prevent nesting
        try {
          const urlObj = new URL(url, baseUrl)
          const callbackUrl = urlObj.searchParams.get('callbackUrl')
          if (callbackUrl && callbackUrl.includes('callbackUrl')) {
            // Prevent nested callbackUrls - just redirect to admin
            return `${baseUrl}/admin`
          }
        } catch (e) {
          // If URL parsing fails, just go to admin
          return `${baseUrl}/admin`
        }
      }
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // If url is on same origin, allow it
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Default to admin page
      return `${baseUrl}/admin`
    }
  },
  pages: {
    signIn: '/admin'
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
