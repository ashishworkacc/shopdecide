'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import type { Product } from '@/lib/types'
import { VerdictBadge } from '@/components/product/verdict-badge'
import { ScoreBar } from '@/components/product/score-bar'
import { ProductImage } from '@/components/product/product-image'

function ProductDetail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const raw = searchParams.get('data')
    if (raw) {
      try {
        setProduct(JSON.parse(decodeURIComponent(raw)))
      } catch {
        // ignore
      }
    }
  }, [searchParams])

  if (!product) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#9a7e68' }}>
        <p>Product not found.</p>
        <button
          onClick={() => router.back()}
          style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: '1.5px solid #e8ddd0', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
        >
          ← Back
        </button>
      </div>
    )
  }

  async function saveToWishlist() {
    if (!product) return
    setSaving(true)
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        currentPrice: product.price,
        verdict: product.verdict,
      }),
    })
    setSaving(false)
    setSaved(true)
  }

  const SOURCES = [
    { label: 'Amazon', rating: product.amazonRating, reviews: product.amazonReviews, href: product.amazonUrl },
    { label: 'Flipkart', rating: product.flipkartRating, reviews: product.flipkartReviews, href: product.flipkartUrl },
  ].filter(s => s.href)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 28px' }}>
      <button
        onClick={() => router.back()}
        style={{ marginBottom: 20, padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e8ddd0', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, color: '#7c6e5a' }}
      >
        ← Back
      </button>

      <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1.5px solid #e8ddd0', boxShadow: '0 4px 24px rgba(28,10,0,0.07)' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {/* Image */}
          <div style={{ width: 220, height: 220, borderRadius: 16, overflow: 'hidden', flexShrink: 0, background: '#f5f0ea' }}>
            <ProductImage src={product.image} alt={product.name} size={220} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <VerdictBadge verdict={product.verdict} size="lg" />
              <span style={{ background: '#f5f0ea', borderRadius: 10, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#7c6e5a' }}>
                Score: {product.score}/100
              </span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1c0a00', margin: '0 0 6px', lineHeight: 1.3 }}>{product.name}</h1>
            <p style={{ fontSize: 14, color: '#9a7e68', margin: '0 0 16px' }}>{product.brand}</p>

            <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316', marginBottom: 16 }}>
              ₹{product.price.toLocaleString('en-IN')}
            </div>

            <ScoreBar score={product.score} />

            {product.aiVerdict && (
              <blockquote style={{ margin: '20px 0 0', padding: '14px 16px', background: '#fff7ed', borderLeft: '3px solid #f97316', borderRadius: '0 12px 12px 0', fontSize: 14, color: '#7c6e5a', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{product.aiVerdict}"
              </blockquote>
            )}
          </div>
        </div>

        {/* Sources */}
        {SOURCES.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1c0a00', marginBottom: 12 }}>Buy from</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {SOURCES.map(s => (
                <a
                  key={s.label}
                  href={s.href ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: '#fef9f0', border: '1.5px solid #e8ddd0', borderRadius: 12, textDecoration: 'none' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1c0a00' }}>{s.label}</span>
                  {s.rating > 0 && <span style={{ fontSize: 12, color: '#9a7e68' }}>★ {s.rating.toFixed(1)} ({s.reviews.toLocaleString()} reviews)</span>}
                  <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Pros / Cons */}
        {(product.pros?.length || product.cons?.length) ? (
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {product.pros?.length ? (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginBottom: 10 }}>✓ Pros</h3>
                <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {product.pros.map((p, i) => <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{p}</li>)}
                </ul>
              </div>
            ) : null}
            {product.cons?.length ? (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', marginBottom: 10 }}>✗ Cons</h3>
                <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {product.cons.map((c, i) => <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{c}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Save button */}
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={saveToWishlist}
            disabled={saving || saved}
            style={{ padding: '11px 28px', borderRadius: 12, background: saved ? '#16a34a' : '#f97316', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: saved ? 'default' : 'pointer', fontFamily: 'inherit' }}
          >
            {saved ? '✓ Saved to Wishlist' : saving ? 'Saving…' : '♡ Save to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading…</div>}>
      <ProductDetail />
    </Suspense>
  )
}
