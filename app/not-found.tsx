import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--pf-blue-50)' }}
    >
      <div className="pf-card text-center" style={{ maxWidth: '480px', padding: '48px 32px' }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '5rem',
            fontWeight: 700,
            color: 'var(--pf-blue-100)',
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          404
        </div>
        <h1 style={{ marginBottom: '8px' }}>Page not found</h1>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px' }}>
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been
          moved or doesn&apos;t exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="pf-btn-primary">
            Go home
          </Link>
          <Link href="/courses" className="pf-btn-secondary">
            Browse courses
          </Link>
        </div>
      </div>
    </div>
  )
}
