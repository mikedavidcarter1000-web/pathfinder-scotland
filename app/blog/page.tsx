import { getArticles } from '@/lib/blog'
import { BlogList } from '@/components/blog/blog-list'

const SITE_URL = 'https://pathfinder-scotland.vercel.app'

export default function BlogPage() {
  const articles = getArticles()

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Pathfinder Scotland Blog',
    description:
      'Guides and articles on Scottish subject choices, university pathways, widening access, and careers.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Pathfinder Scotland',
      url: SITE_URL,
    },
    blogPost: articles.slice(0, 10).map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `${SITE_URL}/blog/${a.slug}`,
      datePublished: a.date,
      dateModified: a.updated,
      description: a.description,
      author: { '@type': 'Organization', name: a.author },
    })),
  }

  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <section
        className="pf-section"
        style={{
          backgroundColor: 'var(--pf-blue-50)',
          paddingTop: '56px',
          paddingBottom: '32px',
        }}
      >
        <div className="pf-container">
          <div style={{ maxWidth: '760px' }}>
            <span className="pf-badge-blue inline-flex" style={{ marginBottom: '20px' }}>
              Guides &amp; Articles
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                lineHeight: 1.15,
                marginBottom: '16px',
                color: 'var(--pf-grey-900)',
              }}
            >
              Guides &amp; Articles
            </h1>
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'var(--pf-grey-600)',
                lineHeight: 1.6,
                maxWidth: '620px',
              }}
            >
              Expert guidance on subject choices, university pathways, and careers in Scotland.
            </p>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '80px' }}>
        <div className="pf-container">
          <BlogList articles={articles} />
        </div>
      </section>
    </div>
  )
}
