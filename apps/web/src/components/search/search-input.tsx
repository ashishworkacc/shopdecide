'use client'
import { useRouter } from 'next/navigation'
import { useState, type KeyboardEvent } from 'react'

const CHIPS = [
  'Best TWS earbuds under ₹2,500',
  'Budget smartphone under ₹15,000',
  'Running shoes under ₹3,000',
  'Air purifier for 300 sq ft room',
]

export function SearchInput() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function submit(q: string) {
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit(value)
  }

  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      {/* Search bar */}
      <div
        style={{
          background: 'white',
          border: '2px solid #e8ddd0',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          boxShadow: '0 4px 32px rgba(28,10,0,0.08)',
          marginBottom: 16,
        }}
      >
        <span style={{ padding: '0 20px', fontSize: 22, color: '#9a7e68' }}>🔍</span>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. best TWS earbuds under ₹2,500 for gym"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 16,
            color: '#1c0a00',
            padding: '20px 20px 20px 0',
            outline: 'none',
            fontWeight: 500,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Quick chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        {CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => submit(chip)}
            style={{
              padding: '9px 18px',
              borderRadius: 100,
              border: '1.5px solid #e0d5cb',
              background: 'white',
              fontSize: 13,
              fontWeight: 600,
              color: '#4a3828',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => submit(value)}
        style={{
          background: '#f97316',
          color: 'white',
          border: 'none',
          borderRadius: 14,
          padding: '16px 0',
          fontSize: 16,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(249,115,22,0.4)',
          width: '100%',
          fontFamily: 'inherit',
        }}
      >
        Find Best Options →
      </button>
    </div>
  )
}
