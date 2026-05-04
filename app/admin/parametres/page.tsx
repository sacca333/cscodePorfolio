'use client'
// ==========================================================
//  app/admin/parametres/page.tsx
// ==========================================================

import { useState, useEffect } from 'react'

interface Settings {
  siteTitle: string; siteTagline: string; siteDescription: string
  fullName: string; bio: string; location: string; email: string
  phone: string; available: boolean; cvUrl: string; avatarUrl: string
  githubUrl: string; linkedinUrl: string; twitterUrl: string
  googleAnalyticsId: string; metaDescription: string
}

const EMPTY: Settings = {
  siteTitle: '', siteTagline: '', siteDescription: '',
  fullName: '', bio: '', location: '', email: '',
  phone: '', available: true, cvUrl: '', avatarUrl: '',
  githubUrl: '', linkedinUrl: '', twitterUrl: '',
  googleAnalyticsId: '', metaDescription: '',
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'profil' | 'seo' | 'reseaux'>('profil')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(({ data }) => { if (data) setSettings(data); setLoading(false) })
  }, [])

  const set = (k: keyof Settings, v: any) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError('')
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else { const { error: e } = await res.json(); setError(e ?? 'Erreur de sauvegarde') }
    setSaving(false)
  }

  if (loading) return (
    <div style={{ color: 'var(--admin-muted)', padding: '3rem', textAlign: 'center' }}>
      Chargement...
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-sub">Personnalisez votre portfolio</p>
        </div>
        <div className="header-actions">
          {saved && <span className="saved-badge">✓ Sauvegardé</span>}
          {error && <span className="error-badge">{error}</span>}
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Sauvegarde...' : 'Sauvegarder les changements'}
          </button>
        </div>
      </div>

      <div className="tabs">
        {(['profil', 'seo', 'reseaux'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>
            {{ profil: '👤 Profil', seo: '🔍 SEO & Site', reseaux: '🔗 Réseaux sociaux' }[t]}
          </button>
        ))}
      </div>

      <div className="settings-body">

        {tab === 'profil' && (
          <div className="settings-grid">
            <div className="form-card">
              <h2 className="section-title">Identité</h2>
              <Field label="Nom complet">
                <input value={settings.fullName} onChange={e => set('fullName', e.target.value)} className="input" placeholder="Charles Sacca" />
              </Field>
              <Field label="Localisation">
                <input value={settings.location} onChange={e => set('location', e.target.value)} className="input" placeholder="Cotonou, Bénin" />
              </Field>
              <Field label="Email de contact (public)">
                <input type="email" value={settings.email} onChange={e => set('email', e.target.value)} className="input" placeholder="contact@charlessacca.dev" />
              </Field>
              <Field label="Téléphone (optionnel)">
                <input value={settings.phone} onChange={e => set('phone', e.target.value)} className="input" placeholder="+229 XX XX XX XX" />
              </Field>
              <Field label="URL du CV (PDF)">
                <input value={settings.cvUrl} onChange={e => set('cvUrl', e.target.value)} className="input" placeholder="https://charlessacca.dev/cv.pdf" />
              </Field>
              <Field label="Biographie courte">
                <textarea
                  value={settings.bio} onChange={e => set('bio', e.target.value)}
                  className="input textarea" rows={4}
                  placeholder="Développeur web full-stack passionné..."
                />
                <span className="hint">{settings.bio.length} / 500 caractères</span>
              </Field>
              <div className="toggle-field">
                <div>
                  <div className="toggle-label">Disponible pour des missions</div>
                  <div className="toggle-hint">Affiche le badge "Disponible" sur le portfolio</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={settings.available} onChange={e => set('available', e.target.checked)} className="toggle-input" />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
            </div>

            <div className="form-card">
              <h2 className="section-title">Avatar & médias</h2>
              <Field label="URL de votre photo / avatar">
                <input value={settings.avatarUrl} onChange={e => set('avatarUrl', e.target.value)} className="input" placeholder="https://..." />
              </Field>
              {settings.avatarUrl && (
                <div className="avatar-preview">
                  <img src={settings.avatarUrl} alt="Aperçu avatar" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <p className="hint" style={{ marginTop: '1rem' }}>
                Hébergez votre photo sur Cloudinary, Imgur ou tout autre service. Taille recommandée : 400×400px.
              </p>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="form-card">
            <h2 className="section-title">SEO & Métadonnées</h2>
            <Field label="Titre du site (balise title)">
              <input value={settings.siteTitle} onChange={e => set('siteTitle', e.target.value)} className="input" placeholder="Charles Sacca – Développeur Full-Stack" />
              <span className="hint">{settings.siteTitle.length} / 60 caractères recommandés</span>
            </Field>
            <Field label="Accroche / tagline">
              <input value={settings.siteTagline} onChange={e => set('siteTagline', e.target.value)} className="input" placeholder="Création d'applications web performantes" />
            </Field>
            <Field label="Description SEO (meta description)">
              <textarea
                value={settings.siteDescription} onChange={e => set('siteDescription', e.target.value)}
                className="input textarea" rows={3}
                placeholder="Portfolio de Charles Sacca, développeur web full-stack basé à Cotonou, Bénin..."
              />
              <span className={`hint ${settings.siteDescription.length > 160 ? 'hint-warn' : ''}`}>
                {settings.siteDescription.length} / 160 caractères (recommandé pour Google)
              </span>
            </Field>
            <Field label="ID Google Analytics (optionnel)">
              <input value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)} className="input" placeholder="G-XXXXXXXXXX" />
            </Field>
            <div className="serp-preview">
              <div className="serp-title">{settings.siteTitle || 'Titre de votre page'}</div>
              <div className="serp-url">charlessacca.dev</div>
              <div className="serp-desc">{settings.siteDescription || 'Description de votre site...'}</div>
            </div>
            <p className="hint" style={{ marginTop: '.5rem', textAlign: 'center' }}>Aperçu Google (simulé)</p>
          </div>
        )}

        {tab === 'reseaux' && (
          <div className="form-card">
            <h2 className="section-title">Liens réseaux sociaux</h2>
            <Field label="GitHub">
              <input value={settings.githubUrl} onChange={e => set('githubUrl', e.target.value)} className="input" placeholder="https://github.com/charlessacca" />
            </Field>
            <Field label="LinkedIn">
              <input value={settings.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} className="input" placeholder="https://linkedin.com/in/charles-sacca" />
            </Field>
            <Field label="Twitter / X (optionnel)">
              <input value={settings.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} className="input" placeholder="https://twitter.com/charlessacca" />
            </Field>
          </div>
        )}

      </div>

      <style>{`
        .page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;
        }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -.02em;
          color: var(--admin-text); margin-bottom: .2rem;
        }
        .page-sub { font-size: .875rem; color: var(--admin-muted); }
        .header-actions { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }

        .saved-badge {
          font-size: .8rem; color: #065F46;
          background: #ECFDF5; padding: .3rem .75rem;
          border-radius: 99px; border: 1px solid #A7F3D0; font-weight: 600;
        }
        .error-badge {
          font-size: .8rem; color: #991B1B;
          background: #FEF2F2; padding: .3rem .75rem;
          border-radius: 99px; border: 1px solid #FECACA;
        }
        .btn-primary {
          background: var(--admin-accent); color: #ffffff;
          padding: .6rem 1.35rem; border-radius: 8px;
          border: none; font-weight: 700; font-size: .85rem;
          font-family: 'Syne', sans-serif; cursor: pointer; transition: opacity .2s;
        }
        .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .btn-primary:hover:not(:disabled) { opacity: .88; }

        .tabs { display: flex; gap: .35rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .tab-btn {
          padding: .5rem 1rem; border-radius: 9px;
          background: transparent; border: 1px solid transparent;
          color: var(--admin-muted); font-size: .85rem; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .18s;
        }
        .tab-btn:hover {
          color: var(--admin-text);
          background: var(--admin-bg);
          border-color: var(--admin-border);
        }
        .tab-btn.active {
          color: var(--admin-accent);
          background: var(--admin-accent-l);
          border-color: var(--admin-accent-m);
        }

        .settings-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .form-card {
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 14px; padding: 1.75rem;
        }
        .section-title {
          font-family: 'Syne', sans-serif; font-weight: 700;
          font-size: .95rem; color: var(--admin-text); margin-bottom: 1.5rem;
        }

        .input {
          background: var(--admin-bg);
          border: 1px solid var(--admin-border);
          border-radius: 9px; padding: .65rem .9rem;
          color: var(--admin-text); font-family: 'DM Sans', sans-serif;
          font-size: .875rem; outline: none; width: 100%; transition: border-color .2s;
        }
        .input:focus { border-color: var(--admin-accent); }
        .input::placeholder { color: var(--admin-muted); opacity: .6; }
        .textarea { resize: vertical; line-height: 1.6; }
        .hint { font-size: .72rem; color: var(--admin-muted); display: block; margin-top: .3rem; }
        .hint-warn { color: #991B1B; }

        .toggle-field {
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem;
          padding: 1rem 0; border-top: 1px solid var(--admin-border); margin-top: 1rem;
        }
        .toggle-label { font-size: .875rem; font-weight: 600; color: var(--admin-text); }
        .toggle-hint  { font-size: .75rem; color: var(--admin-muted); margin-top: .15rem; }
        .toggle { display: flex; cursor: pointer; }
        .toggle-input { display: none; }
        .toggle-track {
          width: 44px; height: 24px; border-radius: 99px;
          background: var(--admin-border-2);
          border: 1px solid var(--admin-border);
          position: relative; transition: background .25s, border-color .25s;
        }
        .toggle-input:checked + .toggle-track {
          background: var(--admin-accent);
          border-color: var(--admin-accent);
        }
        .toggle-thumb {
          position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform .25s;
          box-shadow: 0 1px 3px rgba(0,0,0,.15);
        }
        .toggle-input:checked + .toggle-track .toggle-thumb {
          transform: translateX(20px);
        }

        .avatar-preview {
          width: 80px; height: 80px; border-radius: 14px;
          overflow: hidden; border: 1px solid var(--admin-border); margin-top: .75rem;
        }
        .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

        .serp-preview {
          background: #fff; border: 1px solid #E5E3DC;
          border-radius: 10px; padding: 1.25rem 1.5rem; margin-top: 1.5rem;
        }
        .serp-title { color: #1a0dab; font-size: 1.05rem; font-weight: 400; margin-bottom: .2rem; }
        .serp-url   { color: #006621; font-size: .8rem; margin-bottom: .3rem; }
        .serp-desc  { color: #545454; font-size: .875rem; line-height: 1.5; }

        @media (max-width: 900px) {
          .settings-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; }
          .header-actions { width: 100%; justify-content: flex-end; }
        }

        @media (max-width: 480px) {
          .form-card { padding: 1.25rem; }
          .btn-primary { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={{
        display: 'block', fontSize: '.75rem',
        textTransform: 'uppercase', letterSpacing: '.06em',
        color: 'var(--admin-muted)', fontWeight: 600, marginBottom: '.45rem',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}
