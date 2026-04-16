// ==========================================================
//  __tests__/api/contact.test.ts
//  Tests complets de la route POST /api/contact
// ==========================================================

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import { POST, GET } from '@/app/api/contact/route'
import { prisma }    from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import * as rateLimit from '@/lib/rateLimit'

// ─── Helpers ───────────────────────────────────────────────

function makeRequest(body: unknown, ip = '127.0.0.1'): Request {
  return new Request('http://localhost:3000/api/contact', {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-forwarded-for': ip,
      'user-agent':      'Jest Test Runner',
    },
    body: JSON.stringify(body),
  })
}

const VALID_PAYLOAD = {
  name:    'Sophie Martin',
  email:   'sophie@startup.fr',
  subject: 'Projet SaaS B2B',
  message: 'Bonjour Charles, je cherche un développeur full-stack pour un projet SaaS.',
}

// ─── Mock du rate limiter ──────────────────────────────────

const mockContactLimit = jest.spyOn(rateLimit, 'contactLimit')

// ─── Tests ─────────────────────────────────────────────────

describe('POST /api/contact', () => {

  beforeEach(() => {
    // Par défaut : rate limit OK
    mockContactLimit.mockReturnValue({
      success:   true,
      limit:     3,
      remaining: 2,
      resetAt:   new Date(Date.now() + 3600000),
    })

    // DB mock
    ;(prisma.contactMessage.create as jest.Mock).mockResolvedValue({
      id:        'cuid-test-123',
      ...VALID_PAYLOAD,
      status:    'UNREAD',
      createdAt: new Date(),
    })
  })

  // ── Cas nominal ────────────────────────────────────────

  it('devrait enregistrer le message et envoyer les emails', async () => {
    const req = makeRequest(VALID_PAYLOAD)
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.id).toBe('cuid-test-123')
    expect(json.emailSent).toBe(true)
    expect(json.message).toContain('24')

    // Vérifier que Prisma a bien été appelé
    expect(prisma.contactMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name:    'Sophie Martin',
          email:   'sophie@startup.fr',
          subject: 'Projet SaaS B2B',
        }),
        select: { id: true },
      })
    )

    // Vérifier que l'email a été envoyé
    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        senderName:    'Sophie Martin',
        senderEmail:   'sophie@startup.fr',
        subject:       'Projet SaaS B2B',
      })
    )
  })

  it('devrait retourner les headers de rate limit', async () => {
    const req = makeRequest(VALID_PAYLOAD)
    const res = await POST(req as any)

    expect(res.headers.get('X-RateLimit-Limit')).toBe('3')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('2')
    expect(res.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  // ── Validation ─────────────────────────────────────────

  it('devrait rejeter un email invalide', async () => {
    const req = makeRequest({ ...VALID_PAYLOAD, email: 'pas-un-email' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.fields).toHaveProperty('email')
    expect(prisma.contactMessage.create).not.toHaveBeenCalled()
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('devrait rejeter un nom trop court', async () => {
    const req = makeRequest({ ...VALID_PAYLOAD, name: 'A' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(422)
    expect(json.fields).toHaveProperty('name')
  })

  it('devrait rejeter un message trop court', async () => {
    const req = makeRequest({ ...VALID_PAYLOAD, message: 'Bonjour' })
    const res = await POST(req as any)

    expect(res.status).toBe(422)
  })

  it('devrait rejeter un sujet manquant', async () => {
    const { subject: _, ...noSubject } = VALID_PAYLOAD
    const req = makeRequest(noSubject)
    const res = await POST(req as any)

    expect(res.status).toBe(422)
  })

  it('devrait normaliser l\'email en minuscules', async () => {
    const req = makeRequest({ ...VALID_PAYLOAD, email: 'SOPHIE@STARTUP.FR' })
    await POST(req as any)

    expect(prisma.contactMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'sophie@startup.fr' }),
      })
    )
  })

  it('devrait rejeter un JSON malformé', async () => {
    const req = new Request('http://localhost:3000/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    'pas du json {{{',
    })
    const res = await POST(req as any)

    expect(res.status).toBe(400)
    expect((await res.json()).error).toContain('JSON')
  })

  // ── Honeypot anti-bot ───────────────────────────────────

  it('devrait ignorer silencieusement les bots (honeypot rempli)', async () => {
    const req = makeRequest({ ...VALID_PAYLOAD, website: 'http://spam.com' })
    const res = await POST(req as any)

    // Répondre 200 mais ne rien faire
    expect(res.status).toBe(200)
    expect(prisma.contactMessage.create).not.toHaveBeenCalled()
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  // ── Rate limiting ───────────────────────────────────────

  it('devrait bloquer après dépassement du rate limit', async () => {
    mockContactLimit.mockReturnValue({
      success:   false,
      limit:     3,
      remaining: 0,
      resetAt:   new Date(Date.now() + 3600000),
    })

    const req = makeRequest(VALID_PAYLOAD)
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(429)
    expect(json.error).toContain('Trop de messages')
    expect(res.headers.get('Retry-After')).toBeTruthy()
    expect(prisma.contactMessage.create).not.toHaveBeenCalled()
  })

  it('devrait bloquer des IPs différentes indépendamment', async () => {
    // IP 1 → bloquée
    mockContactLimit
      .mockReturnValueOnce({
        success: false, limit: 3, remaining: 0, resetAt: new Date(Date.now() + 3600000)
      })
      // IP 2 → OK
      .mockReturnValueOnce({
        success: true, limit: 3, remaining: 2, resetAt: new Date(Date.now() + 3600000)
      })

    const res1 = await POST(makeRequest(VALID_PAYLOAD, '192.168.1.1') as any)
    const res2 = await POST(makeRequest(VALID_PAYLOAD, '10.0.0.2') as any)

    expect(res1.status).toBe(429)
    expect(res2.status).toBe(201)
  })

  // ── Erreurs serveur ─────────────────────────────────────

  it('devrait gérer une erreur de base de données', async () => {
    ;(prisma.contactMessage.create as jest.Mock).mockRejectedValue(
      new Error('ECONNREFUSED – PostgreSQL unavailable')
    )

    const req = makeRequest(VALID_PAYLOAD)
    const res = await POST(req as any)

    expect(res.status).toBe(500)
    // Ne pas exposer les détails de l'erreur interne
    expect((await res.json()).error).not.toContain('ECONNREFUSED')
  })

  it('devrait sauvegarder le message même si l\'email échoue', async () => {
    ;(sendContactEmail as jest.Mock).mockResolvedValue({
      success: false,
      error:   'SMTP connection timeout',
    })

    const req = makeRequest(VALID_PAYLOAD)
    const res = await POST(req as any)
    const json = await res.json()

    // Le message est bien enregistré
    expect(res.status).toBe(201)
    expect(json.success).toBe(true)
    expect(json.id).toBeDefined()
    // Mais on signale que l'email n'est pas parti
    expect(json.emailSent).toBe(false)
    expect(prisma.contactMessage.create).toHaveBeenCalledTimes(1)
  })

  // ── Méthode GET ─────────────────────────────────────────

  it('devrait rejeter les requêtes GET', async () => {
    const res = await GET()
    expect(res.status).toBe(405)
  })
})
