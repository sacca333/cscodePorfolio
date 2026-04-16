'use client'
// ==========================================================
//  components/ContactForm.tsx
//  Formulaire de contact — appelle POST /api/contact
// ==========================================================

import { useState } from 'react'

interface FormState {
  name: string; email: string; subject: string; message: string
}

interface FieldErrors {
  name?: string; email?: string; subject?: string; message?: string
}

const EMPTY: FormState = { name: '', email: '', subject: '', message: '' }

export default function ContactForm() {
  const [form,     setForm]     = useState<FormState>(EMPTY)
  const [errors,   setErrors]   = useState<FieldErrors>({})
  const [sending,  setSending]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [apiError, setApiError] = useState('')

  const set = (k: keyof FormState, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setApiError('')
    setErrors({})

    const res = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, website: '' }), // honeypot vide
    })

    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
      setForm(EMPTY)
    } else if (res.status === 422 && data.fields) {
      setErrors(data.fields)
    } else if (res.status === 429) {
      setApiError('Trop de messages envoyés. Réessayez dans une heure.')
    } else {
      setApiError(data.error ?? 'Une erreur est survenue. Veuillez réessayer.')
    }

    setSending(false)
  }

  if (success) {
    return (
      <div style={{
        background: 'rgba(110,231,183,.06)', border: '1px solid rgba(110,231,183,.2)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '.5rem' }}>
          Message envoyé !
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
          Je vous répondrai dans les 24 à 48 heures.
        </p>
        <button
          onClick={() => setSuccess(false)}
          style={{
            marginTop: '1.5rem', background: 'none', border: '1px solid var(--border)',
            color: 'var(--muted)', padding: '.5rem 1.25rem', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontSize: '.85rem', fontFamily: 'var(--font-body)',
          }}
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  const inputStyle = (hasError?: string): React.CSSProperties => ({
    background: 'var(--bg-3)', border: `1px solid ${hasError ? 'rgba(239,68,68,.5)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)', padding: '.8rem 1.05rem',
    color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem',
    outline: 'none', width: '100%', transition: 'border-color .2s',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: '.75rem', textTransform: 'uppercase',
    letterSpacing: '.06em', color: 'var(--muted)', fontWeight: 500,
    display: 'block', marginBottom: '.45rem',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '.72rem', color: '#f87171', marginTop: '.25rem',
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Honeypot anti-bot */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }} aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {apiError && (
        <div style={{
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)',
          color: '#f87171', padding: '.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '.875rem',
        }}>
          {apiError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Nom complet</label>
          <input
            type="text" value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Jean Dupont" required autoComplete="name"
            style={inputStyle(errors.name)}
          />
          {errors.name && <span style={errorStyle}>{errors.name}</span>}
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="jean@exemple.com" required autoComplete="email"
            style={inputStyle(errors.email)}
          />
          {errors.email && <span style={errorStyle}>{errors.email}</span>}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Sujet</label>
        <input
          type="text" value={form.subject} onChange={e => set('subject', e.target.value)}
          placeholder="Projet web, mission freelance..." required
          style={inputStyle(errors.subject)}
        />
        {errors.subject && <span style={errorStyle}>{errors.subject}</span>}
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          value={form.message} onChange={e => set('message', e.target.value)}
          placeholder="Décrivez votre projet et vos besoins..." required
          rows={5} style={{ ...inputStyle(errors.message), resize: 'vertical', lineHeight: 1.6 }}
        />
        {errors.message && <span style={errorStyle}>{errors.message}</span>}
      </div>

      <button
        type="submit" disabled={sending}
        style={{
          background: 'var(--accent)', color: '#0a0a0f',
          border: 'none', padding: '.9rem 2.25rem',
          borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '.9rem',
          cursor: sending ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-display)', alignSelf: 'flex-start',
          opacity: sending ? .6 : 1, transition: 'opacity .2s',
        }}
      >
        {sending ? 'Envoi en cours...' : 'Envoyer le message →'}
      </button>
    </form>
  )
}
