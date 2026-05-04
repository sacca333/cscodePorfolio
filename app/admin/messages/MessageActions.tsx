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


    </>
  )
}
