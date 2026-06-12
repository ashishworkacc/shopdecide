export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getPrisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const data = await req.json()
  const prisma = getPrisma()
  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      emailNotifications: data.emailNotifications,
      priceDropAlerts: data.priceDropAlerts,
    },
  })
  return NextResponse.json({ ok: true })
}
