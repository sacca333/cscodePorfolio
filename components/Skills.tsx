import { getTranslations } from 'next-intl/server'
import type { PortfolioData } from '@/lib/portfolio'
import Section from './Section'

export default async function Skills({ groups }: { groups: PortfolioData['skillGroups'] }) {
    const t = await getTranslations('skills')
    return (
        <Section id="skills" title={t('title')}>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((g) => (
                    <div key={g.id} className="border-t-2 border-accent pt-4">
                        <h3 className="mb-3 font-display text-lg font-bold">{g.name}</h3>
                        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-muted">
                            {g.items.map((i) => (
                                <li key={i.id}>{i.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Section>
    )
}