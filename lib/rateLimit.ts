// ==========================================================
//  lib/rateLimit.ts
//  Rate limiter en mémoire (dev) ou Redis/Upstash (prod)
//  Remplace par @upstash/ratelimit pour la production
// ==========================================================

interface RateLimitEntry {
  count:    number
  resetAt:  number  // timestamp ms
}

// Store en mémoire (uniquement pour dev / serverless single-instance)
const store = new Map<string, RateLimitEntry>()

// Nettoyage des entrées expirées toutes les 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  success:   boolean
  limit:     number
  remaining: number
  resetAt:   Date
}

/**
 * Vérifie et incrémente le compteur pour une clé donnée.
 * @param key       Clé unique (ex: `contact:${ip}`)
 * @param limit     Nombre maximal de requêtes
 * @param windowMs  Fenêtre de temps en millisecondes
 */
export function rateLimit(
  key:      string,
  limit:    number,
  windowMs: number,
): RateLimitResult {
  const now     = Date.now()
  const entry   = store.get(key)
  const resetAt = entry ? entry.resetAt : now + windowMs

  // Fenêtre expirée → réinitialiser
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, limit, remaining: limit - 1, resetAt: new Date(now + windowMs) }
  }

  // Dans la fenêtre → incrémenter
  entry.count++

  if (entry.count > limit) {
    return { success: false, limit, remaining: 0, resetAt: new Date(resetAt) }
  }

  return { success: true, limit, remaining: limit - entry.count, resetAt: new Date(resetAt) }
}

// ─── Présets de limites ────────────────────────────────────

/** 3 messages de contact par heure et par IP */
export const contactLimit = (ip: string) =>
  rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)

/** 10 tentatives de connexion par 15 minutes et par IP */
export const loginLimit = (ip: string) =>
  rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)

/** 60 requêtes par minute pour l'API publique */
export const apiLimit = (ip: string) =>
  rateLimit(`api:${ip}`, 60, 60 * 1000)
