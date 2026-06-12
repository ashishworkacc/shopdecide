import { auth } from '@/auth'
import { getPrisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      emailNotifications: true,
      priceDropAlerts: true,
      createdAt: true,
      _count: { select: { wishlistItems: true } },
    },
  })
  if (!user) return null

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 28px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1c0a00', marginBottom: 6 }}>My Profile</h1>
      <p style={{ fontSize: 14, color: '#9a7e68', marginBottom: 32 }}>
        Manage your account settings
      </p>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Wishlist items', value: user._count.wishlistItems },
          { label: 'Member since', value: new Date(user.createdAt).getFullYear() },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              background: 'white',
              borderRadius: 14,
              padding: '16px 20px',
              border: '1.5px solid #e8ddd0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: '#f97316' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#9a7e68', fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <ProfileForm
        userId={user.id}
        name={user.name ?? ''}
        email={user.email ?? ''}
        emailNotifications={user.emailNotifications}
        priceDropAlerts={user.priceDropAlerts}
      />
    </div>
  )
}
