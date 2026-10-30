import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'
import Section from './Section'

export default async function Projects({ projects }: { projects: PortfolioData['projects'] }) {
    const t = await getTranslations('projects')
    return (
        <Section id="projects" title={t('title')} tinted>
            <div className="divide-y divide-line border-y border-line">
                {projects.map((p) => (
                    <article key={p.id} className="grid gap-6 py-8 md:grid-cols-[18rem_1fr] md:gap-10">
                        <div className="aspect-[16/10] overflow-hidden rounded-md border border-line bg-bg">
                            {p.thumbnail && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                            {p.subtitle && <p className="mt-1 font-medium text-accent">{p.subtitle}</p>}
                            <p className="mt-3 max-w-prose leading-relaxed text-muted">{p.description}</p>
                            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                                {p.technologies.slice(0, 6).map((pt) => (
                                    <li key={pt.technology.name}>{pt.technology.name}</li>
                                ))}
                            </ul>
                            <div className="mt-5 flex gap-5 text-sm font-semibold">
                                {p.demoUrl && (
                                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
                                        {t('demo')}
                                    </a>
                                )}
                                {p.githubUrl && (
                                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                                        {t('code')}
                                    </a>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </Section>
    )
}