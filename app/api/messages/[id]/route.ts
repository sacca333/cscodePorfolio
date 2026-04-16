// ==========================================================
//  app/api/messages/[id]/route.ts
//  PATCH  /api/messages/:id  → changer le statut
//  DELETE /api/messages/:id  → supprimer
// ==========================================================

import { NextRequest, NextResponse }  from 'next/server'
import { getServerSession }           from 'next-auth'
import { authOptions }                from '@/lib/auth'
import { prisma }                     from '@/lib/prisma'
import { MessageStatus }              from '@prisma/client'
import { messageUpdateSchema, formatZodErrors } from '@/lib/validators'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  const body   = await req.json()
  const parsed = messageUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: formatZodErrors(parsed.error) },
      { status: 422 }
    )
  }

  const { status, repliedAt } = parsed.data
  const data: Record<string, unknown> = { status }

  if (status === MessageStatus.REPLIED)  data.repliedAt  = repliedAt ?? new Date()
  if (status === MessageStatus.ARCHIVED) data.archivedAt = new Date()

  const message = await prisma.contactMessage.update({
    where: { id: params.id },
    data,
  })

  const adminRecord = await prisma.admin.findUnique({ where: { email: admin.email! } })
  if (adminRecord) {
    await prisma.activityLog.create({
      data: { action: `MESSAGE_${status}`, entity: 'ContactMessage', entityId: params.id, adminId: adminRecord.id },
    })
  }

  return NextResponse.json({ data: message })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })

  await prisma.contactMessage.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Message supprimé.' })
}
