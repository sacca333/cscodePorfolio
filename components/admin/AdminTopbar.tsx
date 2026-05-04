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
      borderBottom: '1px solid var(--admin-border)',
      background: 'var(--admin-topbar)',
      position: 'sticky', top: 0, zIndex: 50,
      gap: '1rem',
    }}>
      <div>
        <div style={{ fontSize: '.9rem', color: 'var(--admin-text)', fontWeight: 400 }}>
          Bonjour, <strong style={{ fontWeight: 700 }}>{admin?.name ?? 'Admin'}</strong>
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--admin-muted)', marginTop: '.1rem', textTransform: 'capitalize' }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        {/* Bouton voir le site */}
        <Link href="/" target="_blank" style={{
          width: 36, height: 36,
          background: 'var(--admin-bg)',
          border: '1px solid var(--admin-border)',
          borderRadius: 9, color: 'var(--admin-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', fontSize: '.85rem',
          transition: 'all .18s',
        }} title="Voir le site">↗</Link>

        {/* Profil admin */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '.4rem .75rem .4rem .4rem',
          background: 'var(--admin-bg)',
          border: '1px solid var(--admin-border)',
          borderRadius: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--admin-accent-l)',
            color: 'var(--admin-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.72rem',
            fontFamily: "'Syne', sans-serif", flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap' }}>
              {admin?.name}
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--admin-accent)', fontWeight: 500 }}>Administrateur</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{
              background: 'none', border: 'none',
              color: 'var(--admin-muted)',
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
