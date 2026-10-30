import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'
import ContactForm from '@/components/ContactForm'
import Section from './Section'

export default async function ContactSection({ settings }: { settings: PortfolioData['settings'] }) {
    const t = await getTranslations('contact')
    const email = settings?.email ?? 'contact@charlessacca.dev'
    const links = [
        settings?.githubUrl && { label: 'GitHub', href: settings.githubUrl },
        settings?.linkedinUrl && { label: 'LinkedIn', href: settings.linkedinUrl },
        { label: email, href: `mailto:${email}` },
    ].filter(Boolean) as { label: string; href: string }[]

    return (
        <Section id="contact" title={t('title')} tinted>
            <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
                <div>
                    <p className="max-w-prose text-lg leading-relaxed text-muted">{t('text')}</p>
                    <ul className="mt-8 space-y-3">
                        {links.map((l) => (
                            <li key={l.href}>
                                <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <ContactForm />
            </div>
        </Section>
    )
}