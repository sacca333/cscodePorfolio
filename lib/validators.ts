// ==========================================================
//  lib/validators.ts
//  Schémas Zod partagés entre les routes API et les tests
// ==========================================================

import { z } from 'zod'
import { ProjectStatus, MessageStatus, SkillLevel, ExperienceType } from '@prisma/client'

// ─── Contact ───────────────────────────────────────────────

export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Le nom est requis' })
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),

  email: z
    .string({ required_error: "L'email est requis" })
    .email("L'adresse email est invalide")
    .max(254, 'Email trop long')
    .toLowerCase()
    .trim(),

  subject: z
    .string({ required_error: 'Le sujet est requis' })
    .min(3, 'Le sujet doit contenir au moins 3 caractères')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
    .trim(),

  message: z
    .string({ required_error: 'Le message est requis' })
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(5000, 'Le message ne peut pas dépasser 5000 caractères')
    .trim(),

  // Honeypot anti-bot (champ caché, doit être vide)
  website: z.string().max(0, 'Bot detected').optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

// ─── Projet ────────────────────────────────────────────────

export const projectSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
    .optional(),

  title: z.string().min(2).max(200).trim(),
  subtitle: z.string().max(300).trim().optional(),
  description: z.string().min(10).max(1000).trim(),
  content: z.string().max(50000).optional(),

  status: z.nativeEnum(ProjectStatus).default('DRAFT'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),

  thumbnail: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  caseStudyUrl: z.string().url().optional().or(z.literal('')),

  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  technologyIds: z.array(z.string().cuid()).optional(),
  categoryIds: z.array(z.string().cuid()).optional(),
})

export const projectUpdateSchema = projectSchema.partial()

export type ProjectInput = z.infer<typeof projectSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>

// ─── Message de contact (admin) ────────────────────────────

export const messageUpdateSchema = z.object({
  status: z.nativeEnum(MessageStatus),
  repliedAt: z.coerce.date().optional(),
})

export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>

// ─── Compétence ────────────────────────────────────────────

export const skillItemSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  level: z.nativeEnum(SkillLevel).default('INTERMEDIATE'),
  order: z.number().int().min(0).default(0),
  yearsOfExp: z.number().int().min(0).max(50).optional(),
  highlighted: z.boolean().default(false),
  groupId: z.string().cuid(),
  technologyId: z.string().cuid().optional(),
})

export type SkillItemInput = z.infer<typeof skillItemSchema>

// ─── Expérience ────────────────────────────────────────────

export const experienceSchema = z.object({
  role: z.string().min(2).max(200).trim(),
  company: z.string().min(1).max(200).trim(),
  location: z.string().max(200).trim().optional(),
  type: z.nativeEnum(ExperienceType).default('FULLTIME'),
  description: z.string().min(5).max(1000).trim(),
  missions: z.array(z.string().min(3).max(500)).min(1).max(20),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  current: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  techStack: z.array(z.string()).max(20),
  companyUrl: z.string().url().optional().or(z.literal('')),
})

export type ExperienceInput = z.infer<typeof experienceSchema>

// ─── Paramètres du site ────────────────────────────────────

export const settingsSchema = z.object({
  siteTitle: z.string().max(100).trim().optional().nullable(),
  siteTagline: z.string().max(200).trim().optional().nullable(),
  siteDescription: z.string().max(500).trim().optional().nullable(),
  fullName: z.string().max(100).trim().optional().nullable(),
  bio: z.string().max(1000).trim().optional().nullable(),
  location: z.string().max(200).trim().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().max(50).trim().optional().nullable(),
  available: z.boolean().optional().nullable(),
  cvUrl: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  googleAnalyticsId: z.string().max(20).trim().optional().nullable(),
})

export type SettingsInput = z.infer<typeof settingsSchema>

// ─── Helpers ───────────────────────────────────────────────

/**
 * Formate les erreurs Zod en objet lisible
 */
export function formatZodErrors(
  errors: z.ZodError
): Record<string, string> {
  return Object.fromEntries(
    errors.errors.map(e => [e.path.join('.'), e.message])
  )
}
