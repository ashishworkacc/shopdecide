'use client'
import type { Product } from '@/lib/types'
import { ProductImage } from './product-image'
import { VerdictBadge } from './verdict-badge'
import { ScoreBar } from './score-bar'
import { scoreColor } from '@/lib/scoring'

interface Props {
  product: Product
  isSelected: boolean
  onSelect: () => void
  onClick: () => void
  index: number
}

export function ProductCard({ product: p, isSelected, onSelect, onClick, index }: Props) {
  const color = scoreColor(p.score)

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        border: isSelected ? '2px solid #f97316' : '1.5px solid #e8ddd0',
        padding: '20px 24px',
        display: 'flex',
        gap: 20,
        cursor: 'pointer',
        boxShadow: isSelected
          ? '0 4px 24px rgba(249,115,22,0.15)'
          : '0 2px 12px rgba(28,10,0,0.04)',
        transition: 'all 0.2s',
        position: 'relative',
      }}
      onClick={onClick}
    >
      {/* Rank badge */}
      {index < 3 && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 20,
            background: index === 0 ? '#f97316' : index === 1 ? '#94a3b8' : '#b45309',
            color: 'white',
            fontSize: 11,
            fontWeight: 800,
            padding: '2px 10px',
            borderRadius: 100,
          }}
        >
          #{index + 1} {index === 0 ? 'Top Pick' : index === 1 ? 'Runner Up' : '3rd Place'}
        </div>
      )}

      {/* Image */}
      <ProductImage
        src={p.imageUrl}
        alt={p.name}
        fallbackEmoji={p.imageFallbackEmoji}
        size={120}
      />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <VerdictBadge verdict={p.verdict} size="sm" />
          {p.badge && (
            <span
              style={{
                background: '#fff7ed',
                color: '#f97316',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 100,
                border: '1px solid #fed7aa',
              }}
            >
              {p.badge}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1 }}>
              {p.score}
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1c0a00', margin: '0 0 4px', lineHeight: 1.3 }}>
          {p.name}
        </h3>
        <div style={{ fontSize: 13, color: '#7c6e5a', marginBottom: 10 }}>
          {p.brand} ·{' '}
          <span style={{ fontWeight: 700, color: '#1c0a00' }}>
            ₹{p.price.toLocaleString('en-IN')}
          </span>{' '}
          · {p.store}
        </div>

        {/* Ratings row */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          {p.amazonRating > 0 && (
            <span style={{ fontSize: 12, color: '#7c6e5a' }}>
              <span style={{ color: '#FF9900', fontWeight: 700 }}>Amazon</span>{' '}
              ★{p.amazonRating} ({p.amazonReviews.toLocaleString()})
            </span>
          )}
          {p.flipkartRating > 0 && (
            <span style={{ fontSize: 12, color: '#7c6e5a' }}>
              <span style={{ color: '#1F40FB', fontWeight: 700 }}>Flipkart</span>{' '}
              ★{p.flipkartRating} ({p.flipkartReviews.toLocaleString()})
            </span>
          )}
          {p.redditMentions > 0 && (
            <span style={{ fontSize: 12, color: '#7c6e5a' }}>
              💬 Reddit: {p.redditMentions} posts (
              <span
                style={{
                  color:
                    p.redditSentiment === 'positive'
                      ? '#16a34a'
                      : p.redditSentiment === 'negative'
                        ? '#dc2626'
                        : '#d97706',
                  fontWeight: 600,
                }}
              >
                {p.redditSentiment}
              </span>
              )
            </span>
          )}
          {p.youtubeVideos > 0 && (
            <span style={{ fontSize: 12, color: '#7c6e5a' }}>
              ▶ {p.youtubeVideos} videos · {p.youtubeViews} views
            </span>
          )}
        </div>

        <ScoreBar score={p.score} showLabel={false} />

        {/* AI Verdict */}
        {p.aiVerdict && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background:
                p.verdict === 'BUY'
                  ? '#f0fdf4'
                  : p.verdict === 'WAIT'
                    ? '#fffbeb'
                    : '#fef2f2',
              borderRadius: 10,
              fontSize: 13,
              fontStyle: 'italic',
              color: '#4a3828',
              borderLeft: `3px solid ${p.verdict === 'BUY' ? '#86efac' : p.verdict === 'WAIT' ? '#fde68a' : '#fca5a5'}`,
            }}
          >
            &ldquo;{p.aiVerdict}&rdquo;
          </div>
        )}
      </div>

      {/* Compare checkbox */}
      <div
        onClick={e => {
          e.stopPropagation()
          onSelect()
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: isSelected ? '2px solid #f97316' : '2px solid #e8ddd0',
            background: isSelected ? '#f97316' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {isSelected ? '✓' : ''}
        </div>
        <span style={{ fontSize: 9, color: '#9a7e68', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Compare
        </span>
      </div>
    </div>
  )
}
