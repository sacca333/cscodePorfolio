import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProjectStatus, MessageStatus, ArticleStatus } from '@prisma/client'

export const metadata: Metadata = { title: 'Dashboard' }

async function getData() {
  const [publishedProjects, draftProjects, unreadMessages, totalMessages,
    publishedArticles, recentMessages, recentProjects] = await Promise.all([
      prisma.project.count({ where: { status: ProjectStatus.PUBLISHED } }),
      prisma.project.count({ where: { status: ProjectStatus.DRAFT } }),
      prisma.contactMessage.count({ where: { status: MessageStatus.UNREAD } }),
      prisma.contactMessage.count(),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        select: { id: true, name: true, subject: true, status: true, createdAt: true },
      }),
      prisma.project.findMany({
        orderBy: { updatedAt: 'desc' }, take: 5,
        select: { id: true, slug: true, title: true, status: true, updatedAt: true },
      }),
    ])
  return {
    publishedProjects, draftProjects, unreadMessages, totalMessages,
    publishedArticles, recentMessages, recentProjects
  }
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `il y a ${mins}min`
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${days}j`
}

export default async function AdminDashboard() {
  const d = await getData()

  const kpis = [
    { label: 'Projets publiés', value: d.publishedProjects, sub: `${d.draftProjects} brouillon(s)`, color: '#6ee7b7', href: '/admin/projets' },
    { label: 'Messages non lus', value: d.unreadMessages, sub: `${d.totalMessages} au total`, color: d.unreadMessages > 0 ? '#fbbf24' : '#6ee7b7', href: '/admin/messages' },
    { label: 'Articles publiés', value: d.publishedArticles, sub: 'articles en ligne', color: '#60a5fa', href: '/admin/parametres' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-.02em', color: '#e8e8f0', marginBottom: '.25rem' }}>
            Vue d'ensemble
          </h1>
          <p style={{ fontSize: '.875rem', color: '#666680' }}>Bienvenue dans votre espace d'administration.</p>
        </div>
        <Link href="/admin/projets/nouveau" style={{
          background: '#6ee7b7', color: '#0a0a12', padding: '.6rem 1.25rem',
          borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '.85rem',
          fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>+ Nouveau projet</Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {kpis.map(k => (
          <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: `${k.color}18`, border: `1px solid ${k.color}30`,
              borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'pointer',
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2rem', color: k.color, lineHeight: 1, marginBottom: '.35rem' }}>
                {k.value}
              </div>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#c8c8d8', marginBottom: '.2rem' }}>{k.label}</div>
              <div style={{ fontSize: '.72rem', color: '#555568' }}>{k.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Grille messages + projets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Messages récents */}
        <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#e8e8f0', margin: 0 }}>Messages récents</h2>
            <Link href="/admin/messages" style={{ fontSize: '.8rem', color: '#6ee7b7', textDecoration: 'none' }}>Voir tout →</Link>
          </div>
          {d.recentMessages.length === 0
            ? <div style={{ padding: '2rem', textAlign: 'center', color: '#444458', fontSize: '.85rem' }}>Aucun message</div>
            : d.recentMessages.map(msg => (
              <Link key={msg.id} href="/admin/messages" style={{
                display: 'flex', alignItems: 'center', gap: '.875rem',
                padding: '.875rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.04)',
                textDecoration: 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(59,130,246,.15)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '.75rem', flexShrink: 0,
                }}>{msg.name.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#e8e8f0' }}>{msg.name}</span>
                    <span style={{ fontSize: '.72rem', color: '#555568', whiteSpace: 'nowrap' }}>{timeAgo(msg.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '.8rem', color: '#888890', marginTop: '.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</div>
                </div>
                {msg.status === 'UNREAD' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ee7b7', flexShrink: 0 }} />}
              </Link>
            ))
          }
        </div>

        {/* Projets récents */}
        <div style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.95rem', color: '#e8e8f0', margin: 0 }}>Projets récents</h2>
            <Link href="/admin/projets" style={{ fontSize: '.8rem', color: '#6ee7b7', textDecoration: 'none' }}>Gérer →</Link>
          </div>
          {d.recentProjects.map(p => (
            <Link key={p.id} href={`/admin/projets/${p.slug}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '.875rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.04)',
              textDecoration: 'none', gap: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '.875rem', fontWeight: 600, color: '#e8e8f0' }}>{p.title}</div>
                <div style={{ fontSize: '.75rem', color: '#555568', marginTop: '.1rem' }}>Modifié {timeAgo(p.updatedAt)}</div>
              </div>
              <span style={{
                fontSize: '.7rem', fontWeight: 700, padding: '.22rem .65rem',
                borderRadius: 99, whiteSpace: 'nowrap',
                background: p.status === 'PUBLISHED' ? 'rgba(110,231,183,.1)' : 'rgba(255,255,255,.05)',
                color: p.status === 'PUBLISHED' ? '#6ee7b7' : '#888',
                border: `1px solid ${p.status === 'PUBLISHED' ? 'rgba(110,231,183,.2)' : 'rgba(255,255,255,.08)'}`,
              }}>
                {p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}