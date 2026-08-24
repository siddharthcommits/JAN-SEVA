import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from './prisma'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.anonymousName, email: user.email }
      }
    })
  ],
  pages: {
    signIn: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' }
}

export default authOptions
