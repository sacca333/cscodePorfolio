import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'

export default async function Footer({ settings }: { settings: PortfolioData['settings'] }) {
    const t = await getTranslations('footer')
    return (
        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted">
            <p>
                © {new Date().getFullYear()} {settings?.fullName ?? 'Charles Sacca'}. {t('rights')}.
            </p>
            <a href="/admin/login" className="hover:text-ink">
                {t('admin')}
            </a>
        </footer>
    )
}