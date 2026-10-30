import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'
import LocalClock from './LocalClock'

export default async function Hero({ settings, years }: { settings: PortfolioData['settings']; years: number }) {
    const t = await getTranslations('hero')
    const name = settings?.fullName ?? 'Charles Sacca'
    const available = settings?.available ?? true
    const btn = 'rounded-md px-5 py-3 font-semibold'

    return (
        <section id="top" className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-36 md:grid-cols-[1fr_auto] md:items-end">
            <div>
                {available && (
                    <p className="mb-6 flex items-center gap-2 text-sm text-muted">
                        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                        {t('available')}
                    </p>
                )}
                <h1 className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight md:text-8xl">{name}</h1>
                <p className="mt-4 font-display text-2xl text-muted md:text-3xl">{t('role')}</p>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t('tagline')}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <a href="#projects" className={`${btn} bg-accent text-accent-ink`}>
                        {t('seeProjects')}
                    </a>
                    <a href="#contact" className={`${btn} border border-line hover:border-ink`}>
                        {t('contact')}
                    </a>
                    {settings?.cvUrl && (
                        <a href={settings.cvUrl} download className={`${btn} border border-line hover:border-ink`}>
                            {t('cv')}
                        </a>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
                {settings?.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={settings.avatarUrl}
                        alt={name}
                        className="h-40 w-40 rounded-full border border-line object-cover object-top md:h-56 md:w-56"
                    />
                )}
                <LocalClock label={t('localTime')} />
                {years > 0 && <p className="text-sm text-muted">{t('years', { count: years })}</p>}
            </div>
        </section>
    )
}