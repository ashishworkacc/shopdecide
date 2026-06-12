'use client'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface Props {
  wishlistCount: number
  userName?: string
}

export function Nav({ wishlistCount, userName }: Props) {
  return (
    <nav
      style={{
        padding: '14px 32px',
        background: 'white',
        borderBottom: '1.5px solid #e8ddd0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 2px 12px rgba(28,10,0,0.04)',
      }}
    >
      <Link
        href="/"
        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: '#f97316',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          ✦
        </div>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#1c0a00', letterSpacing: '-0.3px' }}>
          ShopDecide
        </span>
      </Link>

      <div style={{ flex: 1 }} />

      {userName && (
        <span style={{ fontSize: 13, color: '#9a7e68', fontWeight: 500 }}>
          Hi, {userName.split(' ')[0]}
        </span>
      )}

      <Link
        href="/wishlist"
        style={{
          padding: '8px 16px',
          borderRadius: 10,
          border: '1.5px solid #e8ddd0',
          background: 'white',
          fontSize: 13,
          fontWeight: 700,
          color: '#7c6e5a',
          textDecoration: 'none',
        }}
      >
        ❤ Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
      </Link>

      <Link
        href="/profile"
        style={{
          padding: '8px 16px',
          borderRadius: 10,
          border: '1.5px solid #e8ddd0',
          background: 'white',
          fontSize: 13,
          fontWeight: 700,
          color: '#7c6e5a',
          textDecoration: 'none',
        }}
      >
        👤 Profile
      </Link>

      <button
        onClick={() => signOut({ callbackUrl: '/auth' })}
        style={{
          padding: '8px 16px',
          borderRadius: 10,
          border: '1.5px solid #e8ddd0',
          background: 'white',
          fontSize: 13,
          fontWeight: 700,
          color: '#dc2626',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </nav>
  )
}
