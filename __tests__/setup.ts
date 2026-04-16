// ==========================================================
//  __tests__/setup.ts
//  Configuration globale Jest – mocks et variables d'env
// ==========================================================

import { jest } from '@jest/globals'

// ─── Variables d'environnement de test ────────────────────
process.env.NODE_ENV          = 'test'
process.env.DATABASE_URL      = 'postgresql://test:test@localhost:5432/portfolio_test'
process.env.NEXTAUTH_SECRET   = 'test-secret-32-chars-minimum-ok!!'
process.env.NEXTAUTH_URL      = 'http://localhost:3000'
process.env.ADMIN_EMAIL       = 'charles@charlessacca.dev'
process.env.EMAIL_PROVIDER    = 'smtp'
process.env.SMTP_HOST         = 'smtp.test.com'
process.env.SMTP_PORT         = '587'
process.env.SMTP_USER         = 'test@test.com'
process.env.SMTP_PASS         = 'test-password'
process.env.SMTP_FROM         = 'Charles Sacca <test@charlessacca.dev>'

// ─── Mock Prisma Client ───────────────────────────────────
jest.mock('@/lib/prisma', () => ({
  prisma: {
    contactMessage: {
      create:    jest.fn(),
      findMany:  jest.fn(),
      findUnique:jest.fn(),
      count:     jest.fn(),
      update:    jest.fn(),
      delete:    jest.fn(),
      groupBy:   jest.fn(),
    },
    project: {
      create:    jest.fn(),
      findMany:  jest.fn(),
      findUnique:jest.fn(),
      count:     jest.fn(),
      update:    jest.fn(),
      delete:    jest.fn(),
      groupBy:   jest.fn(),
    },
    admin: {
      findUnique: jest.fn(),
    },
    activityLog: {
      create:  jest.fn(),
      findMany:jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

// ─── Mock Next-Auth ───────────────────────────────────────
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// ─── Mock du service email ────────────────────────────────
jest.mock('@/lib/email', () => ({
  sendContactEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'mock-message-id-123',
  }),
  verifySmtpConnection: jest.fn().mockResolvedValue(true),
}))

// ─── Mock nodemailer ──────────────────────────────────────
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
    verify:   jest.fn().mockResolvedValue(true),
  })),
}))

// ─── Réinitialisation entre chaque test ───────────────────
afterEach(() => {
  jest.clearAllMocks()
})
