import { SearchInput } from '@/components/search/search-input'

const CATEGORIES = [
  { emoji: '🎧', label: 'Earbuds', q: 'best TWS earbuds under 2500' },
  { emoji: '📱', label: 'Smartphones', q: 'best smartphone under 15000' },
  { emoji: '💻', label: 'Laptops', q: 'best laptop under 50000' },
  { emoji: '🎮', label: 'Gaming', q: 'best gaming headset under 3000' },
  { emoji: '⌨️', label: 'Keyboards', q: 'best mechanical keyboard under 3000' },
  { emoji: '🧴', label: 'Skincare', q: 'best sunscreen for Indian skin' },
  { emoji: '💪', label: 'Supplements', q: 'best whey protein India' },
  { emoji: '⌚', label: 'Watches', q: 'best smartwatch under 5000' },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '52px 24px 40px',
          background: 'linear-gradient(180deg, #fef9f0 0%, #fff7ed 100%)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40, maxWidth: 720 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              padding: '6px 16px',
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ea580c',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Powered by real reviews
            </span>
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 900,
              lineHeight: 1.1,
              color: '#1c0a00',
              marginBottom: 16,
              letterSpacing: '-1.5px',
              margin: '0 0 16px',
            }}
          >
            What are you looking to{' '}
            <span style={{ color: '#f97316' }}>buy today?</span>
          </h1>
          <p
            style={{
              fontSize: 16,
              color: '#7c6e5a',
              fontWeight: 500,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            AI-powered recommendations from Amazon, Flipkart, Reddit &amp; YouTube — like asking a
            knowledgeable friend.
          </p>
        </div>

        <SearchInput />

        {/* Trust bar */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            gap: 28,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['🛒 Amazon & Flipkart', '💬 Reddit', '▶️ YouTube', '🤖 AI analysis'].map(item => (
            <span key={item} style={{ fontSize: 13, color: '#9a7e68', fontWeight: 500 }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Quick category links */}
      <div style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#1c0a00',
            marginBottom: 20,
          }}
        >
          Popular categories
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 14,
          }}
        >
          {CATEGORIES.map(cat => (
            <a
              key={cat.label}
              href={`/search?q=${encodeURIComponent(cat.q)}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                background: 'white',
                borderRadius: 16,
                border: '1.5px solid #e8ddd0',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(28,10,0,0.04)',
                transition: 'border-color 0.15s',
              }}
            >
              <span style={{ fontSize: 24 }}>{cat.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1c0a00' }}>{cat.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
