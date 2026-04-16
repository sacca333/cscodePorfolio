'use client'
// ==========================================================
//  app/admin/projets/ProjectActions.tsx
//  Boutons d'action pour chaque ligne de la table
// ==========================================================

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ProjectStatus } from '@prisma/client'

interface Props { slug: string; status: ProjectStatus }

export default function ProjectActions({ slug, status }: Props) {
  const router  = useRouter()
  const [busy, setBusy]       = useState(false)
  const [confirm, setConfirm] = useState(false)

  const togglePublish = async () => {
    setBusy(true)
    const newStatus = status === ProjectStatus.PUBLISHED ? 'DRAFT' : 'PUBLISHED'
    await fetch(`/api/projects/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
    setBusy(false)
  }

  const deleteProject = async () => {
    setBusy(true)
    await fetch(`/api/projects/${slug}`, { method: 'DELETE' })
    router.refresh()
    setBusy(false)
    setConfirm(false)
  }

  return (
    <>
      <div className="actions">
        {/* Éditer */}
        <Link href={`/admin/projets/${slug}`} className="action-btn edit-btn" title="Éditer">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </Link>

        {/* Publier / Dépublier */}
        <button
          onClick={togglePublish}
          disabled={busy}
          className={`action-btn ${status === 'PUBLISHED' ? 'unpublish-btn' : 'publish-btn'}`}
          title={status === 'PUBLISHED' ? 'Mettre en brouillon' : 'Publier'}
        >
          {status === 'PUBLISHED' ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>

        {/* Voir sur le site */}
        <Link href={`/projets/${slug}`} target="_blank" className="action-btn view-btn" title="Voir sur le site">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </Link>

        {/* Supprimer */}
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            className="action-btn delete-btn"
            title="Supprimer"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        ) : (
          <div className="confirm-row">
            <button onClick={deleteProject} disabled={busy} className="confirm-yes">Oui</button>
            <button onClick={() => setConfirm(false)} className="confirm-no">Non</button>
          </div>
        )}
      </div>

      <style>{`
        .actions {
          display: flex; align-items: center; gap: .35rem;
        }
        .action-btn {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 7px; border: 1px solid rgba(255,255,255,.07);
          background: transparent; cursor: pointer;
          transition: all .18s; text-decoration: none;
        }
        .action-btn svg { width: 13px; height: 13px; stroke: currentColor; }
        .action-btn:disabled { opacity: .4; cursor: not-allowed; }

        .edit-btn    { color: #888; }
        .edit-btn:hover { background: rgba(96,165,250,.1); color: #60a5fa; border-color: rgba(96,165,250,.2); }

        .publish-btn  { color: #888; }
        .publish-btn:hover { background: rgba(110,231,183,.1); color: #6ee7b7; border-color: rgba(110,231,183,.2); }

        .unpublish-btn { color: #888; }
        .unpublish-btn:hover { background: rgba(251,191,36,.1); color: #fbbf24; border-color: rgba(251,191,36,.2); }

        .view-btn  { color: #888; }
        .view-btn:hover { background: rgba(255,255,255,.05); color: #c8c8d8; }

        .delete-btn { color: #888; }
        .delete-btn:hover { background: rgba(239,68,68,.1); color: #f87171; border-color: rgba(239,68,68,.2); }

        .confirm-row { display: flex; gap: .25rem; align-items: center; }
        .confirm-yes {
          padding: .2rem .55rem; border-radius: 6px;
          background: rgba(239,68,68,.15); color: #f87171;
          border: 1px solid rgba(239,68,68,.2);
          font-size: .75rem; font-weight: 700; cursor: pointer;
          transition: background .18s;
        }
        .confirm-yes:hover { background: rgba(239,68,68,.25); }
        .confirm-no {
          padding: .2rem .55rem; border-radius: 6px;
          background: rgba(255,255,255,.05); color: #888;
          border: 1px solid rgba(255,255,255,.08);
          font-size: .75rem; cursor: pointer;
          transition: background .18s;
        }
        .confirm-no:hover { background: rgba(255,255,255,.09); }
      `}</style>
    </>
  )
}
