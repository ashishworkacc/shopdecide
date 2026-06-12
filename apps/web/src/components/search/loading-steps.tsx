'use client'

const STEPS = [
  { emoji: '🛒', label: 'Searching Google Shopping India' },
  { emoji: '⭐', label: 'Checking Amazon & Flipkart ratings' },
  { emoji: '💬', label: 'Reading Reddit discussions' },
  { emoji: '▶️', label: 'Scanning YouTube reviews' },
  { emoji: '🤖', label: 'Generating expert analysis' },
]

interface Props {
  currentStep: number
  query: string
}

export function LoadingSteps({ currentStep, query }: Props) {
  const progress = Math.round((currentStep / STEPS.length) * 100)

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#fef9f0',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        {/* Logo spinner */}
        <div
          style={{
            width: 64,
            height: 64,
            background: '#f97316',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            margin: '0 auto 24px',
            animation: 'spin 2s linear infinite',
          }}
        >
          ✦
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1c0a00', marginBottom: 8 }}>
          Researching your query…
        </h2>
        <p
          style={{
            fontSize: 14,
            color: '#7c6e5a',
            marginBottom: 36,
            background: '#f5f0ea',
            padding: '8px 16px',
            borderRadius: 10,
            display: 'inline-block',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{query}&rdquo;
        </p>

        {/* Progress bar */}
        <div
          style={{
            height: 8,
            background: '#f0e8df',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #f97316, #fb923c)',
              borderRadius: 4,
              width: `${progress}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {STEPS.map((step, i) => {
            const isComplete = i < currentStep
            const isActive = i === currentStep
            return (
              <div
                key={step.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: isActive
                    ? 'white'
                    : isComplete
                      ? '#f0fdf4'
                      : 'transparent',
                  border: isActive
                    ? '1.5px solid #fed7aa'
                    : isComplete
                      ? '1.5px solid #86efac'
                      : '1.5px solid transparent',
                  boxShadow: isActive ? '0 4px 16px rgba(249,115,22,0.1)' : 'none',
                  transition: 'all 0.3s',
                }}
              >
                <span style={{ fontSize: 20 }}>{step.emoji}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isComplete ? '#16a34a' : isActive ? '#1c0a00' : '#9a7e68',
                    flex: 1,
                  }}
                >
                  {step.label}
                </span>
                <span style={{ fontSize: 16 }}>
                  {isComplete ? '✅' : isActive ? '⏳' : '○'}
                </span>
              </div>
            )
          })}
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: '#9a7e68' }}>
          Checking 5+ sources — takes about 15–30 seconds
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
