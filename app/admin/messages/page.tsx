// ==========================================================
//  app/admin/messages/page.tsx – Gestion des messages
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
  const page   = parseInt(filters.page || '1')
  const limit  = 15

  const where = status ? { status } : {}

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
  ])

  return { messages, total, page, pages: Math.ceil(total / limit) }
}

export default async function MessagesPage({ searchParams }: Props) {
  const { messages, total, page, pages } = await getMessages(searchParams)

  const counts = await prisma.contactMessage.groupBy({
    by: ['status'],
    _count: true,
  })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]))

  const tabs = [
    { label: 'Tous',      value: '',         count: total },
    { label: 'Non lus',   value: 'unread',   count: countMap['UNREAD']   ?? 0 },
    { label: 'Lus',       value: 'read',     count: countMap['READ']     ?? 0 },
    { label: 'Répondus',  value: 'replied',  count: countMap['REPLIED']  ?? 0 },
    { label: 'Archivés',  value: 'archived', count: countMap['ARCHIVED'] ?? 0 },
    { label: 'Spam',      value: 'spam',     count: countMap['SPAM']     ?? 0 },
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
            {countMap['UNREAD']} message{countMap['UNREAD'] > 1 ? 's' : ''} non lu{countMap['UNREAD'] > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Filtres par statut */}
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

      {/* Liste des messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✉️</div>
            <div className="empty-title">Aucun message dans cette catégorie</div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`message-card ${msg.status === 'UNREAD' ? 'unread' : ''}`}
            >
              {/* En-tête du message */}
              <div className="msg-header">
                <div className="msg-left">
                  <div className="msg-avatar">
                    {msg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="msg-name">
                      {msg.name}
                      {msg.status === 'UNREAD' && (
                        <span className="unread-badge">Nouveau</span>
                      )}
                    </div>
                    <a href={`mailto:${msg.email}`} className="msg-email">
                      {msg.email}
                    </a>
                  </div>
                </div>
                <div className="msg-right">
                  <span className={`status-pill status-${msg.status.toLowerCase()}`}>
                    {{ UNREAD: 'Non lu', READ: 'Lu', REPLIED: 'Répondu',
                       ARCHIVED: 'Archivé', SPAM: 'Spam' }[msg.status]}
                  </span>
                  <span className="msg-date">
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Sujet */}
              <div className="msg-subject">{msg.subject}</div>

              {/* Corps du message */}
              <div className="msg-body">{msg.message}</div>

              {/* Actions */}
              <div className="msg-footer">
                <div className="msg-actions">
                  <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                     className="action-btn reply-btn">
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/messages?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`page-btn ${p === page ? 'active' : ''}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .page-header {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem; gap: 1rem;
        }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -.02em;
          color: #e8e8f0; margin-bottom: .2rem;
        }
        .page-sub { font-size: .875rem; color: #666680; }
        .unread-notice {
          display: flex; align-items: center; gap: .5rem;
          background: rgba(251,191,36,.08);
          border: 1px solid rgba(251,191,36,.15);
          padding: .5rem 1rem; border-radius: 99px;
          font-size: .82rem; font-weight: 600; color: #fbbf24;
        }
        .notice-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #fbbf24; animation: pulse 2s infinite;
        }

        /* Filtres */
        .filter-tabs {
          display: flex; gap: .35rem; flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .filter-tab {
          display: flex; align-items: center; gap: .4rem;
          padding: .45rem .9rem; border-radius: 8px;
          text-decoration: none; font-size: .82rem;
          font-weight: 500; color: #666680;
          border: 1px solid transparent; transition: all .18s;
        }
        .filter-tab:hover { color: #e8e8f0; background: rgba(255,255,255,.04); }
        .filter-tab.active {
          color: #6ee7b7; background: rgba(110,231,183,.08);
          border-color: rgba(110,231,183,.15);
        }
        .tab-count {
          background: rgba(255,255,255,.08); color: #888;
          font-size: .68rem; font-weight: 700;
          padding: .1rem .45rem; border-radius: 99px;
        }
        .filter-tab.active .tab-count { background: rgba(110,231,183,.1); color: #6ee7b7; }

        /* Messages */
        .messages-container { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

        .message-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px; padding: 1.5rem;
          transition: border-color .2s;
        }
        .message-card:hover { border-color: rgba(255,255,255,.1); }
        .message-card.unread {
          border-color: rgba(110,231,183,.15);
          background: rgba(110,231,183,.02);
        }

        .msg-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1rem;
          margin-bottom: .875rem;
        }
        .msg-left { display: flex; align-items: center; gap: .875rem; }
        .msg-avatar {
          width: 42px; height: 42px; border-radius: 12px;
          background: rgba(59,130,246,.15); color: #60a5fa;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: .8rem; font-family: 'Syne', sans-serif;
          flex-shrink: 0;
        }
        .msg-name {
          font-size: .95rem; font-weight: 700; color: #e8e8f0;
          display: flex; align-items: center; gap: .5rem; margin-bottom: .2rem;
        }
        .unread-badge {
          background: rgba(110,231,183,.1); color: #6ee7b7;
          font-size: .65rem; font-weight: 700;
          padding: .15rem .55rem; border-radius: 99px;
          border: 1px solid rgba(110,231,183,.2);
          text-transform: uppercase; letter-spacing: .05em;
        }
        .msg-email {
          font-size: .82rem; color: #60a5fa;
          text-decoration: none; transition: opacity .2s;
        }
        .msg-email:hover { opacity: .75; }
        .msg-right { display: flex; align-items: center; gap: .75rem; flex-shrink: 0; }
        .msg-date { font-size: .75rem; color: #444458; white-space: nowrap; }

        .msg-subject {
          font-size: .9rem; font-weight: 600; color: #c8c8d8;
          margin-bottom: .75rem;
        }
        .msg-body {
          font-size: .875rem; color: #8888a0; line-height: 1.7;
          margin-bottom: 1.25rem; white-space: pre-wrap;
          background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.05);
          border-radius: 9px; padding: 1rem 1.25rem;
        }
        .msg-footer {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
        }
        .msg-actions { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .action-btn {
          padding: .45rem 1rem; border-radius: 8px;
          font-size: .8rem; font-weight: 600; cursor: pointer;
          transition: all .18s; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }
        .reply-btn {
          background: rgba(96,165,250,.1); color: #60a5fa;
          border: 1px solid rgba(96,165,250,.2);
        }
        .reply-btn:hover { background: rgba(96,165,250,.18); }
        .replied-note { font-size: .75rem; color: #444458; }

        /* Status pills */
        .status-pill {
          font-size: .7rem; font-weight: 700;
          padding: .22rem .65rem; border-radius: 99px;
          white-space: nowrap;
        }
        .status-unread   { background: rgba(110,231,183,.1); color: #6ee7b7; border: 1px solid rgba(110,231,183,.2); }
        .status-read     { background: rgba(255,255,255,.06); color: #888; border: 1px solid rgba(255,255,255,.09); }
        .status-replied  { background: rgba(96,165,250,.1); color: #60a5fa; border: 1px solid rgba(96,165,250,.2); }
        .status-archived { background: rgba(255,255,255,.04); color: #555568; border: 1px solid rgba(255,255,255,.06); }
        .status-spam     { background: rgba(239,68,68,.08); color: #f87171; border: 1px solid rgba(239,68,68,.15); }

        /* Pagination */
        .pagination { display: flex; gap: .4rem; justify-content: center; margin-bottom: 2rem; }
        .page-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          font-size: .82rem; font-weight: 600; color: #666680;
          border: 1px solid rgba(255,255,255,.06); transition: all .18s;
        }
        .page-btn:hover { background: rgba(255,255,255,.05); color: #e8e8f0; }
        .page-btn.active { background: rgba(110,231,183,.1); color: #6ee7b7; border-color: rgba(110,231,183,.2); }

        /* Empty */
        .empty-state {
          padding: 4rem 2rem; text-align: center;
          background: rgba(255,255,255,.015);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { font-size: .95rem; color: #555568; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
      `}</style>
    </>
  )
}
