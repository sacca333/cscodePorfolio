// ==========================================================
//  SEED – Données initiales du portfolio
//  Commande : npx prisma db seed
// ==========================================================

import { PrismaClient, ProjectStatus, TechCategory, SkillLevel,
         ExperienceType, ArticleStatus, MessageStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  // ─── NETTOYAGE (ordre inverse des dépendances) ─────────────
  await prisma.activityLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.articleTag.deleteMany()
  await prisma.article.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.projectTechnology.deleteMany()
  await prisma.projectCategory.deleteMany()
  await prisma.project.deleteMany()
  await prisma.skillItem.deleteMany()
  await prisma.skillGroup.deleteMany()
  await prisma.technology.deleteMany()
  await prisma.category.deleteMany()
  await prisma.experience.deleteMany()
  await prisma.education.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.siteSettings.deleteMany()
  await prisma.admin.deleteMany()

  // ─── 1. ADMIN ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMe123!',
    12
  )

  const admin = await prisma.admin.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'charles@charlessacca.dev',
      password: hashedPassword,
      name: 'Charles Sacca',
    },
  })
  console.log('✅ Admin créé :', admin.email)

  // ─── 2. PARAMÈTRES DU SITE ─────────────────────────────────
  await prisma.siteSettings.create({
    data: {
      siteTitle:       'Charles Sacca – Développeur Full-Stack',
      siteTagline:     "Création d'applications web performantes et modernes",
      siteDescription: 'Portfolio de Charles Sacca, développeur web full-stack basé à Cotonou, Bénin. Spécialisé React, Next.js, Node.js.',
      siteUrl:         'https://charlessacca.dev',
      fullName:        'Charles Sacca',
      bio:             "Développeur web full-stack avec plus de 4 ans d'expérience, passionné par la création de solutions numériques robustes et performantes.",
      location:        'Cotonou, Bénin',
      email:           'contact@charlessacca.dev',
      available:       true,
      githubUrl:       'https://github.com/charlessacca',
      linkedinUrl:     'https://linkedin.com/in/charles-sacca',
    },
  })
  console.log('✅ Paramètres du site créés')

  // ─── 3. TECHNOLOGIES ───────────────────────────────────────
  const techs = await Promise.all([
    // Frontend
    prisma.technology.create({ data: { name: 'React',          category: TechCategory.FRONTEND, icon: 'react' } }),
    prisma.technology.create({ data: { name: 'Next.js',        category: TechCategory.FRONTEND, icon: 'nextjs' } }),
    prisma.technology.create({ data: { name: 'TypeScript',     category: TechCategory.FRONTEND, icon: 'typescript' } }),
    prisma.technology.create({ data: { name: 'Tailwind CSS',   category: TechCategory.FRONTEND, icon: 'tailwind' } }),
    prisma.technology.create({ data: { name: 'Vue.js',         category: TechCategory.FRONTEND, icon: 'vue' } }),
    prisma.technology.create({ data: { name: 'Framer Motion',  category: TechCategory.FRONTEND, icon: 'framer' } }),
    // Backend
    prisma.technology.create({ data: { name: 'Node.js',        category: TechCategory.BACKEND,  icon: 'nodejs' } }),
    prisma.technology.create({ data: { name: 'Express.js',     category: TechCategory.BACKEND,  icon: 'express' } }),
    prisma.technology.create({ data: { name: 'Laravel',        category: TechCategory.BACKEND,  icon: 'laravel' } }),
    prisma.technology.create({ data: { name: 'Django',         category: TechCategory.BACKEND,  icon: 'django' } }),
    prisma.technology.create({ data: { name: 'GraphQL',        category: TechCategory.BACKEND,  icon: 'graphql' } }),
    prisma.technology.create({ data: { name: 'Prisma',         category: TechCategory.BACKEND,  icon: 'prisma' } }),
    // Base de données
    prisma.technology.create({ data: { name: 'PostgreSQL',     category: TechCategory.DATABASE, icon: 'postgresql' } }),
    prisma.technology.create({ data: { name: 'MySQL',          category: TechCategory.DATABASE, icon: 'mysql' } }),
    prisma.technology.create({ data: { name: 'MongoDB',        category: TechCategory.DATABASE, icon: 'mongodb' } }),
    prisma.technology.create({ data: { name: 'Redis',          category: TechCategory.DATABASE, icon: 'redis' } }),
    // DevOps
    prisma.technology.create({ data: { name: 'Docker',         category: TechCategory.DEVOPS,   icon: 'docker' } }),
    prisma.technology.create({ data: { name: 'Git',            category: TechCategory.DEVOPS,   icon: 'git' } }),
    prisma.technology.create({ data: { name: 'Vercel',         category: TechCategory.DEVOPS,   icon: 'vercel' } }),
    prisma.technology.create({ data: { name: 'Railway',        category: TechCategory.DEVOPS,   icon: 'railway' } }),
    // Outils
    prisma.technology.create({ data: { name: 'Socket.io',      category: TechCategory.TOOL,     icon: 'socketio' } }),
  ])

  const techMap = Object.fromEntries(techs.map(t => [t.name, t]))
  console.log('✅ Technologies créées :', techs.length)

  // ─── 4. GROUPES DE COMPÉTENCES ─────────────────────────────
  const groupFE = await prisma.skillGroup.create({
    data: {
      name:  'Frontend',
      icon:  'monitor',
      order: 1,
      color: '#6ee7b7',
      items: {
        create: [
          { name: 'React',          level: SkillLevel.EXPERT,        order: 1, highlighted: true,  yearsOfExp: 4, technologyId: techMap['React'].id },
          { name: 'Next.js',        level: SkillLevel.EXPERT,        order: 2, highlighted: true,  yearsOfExp: 3, technologyId: techMap['Next.js'].id },
          { name: 'TypeScript',     level: SkillLevel.ADVANCED,      order: 3, highlighted: true,  yearsOfExp: 3, technologyId: techMap['TypeScript'].id },
          { name: 'Tailwind CSS',   level: SkillLevel.EXPERT,        order: 4, highlighted: false, yearsOfExp: 3, technologyId: techMap['Tailwind CSS'].id },
          { name: 'Vue.js',         level: SkillLevel.INTERMEDIATE,  order: 5, highlighted: false, yearsOfExp: 1, technologyId: techMap['Vue.js'].id },
          { name: 'Framer Motion',  level: SkillLevel.ADVANCED,      order: 6, highlighted: false, yearsOfExp: 2, technologyId: techMap['Framer Motion'].id },
        ],
      },
    },
  })

  const groupBE = await prisma.skillGroup.create({
    data: {
      name:  'Backend',
      icon:  'server',
      order: 2,
      color: '#3b82f6',
      items: {
        create: [
          { name: 'Node.js',    level: SkillLevel.EXPERT,        order: 1, highlighted: true,  yearsOfExp: 4, technologyId: techMap['Node.js'].id },
          { name: 'Express.js', level: SkillLevel.EXPERT,        order: 2, highlighted: false, yearsOfExp: 4, technologyId: techMap['Express.js'].id },
          { name: 'Laravel',    level: SkillLevel.ADVANCED,      order: 3, highlighted: true,  yearsOfExp: 2, technologyId: techMap['Laravel'].id },
          { name: 'Django',     level: SkillLevel.INTERMEDIATE,  order: 4, highlighted: false, yearsOfExp: 1, technologyId: techMap['Django'].id },
          { name: 'GraphQL',    level: SkillLevel.INTERMEDIATE,  order: 5, highlighted: false, yearsOfExp: 1, technologyId: techMap['GraphQL'].id },
          { name: 'Prisma',     level: SkillLevel.ADVANCED,      order: 6, highlighted: false, yearsOfExp: 2, technologyId: techMap['Prisma'].id },
          { name: 'PostgreSQL', level: SkillLevel.ADVANCED,      order: 7, highlighted: true,  yearsOfExp: 3, technologyId: techMap['PostgreSQL'].id },
          { name: 'MongoDB',    level: SkillLevel.INTERMEDIATE,  order: 8, highlighted: false, yearsOfExp: 2, technologyId: techMap['MongoDB'].id },
        ],
      },
    },
  })

  const groupDevOps = await prisma.skillGroup.create({
    data: {
      name:  'DevOps & Outils',
      icon:  'wrench',
      order: 3,
      color: '#f59e0b',
      items: {
        create: [
          { name: 'Git / GitHub', level: SkillLevel.EXPERT,        order: 1, highlighted: true,  yearsOfExp: 4, technologyId: techMap['Git'].id },
          { name: 'Docker',       level: SkillLevel.ADVANCED,      order: 2, highlighted: true,  yearsOfExp: 2, technologyId: techMap['Docker'].id },
          { name: 'Vercel',       level: SkillLevel.EXPERT,        order: 3, highlighted: false, yearsOfExp: 3, technologyId: techMap['Vercel'].id },
          { name: 'Railway',      level: SkillLevel.ADVANCED,      order: 4, highlighted: false, yearsOfExp: 2, technologyId: techMap['Railway'].id },
          { name: 'Linux / Bash', level: SkillLevel.ADVANCED,      order: 5, highlighted: false, yearsOfExp: 4 },
          { name: 'Socket.io',    level: SkillLevel.INTERMEDIATE,  order: 6, highlighted: false, yearsOfExp: 2, technologyId: techMap['Socket.io'].id },
        ],
      },
    },
  })

  console.log('✅ Groupes de compétences créés : Frontend, Backend, DevOps')

  // ─── 5. CATÉGORIES ─────────────────────────────────────────
  const [catSaaS, catEcommerce, catMobile, catAPI, catTutorial] = await Promise.all([
    prisma.category.create({ data: { name: 'SaaS',       slug: 'saas' } }),
    prisma.category.create({ data: { name: 'E-commerce', slug: 'e-commerce' } }),
    prisma.category.create({ data: { name: 'Web App',    slug: 'web-app' } }),
    prisma.category.create({ data: { name: 'API',        slug: 'api' } }),
    prisma.category.create({ data: { name: 'Tutoriel',   slug: 'tutoriel' } }),
  ])
  console.log('✅ Catégories créées')

  // ─── 6. PROJETS ────────────────────────────────────────────
  const project1 = await prisma.project.create({
    data: {
      slug:        'databoard-saas',
      title:       'DataBoard SaaS',
      subtitle:    'Tableau de bord analytique temps réel pour PME',
      description: "Tableau de bord analytique en temps réel pour PME. Visualisations dynamiques, exports PDF/CSV, gestion multi-utilisateurs et système d'alertes.",
      content:     `## Contexte\n\nLes PME africaines manquent d'outils analytiques abordables et adaptés à leurs besoins. DataBoard répond à ce besoin avec une solution SaaS clé en main.\n\n## Solution\n\nApplication Next.js avec backend Node.js, API REST sécurisée et base de données PostgreSQL. Les graphiques sont générés avec Recharts, les exports PDF via Puppeteer.\n\n## Résultats\n\n- 3 PME clientes en phase beta\n- Temps de chargement < 1.5s (Lighthouse 95+)\n- Architecture multi-tenant sécurisée`,
      status:      ProjectStatus.PUBLISHED,
      featured:    true,
      order:       1,
      demoUrl:     'https://databoard.charlessacca.dev',
      githubUrl:   'https://github.com/charlessacca/databoard',
      startDate:   new Date('2024-06-01'),
      endDate:     new Date('2024-10-01'),
      technologies: {
        create: [
          { technologyId: techMap['Next.js'].id },
          { technologyId: techMap['Node.js'].id },
          { technologyId: techMap['PostgreSQL'].id },
          { technologyId: techMap['Prisma'].id },
          { technologyId: techMap['TypeScript'].id },
        ],
      },
      categories: {
        create: [{ categoryId: catSaaS.id }],
      },
    },
  })

  const project2 = await prisma.project.create({
    data: {
      slug:        'benishop-ecommerce',
      title:       'BéniShop – E-commerce',
      subtitle:    'Plateforme e-commerce avec paiement Mobile Money',
      description: "Plateforme e-commerce complète avec gestion des stocks, paiement mobile money, panel vendeur et système de livraison géolocalisé.",
      status:      ProjectStatus.PUBLISHED,
      featured:    true,
      order:       2,
      demoUrl:     'https://benishop.charlessacca.dev',
      githubUrl:   'https://github.com/charlessacca/benishop',
      startDate:   new Date('2024-02-01'),
      endDate:     new Date('2024-06-01'),
      technologies: {
        create: [
          { technologyId: techMap['React'].id },
          { technologyId: techMap['Laravel'].id },
          { technologyId: techMap['MySQL'].id },
        ],
      },
      categories: {
        create: [{ categoryId: catEcommerce.id }],
      },
    },
  })

  const project3 = await prisma.project.create({
    data: {
      slug:        'educonnect-platform',
      title:       'EduConnect Platform',
      subtitle:    'LMS pour écoles africaines',
      description: "Plateforme LMS pour écoles africaines. Cours en ligne, vidéos, quiz interactifs, certificats automatiques et suivi pédagogique.",
      status:      ProjectStatus.PUBLISHED,
      featured:    false,
      order:       3,
      demoUrl:     'https://educonnect.charlessacca.dev',
      githubUrl:   'https://github.com/charlessacca/educonnect',
      startDate:   new Date('2023-10-01'),
      endDate:     new Date('2024-02-01'),
      technologies: {
        create: [
          { technologyId: techMap['Next.js'].id },
          { technologyId: techMap['Django'].id },
          { technologyId: techMap['PostgreSQL'].id },
        ],
      },
      categories: {
        create: [{ categoryId: catSaaS.id }],
      },
    },
  })

  const project4 = await prisma.project.create({
    data: {
      slug:        'chatpro-messagerie',
      title:       'ChatPro – Messagerie',
      subtitle:    'Application de messagerie temps réel',
      description: "Application de messagerie temps réel avec channels, messages directs, partage de fichiers et notifications push via WebSockets.",
      status:      ProjectStatus.PUBLISHED,
      featured:    false,
      order:       4,
      githubUrl:   'https://github.com/charlessacca/chatpro',
      startDate:   new Date('2023-06-01'),
      endDate:     new Date('2023-09-01'),
      technologies: {
        create: [
          { technologyId: techMap['React'].id },
          { technologyId: techMap['Node.js'].id },
          { technologyId: techMap['Socket.io'].id },
          { technologyId: techMap['MongoDB'].id },
        ],
      },
      categories: {
        create: [{ categoryId: catSaaS.id }],
      },
    },
  })

  console.log('✅ Projets créés : 4 projets publiés')

  // ─── 7. EXPÉRIENCES ────────────────────────────────────────
  await prisma.experience.createMany({
    data: [
      {
        role:        'Développeur Full-Stack Freelance',
        company:     'Indépendant',
        location:    'Cotonou, Bénin & Remote',
        type:        ExperienceType.FREELANCE,
        description: "Développement d'applications web sur mesure pour clients français et africains.",
        missions: [
          "Conception et développement d'APIs REST avec Node.js/Express et Prisma",
          "Création d'interfaces React/Next.js responsive et accessibles",
          "Déploiement et maintenance sur Vercel, Railway et VPS Linux",
          "Gestion complète du cycle projet : specs, dev, tests, livraison",
          "Intégration de systèmes de paiement (Stripe, Mobile Money)",
        ],
        startDate:  new Date('2023-01-01'),
        current:    true,
        order:      1,
        techStack:  ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Docker', 'Vercel'],
        companyUrl: null,
      },
      {
        role:        'Développeur Web – Backend',
        company:     'TechAfrique SARL',
        location:    'Cotonou, Bénin',
        type:        ExperienceType.FULLTIME,
        description: "Développement et maintenance de services backend pour des solutions fintech.",
        missions: [
          "Développement de services backend Laravel et Node.js pour fintech",
          "Intégration API Mobile Money (MTN MoMo, Moov Africa)",
          "Sécurisation des flux de paiement et gestion des transactions",
          "Mise en place de tests unitaires et d'intégration (PHPUnit, Jest)",
          "Optimisation des requêtes SQL et performance base de données",
        ],
        startDate:  new Date('2022-01-01'),
        endDate:    new Date('2022-12-31'),
        current:    false,
        order:      2,
        techStack:  ['Laravel', 'Node.js', 'MySQL', 'Redis', 'API REST'],
        companyUrl: 'https://techafrique.bj',
      },
      {
        role:        'Développeur Frontend Junior',
        company:     'WebStudio Bénin',
        location:    'Cotonou, Bénin',
        type:        ExperienceType.FULLTIME,
        description: "Création de sites vitrines et interfaces React pour clients locaux et régionaux.",
        missions: [
          "Intégration de maquettes Figma en HTML/CSS/React responsive",
          "Optimisation SEO on-page et performances (Lighthouse 90+)",
          "Collaboration avec les designers UX en environnement agile",
          "Développement de sites WordPress avec ACF et Elementor",
          "Formation continue sur React et les bonnes pratiques frontend",
        ],
        startDate:  new Date('2020-06-01'),
        endDate:    new Date('2021-12-31'),
        current:    false,
        order:      3,
        techStack:  ['React', 'JavaScript', 'HTML/CSS', 'WordPress', 'SEO'],
        companyUrl: null,
      },
    ],
  })

  // ─── 8. FORMATION ──────────────────────────────────────────
  await prisma.education.createMany({
    data: [
      {
        degree:      'Licence en Génie Logiciel',
        institution: "Institut de Formation et de Recherche en Informatique (IFRI)",
        location:    "Cotonou, Bénin",
        startDate:   new Date('2017-10-01'),
        endDate:     new Date('2020-07-01'),
        description: "Formation en développement logiciel, algorithmique, bases de données et réseaux.",
        order:       1,
      },
      {
        degree:      'Certifications',
        institution: "Coursera / FreeCodeCamp / OpenClassrooms",
        startDate:   new Date('2020-01-01'),
        current:     true,
        description: "Full-Stack Web Development (Meta), APIs REST (Node.js), AWS Cloud Practitioner.",
        order:       2,
      },
    ],
  })
  console.log('✅ Expériences et formations créées')

  // ─── 9. MESSAGES DE CONTACT ────────────────────────────────
  await prisma.contactMessage.createMany({
    data: [
      {
        name:    'Sophie Martin',
        email:   'sophie.martin@startup.fr',
        subject: 'Développement application SaaS',
        message: "Bonjour Charles, je suis directrice produit chez une startup parisienne. Nous cherchons un développeur full-stack pour un projet SaaS B2B. Votre profil correspond exactement à nos besoins. Seriez-vous disponible pour un appel cette semaine ?",
        status:  MessageStatus.UNREAD,
      },
      {
        name:    'Koffi Mensah',
        email:   'k.mensah@entreprise-bj.com',
        subject: 'Refonte site e-commerce',
        message: "Bonjour, je suis directeur commercial d'une entreprise basée à Cotonou. Nous souhaitons refondre notre site e-commerce actuel sous WordPress pour une solution custom plus performante. Budget disponible : 3M FCFA. Merci de me contacter.",
        status:  MessageStatus.UNREAD,
      },
      {
        name:    'Jean-Baptiste Leclerc',
        email:   'jb.leclerc@agence-digitale.fr',
        subject: 'Collaboration freelance long terme',
        message: "Bonjour Charles, je dirige une agence digitale à Lyon. Nous cherchons un dev full-stack en sous-traitance pour nos projets clients Next.js. Tarif souhaité : 350-450€/jour. Disponible pour une collaboration régulière ?",
        status:  MessageStatus.READ,
        repliedAt: new Date('2025-01-10'),
      },
    ],
  })
  console.log('✅ Messages de contact créés : 3 messages (2 non lus)')

  // ─── 10. ARTICLES DE BLOG ──────────────────────────────────
  const [tagNextjs, tagPerf, tagBenin, tagPrisma] = await Promise.all([
    prisma.tag.create({ data: { name: 'Next.js',     slug: 'nextjs' } }),
    prisma.tag.create({ data: { name: 'Performance', slug: 'performance' } }),
    prisma.tag.create({ data: { name: 'Afrique',     slug: 'afrique' } }),
    prisma.tag.create({ data: { name: 'Prisma',      slug: 'prisma' } }),
  ])

  await prisma.article.create({
    data: {
      slug:           'nextjs-app-router-guide-complet',
      title:          'Next.js App Router : le guide complet pour débutants',
      excerpt:        "Découvrez les nouveautés du App Router de Next.js 14 : Server Components, layouts imbriqués, loading states et error boundaries.",
      content:        "# Next.js App Router\n\nDepuis Next.js 13, l'App Router révolutionne la façon de structurer nos applications...",
      status:         ArticleStatus.PUBLISHED,
      featured:       true,
      readingTime:    8,
      publishedAt:    new Date('2025-01-15'),
      categoryId:     catTutorial.id,
      metaTitle:      'Guide Next.js App Router – Charles Sacca',
      metaDescription:"Apprenez à utiliser le App Router de Next.js 14 avec des exemples pratiques.",
      tags: {
        create: [{ tagId: tagNextjs.id }],
      },
    },
  })

  await prisma.article.create({
    data: {
      slug:        'prisma-postgresql-nextjs-setup',
      title:       'Configurer Prisma avec PostgreSQL dans un projet Next.js',
      excerpt:     "Tutoriel pas à pas pour intégrer Prisma ORM avec PostgreSQL dans une application Next.js, incluant migrations et seed.",
      content:     "# Prisma + PostgreSQL + Next.js\n\nDans ce guide, nous allons mettre en place Prisma ORM...",
      status:      ArticleStatus.PUBLISHED,
      featured:    false,
      readingTime: 6,
      publishedAt: new Date('2025-02-01'),
      categoryId:  catTutorial.id,
      tags: {
        create: [{ tagId: tagNextjs.id }, { tagId: tagPrisma.id }],
      },
    },
  })

  await prisma.article.create({
    data: {
      slug:        'freelance-developpeur-afrique-guide',
      title:       'Devenir développeur freelance en Afrique : mon retour d\'expérience',
      excerpt:     "Comment j'ai lancé mon activité freelance depuis Cotonou et décroché mes premiers clients internationaux.",
      content:     "# Freelance depuis l'Afrique\n\nIl y a deux ans, je suis passé en freelance...",
      status:      ArticleStatus.DRAFT,
      featured:    false,
      categoryId:  catTutorial.id,
      tags: {
        create: [{ tagId: tagBenin.id }],
      },
    },
  })

  console.log('✅ Articles créés : 2 publiés, 1 brouillon')

  // ─── 11. LOG D'ACTIVITÉ INITIAL ────────────────────────────
  await prisma.activityLog.create({
    data: {
      action:   'SEED_COMPLETED',
      entity:   'System',
      details:  JSON.stringify({ version: '1.0.0', date: new Date().toISOString() }),
      adminId:  admin.id,
    },
  })

  console.log('\n🎉 Seed terminé avec succès !')
  console.log('─────────────────────────────────────')
  console.log('📊 Résumé :')
  console.log('  • 1 admin créé')
  console.log('  • 4 projets publiés')
  console.log('  • 21 technologies')
  console.log('  • 3 groupes de compétences (16 items)')
  console.log('  • 3 expériences professionnelles')
  console.log('  • 3 messages de contact')
  console.log('  • 3 articles (2 publiés, 1 brouillon)')
  console.log('─────────────────────────────────────')
}

main()
  .catch(e => {
    console.error('❌ Erreur seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
