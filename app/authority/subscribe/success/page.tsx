import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AuthoritySubscribeSuccessPage() {
  return (
    <main style={{ padding: '60px 24px', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <h1
        style={{
          fontSize: '2rem',
          fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: '12px',
        }}
      >
        Subscription confirmed
      </h1>
      <p style={{ color: '#4b5563', marginBottom: '24px' }}>
        Thanks. Your subscription is being activated. It can take a moment for
        Stripe to confirm payment; refresh in a few seconds if your dashboard
        still shows the trial banner.
      </p>
      <p style={{ color: '#4b5563', marginBottom: '32px', fontSize: '0.9375rem' }}>
        All schools in your LA area will now have Standard tier included.
        Schools that want Premium features can upgrade individually for
        &pound;1,000/year.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link
          href="/authority/dashboard"
          style={{
            background: '#3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Open dashboard
        </Link>
        <Link
          href="/authority/settings/subscription"
          style={{
            background: '#ffffff',
            color: '#1a1a2e',
            padding: '12px 24px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600,
            border: '1px solid #d1d5db',
          }}
        >
          Manage subscription
        </Link>
      </div>
    </main>
  )
}
