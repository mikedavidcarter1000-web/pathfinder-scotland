import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <main
      style={{
        backgroundColor: 'var(--pf-blue-50)',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: '520px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <Image
            src="/logo.svg"
            alt="Pathfinder Scotland"
            width={56}
            height={56}
            priority
          />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--pf-blue-700)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          404
        </p>
        <h1 style={{ marginBottom: '12px' }}>Page not found</h1>
        <p
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '440px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" className="pf-btn-primary">
            Go home
          </Link>
          <Link href="/subjects" className="pf-btn-secondary">
            Browse subjects
          </Link>
        </div>
      </div>
    </main>
  )
}
