// ==========================================================
//  app/layout.tsx – Layout racine Next.js
// ==========================================================

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s – Charles Sacca',
    default:  'Charles Sacca – Développeur web full-stack',
  },
  description: 'Portfolio de Charles Sacca, développeur web full-stack basé à Cotonou, Bénin. Spécialisé React, Next.js, Node.js, Laravel.',
  keywords:    ['développeur web', 'full-stack', 'React', 'Next.js', 'Node.js', 'Bénin', 'freelance'],
  authors:     [{ name: 'Charles Sacca', url: 'https://charlessacca.dev' }],
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    url:         'https://charlessacca.dev',
    siteName:    'Charles Sacca',
    title:       'Charles Sacca – Développeur web full-stack',
    description: 'Portfolio de Charles Sacca, développeur web full-stack basé à Cotonou, Bénin.',
  },
  twitter: {
    card:    'summary_large_image',
    title:   'Charles Sacca – Développeur web full-stack',
    creator: '@charlessacca',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
