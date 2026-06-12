'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LoadingSteps } from '@/components/search/loading-steps'
import { ProductCard } from '@/components/product/product-card'
import { ChatPanel } from '@/components/chat/chat-panel'
import type { Product, ChatMessage, ResearchEvent } from '@/lib/types'

type SortBy = 'score' | 'price' | 'reviews'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') ?? ''

  const [phase, setPhase] = useState<'loading' | 'results'>('loading')
  const [loadingStep, setLoadingStep] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<SortBy>('score')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      type: 'ai',
      text: `I've analysed the best options for "${query}". Tell me what matters most — battery life, price, or specific features — and I'll reorder these for you.`,
    },
  ])
  const [isRefining, setIsRefining] = useState(false)

  useEffect(() => {
    if (!query) return

    fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }).then(res => {
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      function pump(): Promise<void> {
        return reader.read().then(({ done, value }) => {
          if (done) return
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            try {
              const event: ResearchEvent = JSON.parse(line.slice(6))
              if (event.type === 'step_start') setLoadingStep(event.step ?? 0)
              if (event.type === 'product' && event.product)
                setProducts(p => [...p, event.product!])
              if (event.type === 'done' || event.type === 'cached') setPhase('results')
              if (event.type === 'error') setPhase('results')
            } catch {
              // skip malformed
            }
          }
          return pump()
        })
      }
      return pump()
    })
  }, [query])

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'reviews')
      return b.amazonReviews + b.flipkartReviews - (a.amazonReviews + a.flipkartReviews)
    return b.score - a.score
  })

  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  if (phase === 'loading') return <LoadingSteps currentStep={loadingStep} query={query} />

  return (
    <div style={{ height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky result header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1.5px solid #e8ddd0',
          padding: '13px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 2px 14px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '7px 14px',
            borderRadius: 9,
            border: '1.5px solid #e8ddd0',
            fontSize: 12,
            fontWeight: 700,
            color: '#7c6e5a',
            background: 'white',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← Home
        </button>
        <span style={{ fontSize: 13, color: '#9a7e68' }}>Results for:</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1c0a00' }}>
          &ldquo;{query}&rdquo;
        </span>
        <div style={{ flex: 1 }} />

        {/* Sort pills */}
        <div
          style={{
            background: '#f5f0ea',
            borderRadius: 10,
            padding: 4,
            display: 'flex',
            gap: 3,
          }}
        >
          {(['score', 'price', 'reviews'] as SortBy[]).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: sortBy === s ? '#f97316' : 'transparent',
                color: sortBy === s ? 'white' : '#7c6e5a',
                fontFamily: 'inherit',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {selectedIds.length >= 2 && (
          <button
            onClick={() => router.push(`/compare?ids=${selectedIds.join(',')}`)}
            style={{
              background: '#1c0a00',
              color: 'white',
              padding: '9px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Compare {selectedIds.length} →
          </button>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Product list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a7e68' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No results found.</p>
              <p style={{ fontSize: 14 }}>Try a more specific query or different keywords.</p>
            </div>
          ) : (
            sorted.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                isSelected={selectedIds.includes(p.id)}
                onSelect={() => toggleSelect(p.id)}
                index={i}
                onClick={() => router.push(`/product/${p.id}?data=${encodeURIComponent(JSON.stringify(p))}`)}
              />
            ))
          )}
        </div>

        {/* Chat panel */}
        <ChatPanel
          products={sorted}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          isRefining={isRefining}
          setIsRefining={setIsRefining}
          onReorder={ids =>
            setProducts(prev => [...prev].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)))
          }
        />
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSteps currentStep={0} query="Loading…" />}>
      <SearchContent />
    </Suspense>
  )
}
