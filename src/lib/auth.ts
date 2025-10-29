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
      if (token && session.user) {
        session.user.id = token.sub || token.id || ''
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin'
  }
}
