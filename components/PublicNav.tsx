'use client'
// ==========================================================
//  components/PublicNav.tsx
// ==========================================================

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      const sections = ['accueil', 'apropos', 'competences', 'projets', 'experience', 'contact']
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) current = id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '#apropos', label: 'À propos' },
    { href: '#competences', label: 'Compétences' },
    { href: '#projets', label: 'Projets' },
    { href: '#experience', label: 'Expérience' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: scrolled ? '.875rem 4rem' : '1.25rem 4rem',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-2)' : 'var(--border)'}`,
        background: 'rgba(10,10,15,0.82)',
        transition: 'padding .3s ease',
      }}>
        <a href="#accueil" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text)', textDecoration: 'none' }}>
          {'&lt;cscode/&gt;'}<span style={{ color: 'var(--accent)' }}></span>
        </a>

        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} style={{
                color: active === l.href.slice(1) ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none', fontSize: '.875rem', fontWeight: 500,
                transition: 'color .2s', position: 'relative',
              }}>
                {l.label}
                {active === l.href.slice(1) && (
                  <span style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 1, background: 'var(--accent)', borderRadius: 1 }} />
                )}
              </a>
            </li>
          ))}
        </ul>

        <a href="#contact" style={{
          background: 'var(--accent)', color: '#0a0a0f',
          padding: '.5rem 1.25rem', borderRadius: 'var(--radius-sm)',
          textDecoration: 'none', fontSize: '.85rem', fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}>
          Me contacter
        </a>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          nav ul, nav a:last-child { display: none !important; }
        }
      `}</style>
    </>
  )
}
