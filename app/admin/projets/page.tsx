// ==========================================================
//  app/admin/projets/page.tsx
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
  const page = parseInt(filters.page || '1')
  const limit = 10

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
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

  const counts = await prisma.project.groupBy({ by: ['status'], _count: true })
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

      <div className="filters-bar">
        <div className="filter-tabs">
          {[
            { label: 'Tous', value: '', count: total },
            { label: 'Publiés', value: 'published', count: countMap['PUBLISHED'] ?? 0 },
            { label: 'Brouillons', value: 'draft', count: countMap['DRAFT'] ?? 0 },
            { label: 'Archivés', value: 'archived', count: countMap['ARCHIVED'] ?? 0 },
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
        <form method="GET" className="search-form">
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
          <input
            type="search" name="q"
            defaultValue={searchParams.q}
            placeholder="Rechercher un projet..."
            className="search-input"
          />
        </form>
      </div>

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
                <th className="hide-mobile">Technologies</th>
                <th>Statut</th>
                <th className="hide-mobile">Mis en avant</th>
                <th className="hide-mobile">Date</th>
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
                  <td className="hide-mobile">
                    <div className="tech-tags">
                      {project.technologies.slice(0, 3).map(pt => (
                        <span key={pt.technology.name} className="tech-tag">{pt.technology.name}</span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="tech-tag more">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${project.status.toLowerCase()}`}>
                      {project.status === 'PUBLISHED' ? 'Publié' : project.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                    </span>
                  </td>
                  <td className="hide-mobile">
                    <span className={`featured-pill ${project.featured ? 'yes' : 'no'}`}>
                      {project.featured ? '★ Oui' : '—'}
                    </span>
                  </td>
                  <td className="date-cell hide-mobile">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
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

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/projets?page=${p}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`page-btn ${p === page ? 'active' : ''}`}
            >{p}</Link>
          ))}
        </div>
      )}

      <style>{`
        .page-header {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;
        }
        .page-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 1.6rem; letter-spacing: -.02em;
          color: var(--admin-text); margin-bottom: .2rem;
        }
        .page-sub { font-size: .875rem; color: var(--admin-muted); }

        .btn-primary {
          background: var(--admin-accent); color: #ffffff;
          padding: .6rem 1.25rem; border-radius: 8px;
          text-decoration: none; font-weight: 700;
          font-size: .85rem; font-family: 'Syne', sans-serif;
          white-space: nowrap; transition: opacity .2s;
          display: inline-block;
        }
        .btn-primary:hover { opacity: .88; }

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
          background: var(--admin-accent-m); color: var(--admin-accent);
        }

        .search-form { display: flex; }
        .search-input {
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 8px; padding: .5rem .875rem;
          color: var(--admin-text); font-size: .85rem;
          outline: none; width: 220px; max-width: 100%;
          transition: border-color .2s;
          font-family: 'DM Sans', sans-serif;
        }
        .search-input:focus { border-color: var(--admin-accent); }
        .search-input::placeholder { color: var(--admin-muted); }

        .table-card {
          background: var(--admin-card);
          border: 1px solid var(--admin-border);
          border-radius: 14px; overflow: hidden;
          margin-bottom: 1.5rem; overflow-x: auto;
        }
        .data-table {
          width: 100%; border-collapse: collapse; font-size: .85rem;
          min-width: 500px;
        }
        .data-table th {
          padding: .75rem 1.25rem; text-align: left;
          font-size: .72rem; text-transform: uppercase;
          letter-spacing: .07em; color: var(--admin-muted);
          font-weight: 600; border-bottom: 1px solid var(--admin-border);
          background: var(--admin-bg); white-space: nowrap;
        }
        .data-table td {
          padding: .9rem 1.25rem;
          border-bottom: 1px solid var(--admin-border);
          vertical-align: middle;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: var(--admin-bg); }

        .project-cell { min-width: 160px; }
        .project-title-link {
          font-weight: 600; color: var(--admin-text);
          text-decoration: none; font-size: .875rem; transition: color .18s;
        }
        .project-title-link:hover { color: var(--admin-accent); }
        .project-slug { font-size: .72rem; color: var(--admin-muted); margin-top: .15rem; }

        .tech-tags { display: flex; gap: .35rem; flex-wrap: wrap; }
        .tech-tag {
          background: var(--admin-bg); border: 1px solid var(--admin-border);
          color: var(--admin-muted); font-size: .7rem;
          padding: .15rem .5rem; border-radius: 5px;
        }
        .tech-tag.more { color: var(--admin-muted); }

        .status-pill {
          font-size: .72rem; font-weight: 700;
          padding: .25rem .65rem; border-radius: 99px; white-space: nowrap;
        }
        .status-pill.published { background: #EBF0FD; color: #1A56DB; border: 1px solid #C7D4F9; }
        .status-pill.draft     { background: var(--admin-bg-2); color: var(--admin-muted); border: 1px solid var(--admin-border); }
        .status-pill.archived  { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }

        .featured-pill { font-size: .78rem; color: #B45309; font-weight: 600; }
        .featured-pill.no { color: var(--admin-muted); }

        .date-cell { color: var(--admin-muted); font-size: .8rem; white-space: nowrap; }

        .pagination { display: flex; gap: .4rem; justify-content: center; }
        .page-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; text-decoration: none;
          font-size: .82rem; font-weight: 600; color: var(--admin-muted);
          border: 1px solid var(--admin-border); transition: all .18s;
        }
        .page-btn:hover { background: var(--admin-bg-2); color: var(--admin-text); }
        .page-btn.active { background: var(--admin-accent); color: #fff; border-color: var(--admin-accent); }

        .empty-state {
          padding: 4rem 2rem; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { font-size: 1rem; color: var(--admin-muted); font-weight: 500; }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .page-header { flex-direction: column; }
          .filters-bar { flex-direction: column; align-items: flex-start; }
          .search-input { width: 100%; }
        }
      `}</style>
    </>
  )
}
