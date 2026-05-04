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
      <style>{`
        .admin-shell {
          --admin-bg:       #F7F7F5;
          --admin-bg-2:     #EFEEEA;
          --admin-sidebar:  #1C1C28;
          --admin-topbar:   #ffffff;
          --admin-card:     #ffffff;
          --admin-border:   #E4E3DE;
          --admin-border-2: #D5D3CC;
          --admin-text:     #16161F;
          --admin-muted:    #6B6A7A;
          --admin-accent:   #1A56DB;
          --admin-accent-l: #EBF0FD;
          --admin-accent-m: #C7D4F9;
          display: flex;
          min-height: 100vh;
          background: var(--admin-bg);
          color: var(--admin-text);
          font-family: 'DM Sans', sans-serif;
        }
        .admin-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
          background: var(--admin-bg);
        }
        .admin-content {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
        }
      `}</style>
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
