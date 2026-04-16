import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { settingsSchema, formatZodErrors } from '@/lib/validators'

export async function GET() {
  const data = await prisma.siteSettings.findFirst()
  return NextResponse.json({ data })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    console.log('ZOD ERRORS:', JSON.stringify(parsed.error.errors, null, 2))
    return NextResponse.json({ error: 'Données invalides.', fields: formatZodErrors(parsed.error) }, { status: 422 })
  }
  const existing = await prisma.siteSettings.findFirst()
  const settings = existing
    ? await prisma.siteSettings.update({ where: { id: existing.id }, data: parsed.data as any })
    : await prisma.siteSettings.create({ data: parsed.data as any })
  return NextResponse.json({ data: settings })
}
