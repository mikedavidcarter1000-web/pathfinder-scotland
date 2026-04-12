import Link from 'next/link'

const tools = [
  {
    title: 'Grade sensitivity',
    description:
      'See exactly how improving or dropping a single grade changes which university courses you can apply for.',
    href: '/tools/grade-sensitivity',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Cost calculator',
    description:
      'Estimate the real cost of a Scottish degree — including living costs, funding, and part-time work — then compare to England.',
    href: '/tools/roi-calculator',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Subject choice simulator',
    description:
      'Try different subject combinations for S3–S6 and see how each choice affects your career options and course eligibility.',
    href: '/simulator',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
]

export default function ToolsPage() {
  return (
    <div style={{ backgroundColor: 'var(--pf-blue-50)', minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div
          className="pf-container"
          style={{ paddingTop: '48px', paddingBottom: '48px' }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.75rem, 5vw, 2rem)' }}>
                Tools
              </h1>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.6,
                  maxWidth: '480px',
                }}
              >
                Interactive tools to help you make confident, informed decisions about
                your grades, subject choices, and university applications.
              </p>
            </div>
            {/* Visual: tool icons grid */}
            <div
              className="hidden md:grid grid-cols-3 gap-4 justify-items-center"
              aria-hidden="true"
            >
              {[
                { color: 'var(--pf-blue-500)', opacity: 0.15, size: '64px' },
                { color: 'var(--pf-green-500)', opacity: 0.15, size: '56px' },
                { color: 'var(--pf-amber-500)', opacity: 0.15, size: '48px' },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="rounded-xl flex items-center justify-center"
                  style={{
                    width: dot.size,
                    height: dot.size,
                    backgroundColor: dot.color,
                    opacity: dot.opacity + 0.3,
                  }}
                >
                  {tools[i]?.icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool cards */}
      <section className="pf-container" style={{ paddingBottom: '64px' }}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="pf-card-hover no-underline hover:no-underline flex flex-col"
              style={{ padding: '24px' }}
            >
              <div
                className="flex items-center justify-center mb-4"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                }}
              >
                {tool.icon}
              </div>
              <h2
                style={{
                  fontSize: '1.125rem',
                  marginBottom: '8px',
                  color: 'var(--pf-grey-900)',
                }}
              >
                {tool.title}
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {tool.description}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--pf-blue-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Try it
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
