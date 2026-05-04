// ==========================================================
//  app/admin/messages/page.tsx
// ==========================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MessageStatus } from '@prisma/client'
import MessageActions from './MessageActions'

export const metadata: Metadata = { title: 'Messages' }

interface Props {
  searchParams: { status?: string; page?: string }
}

async function getMessages(filters: Props['searchParams']) {
  const status = (filters.status?.toUpperCase() as MessageStatus) || undefined
  const page = parseInt(filters.page || '1')
  const limit = 15
  const where = status ? { status } : {}

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ])

  return { messages, total, page, pages: Math.ceil(total / limit) }
}

export default async function MessagesPage({ searchParams }: Props) {
  const { messages, total, page, pages } = await getMessages(searchParams)

  const counts = await prisma.contactMessage.groupBy({ by: ['status'], _count: true })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]))

  const tabs = [
    { label: 'Tous', value: '', count: total },
    { label: 'Non lus', value: 'unread', count: countMap['UNREAD'] ?? 0 },
    { label: 'Lus', value: 'read', count: countMap['READ'] ?? 0 },
    { label: 'Répondus', value: 'replied', count: countMap['REPLIED'] ?? 0 },
    { label: 'Archivés', value: 'archived', count: countMap['ARCHIVED'] ?? 0 },
    { label: 'Spam', value: 'spam', count: countMap['SPAM'] ?? 0 },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-sub">{total} message{total > 1 ? 's' : ''} au total</p>
        </div>
        {countMap['UNREAD'] > 0 && (
          <div className="unread-notice">
            <span className="notice-dot" />
            {countMap['UNREAD']} non lu{countMap['UNREAD'] > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="filter-tabs">
        {tabs.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/messages${tab.value ? `?status=${tab.value}` : ''}`}
            className={`filter-tab ${(searchParams.status ?? '') === tab.value ? 'active' : ''}`}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </Link>
        ))}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✉️</div>
            <div className="empty-title">Aucun message dans cette catégorie</div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`message-card ${msg.status === 'UNREAD' ? 'unread' : ''}`}>
              <div className="msg-header">
                <div className="msg-left">
                  <div className="msg-avatar">{msg.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="msg-name">
                      {msg.name}
                      {msg.status === 'UNREAD' && <span className="unread-badge">Nouveau</span>}
                    </div>
                    <a href={`mailto:${msg.email}`} className="msg-email">{msg.email}</a>
                  </div>
                </div>
                <div className="msg-right">
                  <span className={`status-pill status-${msg.status.toLowerCase()}`}>
                    {{ UNREAD: 'Non lu', READ: 'Lu', REPLIED: 'Répondu', ARCHIVED: 'Archivé', SPAM: 'Spam' }[msg.status]}
                  </span>
                  <span className="msg-date">
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="msg-subject">{msg.subject}</div>
              <div className="msg-body">{msg.message}</div>

              <div className="msg-footer">
                <div className="msg-actions">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                    className="action-btn reply-btn"
                  >
                    ↩ Répondre par email
                  </a>
                  <MessageActions id={msg.id} status={msg.status} />
                </div>
                {msg.repliedAt && (
                  <span className="replied-note">
                    Répondu le {new Date(msg.repliedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/messages?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`page-btn ${p === page ? 'active' : ''}`}
            >{p}</Link>
          ))}
        </div>
      )}

      <style>{`
        .page-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
        }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -.02em;
          color: var(--admin-text); margin-bottom: .2rem;
        }
        .page-sub { font-size: .875rem; color: var(--admin-muted); }

        .unread-notice {
          display: flex; align-items: center; gap: .5rem;
          background: #FEF3C7; border: 1px solid #FDE68A;
          padding: .45rem 1rem; border-radius: 99px;
          font-size: .82rem; font-weight: 600; color: #92400E;
        }
        .notice-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #D97706; animation: pulse 2s infinite;
        }

        .filter-tabs {
          display: flex; gap: .35rem; flex-wrap: wrap; margin-bottom: 1.5rem;
        }
        .filter-tab {
          display: flex; align-items: center; gap: .4rem;
          padding: .45rem .9rem; border-radius: 8px;
          text-decoration: none; font-size: .82rem;
          font-weight: 500; color: var(--admin-muted);
          border: 1px solid transparent; transition: all .18s;
        }
        .filter-tab:hover {
          color: var(--admin-text);
          background: var(--admin-bg);
          border-color: var(--admin-border);
        }
        .filter-tab.active {
          color: var(--admin-accent);
          background: var(--admin-accent-l);
          border-color: var(--admin-accent-m);
        }
        .tab-count {
          background: var(--admin-bg-2); color: var(--admin-muted);
          font-size: .68rem; font-weight: 700;
          padding: .1rem .45rem; border-radius: 99px;
          border: 1px solid var(--admin-border);
        }
        .filter-tab.active .tab-count {
          background: var(--admin-accent-m);
          color: var(--admin-accent);
          border-color: var(--admin-accent-m);
        }

        .messages-container {
          display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;
        }
        .message-card {
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 14px; padding: 1.5rem;
          transition: box-shadow .2s;
        }
        .message-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .message-card.unread {
          border-color: var(--admin-accent-m);
          background: var(--admin-accent-l);
        }

        .msg-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem;
          margin-bottom: .875rem; flex-wrap: wrap;
        }
        .msg-left { display: flex; align-items: center; gap: .875rem; }
        .msg-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          background: var(--admin-accent-l); color: var(--admin-accent);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: .8rem;
          font-family: 'Syne', sans-serif; flex-shrink: 0;
          border: 1px solid var(--admin-accent-m);
        }
        .msg-name {
          font-size: .95rem; font-weight: 700; color: var(--admin-text);
          display: flex; align-items: center; gap: .5rem; margin-bottom: .2rem;
          flex-wrap: wrap;
        }
        .unread-badge {
          background: var(--admin-accent); color: #fff;
          font-size: .65rem; font-weight: 700;
          padding: .15rem .55rem; border-radius: 99px;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .msg-email {
          font-size: .82rem; color: var(--admin-accent);
          text-decoration: none; transition: opacity .2s;
        }
        .msg-email:hover { opacity: .75; }
        .msg-right {
          display: flex; align-items: center; gap: .75rem;
          flex-shrink: 0; flex-wrap: wrap;
        }
        .msg-date { font-size: .75rem; color: var(--admin-muted); white-space: nowrap; }

        .msg-subject {
          font-size: .9rem; font-weight: 600; color: var(--admin-text);
          margin-bottom: .75rem;
        }
        .msg-body {
          font-size: .875rem; color: var(--admin-muted); line-height: 1.7;
          margin-bottom: 1.25rem; white-space: pre-wrap;
          background: var(--admin-bg); border: 1px solid var(--admin-border);
          border-radius: 9px; padding: 1rem 1.25rem;
        }
        .msg-footer {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .msg-actions { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .action-btn {
          padding: .45rem 1rem; border-radius: 8px;
          font-size: .8rem; font-weight: 600; cursor: pointer;
          transition: all .18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }
        .reply-btn {
          background: var(--admin-accent-l); color: var(--admin-accent);
          border: 1px solid var(--admin-accent-m);
        }
        .reply-btn:hover { background: var(--admin-accent-m); }
        .replied-note { font-size: .75rem; color: var(--admin-muted); }

        .status-pill {
          font-size: .7rem; font-weight: 700;
          padding: .22rem .65rem; border-radius: 99px; white-space: nowrap;
        }
        .status-unread   { background: #EBF0FD; color: #1A56DB; border: 1px solid #C7D4F9; }
        .status-read     { background: var(--admin-bg-2); color: var(--admin-muted); border: 1px solid var(--admin-border); }
        .status-replied  { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
        .status-archived { background: var(--admin-bg-2); color: var(--admin-muted); border: 1px solid var(--admin-border); }
        .status-spam     { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

        .pagination { display: flex; gap: .4rem; justify-content: center; margin-bottom: 2rem; }
        .page-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          font-size: .82rem; font-weight: 600; color: var(--admin-muted);
          border: 1px solid var(--admin-border); transition: all .18s;
        }
        .page-btn:hover { background: var(--admin-bg-2); color: var(--admin-text); }
        .page-btn.active {
          background: var(--admin-accent); color: #fff;
          border-color: var(--admin-accent);
        }

        .empty-state {
          padding: 4rem 2rem; text-align: center;
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 14px;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { font-size: .95rem; color: var(--admin-muted); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

        @media (max-width: 768px) {
          .msg-header { flex-direction: column; }
          .msg-right { justify-content: flex-start; }
          .msg-footer { flex-direction: column; align-items: flex-start; }
          .page-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  )
}
