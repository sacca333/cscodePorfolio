'use client'
// ==========================================================
//  app/admin/messages/MessageActions.tsx
// ==========================================================

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MessageStatus } from '@prisma/client'

interface Props { id: string; status: MessageStatus }

export default function MessageActions({ id, status }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const update = async (newStatus: MessageStatus) => {
    setBusy(true)
    await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <>
      <div className="actions">
        {status === MessageStatus.UNREAD && (
          <button
            onClick={() => update(MessageStatus.READ)}
            disabled={busy}
            className="action-btn mark-read-btn"
          >
            ✓ Marquer lu
          </button>
        )}
        {status === MessageStatus.READ && (
          <button
            onClick={() => update(MessageStatus.UNREAD)}
            disabled={busy}
            className="action-btn mark-unread-btn"
          >
            Marquer non lu
          </button>
        )}
        {status !== MessageStatus.REPLIED && (
          <button
            onClick={() => update(MessageStatus.REPLIED)}
            disabled={busy}
            className="action-btn replied-btn"
          >
            ✓ Marqué répondu
          </button>
        )}
        {status !== MessageStatus.ARCHIVED && status !== MessageStatus.SPAM && (
          <button
            onClick={() => update(MessageStatus.ARCHIVED)}
            disabled={busy}
            className="action-btn archive-btn"
          >
            Archiver
          </button>
        )}
        {status !== MessageStatus.SPAM && (
          <button
            onClick={() => update(MessageStatus.SPAM)}
            disabled={busy}
            className="action-btn spam-btn"
          >
            Spam
          </button>
        )}
        {(status === MessageStatus.ARCHIVED || status === MessageStatus.SPAM) && (
          <button
            onClick={() => update(MessageStatus.READ)}
            disabled={busy}
            className="action-btn restore-btn"
          >
            ↩ Restaurer
          </button>
        )}
      </div>

      <style>{`
        .actions { display: flex; gap: .4rem; flex-wrap: wrap; }
        .action-btn {
          padding: .38rem .85rem; border-radius: 7px;
          font-size: .78rem; font-weight: 600; cursor: pointer;
          transition: all .18s; border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .mark-read-btn {
          background: rgba(110,231,183,.08); color: #6ee7b7;
          border-color: rgba(110,231,183,.18);
        }
        .mark-read-btn:hover { background: rgba(110,231,183,.15); }
        .mark-unread-btn {
          background: rgba(255,255,255,.05); color: #888;
          border-color: rgba(255,255,255,.09);
        }
        .replied-btn {
          background: rgba(96,165,250,.08); color: #60a5fa;
          border-color: rgba(96,165,250,.18);
        }
        .replied-btn:hover { background: rgba(96,165,250,.15); }
        .archive-btn {
          background: rgba(255,255,255,.05); color: #666680;
          border-color: rgba(255,255,255,.08);
        }
        .archive-btn:hover { background: rgba(255,255,255,.09); color: #c8c8d8; }
        .spam-btn {
          background: rgba(239,68,68,.06); color: #f87171;
          border-color: rgba(239,68,68,.12);
        }
        .spam-btn:hover { background: rgba(239,68,68,.12); }
        .restore-btn {
          background: rgba(251,191,36,.08); color: #fbbf24;
          border-color: rgba(251,191,36,.15);
        }
        .restore-btn:hover { background: rgba(251,191,36,.15); }
      `}</style>
    </>
  )
}
