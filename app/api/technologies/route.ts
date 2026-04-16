// ==========================================================
//  app/api/technologies/route.ts
// ==========================================================

import { NextResponse }    from 'next/server'
import { prisma }          from '@/lib/prisma'

export async function GET() {
  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ data: technologies })
}


// ==========================================================
//  app/api/categories/route.ts
// ==========================================================

export async function GET_categories() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ data: categories })
}


// ==========================================================
//  app/api/skills/route.ts
//  GET /api/skills → groupes + items pour la page publique
// ==========================================================

export async function GET_skills() {
  const groups = await prisma.skillGroup.findMany({
    orderBy: { order: 'asc' },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { technology: { select: { name: true, icon: true } } },
      },
    },
  })
  return NextResponse.json({ data: groups })
}


// ==========================================================
//  app/api/experiences/route.ts
//  GET /api/experiences → liste publique triée
// ==========================================================

export async function GET_experiences() {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ current: 'desc' }, { order: 'asc' }],
  })
  return NextResponse.json({ data: experiences })
}


// ==========================================================
//  app/api/settings/route.ts
//  GET   /api/settings → paramètres du site
//  PATCH /api/settings → mettre à jour (admin)
// ==========================================================

import { NextRequest }   from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }   from '@/lib/auth'
import { settingsSchema, formatZodErrors } from '@/lib/validators'

export async function GET_settings() {
  const settings = await prisma.siteSettings.findFirst()
  return NextResponse.json({ data: settings })
}

export async function PATCH_settings(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body   = await req.json()
  const parsed = settingsSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.', fields: formatZodErrors(parsed.error) }, { status: 422 })
  }

  const existing = await prisma.siteSettings.findFirst()

  const settings = existing
    ? await prisma.siteSettings.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.siteSettings.create({ data: parsed.data as Parameters<typeof prisma.siteSettings.create>[0]['data'] })

  return NextResponse.json({ data: settings })
}
