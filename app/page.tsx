// ==========================================================
//  app/page.tsx – Page publique principale du portfolio
//  Server Component : données chargées depuis Prisma
// ==========================================================

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import PublicNav from '@/components/PublicNav'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Charles Sacca – Développeur web full-stack',
}

// Chargement des données côté serveur
async function getPortfolioData() {
  const [projects, skillGroups, experiences, settings] = await Promise.all([
    prisma.project.findMany({
      where: { status: ProjectStatus.PUBLISHED },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        technologies: { include: { technology: { select: { name: true } } } },
      },
    }),
    prisma.skillGroup.findMany({
      orderBy: { order: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    }),
    prisma.experience.findMany({
      orderBy: [{ current: 'desc' }, { order: 'asc' }],
    }),
    prisma.siteSettings.findFirst(),
  ])
  return { projects, skillGroups, experiences, settings }
}

export default async function HomePage() {
  const { projects, skillGroups, experiences, settings } = await getPortfolioData()

  const siteTitle = settings?.siteTitle ?? 'Charles Sacca – Développeur web full-stack'
  const siteTagline = settings?.siteTagline ?? "Création d'applications web performantes et modernes"
  const bio = settings?.bio ?? "Développeur web full-stack avec plus de 4 ans d'expérience, je conçois des solutions numériques robustes pour startups, PME et clients internationaux."
  const available = settings?.available ?? true
  const githubUrl = settings?.githubUrl ?? 'https://github.com/charlessacca'
  const linkedinUrl = settings?.linkedinUrl ?? 'https://linkedin.com/in/charles-sacca'
  const email = settings?.email ?? 'contact@charlessacca.dev'

  return (
    <>
      <PublicNav />

      {/* ── HERO ── */}
      <section id="accueil" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '8rem 4rem 4rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbs décoratifs */}
        <div style={{ position: 'absolute', top: -200, right: -150, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,231,183,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, black 0%, transparent 100%)',
        }} />
        {settings?.avatarUrl && (
          <div style={{
            position: 'absolute', right: '6%', top: '30%',
            transform: 'translateY(-30%)',
            width: 'clamp(200px, 20vw, 320px)',
            height: 'clamp(200px, 20vw, 320px)',
            zIndex: 1,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(110,231,183,.3)',
            boxShadow: '0 0 40px rgba(110,231,183,.08)',
          }}>
            <img
              src={settings.avatarUrl}
              alt="Charles Sacca"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
              }}
            />
          </div>
        )}


        <div style={{ maxWidth: 820, position: 'relative', zIndex: 1 }}>
          {available && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              background: 'rgba(110,231,183,.08)', border: '1px solid rgba(110,231,183,.2)',
              color: 'var(--accent)', fontSize: '.75rem', fontWeight: 500,
              padding: '.375rem .9rem', borderRadius: 'var(--radius-full)',
              marginBottom: '2rem', letterSpacing: '.05em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2.2s ease-in-out infinite', display: 'inline-block' }} />
              Disponible pour missions freelance
            </div>
          )}

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(3rem, 5.2vw, 5.5rem)', lineHeight: 1.04,
            letterSpacing: '-0.04em', marginBottom: '1.5rem',
          }}>
            <span>{settings?.fullName ?? 'Charles Sacca'}</span><br />
            <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 'clamp(2.5rem, 3vw, 3rem)' }}>Développeur web </span>
            <span style={{ color: 'var(--accent)', fontSize: 'clamp(2.5rem, 3vw, 3rem)' }}>full&#8209;stack</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--muted)', maxWidth: 540, marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.8 }}>
            {siteTagline}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <a href="#projets" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              background: 'var(--accent)', color: '#0a0a0f',
              padding: '.8rem 1.85rem', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontWeight: 700, fontSize: '.9rem',
              fontFamily: 'var(--font-display)',
            }}>
              Voir mes projets →
            </a>
            <a href="#contact" style={{
              display: 'inline-flex', alignItems: 'center',
              border: '1px solid var(--border-2)', color: 'var(--muted)',
              padding: '.8rem 1.85rem', borderRadius: 'var(--radius-sm)',
              textDecoration: 'none', fontWeight: 500, fontSize: '.9rem',
            }}>
              Me contacter
            </a>
            {settings?.cvUrl && (
              <a href={settings.cvUrl} download style={{
                display: 'inline-flex', alignItems: 'center',
                border: '1px solid var(--border-2)', color: 'var(--muted)',
                padding: '.8rem 1.85rem', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontWeight: 500, fontSize: '.9rem',
              }}>
                Télécharger le CV
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: '3.5rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
            {[
              { num: '4+', label: "Années d'expérience" },
              { num: `${projects.length}+`, label: 'Projets livrés' },
              { num: '10+', label: 'Technologies maîtrisées' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem', lineHeight: 1, marginBottom: '.25rem' }}>{s.num}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ── À PROPOS ── */}
      <section id="apropos" style={{ padding: '6rem 4rem', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>À propos</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Un développeur passionné<br />basé au Bénin
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '4rem', marginTop: '2rem' }}>
          <div>
            <div style={{
              width: 120, height: 120, borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(110,231,183,.15), rgba(59,130,246,.1))',
              border: '1px solid rgba(110,231,183,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--accent)',
              marginBottom: '1.5rem',
            }}>
              {settings?.avatarUrl
                ? <img src={settings.avatarUrl} alt="Charles Sacca" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: 'inherit' }} />
                : 'CS'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[
                settings?.location ?? 'Cotonou, Bénin',
                'Remote – France / International',
                'Français · Anglais (B2)',
                available ? 'Disponible maintenant' : 'Non disponible',
              ].map(info => (
                <div key={info} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', fontSize: '.875rem', color: 'var(--muted)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }} />
                  {info}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.85, marginBottom: '1.25rem' }}>{bio}</p>
            <p style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.85 }}>
              Basé à Cotonou, je travaille en remote pour des clients en Europe et en Afrique.
              Freelance et ouvert aux collaborations long terme.
            </p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              {['Frontend Developer', 'Backend Developer', 'Full-Stack', 'API Design', 'Freelance'].map(role => (
                <span key={role} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: '.8rem',
                  padding: '.35rem .85rem', borderRadius: 'var(--radius-full)', fontWeight: 500,
                }}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPÉTENCES ── */}
      <section id="competences" style={{ padding: '6rem 4rem' }}>
        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>Stack technique</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>Compétences</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {skillGroups.map(group => (
            <div key={group.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: group.color ? `${group.color}18` : 'rgba(110,231,183,.1)',
                  color: group.color ?? 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>
                  {group.icon === 'monitor' ? '⚛' : group.icon === 'server' ? '⚙' : '🔧'}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.95rem' }}>{group.name}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
                {group.items.map(item => (
                  <span key={item.id} style={{
                    background: 'rgba(255,255,255,.04)', border: '1px solid var(--border)',
                    color: 'var(--muted)', fontSize: '.78rem',
                    padding: '.28rem .7rem', borderRadius: 'var(--radius-sm)',
                  }}>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROJETS ── */}
      <section id="projets" style={{ padding: '0 4rem 6rem' }}>
        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>Réalisations</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>Projets récents</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {projects.map((project, i) => (
            <article key={project.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            }}>
              <div style={{
                height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem',
                background: [
                  'linear-gradient(135deg, rgba(59,130,246,.14), rgba(110,231,183,.07))',
                  'linear-gradient(135deg, rgba(245,158,11,.14), rgba(239,68,68,.07))',
                  'linear-gradient(135deg, rgba(168,85,247,.14), rgba(59,130,246,.07))',
                  'linear-gradient(135deg, rgba(110,231,183,.14), rgba(16,185,129,.07))',
                  'linear-gradient(135deg, rgba(239,68,68,.14), rgba(245,158,11,.07))',
                  'linear-gradient(135deg, rgba(16,185,129,.14), rgba(59,130,246,.07))',
                ][i % 6],
              }}>
                {project.thumbnail
                  ? <img src={project.thumbnail} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '📁'}
              </div>
              <div style={{ padding: '1.25rem 1.5rem 1.75rem' }}>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
                  {project.technologies.slice(0, 4).map(pt => (
                    <span key={pt.technology.name} style={{
                      fontSize: '.7rem', padding: '.2rem .65rem', borderRadius: 4, fontWeight: 600,
                      background: 'rgba(110,231,183,.08)', color: 'var(--accent)',
                      border: '1px solid rgba(110,231,183,.15)',
                    }}>
                      {pt.technology.name}
                    </span>
                  ))}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '.45rem' }}>{project.title}</h3>
                {project.subtitle && <p style={{ fontSize: '.8rem', color: 'var(--accent)', marginBottom: '.45rem', fontWeight: 500 }}>{project.subtitle}</p>}
                <p style={{ color: 'var(--muted)', fontSize: '.875rem', lineHeight: 1.65, marginBottom: '1.1rem', fontWeight: 300 }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '.85rem', alignItems: 'center' }}>
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>→ Voir la démo</a>
                  )}
                  {project.demoUrl && project.githubUrl && (
                    <span style={{ width: 1, height: 12, background: 'var(--border-2)', display: 'inline-block' }} />
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'none' }}>GitHub</a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── EXPÉRIENCES ── */}
      <section id="experience" style={{ padding: '0 4rem 6rem', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', paddingTop: '6rem' }}>
        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>Parcours</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>Expériences professionnelles</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {experiences.map(exp => (
            <div key={exp.id} style={{
              display: 'grid', gridTemplateColumns: '160px 1fr', gap: '2.5rem',
              padding: '1.5rem 1.75rem', background: 'var(--card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            }}>
              <div>
                <div style={{ fontSize: '.8rem', color: 'var(--muted)', paddingTop: '.3rem' }}>
                  {new Date(exp.startDate).getFullYear()} – {exp.current ? 'Présent' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                </div>
                {exp.current && (
                  <span style={{
                    display: 'inline-block', marginTop: '.5rem', fontSize: '.68rem', fontWeight: 600,
                    padding: '.2rem .6rem', borderRadius: 'var(--radius-full)',
                    background: 'rgba(110,231,183,.1)', color: 'var(--accent)',
                    border: '1px solid rgba(110,231,183,.2)', textTransform: 'uppercase', letterSpacing: '.05em',
                  }}>En poste</span>
                )}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '.3rem' }}>{exp.role}</div>
                <div style={{ fontSize: '.875rem', color: 'var(--accent-blue)', marginBottom: '.6rem', fontWeight: 500 }}>{exp.company}{exp.location ? ` – ${exp.location}` : ''}</div>
                <p style={{ fontSize: '.875rem', color: 'var(--muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: '.75rem' }}>{exp.description}</p>
                {exp.techStack.length > 0 && (
                  <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                    {exp.techStack.map(t => (
                      <span key={t} style={{
                        fontSize: '.7rem', color: 'var(--muted)',
                        border: '1px solid var(--border)', padding: '.15rem .55rem', borderRadius: 4,
                      }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: '6rem 4rem' }}>
        <span style={{ display: 'inline-block', fontSize: '.7rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.75rem' }}>Contact</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.02em', marginBottom: '3rem' }}>Travaillons ensemble</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem' }}>
          <div>
            <p style={{ color: 'var(--muted)', fontWeight: 300, fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              Disponible pour des projets freelance, des collaborations ou des postes en CDI/CDD.
              Je réponds sous 24h.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {[
                { label: 'GH', text: githubUrl.replace('https://', ''), href: githubUrl },
                { label: 'LI', text: linkedinUrl.replace('https://', ''), href: linkedinUrl },
                { label: '@', text: email, href: `mailto:${email}` },
              ].map(link => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '.85rem',
                  color: 'var(--muted)', textDecoration: 'none', fontSize: '.9rem',
                  padding: '.65rem .875rem', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', background: 'var(--card)',
                }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                    flexShrink: 0, background: 'var(--bg-3)', color: 'var(--muted)',
                  }}>{link.label}</span>
                  {link.text}
                </a>
              ))}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '2rem 4rem', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
      }}>
        <div style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
          © {new Date().getFullYear()} Charles Sacca – Tous droits réservés
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            { label: 'GitHub', href: githubUrl },
            { label: 'LinkedIn', href: linkedinUrl },
            { label: 'Admin', href: '/admin' },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.85rem' }}>{l.label}</a>
          ))}
        </div>
      </footer>
    </>
  )
}
