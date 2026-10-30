import type { Metadata } from 'next'
import { Bricolage_Grotesque, Source_Sans_3 } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import Providers from '@/components/Providers'
import './portfolio.css'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' })
const body = Source_Sans_3({ subsets: ['latin'], variable: '--font-body' })

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'meta' })
    return {
        title: t('title'),
        description: t('description'),
        alternates: { languages: { en: '/en', fr: '/fr' } },
    }
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params
    if (!routing.locales.includes(locale as 'en' | 'fr')) notFound()
    setRequestLocale(locale)
    const messages = await getMessages()

    return (
        <div className={`${display.variable} ${body.variable} min-h-screen font-sans antialiased`}>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <Providers locale={locale}>{children}</Providers>
            </NextIntlClientProvider>
        </div>
    )
}