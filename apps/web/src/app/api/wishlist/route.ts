export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPrisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { wishlistItems: { orderBy: { createdAt: 'desc' } } },
  })
  return NextResponse.json({ items: user?.wishlistItems ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { productId, productData } = await req.json()
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId, productData: JSON.stringify(productData) },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { productId } = await req.json()
  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } })
  return NextResponse.json({ ok: true })
}
