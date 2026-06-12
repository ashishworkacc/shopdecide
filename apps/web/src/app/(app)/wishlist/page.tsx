import { auth } from '@/auth'
import { getPrisma } from '@/lib/prisma'
import type { Verdict } from '@/lib/types'

type PrismaWishlistItem = {
  id: string
  userId: string
  productId: string
  productName: string
  productImage: string | null
  currentPrice: number | null
  verdict: string | null
  productData: string
  createdAt: Date
}

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.email) return null

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return null

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const BADGE_COLORS: Record<Verdict, { bg: string; text: string }> = {
    BUY: { bg: '#dcfce7', text: '#15803d' },
    WAIT: { bg: '#fef9c3', text: '#854d0e' },
    SKIP: { bg: '#fee2e2', text: '#991b1b' },
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1c0a00', marginBottom: 6 }}>
        My Wishlist
      </h1>
      <p style={{ fontSize: 14, color: '#9a7e68', marginBottom: 28 }}>
        {items.length} saved {items.length === 1 ? 'item' : 'items'}
      </p>

      {items.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 60,
            textAlign: 'center',
            border: '1.5px solid #e8ddd0',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1c0a00', marginBottom: 8 }}>
            Your wishlist is empty
          </p>
          <p style={{ fontSize: 14, color: '#9a7e68' }}>
            Research a product and save the ones you're interested in.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              marginTop: 20,
              padding: '11px 28px',
              background: '#f97316',
              color: 'white',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Start Researching
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item: PrismaWishlistItem) => {
            const verdict = (item.verdict as Verdict) ?? 'WAIT'
            const badge = BADGE_COLORS[verdict] ?? BADGE_COLORS.WAIT
            return (
              <div
                key={item.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '18px 20px',
                  border: '1.5px solid #e8ddd0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: '0 2px 10px rgba(28,10,0,0.04)',
                }}
              >
                {item.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    width={64}
                    height={64}
                    style={{ objectFit: 'contain', borderRadius: 10, background: '#f5f0ea', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#1c0a00',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.productName}
                  </div>
                  {item.currentPrice && (
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#f97316' }}>
                      ₹{Number(item.currentPrice).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 800,
                    background: badge.bg,
                    color: badge.text,
                    flexShrink: 0,
                  }}
                >
                  {verdict}
                </span>
                <form
                  action={async () => {
                    'use server'
                    // handled client-side via API
                  }}
                >
                  <RemoveButton itemId={item.id} />
                </form>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RemoveButton({ itemId }: { itemId: string }) {
  return (
    <form
      action={`/api/wishlist?id=${itemId}`}
      method="POST"
      style={{ display: 'inline' }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        style={{
          padding: '7px 14px',
          borderRadius: 10,
          border: '1.5px solid #e8ddd0',
          background: 'white',
          fontSize: 12,
          fontWeight: 700,
          color: '#9a7e68',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Remove
      </button>
    </form>
  )
}
