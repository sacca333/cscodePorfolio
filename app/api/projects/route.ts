// ==========================================================
//  app/api/projects/route.ts
//  GET  /api/projects  → liste publique (publiés)
//  POST /api/projects  → créer (admin)
// ==========================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'
import { ProjectStatus }             from '@prisma/client'
import { projectSchema, formatZodErrors } from '@/lib/validators'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session  = await getServerSession(authOptions)
  const isAdmin  = !!session?.user

  const status   = isAdmin
    ? (searchParams.get('status')?.toUpperCase() as ProjectStatus | undefined)
    : ProjectStatus.PUBLISHED

  const search = searchParams.get('q') || ''
  const page   = parseInt(searchParams.get('page')  || '1')
  const limit  = parseInt(searchParams.get('limit') || '10')
  const tech   = searchParams.get('tech')

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title:       { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(tech && {
      technologies: {
        some: { technology: { name: { contains: tech, mode: 'insensitive' as const } } },
      },
    }),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip:  (page - 1) * limit,
      take:  limit,
      include: {
        technologies: { include: { technology: { select: { id: true, name: true, icon: true, category: true } } } },
        categories:   { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.project.count({ where }),
  ])

  return NextResponse.json({
    data:       projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body   = await req.json()
  const parsed = projectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.', fields: formatZodErrors(parsed.error) }, { status: 422 })
  }

  const { technologyIds, categoryIds, ...projectData } = parsed.data

  const project = await prisma.project.create({
    data: {
      ...projectData,
      slug: projectData.slug ?? projectData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      ...(technologyIds?.length && {
        technologies: { create: technologyIds.map(id => ({ technologyId: id })) },
      }),
      ...(categoryIds?.length && {
        categories: { create: categoryIds.map(id => ({ categoryId: id })) },
      }),
    },
    include: {
      technologies: { include: { technology: true } },
      categories:   { include: { category: true } },
    },
  })

  return NextResponse.json({ data: project }, { status: 201 })
}
