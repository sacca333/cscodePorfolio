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

      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main-area">
          <AdminTopbar admin={session.user} />
          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
