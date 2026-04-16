'use client'
// ==========================================================
//  app/admin/projets/[slug]/page.tsx
//  Formulaire d'édition / création d'un projet
//  Usage : /admin/projets/nouveau  → création
//          /admin/projets/:slug    → édition
// ==========================================================

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Technology { id: string; name: string; category: string }
interface Category    { id: string; name: string }

interface ProjectForm {
  title: string; subtitle: string; description: string
  content: string; slug: string; status: string; featured: boolean
  demoUrl: string; githubUrl: string; order: number
  technologyIds: string[]; categoryIds: string[]
}

const EMPTY: ProjectForm = {
  title: '', subtitle: '', description: '', content: '',
  slug: '', status: 'DRAFT', featured: false,
  demoUrl: '', githubUrl: '', order: 0,
  technologyIds: [], categoryIds: [],
}

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function ProjectFormPage() {
  const router = useRouter()
  const params = useParams()
  const slug   = params?.slug as string
  const isNew  = slug === 'nouveau'

  const [form,    setForm]    = useState<ProjectForm>(EMPTY)
  const [techs,   setTechs]   = useState<Technology[]>([])
  const [cats,    setCats]    = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  // Charger les technologies et catégories disponibles
  useEffect(() => {
    Promise.all([
      fetch('/api/technologies').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([t, c]) => {
      setTechs(t.data ?? [])
      setCats(c.data ?? [])
    })

    if (!isNew) {
      fetch(`/api/projects/${slug}`).then(r => r.json()).then(({ data }) => {
        if (data) {
          setForm({
            title:         data.title,
            subtitle:      data.subtitle ?? '',
            description:   data.description,
            content:       data.content ?? '',
            slug:          data.slug,
            status:        data.status,
            featured:      data.featured,
            demoUrl:       data.demoUrl ?? '',
            githubUrl:     data.githubUrl ?? '',
            order:         data.order,
            technologyIds: data.technologies.map((t: any) => t.technologyId),
            categoryIds:   data.categories.map((c: any) => c.categoryId),
          })
        }
        setLoading(false)
      })
    }
  }, [slug, isNew])

  const set = (field: keyof ProjectForm, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleTitleChange = (v: string) => {
    set('title', v)
    if (isNew) set('slug', slugify(v))
  }

  const toggleTech = (id: string) => {
    set('technologyIds', form.technologyIds.includes(id)
      ? form.technologyIds.filter(x => x !== id)
      : [...form.technologyIds, id]
    )
  }

  const toggleCat = (id: string) => {
    set('categoryIds', form.categoryIds.includes(id)
      ? form.categoryIds.filter(x => x !== id)
      : [...form.categoryIds, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const method = isNew ? 'POST' : 'PATCH'
    const url    = isNew ? '/api/projects' : `/api/projects/${slug}`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (isNew) {
        const { data } = await res.json()
        router.push(`/admin/projets/${data.slug}`)
      }
    } else {
      const { error: msg } = await res.json()
      setError(msg ?? 'Une erreur est survenue.')
    }
    setSaving(false)
  }

  const techGroups = techs.reduce<Record<string, Technology[]>>((acc, t) => {
    ;(acc[t.category] = acc[t.category] ?? []).push(t)
    return acc
  }, {})

  const categoryLabels: Record<string, string> = {
    FRONTEND: 'Frontend', BACKEND: 'Backend',
    DATABASE: 'Base de données', DEVOPS: 'DevOps', TOOL: 'Outils', OTHER: 'Autres'
  }

  if (loading) return <div style={{ color: '#666680', padding: '3rem', textAlign: 'center' }}>Chargement...</div>

  return (
    <>
      {/* ── En-tête ── */}
      <div className="page-header">
        <div>
          <button onClick={() => router.push('/admin/projets')} className="back-btn">
            ← Retour aux projets
          </button>
          <h1 className="page-title">
            {isNew ? 'Nouveau projet' : `Éditer : ${form.title || slug}`}
          </h1>
        </div>
        <div className="header-actions">
          {saved && <span className="saved-badge">✓ Sauvegardé</span>}
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="status-select"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>
          <button onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Sauvegarde...' : isNew ? 'Créer le projet' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* ── Formulaire ── */}
      <form onSubmit={handleSubmit} className="form-grid">

        {/* Colonne principale */}
        <div className="form-main">

          {/* Informations de base */}
          <div className="form-card">
            <h2 className="form-section-title">Informations générales</h2>

            <div className="field-group">
              <label className="label">Titre <span className="required">*</span></label>
              <input
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Nom du projet"
                required
                className="input"
              />
            </div>

            <div className="field-row">
              <div className="field-group">
                <label className="label">Slug (URL)</label>
                <div className="slug-preview">
                  <span className="slug-prefix">/projets/</span>
                  <input
                    value={form.slug}
                    onChange={e => set('slug', e.target.value)}
                    placeholder="mon-projet"
                    className="input slug-input"
                  />
                </div>
              </div>
              <div className="field-group">
                <label className="label">Ordre d'affichage</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => set('order', parseInt(e.target.value) || 0)}
                  className="input"
                  style={{ width: 100 }}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="label">Sous-titre / accroche</label>
              <input
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
                placeholder="Une ligne courte pour décrire l'objectif du projet"
                className="input"
              />
            </div>

            <div className="field-group">
              <label className="label">Description courte <span className="required">*</span></label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Résumé visible sur la carte projet (150-300 caractères recommandés)"
                required
                className="input textarea"
                rows={3}
              />
              <span className="field-hint">{form.description.length} / 300 caractères</span>
            </div>

            <div className="field-group">
              <label className="label">Description longue (Markdown)</label>
              <textarea
                value={form.content}
                onChange={e => set('content', e.target.value)}
                placeholder="# Contexte&#10;&#10;Décrivez le projet en détail...&#10;&#10;## Stack technique&#10;&#10;## Résultats"
                className="input textarea code-area"
                rows={12}
              />
            </div>
          </div>

          {/* Liens */}
          <div className="form-card">
            <h2 className="form-section-title">Liens</h2>
            <div className="field-row">
              <div className="field-group">
                <label className="label">URL de démo</label>
                <input
                  type="url"
                  value={form.demoUrl}
                  onChange={e => set('demoUrl', e.target.value)}
                  placeholder="https://demo.charlessacca.dev"
                  className="input"
                />
              </div>
              <div className="field-group">
                <label className="label">URL GitHub</label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={e => set('githubUrl', e.target.value)}
                  placeholder="https://github.com/charlessacca/..."
                  className="input"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Colonne latérale */}
        <aside className="form-aside">

          {/* Mise en avant */}
          <div className="form-card">
            <h2 className="form-section-title">Options</h2>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-text">Mettre en avant</span>
            </label>
            <p className="field-hint" style={{ marginTop: '.5rem' }}>
              Les projets mis en avant apparaissent en premier sur le portfolio public.
            </p>
          </div>

          {/* Technologies */}
          <div className="form-card">
            <h2 className="form-section-title">
              Technologies
              {form.technologyIds.length > 0 && (
                <span className="count-badge">{form.technologyIds.length}</span>
              )}
            </h2>
            {Object.entries(techGroups).map(([cat, items]) => (
              <div key={cat} className="tech-group">
                <div className="tech-group-label">{categoryLabels[cat] ?? cat}</div>
                <div className="tech-options">
                  {items.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTech(t.id)}
                      className={`tech-option ${form.technologyIds.includes(t.id) ? 'selected' : ''}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Catégories */}
          <div className="form-card">
            <h2 className="form-section-title">Catégories</h2>
            <div className="tech-options">
              {cats.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={`tech-option ${form.categoryIds.includes(c.id) ? 'selected' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

        </aside>

      </form>

      <style>{`
        .page-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;
        }
        .back-btn {
          background: none; border: none; color: #6ee7b7;
          font-size: .8rem; cursor: pointer; padding: 0;
          margin-bottom: .5rem; display: block;
          font-family: 'DM Sans', sans-serif;
          transition: opacity .2s;
        }
        .back-btn:hover { opacity: .7; }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.5rem; letter-spacing: -.02em; color: #e8e8f0;
        }
        .header-actions { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
        .saved-badge {
          font-size: .8rem; color: #6ee7b7;
          background: rgba(110,231,183,.1);
          padding: .3rem .75rem; border-radius: 99px;
          border: 1px solid rgba(110,231,183,.2);
          font-weight: 600;
        }
        .status-select {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          color: #c8c8d8; border-radius: 8px;
          padding: .5rem .875rem; font-size: .85rem;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; outline: none;
        }
        .btn-primary {
          background: #6ee7b7; color: #0a0a12;
          padding: .6rem 1.35rem; border-radius: 8px;
          border: none; font-weight: 700; font-size: .85rem;
          font-family: 'Syne', sans-serif; cursor: pointer;
          transition: opacity .2s;
        }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .btn-primary:hover:not(:disabled) { opacity: .88; }

        .error-banner {
          background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2);
          color: #f87171; padding: .875rem 1.25rem; border-radius: 10px;
          font-size: .875rem; margin-bottom: 1.5rem;
        }

        /* Formulaire */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.25rem; align-items: start;
        }
        .form-main { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-aside { display: flex; flex-direction: column; gap: 1.25rem; }

        .form-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px; padding: 1.5rem;
        }
        .form-section-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: .9rem; color: #e8e8f0;
          margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: .6rem;
        }
        .count-badge {
          background: rgba(110,231,183,.1); color: #6ee7b7;
          font-size: .68rem; padding: .1rem .45rem;
          border-radius: 99px; border: 1px solid rgba(110,231,183,.2);
        }

        .field-group { display: flex; flex-direction: column; gap: .45rem; margin-bottom: 1rem; }
        .field-group:last-child { margin-bottom: 0; }
        .field-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1rem; margin-bottom: 1rem;
        }
        .label {
          font-size: .75rem; text-transform: uppercase;
          letter-spacing: .06em; color: #666680; font-weight: 600;
        }
        .required { color: #f87171; }
        .input {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9px; padding: .65rem .9rem;
          color: #e8e8f0; font-family: 'DM Sans', sans-serif;
          font-size: .875rem; outline: none; width: 100%;
          transition: border-color .2s;
        }
        .input:focus { border-color: rgba(110,231,183,.35); }
        .input::placeholder { color: #333348; }
        .textarea { resize: vertical; line-height: 1.6; }
        .code-area { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: .82rem; }
        .slug-preview { display: flex; align-items: center; }
        .slug-prefix {
          padding: .65rem .75rem; background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08); border-right: none;
          border-radius: 9px 0 0 9px; color: #555568; font-size: .85rem;
          white-space: nowrap;
        }
        .slug-input { border-radius: 0 9px 9px 0 !important; }
        .field-hint { font-size: .72rem; color: #444458; margin-top: .25rem; }

        /* Toggle */
        .toggle-label {
          display: flex; align-items: center; gap: .75rem; cursor: pointer;
        }
        .toggle-input { display: none; }
        .toggle-track {
          width: 40px; height: 22px; border-radius: 99px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.1);
          position: relative; transition: background .25s, border-color .25s;
          flex-shrink: 0;
        }
        .toggle-input:checked + .toggle-track {
          background: rgba(110,231,183,.2);
          border-color: rgba(110,231,183,.35);
        }
        .toggle-thumb {
          position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #888; transition: transform .25s, background .25s;
        }
        .toggle-input:checked + .toggle-track .toggle-thumb {
          transform: translateX(18px); background: #6ee7b7;
        }
        .toggle-text { font-size: .875rem; font-weight: 500; color: #c8c8d8; }

        /* Technologies */
        .tech-group { margin-bottom: 1rem; }
        .tech-group:last-child { margin-bottom: 0; }
        .tech-group-label {
          font-size: .68rem; text-transform: uppercase; letter-spacing: .08em;
          color: #444458; font-weight: 600; margin-bottom: .5rem;
        }
        .tech-options { display: flex; flex-wrap: wrap; gap: .35rem; }
        .tech-option {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          color: #888; font-size: .78rem;
          padding: .28rem .65rem; border-radius: 7px;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all .18s;
        }
        .tech-option:hover { background: rgba(255,255,255,.07); color: #c8c8d8; }
        .tech-option.selected {
          background: rgba(110,231,183,.1); color: #6ee7b7;
          border-color: rgba(110,231,183,.25); font-weight: 600;
        }

        @media (max-width: 900px) {
          .form-grid { grid-template-columns: 1fr; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
