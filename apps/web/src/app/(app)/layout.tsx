import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/layout/nav'
import { getPrisma } from '@/lib/prisma'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.email) redirect('/auth')

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { _count: { select: { wishlistItems: true } } },
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fef9f0' }}>
      <Nav
        wishlistCount={user?._count.wishlistItems ?? 0}
        userName={user?.name ?? session.user.name ?? undefined}
      />
      {children}
    </div>
  )
}
