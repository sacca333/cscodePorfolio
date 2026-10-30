import { getTranslations } from 'next-intl/server'
import Section from './Section'

export default async function About() {
    const t = await getTranslations('about')
    return (
        <Section id="about" title={t('title')} tinted>
            <div className="grid gap-10 md:grid-cols-[1fr_20rem]">
                <div className="max-w-prose space-y-4 text-lg leading-relaxed text-muted">
                    <p>{t('p1')}</p>
                    <p>{t('p2')}</p>
                </div>
                <dl className="space-y-3 text-sm">
                    {(['location', 'remote', 'languages'] as const).map((k) => (
                        <div key={k} className="border-t border-line pt-3">
                            {t(k)}
                        </div>
                    ))}
                </dl>
            </div>
        </Section>
    )
}