import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getArticleBySlug,
  getArticles,
  getArticleSlugs,
  getRelatedArticles,
  getNextArticle,
  formatDisplayDate,
  categoryColour,
  type BlogCategory,
} from '@/lib/blog'
import { ArticleContent } from '@/components/blog/article-content'
import { ArticleFooter } from '@/components/blog/article-footer'

const SITE_URL = 'https://pathfinder-scotland.vercel.app'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) {
    return { title: 'Article not found' }
  }
  return {
    title: `${article.title} | Pathfinder Scotland Blog`,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.updated,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}

const TOOL_LINKS: Record<BlogCategory, Array<{ href: string; label: string; description: string }>> = {
  'Subject Choices': [
    { href: '/pathways', label: 'Pathway planner', description: 'Sketch your S3 to S6 timetable' },
    { href: '/subjects', label: 'Subjects database', description: 'Browse every SQA subject' },
    { href: '/simulator', label: 'Choice simulator', description: 'Compare combinations' },
  ],
  'Widening Access': [
    { href: '/widening-access', label: 'Eligibility check', description: 'Enter your postcode' },
    { href: '/courses', label: 'Browse courses', description: 'See contextual offers' },
  ],
  University: [
    { href: '/courses', label: 'Course search', description: 'Find your shortlist' },
    { href: '/universities', label: 'Universities', description: 'All Scottish institutions' },
    { href: '/simulator', label: 'Grades simulator', description: 'Model outcomes' },
  ],
  Careers: [
    { href: '/careers', label: 'Career sectors', description: 'Browse all career paths' },
    { href: '/pathways', label: 'Pathway planner', description: 'Plan your subjects' },
    { href: '/discover', label: 'Discover tool', description: 'Explore options' },
  ],
  'AI & Future': [
    { href: '/careers', label: 'Career AI ratings', description: 'See AI impact per sector' },
    { href: '/simulator', label: 'Future-proof simulator', description: 'Test combinations' },
    { href: '/discover', label: 'Discover careers', description: 'Find resilient paths' },
  ],
  Parents: [
    { href: '/parents', label: 'Parents page', description: 'Tools for families' },
    { href: '/widening-access', label: 'Widening access', description: 'Check eligibility' },
    { href: '/pathways', label: 'Pathway planner', description: 'Plan together' },
  ],
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const related = getRelatedArticles(slug, article.category, 3)
  const next = getNextArticle(slug)
  const tools = TOOL_LINKS[article.category] ?? []
  const { bg: catBg, fg: catFg } = categoryColour(article.category)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pathfinder Scotland',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-white.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}`,
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE_URL}/blog` },
      {
        '@type': 'ListItem',
        position: 2,
        name: article.category,
        item: `${SITE_URL}/blog?category=${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${SITE_URL}/blog/${article.slug}`,
      },
    ],
  }

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          padding: '16px 0',
        }}
      >
        <div className="pf-container">
          <ol
            className="flex flex-wrap items-center gap-2"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--pf-grey-600)',
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <Link
                href="/blog"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                }}
              >
                {article.category}
              </span>
            </li>
            <li aria-hidden="true">/</li>
            <li
              style={{
                color: 'var(--pf-grey-900)',
                maxWidth: '420px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              aria-current="page"
            >
              {article.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--pf-white)',
          paddingTop: '48px',
          paddingBottom: '40px',
          borderBottom: '1px solid var(--pf-grey-300)',
        }}
      >
        <div className="pf-container">
          <div style={{ maxWidth: '760px' }}>
            <span
              className="inline-flex items-center"
              style={{
                backgroundColor: catBg,
                color: catFg,
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: '20px',
              }}
            >
              {article.category}
            </span>
            <h1
              style={{
                fontSize: 'clamp(1.875rem, 4.5vw, 2.5rem)',
                lineHeight: 1.2,
                marginBottom: '20px',
                color: 'var(--pf-grey-900)',
              }}
            >
              {article.title}
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              {article.description}
            </p>
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
              style={{
                fontSize: '0.875rem',
                color: 'var(--pf-grey-600)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
              }}
            >
              <span>By {article.author}</span>
              <span aria-hidden="true">•</span>
              <time dateTime={article.date}>{formatDisplayDate(article.date)}</time>
              {article.updated && article.updated !== article.date && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>Updated {formatDisplayDate(article.updated)}</span>
                </>
              )}
              <span aria-hidden="true">•</span>
              <span>{article.readingTime} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Article body + sidebar */}
      <section style={{ paddingTop: '48px', paddingBottom: '64px' }}>
        <div className="pf-container">
          <div
            className="grid gap-10"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr)',
            }}
          >
            <div
              className="grid gap-10"
              style={{
                gridTemplateColumns: 'minmax(0, 1fr)',
              }}
            >
              <div className="lg:grid lg:gap-10" style={{ gridTemplateColumns: 'minmax(0, 1fr) 280px' }}>
                {/* Article body */}
                <ArticleContent html={article.html} />

                {/* Sidebar */}
                <aside
                  className="hidden lg:block"
                  style={{
                    position: 'sticky',
                    top: '88px',
                    alignSelf: 'start',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                  }}
                >
                  {article.toc.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--pf-grey-900)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '12px',
                        }}
                      >
                        On this page
                      </h3>
                      <ul
                        style={{
                          listStyle: 'none',
                          padding: 0,
                          margin: 0,
                          borderLeft: '2px solid var(--pf-grey-300)',
                        }}
                      >
                        {article.toc.map((entry) => (
                          <li key={entry.id} style={{ marginBottom: '8px' }}>
                            <a
                              href={`#${entry.id}`}
                              style={{
                                display: 'block',
                                fontSize: '0.8125rem',
                                color: 'var(--pf-grey-600)',
                                paddingLeft: entry.level === 3 ? '24px' : '12px',
                                lineHeight: 1.4,
                                textDecoration: 'none',
                                fontFamily: "'Inter', sans-serif",
                              }}
                            >
                              {entry.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tools.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--pf-grey-900)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '12px',
                        }}
                      >
                        Key tools
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {tools.map((tool) => (
                          <li key={tool.href} style={{ marginBottom: '12px' }}>
                            <Link
                              href={tool.href}
                              className="pf-card-flat block no-underline hover:no-underline"
                              style={{
                                padding: '12px 16px',
                                borderLeft: '3px solid var(--pf-blue-700)',
                              }}
                            >
                              <span
                                style={{
                                  display: 'block',
                                  fontFamily: "'Space Grotesk', sans-serif",
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: 'var(--pf-blue-700)',
                                }}
                              >
                                {tool.label}
                              </span>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '0.75rem',
                                  color: 'var(--pf-grey-600)',
                                  marginTop: '2px',
                                }}
                              >
                                {tool.description}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {related.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'var(--pf-grey-900)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '12px',
                        }}
                      >
                        Related articles
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {related.map((rel) => (
                          <li key={rel.slug} style={{ marginBottom: '12px' }}>
                            <Link
                              href={`/blog/${rel.slug}`}
                              style={{
                                display: 'block',
                                fontFamily: "'Space Grotesk', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                color: 'var(--pf-grey-900)',
                                lineHeight: 1.4,
                                textDecoration: 'none',
                              }}
                            >
                              {rel.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>

          {/* Mobile-only related / tools section */}
          <div className="lg:hidden" style={{ marginTop: '40px' }}>
            {tools.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '12px',
                  }}
                >
                  Key tools
                </h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="pf-card-flat block no-underline hover:no-underline"
                      style={{
                        padding: '14px 16px',
                        borderLeft: '3px solid var(--pf-blue-700)',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'var(--pf-blue-700)',
                        }}
                      >
                        {tool.label}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '2px' }}>
                        {tool.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '12px',
                  }}
                >
                  Related articles
                </h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  {related.map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/blog/${rel.slug}`}
                      className="pf-card-flat block no-underline hover:no-underline"
                      style={{ padding: '14px 16px' }}
                    >
                      <span
                        style={{
                          display: 'block',
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'var(--pf-grey-900)',
                        }}
                      >
                        {rel.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ArticleFooter article={article} next={next} />
    </div>
  )
}
