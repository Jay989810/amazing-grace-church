import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from './supabase'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

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

        // Check against default admin credentials
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@amazinggracechurch.org'
        const adminPassword = process.env.ADMIN_PASSWORD || 'grace1234'
        
        if (credentials.email === adminEmail && 
            credentials.password === adminPassword) {
          return {
            id: 'admin',
            email: credentials.email,
            name: 'Admin User',
            role: 'admin'
          }
        }

        // Check against database users (only if Supabase is configured)
        try {
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .eq('role', 'admin')
            .single()

          if (error || !user) {
            return null
          }

          // In a real app, you'd hash the password and compare
          // For now, we'll use a simple check
          if (user.password === credentials.password) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }
        } catch (error) {
          // Supabase not configured, skip database check
          console.log('Supabase not configured, using default admin only')
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
}
