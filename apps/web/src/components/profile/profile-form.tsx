'use client'
import { useState } from 'react'

interface Props {
  userId: string
  name: string
  email: string
  emailNotifications: boolean
  priceDropAlerts: boolean
}

export function ProfileForm({ userId, name, email, emailNotifications, priceDropAlerts }: Props) {
  const [notifs, setNotifs] = useState(emailNotifications)
  const [drops, setDrops] = useState(priceDropAlerts)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailNotifications: notifs, priceDropAlerts: drops }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1.5px solid #e8ddd0', boxShadow: '0 4px 20px rgba(28,10,0,0.05)' }}>
      {/* Read-only info */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#9a7e68', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</label>
        <div style={{ padding: '10px 14px', background: '#f5f0ea', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#1c0a00' }}>{name || '—'}</div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#9a7e68', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
        <div style={{ padding: '10px 14px', background: '#f5f0ea', borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#1c0a00' }}>{email}</div>
      </div>

      {/* Notification toggles */}
      <div style={{ borderTop: '1.5px solid #f5f0ea', paddingTop: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1c0a00', marginBottom: 16 }}>Notifications</h2>

        {[
          { label: 'Email notifications', description: 'Get updates about your saved searches', value: notifs, onChange: setNotifs },
          { label: 'Price drop alerts', description: 'Get notified when wishlist item prices drop', value: drops, onChange: setDrops },
        ].map(item => (
          <div
            key={item.label}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1c0a00' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#9a7e68', marginTop: 2 }}>{item.description}</div>
            </div>
            <button
              role="switch"
              aria-checked={item.value}
              onClick={() => item.onChange(!item.value)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: 'none',
                background: item.value ? '#f97316' : '#e8ddd0',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: item.value ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 8,
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          background: saved ? '#16a34a' : '#f97316',
          color: 'white',
          border: 'none',
          fontWeight: 800,
          fontSize: 15,
          cursor: saving ? 'default' : 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}
