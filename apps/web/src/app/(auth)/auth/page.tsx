import { AuthForm } from '@/components/auth/auth-form'

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef9f0 0%, #fff7ed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: '#f97316',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 28,
              fontWeight: 900,
              margin: '0 auto 16px',
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: '#1c0a00',
              letterSpacing: -1,
              margin: 0,
            }}
          >
            ShopDecide
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#7c6e5a',
              fontWeight: 500,
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            India&apos;s smartest product recommender
          </p>
        </div>

        <AuthForm />

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9a7e68', marginTop: 24 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
