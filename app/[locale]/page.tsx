import { setRequestLocale } from 'next-intl/server'
import { getPortfolioData } from '@/lib/portfolio'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const { projects, skillGroups, experiences, settings } = await getPortfolioData()

    const firstYear = Math.min(...experiences.map((e) => new Date(e.startDate).getFullYear()))
    const years = Number.isFinite(firstYear) ? new Date().getFullYear() - firstYear : 0

    return (
        <>
            <Header />
            <main>
                <Hero settings={settings} years={years} />
                <About />
                <Skills groups={skillGroups} />
                <Projects projects={projects} />
                <Experience experiences={experiences} locale={locale} />
                <ContactSection settings={settings} />
            </main>
            <Footer settings={settings} />
        </>
    )
}