// ==========================================================
//  app/admin/projets/page.tsx – Liste des projets
// ==========================================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProjectStatus } from '@prisma/client'
import ProjectActions from './ProjectActions'

export const metadata: Metadata = { title: 'Projets' }

interface Props {
  searchParams: { status?: string; q?: string; page?: string }
}

async function getProjects(filters: Props['searchParams']) {
  const status = (filters.status?.toUpperCase() as ProjectStatus) || undefined
  const search = filters.q || ''
  const page   = parseInt(filters.page || '1')
  const limit  = 10

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title:       { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        technologies: { include: { technology: { select: { name: true } } } },
        _count: { select: { technologies: true } },
      },
    }),
    prisma.project.count({ where }),
  ])

  return { projects, total, page, pages: Math.ceil(total / limit), limit }
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { projects, total, page, pages } = await getProjects(searchParams)

  const counts = await prisma.project.groupBy({
    by: ['status'],
    _count: true,
  })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projets</h1>
          <p className="page-sub">{total} projet{total > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/admin/projets/nouveau" className="btn-primary">+ Nouveau projet</Link>
      </div>

      {/* ── Filtres ── */}
      <div className="filters-bar">
        <div className="filter-tabs">
          {[
            { label: 'Tous',       value: '',          count: total },
            { label: 'Publiés',    value: 'published', count: countMap['PUBLISHED'] ?? 0 },
            { label: 'Brouillons', value: 'draft',     count: countMap['DRAFT'] ?? 0 },
            { label: 'Archivés',   value: 'archived',  count: countMap['ARCHIVED'] ?? 0 },
          ].map(tab => (
            <Link
              key={tab.value}
              href={`/admin/projets?status=${tab.value}`}
              className={`filter-tab ${(searchParams.status || '') === tab.value ? 'active' : ''}`}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </Link>
          ))}
        </div>

        {/* Recherche */}
        <form method="GET" className="search-form">
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
          <input
            type="search"
            name="q"
            defaultValue={searchParams.q}
            placeholder="Rechercher un projet..."
            className="search-input"
          />
        </form>
      </div>

      {/* ── Table des projets ── */}
      <div className="table-card">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div className="empty-title">Aucun projet trouvé</div>
            <Link href="/admin/projets/nouveau" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Créer votre premier projet
            </Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Projet</th>
                <th>Technologies</th>
                <th>Statut</th>
                <th>Mis en avant</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>
                    <div className="project-cell">
                      <Link href={`/admin/projets/${project.slug}`} className="project-title-link">
                        {project.title}
                      </Link>
                      <div className="project-slug">/{project.slug}</div>
                    </div>
                  </td>
                  <td>
                    <div className="tech-tags">
                      {project.technologies.slice(0, 3).map(pt => (
                        <span key={pt.technology.name} className="tech-tag">
                          {pt.technology.name}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="tech-tag more">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${project.status.toLowerCase()}`}>
                      {project.status === 'PUBLISHED' ? 'Publié'
                       : project.status === 'DRAFT'   ? 'Brouillon'
                       :                                'Archivé'}
                    </span>
                  </td>
                  <td>
                    <span className={`featured-pill ${project.featured ? 'yes' : 'no'}`}>
                      {project.featured ? '★ Oui' : '—'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td>
                    <ProjectActions slug={project.slug} status={project.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/projets?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`page-btn ${p === page ? 'active' : ''}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.75rem; gap: 1rem;
        }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -.02em;
          color: #e8e8f0; margin-bottom: .2rem;
        }
        .page-sub { font-size: .875rem; color: #666680; }
        .btn-primary {
          background: #6ee7b7; color: #0a0a12;
          padding: .6rem 1.25rem; border-radius: 8px;
          text-decoration: none; font-weight: 700;
          font-size: .85rem; font-family: 'Syne', sans-serif;
          white-space: nowrap; transition: opacity .2s;
        }
        .btn-primary:hover { opacity: .88; }

        /* Filtres */
        .filters-bar {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .filter-tabs { display: flex; gap: .35rem; flex-wrap: wrap; }
        .filter-tab {
          display: flex; align-items: center; gap: .4rem;
          padding: .45rem .9rem; border-radius: 8px;
          text-decoration: none; font-size: .82rem;
          font-weight: 500; color: #666680;
          border: 1px solid transparent;
          transition: all .18s;
        }
        .filter-tab:hover { color: #e8e8f0; background: rgba(255,255,255,.04); }
        .filter-tab.active {
          color: #6ee7b7; background: rgba(110,231,183,.08);
          border-color: rgba(110,231,183,.15);
        }
        .tab-count {
          background: rgba(255,255,255,.08);
          color: #888; font-size: .68rem; font-weight: 700;
          padding: .1rem .45rem; border-radius: 99px;
        }
        .filter-tab.active .tab-count { background: rgba(110,231,183,.1); color: #6ee7b7; }
        .search-form { display: flex; }
        .search-input {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px; padding: .5rem .875rem;
          color: #e8e8f0; font-size: .85rem;
          outline: none; width: 220px;
          transition: border-color .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .search-input:focus { border-color: rgba(110,231,183,.35); }
        .search-input::placeholder { color: #444458; }

        /* Table */
        .table-card {
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 14px; overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .data-table {
          width: 100%; border-collapse: collapse;
          font-size: .85rem;
        }
        .data-table th {
          padding: .75rem 1.25rem;
          text-align: left; font-size: .72rem;
          text-transform: uppercase; letter-spacing: .07em;
          color: #555568; font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,.06);
          background: rgba(255,255,255,.02);
        }
        .data-table td {
          padding: .9rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,.04);
          vertical-align: middle;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(255,255,255,.02); }

        .project-cell { min-width: 180px; }
        .project-title-link {
          font-weight: 600; color: #e8e8f0;
          text-decoration: none; font-size: .875rem;
          transition: color .18s;
        }
        .project-title-link:hover { color: #6ee7b7; }
        .project-slug { font-size: .72rem; color: #444458; margin-top: .15rem; }

        .tech-tags { display: flex; gap: .35rem; flex-wrap: wrap; }
        .tech-tag {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          color: #888; font-size: .7rem;
          padding: .15rem .5rem; border-radius: 5px;
        }
        .tech-tag.more { color: #555568; }

        .status-pill {
          font-size: .72rem; font-weight: 700;
          padding: .25rem .65rem; border-radius: 99px;
          white-space: nowrap;
        }
        .status-pill.published { background: rgba(110,231,183,.1); color: #6ee7b7; border: 1px solid rgba(110,231,183,.2); }
        .status-pill.draft     { background: rgba(255,255,255,.05); color: #888; border: 1px solid rgba(255,255,255,.08); }
        .status-pill.archived  { background: rgba(239,68,68,.08); color: #f87171; border: 1px solid rgba(239,68,68,.15); }

        .featured-pill { font-size: .78rem; color: #fbbf24; font-weight: 600; }
        .featured-pill.no { color: #333348; }

        .date-cell { color: #555568; font-size: .8rem; white-space: nowrap; }

        /* Pagination */
        .pagination { display: flex; gap: .4rem; justify-content: center; }
        .page-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          font-size: .82rem; font-weight: 600;
          color: #666680;
          border: 1px solid rgba(255,255,255,.06);
          transition: all .18s;
        }
        .page-btn:hover { background: rgba(255,255,255,.05); color: #e8e8f0; }
        .page-btn.active { background: rgba(110,231,183,.1); color: #6ee7b7; border-color: rgba(110,231,183,.2); }

        /* Empty */
        .empty-state {
          padding: 4rem 2rem; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { font-size: 1rem; color: #666680; font-weight: 500; }
      `}</style>
    </>
  )
}
