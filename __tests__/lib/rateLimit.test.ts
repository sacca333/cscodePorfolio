// ==========================================================
//  __tests__/lib/rateLimit.test.ts
// ==========================================================

import { describe, it, expect } from '@jest/globals'
import { rateLimit, contactLimit, loginLimit } from '@/lib/rateLimit'

describe('rateLimit', () => {

  it('autorise la première requête', () => {
    const result = rateLimit(`test:${Date.now()}-a`, 3, 60000)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
    expect(result.limit).toBe(3)
  })

  it('compte correctement les requêtes successives', () => {
    const key = `test:${Date.now()}-seq`
    const r1 = rateLimit(key, 3, 60000)
    const r2 = rateLimit(key, 3, 60000)
    const r3 = rateLimit(key, 3, 60000)

    expect(r1.remaining).toBe(2)
    expect(r2.remaining).toBe(1)
    expect(r3.remaining).toBe(0)
    expect(r3.success).toBe(true)
  })

  it('bloque après dépassement de la limite', () => {
    const key = `test:${Date.now()}-block`
    rateLimit(key, 2, 60000)
    rateLimit(key, 2, 60000)
    const result = rateLimit(key, 2, 60000) // 3ème requête → bloqué

    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('utilise des compteurs séparés par clé', () => {
    const key1 = `test:${Date.now()}-x`
    const key2 = `test:${Date.now()}-y`

    rateLimit(key1, 1, 60000)
    const blocked = rateLimit(key1, 1, 60000)
    const allowed = rateLimit(key2, 1, 60000)

    expect(blocked.success).toBe(false)
    expect(allowed.success).toBe(true)
  })

  it('fournit une date de reset dans le futur', () => {
    const result = rateLimit(`test:${Date.now()}-reset`, 5, 60000)
    expect(result.resetAt).toBeInstanceOf(Date)
    expect(result.resetAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('contactLimit limite à 3 requêtes par heure', () => {
    const ip = `192.168.${Date.now()}.1`
    const r1 = contactLimit(ip)
    const r2 = contactLimit(ip)
    const r3 = contactLimit(ip)
    const r4 = contactLimit(ip)

    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
    expect(r3.success).toBe(true)
    expect(r4.success).toBe(false)
    expect(r1.limit).toBe(3)
  })

  it('loginLimit limite à 10 tentatives par 15 minutes', () => {
    const ip = `10.${Date.now() % 255}.0.1`
    for (let i = 0; i < 10; i++) loginLimit(ip)
    const blocked = loginLimit(ip)

    expect(blocked.success).toBe(false)
    expect(blocked.limit).toBe(10)
  })
})


// ==========================================================
//  __tests__/lib/email.test.ts
// ==========================================================

import { describe as describeEmail, it as itEmail, expect as expectEmail, jest as jestEmail, beforeEach as beforeEachEmail } from '@jest/globals'
import nodemailer from 'nodemailer'

// On importe le vrai module (pas le mock de setup.ts) pour ces tests
jest.unmock('@/lib/email')
import { sendContactEmail, verifySmtpConnection } from '@/lib/email'

const PAYLOAD = {
  senderName:    'Marie Curie',
  senderEmail:   'marie@curie.fr',
  subject:       'Projet de collaboration',
  message:       'Bonjour, je souhaite discuter d un projet web full-stack.',
  receivedAt:    new Date('2025-03-01T10:00:00Z'),
}

describeEmail('sendContactEmail (SMTP)', () => {

  beforeEachEmail(() => {
    process.env.EMAIL_PROVIDER = 'smtp'
  })

  itEmail('envoie deux emails (notification + confirmation)', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id-123' })
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
      verify:   jest.fn().mockResolvedValue(true),
    })

    const result = await sendContactEmail(PAYLOAD)

    expectEmail(result.success).toBe(true)
    expectEmail(mockSendMail).toHaveBeenCalledTimes(2)

    // 1er email → admin
    const firstCall = (mockSendMail.mock.calls[0] as any[])[0]
    expectEmail(firstCall.to).toBe(process.env.ADMIN_EMAIL)
    expectEmail(firstCall.replyTo).toBe('marie@curie.fr')
    expectEmail(firstCall.subject).toContain('Projet de collaboration')
    expectEmail(firstCall.html).toContain('Marie Curie')

    // 2ème email → expéditeur
    const secondCall = (mockSendMail.mock.calls[1] as any[])[0]
    expectEmail(secondCall.to).toBe('marie@curie.fr')
    expectEmail(secondCall.subject).toContain('reçu')
  })

  itEmail('retourne le messageId en cas de succès', async () => {
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: '<msg-abc@smtp>' }),
      verify:   jest.fn(),
    })

    const result = await sendContactEmail(PAYLOAD)
    expectEmail(result.messageId).toBe('<msg-abc@smtp>')
  })

  itEmail('retourne success:false si SMTP échoue', async () => {
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
      verify:   jest.fn(),
    })

    const result = await sendContactEmail(PAYLOAD)
    expectEmail(result.success).toBe(false)
    expectEmail(result.error).toBeDefined()
    // Ne pas exposer le détail interne
    expectEmail(result.error).not.toContain('at Object')
  })

  itEmail('échappe le HTML dans le corps du message', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'x' })
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail, verify: jest.fn(),
    })

    await sendContactEmail({
      ...PAYLOAD,
      message: '<script>alert("xss")</script>',
    })

    const firstCall = (mockSendMail.mock.calls[0] as any[])[0]
    expectEmail(firstCall.html).not.toContain('<script>')
    expectEmail(firstCall.html).toContain('&lt;script&gt;')
  })
})

describeEmail('verifySmtpConnection', () => {

  itEmail('retourne true si la connexion est OK', async () => {
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      verify: jest.fn().mockResolvedValue(true),
    })
    const ok = await verifySmtpConnection()
    expectEmail(ok).toBe(true)
  })

  itEmail('retourne false si la connexion échoue', async () => {
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      verify: jest.fn().mockRejectedValue(new Error('Connection refused')),
    })
    const ok = await verifySmtpConnection()
    expectEmail(ok).toBe(false)
  })
})
