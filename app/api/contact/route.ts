// ==========================================================
//  app/api/contact/route.ts
//  POST /api/contact – Formulaire de contact public
//
//  Flux :
//    1. Rate limiting par IP
//    2. Validation Zod (+ honeypot anti-bot)
//    3. Sauvegarde en base de données (Prisma)
//    4. Envoi email (notification admin + confirmation expéditeur)
//    5. Log d'activité
// ==========================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma }           from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import { contactLimit }     from '@/lib/rateLimit'
import { contactSchema, formatZodErrors } from '@/lib/validators'
import { z } from 'zod'

// ─── Helpers ───────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ─── POST /api/contact ────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // ── 1. Rate limiting ──────────────────────────────────────
  const limit = contactLimit(ip)

  if (!limit.success) {
    return NextResponse.json(
      {
        error:   'Trop de messages envoyés. Veuillez réessayer dans une heure.',
        resetAt: limit.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit':     String(limit.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(limit.resetAt.getTime()),
          'Retry-After':           String(Math.ceil((limit.resetAt.getTime() - Date.now()) / 1000)),
        },
      }
    )
  }

  // ── 2. Parsing et validation ──────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Corps de la requête invalide (JSON attendu).' },
      { status: 400 }
    )
  }

  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides.', fields: formatZodErrors(parsed.error) },
      { status: 422 }
    )
  }

  const { name, email, subject, message, website } = parsed.data

  // ── Honeypot anti-bot ─────────────────────────────────────
  if (website) {
    // Répondre 200 pour ne pas alerter le bot, mais ne rien faire
    return NextResponse.json({ success: true }, { status: 200 })
  }

  // ── 3. Sauvegarde en base ─────────────────────────────────
  let savedMessage: { id: string }
  try {
    savedMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ip,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
      select: { id: true },
    })
  } catch (err) {
    console.error('[POST /api/contact] DB error:', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }

  // ── 4. Envoi des emails (non-bloquant en cas d'erreur) ────
  const emailResult = await sendContactEmail({
    senderName:  name,
    senderEmail: email,
    subject,
    message,
    receivedAt:  new Date(),
  })

  if (!emailResult.success) {
    // L'email a échoué mais le message est bien sauvegardé.
    // On ne bloque pas l'expéditeur pour autant.
    console.error('[POST /api/contact] Email error:', emailResult.error)
  }

  // ── 5. Log d'activité (optionnel, meilleures pratiques) ───
  // Note : pas de adminId ici (action publique) → on le skippe
  // ou on crée un log système sans référence admin

  // ── 6. Réponse ────────────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      message: 'Votre message a bien été envoyé. Je vous répondrai sous 24 à 48 heures.',
      id:      savedMessage.id,
      emailSent: emailResult.success,
    },
    {
      status: 201,
      headers: {
        'X-RateLimit-Limit':     String(limit.limit),
        'X-RateLimit-Remaining': String(limit.remaining),
        'X-RateLimit-Reset':     String(limit.resetAt.getTime()),
      },
    }
  )
}

// ─── GET /api/contact — non autorisé publiquement ─────────

export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée.' },
    { status: 405 }
  )
}
