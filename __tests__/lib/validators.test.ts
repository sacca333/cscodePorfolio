// ==========================================================
//  __tests__/lib/validators.test.ts
// ==========================================================

import { describe, it, expect } from '@jest/globals'
import {
  contactSchema,
  projectSchema,
  messageUpdateSchema,
  settingsSchema,
  formatZodErrors,
} from '@/lib/validators'

describe('contactSchema', () => {

  const valid = {
    name:    'Jean Dupont',
    email:   'jean@exemple.fr',
    subject: 'Collaboration freelance',
    message: 'Bonjour, je souhaite vous proposer une mission de développement.',
  }

  it('accepte un payload valide', () => {
    const result = contactSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('normalise l email en minuscules', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'JEAN@EXEMPLE.FR' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('jean@exemple.fr')
  })

  it('trim les espaces', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Jean Dupont  ' })
    if (result.success) expect(result.data.name).toBe('Jean Dupont')
  })

  it('rejette un email invalide', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'pas-un-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = formatZodErrors(result.error)
      expect(fields.email).toBeDefined()
    }
  })

  it('rejette un nom trop court', () => {
    expect(contactSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false)
  })

  it('rejette un nom trop long', () => {
    expect(contactSchema.safeParse({ ...valid, name: 'A'.repeat(101) }).success).toBe(false)
  })

  it('rejette un message trop court', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'Salut!' }).success).toBe(false)
  })

  it('rejette un message trop long', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'A'.repeat(5001) }).success).toBe(false)
  })

  it('bloque le honeypot si rempli', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'http://spam.com' }).success).toBe(false)
  })

  it('accepte le honeypot vide ou absent', () => {
    expect(contactSchema.safeParse({ ...valid, website: '' }).success).toBe(true)
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })
})

describe('projectSchema', () => {

  const valid = {
    title:       'Mon Projet',
    description: 'Une description suffisamment longue pour passer la validation.',
  }

  it('accepte un projet minimal avec statut DRAFT par défaut', () => {
    const result = projectSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('DRAFT')
  })

  it('rejette un slug avec espaces ou majuscules', () => {
    expect(projectSchema.safeParse({ ...valid, slug: 'Mon Projet' }).success).toBe(false)
    expect(projectSchema.safeParse({ ...valid, slug: 'MonProjet' }).success).toBe(false)
  })

  it('accepte un slug correct', () => {
    expect(projectSchema.safeParse({ ...valid, slug: 'mon-projet-2024' }).success).toBe(true)
  })

  it('rejette une URL invalide', () => {
    expect(projectSchema.safeParse({ ...valid, demoUrl: 'pas-une-url' }).success).toBe(false)
  })

  it('accepte un demoUrl vide', () => {
    expect(projectSchema.safeParse({ ...valid, demoUrl: '' }).success).toBe(true)
  })
})

describe('messageUpdateSchema', () => {

  it('accepte tous les statuts valides', () => {
    const statuses = ['UNREAD', 'READ', 'REPLIED', 'ARCHIVED', 'SPAM'] as const
    statuses.forEach(status => {
      expect(messageUpdateSchema.safeParse({ status }).success).toBe(true)
    })
  })

  it('rejette un statut inconnu', () => {
    expect(messageUpdateSchema.safeParse({ status: 'DELETED' }).success).toBe(false)
  })

  it('parse repliedAt comme Date', () => {
    const result = messageUpdateSchema.safeParse({
      status: 'REPLIED',
      repliedAt: '2025-01-15T10:30:00Z',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.repliedAt).toBeInstanceOf(Date)
  })
})

describe('settingsSchema', () => {

  it('accepte un objet vide (tous les champs optionnels)', () => {
    expect(settingsSchema.safeParse({}).success).toBe(true)
  })

  it('rejette un email invalide', () => {
    expect(settingsSchema.safeParse({ email: 'invalide' }).success).toBe(false)
  })

  it('rejette une URL sans https://', () => {
    expect(settingsSchema.safeParse({ githubUrl: 'github.com/charles' }).success).toBe(false)
  })

  it('accepte une URL complète', () => {
    expect(settingsSchema.safeParse({ githubUrl: 'https://github.com/charlessacca' }).success).toBe(true)
  })
})

describe('formatZodErrors', () => {

  it('retourne un objet clé->message', () => {
    const result = contactSchema.safeParse({
      name: '', email: 'invalide', subject: 'ok', message: 'court',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = formatZodErrors(result.error)
      expect(typeof fields).toBe('object')
      expect(fields.email).toBeDefined()
    }
  })
})
