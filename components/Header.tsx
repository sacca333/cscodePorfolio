'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'

const links = ['about', 'skills', 'projects', 'experience', 'contact'] as const

export default function Header() {
    const t = useTranslations('nav')
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
                <a href="#top" className="font-display text-lg font-bold tracking-tight">
                    CS
                </a>

                <nav aria-label="Main" className="hidden gap-6 text-sm text-muted md:flex">
                    {links.map((id) => (
                        <a key={id} href={`#${id}`} className="hover:text-ink">
                            {t(id)}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <LangSwitch />
                    <ThemeToggle />
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        aria-label={t('menu')}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-ink md:hidden"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <div id="mobile-nav" role="navigation" aria-label="Main" className="block border-t border-line bg-bg px-6 pb-3 md:hidden">
                    {links.map((id) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            onClick={() => setOpen(false)}
                            className="block border-b border-line py-3 text-lg text-ink last:border-b-0"
                        >
                            {t(id)}
                        </a>
                    ))}
                </div>
            )}
        </header>
    )
}