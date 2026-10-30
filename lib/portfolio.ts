import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'

export async function getPortfolioData() {
    const [projects, skillGroups, experiences, settings] = await Promise.all([
        prisma.project.findMany({
            where: { status: ProjectStatus.PUBLISHED },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            include: { technologies: { include: { technology: { select: { name: true } } } } },
        }),
        prisma.skillGroup.findMany({
            orderBy: { order: 'asc' },
            include: { items: { orderBy: { order: 'asc' } } },
        }),
        prisma.experience.findMany({ orderBy: [{ current: 'desc' }, { order: 'asc' }] }),
        prisma.siteSettings.findFirst(),
    ])
    return { projects, skillGroups, experiences, settings }
}

export type PortfolioData = Awaited<ReturnType<typeof getPortfolioData>>