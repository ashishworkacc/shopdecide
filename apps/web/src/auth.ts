import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getPrisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string
        const password = credentials?.password as string
        if (!email || !password) return null
        try {
          const prisma = getPrisma()
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user?.password) {
            console.error(JSON.stringify({ msg: 'auth: no user or no password', email }))
            return null
          }
          const valid = await bcrypt.compare(password, user.password)
          if (!valid) {
            console.error(JSON.stringify({ msg: 'auth: wrong password', email }))
            return null
          }
          return { id: user.id, name: user.name, email: user.email, image: user.image }
        } catch (err) {
          console.error(JSON.stringify({ msg: 'auth: authorize threw', error: String(err) }))
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
