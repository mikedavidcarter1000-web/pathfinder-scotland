'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BLOG_CATEGORIES,
  categoryColour,
  formatDisplayDate,
  type BlogArticle,
  type BlogCategory,
} from '@/lib/blog-shared'

const PAGE_SIZE = 12
type Filter = 'All' | BlogCategory

export function BlogList({ articles }: { articles: BlogArticle[] }) {
  const [filter, setFilter] = useState<Filter>('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (filter === 'All') return articles
    return articles.filter((a) => a.category === filter)
  }, [articles, filter])

  const featured = useMemo(() => filtered.filter((a) => a.featured), [filtered])
  const standard = useMemo(() => filtered.filter((a) => !a.featured), [filtered])

  const totalPages = Math.max(1, Math.ceil(standard.length / PAGE_SIZE))
  const pagedStandard = standard.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleFilter = (next: Filter) => {
    setFilter(next)
    setPage(1)
  }

  const tabs: Filter[] = ['All', ...BLOG_CATEGORIES]

  return (
    <div>
      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter articles by category"
        className="flex flex-wrap gap-2"
        style={{ marginBottom: '32px' }}
      >
        {tabs.map((tab) => {
          const active = filter === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={active}
              onClick={() => handleFilter(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                border: active ? '1px solid var(--pf-blue-700)' : '1px solid var(--pf-grey-300)',
                backgroundColor: active ? 'var(--pf-blue-700)' : 'var(--pf-white)',
                color: active ? '#fff' : 'var(--pf-grey-900)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: '40px',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div
          className="pf-card"
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <p style={{ color: 'var(--pf-grey-600)', margin: 0 }}>
            No articles in this category yet — check back soon.
          </p>
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            marginBottom: standard.length > 0 ? '40px' : '0',
          }}
        >
          {featured.map((article) => (
            <FeaturedCard key={article.slug} article={article} />
          ))}
        </div>
      )}

      {/* Standard grid */}
      {pagedStandard.length > 0 && (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {pagedStandard.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-2"
          style={{ marginTop: '40px' }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pf-btn-secondary pf-btn-sm"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span
            style={{
              padding: '0 16px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--pf-grey-600)',
            }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pf-btn-secondary pf-btn-sm"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}

function CategoryBadge({ category }: { category: BlogCategory }) {
  const { bg, fg } = categoryColour(category)
  return (
    <span
      className="inline-flex items-center"
      style={{
        backgroundColor: bg,
        color: fg,
        borderRadius: '9999px',
        padding: '4px 12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
        lineHeight: 1.2,
      }}
    >
      {category}
    </span>
  )
}

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{ padding: '24px' }}
      aria-label={`${article.title} — read article`}
    >
      <div style={{ marginBottom: '16px' }}>
        <CategoryBadge category={article.category} />
      </div>
      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          fontSize: '1.1875rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '12px',
          lineHeight: 1.3,
        }}
      >
        {article.title}
      </h3>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '0.9375rem',
          lineHeight: 1.6,
          marginBottom: '20px',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {article.description}
      </p>
      <div
        className="flex items-center gap-3"
        style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
      >
        <time dateTime={article.date}>{formatDisplayDate(article.date)}</time>
        <span aria-hidden="true">•</span>
        <span>{article.readingTime} min read</span>
      </div>
    </Link>
  )
}

function FeaturedCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="pf-card-hover no-underline hover:no-underline flex flex-col h-full"
      style={{
        padding: '32px',
        borderTop: '4px solid var(--pf-blue-700)',
      }}
      aria-label={`${article.title} — featured article`}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
        <CategoryBadge category={article.category} />
        <span
          className="inline-flex items-center"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: '#B45309',
            borderRadius: '9999px',
            padding: '4px 10px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Featured
        </span>
      </div>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: 'var(--pf-grey-900)',
          marginBottom: '12px',
          lineHeight: 1.25,
        }}
      >
        {article.title}
      </h2>
      <p
        style={{
          color: 'var(--pf-grey-600)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '24px',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {article.description}
      </p>
      <div
        className="flex items-center gap-3"
        style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}
      >
        <time dateTime={article.date}>{formatDisplayDate(article.date)}</time>
        <span aria-hidden="true">•</span>
        <span>{article.readingTime} min read</span>
      </div>
    </Link>
  )
}
