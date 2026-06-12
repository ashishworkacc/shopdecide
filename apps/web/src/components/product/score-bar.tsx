import { scoreColor } from '@/lib/scoring'

interface Props {
  score: number
  showLabel?: boolean
}

export function ScoreBar({ score, showLabel = true }: Props) {
  const color = scoreColor(score)
  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#9a7e68',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Overall Score
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color }}>{score}</span>
        </div>
      )}
      <div
        style={{
          height: 9,
          background: '#f0e8df',
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: color,
            borderRadius: 5,
            width: `${score}%`,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}
