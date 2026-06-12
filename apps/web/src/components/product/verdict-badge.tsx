import type { Verdict } from '@/lib/types'

const MAP: Record<Verdict, { bg: string; color: string; icon: string }> = {
  BUY: { bg: '#dcfce7', color: '#16a34a', icon: '🟢' },
  WAIT: { bg: '#fef3c7', color: '#d97706', icon: '🟡' },
  SKIP: { bg: '#fee2e2', color: '#dc2626', icon: '🔴' },
}

interface Props {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

export function VerdictBadge({ verdict, size = 'sm' }: Props) {
  const s = MAP[verdict]
  const fontSize = size === 'lg' ? 22 : size === 'md' ? 14 : 12
  const padding = size === 'lg' ? '18px 28px' : '5px 13px'
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize,
        fontWeight: 800,
        padding,
        borderRadius: 100,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {s.icon} {verdict}
    </span>
  )
}
