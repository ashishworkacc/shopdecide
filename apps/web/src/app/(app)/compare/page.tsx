'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { VerdictBadge } from '@/components/product/verdict-badge'
import { ScoreBar } from '@/components/product/score-bar'
import type { Product } from '@/lib/types'

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const idsParam = searchParams.get('ids') ?? ''
  const dataParam = searchParams.get('data') ?? ''

  let products: Product[] = []
  if (dataParam) {
    try {
      products = JSON.parse(decodeURIComponent(dataParam))
    } catch {
      // ignore
    }
  }

  if (products.length < 2) {
    return (
      <div style={{ padding: '60px 28px', textAlign: 'center', color: '#9a7e68' }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Select at least 2 products from search to compare.</p>
        <button
          onClick={() => router.back()}
          style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: '1.5px solid #e8ddd0', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}
        >
          ← Back to results
        </button>
      </div>
    )
  }

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: 'Verdict', render: p => <VerdictBadge verdict={p.verdict} size="sm" /> },
    { label: 'Score', render: p => <div style={{ minWidth: 120 }}><ScoreBar score={p.score} /></div> },
    { label: 'Price', render: p => <span style={{ fontWeight: 900, color: '#f97316' }}>₹{p.price.toLocaleString('en-IN')}</span> },
    { label: 'Amazon ★', render: p => p.amazonRating ? `${p.amazonRating.toFixed(1)} (${p.amazonReviews.toLocaleString()})` : '—' },
    { label: 'Flipkart ★', render: p => p.flipkartRating ? `${p.flipkartRating.toFixed(1)} (${p.flipkartReviews.toLocaleString()})` : '—' },
    { label: 'Brand', render: p => p.brand || '—' },
    { label: 'AI Verdict', render: p => p.aiVerdict ? <span style={{ fontSize: 13, color: '#7c6e5a', fontStyle: 'italic' }}>&ldquo;{p.aiVerdict}&rdquo;</span> : '—' },
  ]

  return (
    <div style={{ padding: '28px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button
          onClick={() => router.back()}
          style={{ padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e8ddd0', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, color: '#7c6e5a' }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1c0a00', margin: 0 }}>Compare products</h1>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #e8ddd0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(28,10,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fef9f0', borderBottom: '1.5px solid #e8ddd0' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9a7e68', width: 120 }}>
                Feature
              </th>
              {products.map(p => (
                <th key={p.id} style={{ padding: '16px 20px', textAlign: 'left', minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1c0a00', lineHeight: 1.3 }}>{p.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                style={{ borderBottom: '1px solid #f5f0ea', background: i % 2 === 0 ? 'white' : '#fefcf9' }}
              >
                <td style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#9a7e68', verticalAlign: 'top' }}>
                  {row.label}
                </td>
                {products.map(p => (
                  <td key={p.id} style={{ padding: '14px 20px', fontSize: 14, color: '#1c0a00', verticalAlign: 'top' }}>
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading…</div>}>
      <CompareContent />
    </Suspense>
  )
}
