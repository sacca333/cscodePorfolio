'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'DM Sans', sans-serif",
      color: '#e8e8f0', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,231,183,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,.025)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 20, padding: '2.5rem',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.25rem' }}>
          <div style={{
            width: 44, height: 44, background: '#6ee7b7', color: '#0a0a0f',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.9rem', fontFamily: "'Syne', sans-serif", flexShrink: 0,
          }}>CS</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: '#e8e8f0' }}>
              Administration
            </div>
            <div style={{ fontSize: '.8rem', color: '#555568', marginTop: '.1rem' }}>
              Portfolio Charles Sacca
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
              color: '#f87171', padding: '.75rem 1rem', borderRadius: 10, fontSize: '.85rem',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
            <label style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.07em', color: '#555568', fontWeight: 600 }}>
              Adresse email
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="charles@charlessacca.dev"
              required autoComplete="email"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 10, padding: '.75rem 1rem',
                color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif",
                fontSize: '.9rem', outline: 'none', width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
            <label style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.07em', color: '#555568', fontWeight: 600 }}>
              Mot de passe
            </label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required autoComplete="current-password"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 10, padding: '.75rem 1rem',
                color: '#e8e8f0', fontFamily: "'DM Sans', sans-serif",
                fontSize: '.9rem', outline: 'none', width: '100%',
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              background: '#6ee7b7', color: '#0a0a0f', border: 'none',
              padding: '.85rem', borderRadius: 10, fontWeight: 800,
              fontSize: '.9rem', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Syne', sans-serif", marginTop: '.25rem',
              opacity: loading ? .5 : 1, transition: 'opacity .2s',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" style={{ fontSize: '.82rem', color: '#444458', textDecoration: 'none' }}>
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}