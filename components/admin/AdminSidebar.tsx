'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true, icon: '▪' },
  { href: '/admin/projets', label: 'Projets', exact: false, icon: '▪' },
  { href: '/admin/messages', label: 'Messages', exact: false, icon: '▪' },
  { href: '/admin/parametres', label: 'Paramètres', exact: false, icon: '▪' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside style={{
      width: 220,
      minHeight: 'auto',
      height: '100vh',
      background: 'var(--admin-sidebar)',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,.07)',
      }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--admin-accent)',
            color: '#ffffff',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '.8rem',
            fontFamily: "'Syne', sans-serif",
            flexShrink: 0,
          }}>CS</div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: '.95rem',
            color: '#ffffff',
          }}>
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem .75rem', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '.65rem .875rem',
                borderRadius: 9,
                textDecoration: 'none',
                color: active ? '#ffffff' : 'rgba(255,255,255,.45)',
                background: active ? 'rgba(26,86,219,.35)' : 'transparent',
                fontSize: '.875rem',
                fontWeight: active ? 600 : 400,
                transition: 'all .18s',
                borderLeft: active ? '3px solid var(--admin-accent)' : '3px solid transparent',
                letterSpacing: active ? '-.01em' : 'normal',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Lien site public */}
      <div style={{ padding: '.75rem', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '.6rem',
          padding: '.55rem .875rem', borderRadius: 9,
          textDecoration: 'none',
          color: 'rgba(255,255,255,.35)',
          fontSize: '.8rem',
          transition: 'color .18s',
        }}>
          ↗ Voir le site
        </Link>
      </div>
    </aside>
  )
}
