# Portfolio Charles Sacca — Guide complet

Stack : **Next.js 14** · **TypeScript** · **Prisma ORM** · **PostgreSQL** · **NextAuth.js**

---

## Démarrage rapide (développement local)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier et remplir les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec votre DATABASE_URL PostgreSQL

# 3. Générer le client Prisma
npm run db:generate

# 4. Appliquer le schéma en base
npm run db:push

# 5. Remplir avec les données initiales
npm run db:seed

# 6. Lancer le serveur
npm run dev
```

Portfolio public → http://localhost:3000
Dashboard admin → http://localhost:3000/admin

---

## Structure du projet

```
portfolio-charles-sacca/
├── app/
│   ├── layout.tsx              ← Layout racine (métadonnées, polices)
│   ├── globals.css             ← Styles globaux
│   ├── page.tsx                ← Page publique (Server Component)
│   ├── admin/
│   │   ├── layout.tsx          ← Shell admin (sidebar + topbar + auth)
│   │   ├── page.tsx            ← Dashboard home (KPIs, activité)
│   │   ├── login/page.tsx      ← Page de connexion
│   │   ├── projets/            ← Gestion des projets (liste + formulaire)
│   │   ├── messages/           ← Gestion des messages de contact
│   │   └── parametres/         ← Paramètres du site
│   └── api/
│       ├── auth/[...nextauth]/ ← NextAuth handler
│       ├── contact/            ← POST /api/contact
│       ├── projects/           ← CRUD projets
│       ├── messages/           ← CRUD messages (admin)
│       ├── technologies/       ← GET technologies
│       ├── categories/         ← GET catégories
│       ├── skills/             ← GET compétences
│       ├── experiences/        ← GET expériences
│       └── settings/           ← GET/PATCH paramètres
├── components/
│   ├── PublicNav.tsx           ← Navigation publique
│   ├── ContactForm.tsx         ← Formulaire de contact (Client)
│   └── admin/
│       ├── AdminSidebar.tsx    ← Sidebar admin (repliable)
│       └── AdminTopbar.tsx     ← Topbar admin + déconnexion
├── lib/
│   ├── prisma.ts               ← Client Prisma singleton
│   ├── auth.ts                 ← Config NextAuth
│   ├── email.ts                ← Service email (SMTP / Resend)
│   ├── rateLimit.ts            ← Rate limiting par IP
│   └── validators.ts           ← Schémas Zod partagés
├── prisma/
│   ├── schema.prisma           ← Modèles de données (15 modèles)
│   └── seed.ts                 ← Données initiales
├── __tests__/                  ← Tests Jest (~35 tests)
├── middleware.ts               ← Protection routes /admin/*
├── next.config.js
├── tsconfig.json
└── .env.example
```

---

## Commandes utiles

```bash
npm run dev              # Serveur de développement (http://localhost:3000)
npm run build            # Build production (migrate + build)
npm run test             # Lancer les tests
npm run test:coverage    # Tests avec rapport de couverture
npm run db:studio        # Interface graphique Prisma (http://localhost:5555)
npm run db:migrate       # Créer une migration
npm run db:seed          # Remplir la base de données
npm run db:reset         # Réinitialiser la base + re-seed
npm run type-check       # Vérification TypeScript
```

---

## Déploiement en production

### 1. PostgreSQL — Railway
- Créer un projet sur railway.app → Add PostgreSQL
- Copier la `DATABASE_URL` dans les variables Vercel

### 2. Application — Vercel
```bash
# Connecter le repo GitHub à Vercel
# Ajouter les variables d'environnement dans Vercel Dashboard :
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://charlessacca.dev
NEXTAUTH_SECRET=<openssl rand -base64 32>
ADMIN_EMAIL=charles@charlessacca.dev
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxx
SMTP_FROM=Charles Sacca <noreply@charlessacca.dev>
```

Le script `build` inclut `prisma migrate deploy` — les migrations sont appliquées automatiquement à chaque déploiement.

### 3. Domaine personnalisé
Dans Vercel → Settings → Domains → ajouter `charlessacca.dev`
Configurer les DNS chez votre registrar :
- `A` record : `@` → `76.76.21.21`
- `CNAME` : `www` → `cname.vercel-dns.com`

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds)
- Routes `/admin/*` protégées par middleware Next.js (NextAuth JWT)
- Validation des entrées avec **Zod** côté serveur
- Rate limiting sur `/api/contact` (3 messages/heure/IP)
- Honeypot anti-bot dans le formulaire de contact
- Variables sensibles uniquement dans `.env.local` (jamais commitées)
- HTTPS automatique via Vercel (Let's Encrypt)
