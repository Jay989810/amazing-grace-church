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
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.role = token.role as string
      }
      return session
    }
  }
}
