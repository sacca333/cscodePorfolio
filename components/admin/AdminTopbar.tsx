'use client'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  admin?: { name?: string | null; email?: string | null }
}

export default function AdminTopbar({ admin }: Props) {
  const initials = admin?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? 'CS'

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '.875rem 2.5rem',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      background: 'rgba(13,13,20,0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50,
      gap: '1rem',
    }}>
      <div>
        <div style={{ fontSize: '.9rem', color: '#e8e8f0' }}>
          Bonjour, <strong>{admin?.name ?? 'Admin'}</strong>
        </div>
        <div style={{ fontSize: '.75rem', color: '#666680', marginTop: '.1rem', textTransform: 'capitalize' }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <Link href="/" target="_blank" style={{
          width: 36, height: 36,
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 9, color: '#888',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: '.8rem',
        }} title="Voir le site">↗</Link>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '.4rem .75rem .4rem .4rem',
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(110,231,183,.15)', color: '#6ee7b7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.72rem',
            fontFamily: "'Syne', sans-serif", flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap' }}>
              {admin?.name}
            </div>
            <div style={{ fontSize: '.7rem', color: '#6ee7b7' }}>Administrateur</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{
              background: 'none', border: 'none', color: '#555',
              cursor: 'pointer', padding: '.25rem', borderRadius: 6,
              fontSize: '.85rem', transition: 'color .2s', marginLeft: '.25rem',
            }}
            title="Se déconnecter"
          >✕</button>
        </div>
      </div>
    </header>
  )
}