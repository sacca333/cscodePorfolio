import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'
import Section from './Section'

export default async function Experience({
    experiences,
    locale,
}: {
    experiences: PortfolioData['experiences']
    locale: string
}) {
    const t = await getTranslations('experience')
    const fmt = (d: Date) => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(d))

    return (
        <Section id="experience" title={t('title')}>
            <ol className="space-y-10">
                {experiences.map((e) => (
                    <li key={e.id} className="grid gap-2 md:grid-cols-[11rem_1fr] md:gap-10">
                        <p className="text-sm text-muted">
                            {fmt(e.startDate)} – {e.current ? t('present') : e.endDate ? fmt(e.endDate) : ''}
                        </p>
                        <div>
                            <h3 className="font-display text-xl font-bold">{e.role}</h3>
                            <p className="mt-0.5 font-medium text-accent">
                                {e.company}
                                {e.location ? `, ${e.location}` : ''}
                            </p>
                            <p className="mt-3 max-w-prose leading-relaxed text-muted">{e.description}</p>
                            {e.techStack.length > 0 && <p className="mt-3 text-sm text-muted">{e.techStack.join(', ')}</p>}
                        </div>
                    </li>
                ))}
            </ol>
        </Section>
    )
}