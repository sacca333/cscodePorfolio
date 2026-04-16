// ==========================================================
//  app/api/projects/[slug]/route.ts
// ==========================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }          from 'next-auth'
import { authOptions }               from '@/lib/auth'
import { prisma }                    from '@/lib/prisma'
import { projectUpdateSchema, formatZodErrors } from '@/lib/validators'

type Params = { params: { slug: string } }

const include = {
  technologies: { include: { technology: true } },
  categories:   { include: { category:   true } },
}

export async function GET(_req: NextRequest, { params }: Params) {
  const project = await prisma.project.findUnique({ where: { slug: params.slug }, include })
  if (!project) return NextResponse.json({ error: 'Projet introuvable.' }, { status: 404 })
  return NextResponse.json({ data: project })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body   = await req.json()
  const parsed = projectUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.', fields: formatZodErrors(parsed.error) }, { status: 422 })
  }

  const { technologyIds, categoryIds, ...projectData } = parsed.data

  const project = await prisma.project.update({
    where: { slug: params.slug },
    data: {
      ...projectData,
      ...(technologyIds && {
        technologies: { deleteMany: {}, create: technologyIds.map(id => ({ technologyId: id })) },
      }),
      ...(categoryIds && {
        categories: { deleteMany: {}, create: categoryIds.map(id => ({ categoryId: id })) },
      }),
    },
    include,
  })

  const adminRecord = await prisma.admin.findUnique({ where: { email: session.user.email! } })
  if (adminRecord && projectData.status) {
    await prisma.activityLog.create({
      data: {
        action:   `PROJECT_${projectData.status}`,
        entity:   'Project',
        entityId: project.id,
        adminId:  adminRecord.id,
      },
    })
  }

  return NextResponse.json({ data: project })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  await prisma.project.delete({ where: { slug: params.slug } })
  return NextResponse.json({ message: 'Projet supprimé.' })
}
