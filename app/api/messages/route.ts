// ==========================================================
//  app/api/messages/route.ts        GET  /api/messages
//  app/api/messages/[id]/route.ts   PATCH /api/messages/:id
// ==========================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/prisma'
import { MessageStatus }     from '@prisma/client'
import { messageUpdateSchema, formatZodErrors } from '@/lib/validators'

// ─── Middleware d'auth admin ───────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user
}

// ─── GET /api/messages ────────────────────────────────────

export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status  = searchParams.get('status') as MessageStatus | null
  const page    = parseInt(searchParams.get('page')  || '1')
  const limit   = parseInt(searchParams.get('limit') || '20')

  const where = status ? { status } : {}

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.contactMessage.count({ where }),
  ])

  return NextResponse.json({
    data:       messages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// ==========================================================
//  app/api/messages/[id]/route.ts
// ==========================================================

// ─── PATCH /api/messages/:id ──────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const body   = await req.json()
  const parsed = messageUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: formatZodErrors(parsed.error) },
      { status: 422 }
    )
  }

  const { status, repliedAt } = parsed.data

  // Si on marque comme "répondu", on enregistre la date
  const data: Record<string, unknown> = { status }
  if (status === MessageStatus.REPLIED) {
    data.repliedAt = repliedAt ?? new Date()
  }
  if (status === MessageStatus.ARCHIVED) {
    data.archivedAt = new Date()
  }

  const message = await prisma.contactMessage.update({
    where: { id: params.id },
    data,
  })

  // Log d'activité
  const adminRecord = await prisma.admin.findUnique({ where: { email: admin.email! } })
  if (adminRecord) {
    await prisma.activityLog.create({
      data: {
        action:   `MESSAGE_${status}`,
        entity:   'ContactMessage',
        entityId: params.id,
        adminId:  adminRecord.id,
      },
    })
  }

  return NextResponse.json({ data: message })
}

// ─── DELETE /api/messages/:id ─────────────────────────────

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  await prisma.contactMessage.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Message supprimé.' })
}
