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

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup fields
  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push('/')
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: signupEmail, password: signupPassword }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Registration failed.')
      setLoading(false)
      return
    }
    const result = await signIn('credentials', {
      email: signupEmail,
      password: signupPassword,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Account created. Please log in.')
      setTab('login')
    } else {
      router.push('/')
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

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    borderRadius: 14,
    border: 'none',
    background: loading ? '#f5f0ea' : '#f97316',
    color: loading ? '#9a7e68' : 'white',
    fontSize: 15,
    fontWeight: 800,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    marginTop: 8,
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
            onClick={() => { setTab(t); setError('') }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 9,
              border: 'none',
              background: tab === t ? 'white' : 'transparent',
              color: tab === t ? '#1c0a00' : '#7c6e5a',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
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
          }}
        >
          {error}
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
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
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
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email address"
            value={signupEmail}
            onChange={e => setSignupEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={signupPassword}
            onChange={e => setSignupPassword(e.target.value)}
            minLength={8}
            required
            style={inputStyle}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>
      )}

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '20px 0',
          color: '#9a7e68',
          fontSize: 13,
        }}
      >
        <div style={{ flex: 1, height: 1, background: '#e8ddd0' }} />
        OR
        <div style={{ flex: 1, height: 1, background: '#e8ddd0' }} />
      </div>

      {/* Google */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 14,
          border: '1.5px solid #e8ddd0',
          background: 'white',
          fontSize: 14,
          fontWeight: 700,
          color: '#1c0a00',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 20 }}>🔵</span>
        Continue with Google
      </button>
    </div>
  )
}
