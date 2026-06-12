export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  const steps: string[] = []
  try {
    steps.push('1: got request')
    const prisma = getPrisma()
    steps.push('2: got prisma')
    const user = await prisma.user.findUnique({ where: { email } })
    steps.push(`3: user found = ${!!user}, has password = ${!!user?.password}`)
    if (!user?.password) return NextResponse.json({ steps, result: 'no user or no password' })
    const valid = await bcrypt.compare(password, user.password)
    steps.push(`4: bcrypt valid = ${valid}`)
    return NextResponse.json({ steps, result: valid ? 'LOGIN OK' : 'WRONG PASSWORD' })
  } catch (e) {
    return NextResponse.json({ steps, error: String(e) }, { status: 500 })
  }
}
