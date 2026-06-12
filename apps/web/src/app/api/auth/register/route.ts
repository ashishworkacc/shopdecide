export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPrisma, ensureDb } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const start = Date.now()
  console.log(JSON.stringify({ level: 'info', msg: 'register start', route: '/api/auth/register' }))

  let body: { name?: string; email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, password } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    await ensureDb()
    const prisma = getPrisma()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { name, email, password: hashed } })
    console.log(JSON.stringify({ level: 'info', msg: 'register ok', ms: Date.now() - start }))
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ level: 'error', msg: 'register failed', error: message, ms: Date.now() - start }))
    return NextResponse.json({ error: 'Database error. Please try again in a moment.' }, { status: 500 })
  }
}
