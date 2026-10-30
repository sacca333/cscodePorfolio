import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Ta protection admin actuelle, inchangée
const authMiddleware = withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/admin/login',
    },
  }
)

// Gestion des langues (/en, /fr) pour le site public
const intl = createMiddleware(routing)

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl

  // Pages admin protégées (toutes sauf la page de connexion)
  if (pathname.startsWith('/admin/') && !pathname.startsWith('/admin/login')) {
    return authMiddleware(req as NextRequestWithAuth, event)
  }

  // Page de connexion admin : on laisse passer, sans préfixe de langue
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Tout le reste : site public avec les langues
  return intl(req)
}

export const config = {
  // Exclut l'API, les fichiers internes de Next.js et les fichiers statiques (images, css…)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}