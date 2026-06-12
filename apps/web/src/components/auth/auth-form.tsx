'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'signup'

export function AuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email or password.')
        setLoading(false)
      } else {
        setSuccess('Signed in! Taking you to the app…')
        // Keep loading=true while navigating so button stays green
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: signupEmail, password: signupPassword }),
      })

      let data: { error?: string } = {}
      try { data = await res.json() } catch { /* ignore non-JSON */ }

      if (!res.ok) {
        setError(data.error ?? `Registration failed (${res.status}). Please try again.`)
        setLoading(false)
        return
      }

      setSuccess('Account created! Signing you in…')

      // Auto sign-in after registration
      const result = await signIn('credentials', {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
      })
      if (result?.error) {
        setSuccess('')
        setError('Account created! Please sign in with your credentials.')
        setTab('login')
        setLoading(false)
      } else {
        setSuccess('All set! Taking you to the app…')
        // Keep loading=true while navigating
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #e8ddd0',
    borderRadius: 12,
    fontSize: 15,
    color: '#1c0a00',
    background: 'white',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const getBtnStyle = (): React.CSSProperties => ({
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    border: 'none',
    background: success ? '#16a34a' : loading ? '#fed7aa' : '#f97316',
    color: success ? 'white' : loading ? '#9a4a00' : 'white',
    fontSize: 15,
    fontWeight: 800,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    marginTop: 8,
    transition: 'background 0.2s, color 0.2s',
  })

  const getButtonLabel = (isLogin: boolean) => {
    if (success) return '✓ ' + success
    if (loading) return isLogin ? 'Signing in…' : 'Creating account…'
    return isLogin ? 'Sign In →' : 'Create Account →'
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 24,
        padding: '32px',
        boxShadow: '0 8px 48px rgba(28,10,0,0.10)',
        border: '1.5px solid #f0e8df',
      }}
    >
      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          background: '#f5f0ea',
          borderRadius: 12,
          padding: 4,
          marginBottom: 28,
        }}
      >
        {(['login', 'signup'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setSuccess('') }}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 9,
              border: 'none',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1c0a00' : '#7c6e5a',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              fontFamily: 'inherit',
            }}
          >
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 10,
            fontSize: 13,
            color: '#dc2626',
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}

      {success && !error && (
        <div
          style={{
            padding: '10px 14px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: 10,
            fontSize: 13,
            color: '#16a34a',
            marginBottom: 16,
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        >
          ✓ {success}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email address"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
          <button type="submit" style={getBtnStyle()} disabled={loading}>
            {getButtonLabel(true)}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email address"
            value={signupEmail}
            onChange={e => setSignupEmail(e.target.value)}
            required
            disabled={loading}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={signupPassword}
            onChange={e => setSignupPassword(e.target.value)}
            minLength={8}
            required
            disabled={loading}
            style={inputStyle}
          />
          <button type="submit" style={getBtnStyle()} disabled={loading}>
            {getButtonLabel(false)}
          </button>
        </form>
      )}
    </div>
  )
}
