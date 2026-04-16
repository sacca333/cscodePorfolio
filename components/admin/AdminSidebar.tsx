'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/projets', label: 'Projets', exact: false },
  { href: '/admin/messages', label: 'Messages', exact: false },
  { href: '/admin/parametres', label: 'Paramètres', exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: '#0a0a12',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '.65rem', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: '#6ee7b7', color: '#0a0a12',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.8rem', fontFamily: "'Syne', sans-serif", flexShrink: 0,
          }}>CS</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', color: '#e8e8f0' }}>
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '.75rem .6rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '.6rem .75rem', borderRadius: 8,
                textDecoration: 'none',
                color: active ? '#6ee7b7' : '#8888a0',
                background: active ? 'rgba(110,231,183,.1)' : 'transparent',
                fontSize: '.875rem', fontWeight: 500,
                transition: 'all .18s',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Lien site public */}
      <div style={{ padding: '.75rem .6rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '.65rem',
          padding: '.5rem .75rem', borderRadius: 8,
          textDecoration: 'none', color: '#8888a0', fontSize: '.8rem',
        }}>
          ↗ Voir le site
        </Link>
      </div>
    </aside>
  )
}