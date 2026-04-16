import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'

export const metadata: Metadata = {
  title: { template: '%s – Admin | Charles Sacca', default: 'Dashboard Admin' },
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Pas de session → on rend quand même children
  // Le middleware protège les routes, pas ce layout
  if (!session) {
    return <>{children}</>
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <div style={{
        display: 'flex', minHeight: '100vh',
        background: '#0d0d14', color: '#e8e8f0',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <AdminTopbar admin={session.user} />
          <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}