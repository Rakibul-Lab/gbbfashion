import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.trim().toLowerCase()
        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }

      // Always refresh user info from DB so role, name, email survive refresh / updates
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: String(token.id) },
            select: { role: true, name: true, email: true },
          })
          if (dbUser) {
            if (dbUser.role) token.role = dbUser.role
            if (dbUser.name) token.name = dbUser.name
            if (dbUser.email) token.email = dbUser.email
          }
        } catch {
          // keep existing token values
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || '')
        session.user.role = String(token.role || 'customer')
        if (token.name) session.user.name = String(token.name)
        if (token.email) session.user.email = String(token.email)
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'gbb-fashion-secret-key-2024',
}
