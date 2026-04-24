import Link from 'next/link'
import { getAdminClient } from '@/lib/admin-auth'
import { FOUNDING_SCHOOLS_CAP } from '@/lib/school/constants'

// Counter must be live (queried on each page load), not cached: schools
// registering while someone else is viewing the page should see their
// place taken immediately.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'For Schools',
  description:
    'See what your students are exploring. Support their choices with data. SIMD profile, subject-choice analysis, university consequence flags, and CES capacity alignment. Free for 12 months for our first 10 founding schools.',
  alternates: { canonical: '/for-schools' },
}

async function getFoundingRemaining(): Promise<number> {
  const admin = getAdminClient()
  if (!admin) return FOUNDING_SCHOOLS_CAP
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (admin as any)
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .eq('is_founding_school', true)
      .in('subscription_status', ['trial', 'active'])
    return Math.max(FOUNDING_SCHOOLS_CAP - (count ?? 0), 0)
  } catch {
    return FOUNDING_SCHOOLS_CAP
  }
}

export default async function ForSchoolsPage() {
  const remaining = await getFoundingRemaining()

  return (
    <div className="pf-container pt-8 pb-16" style={{ maxWidth: '960px' }}>
      <section style={hero}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2.5rem', margin: 0 }}>
          See what your students are exploring.
        </h1>
        <p style={{ fontSize: '1.25rem', margin: '12px 0 0', opacity: 0.85 }}>
          Support their choices with data. Aligned to the Scottish Career Education Standard and DYW indicators.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <Link href="/school/register" style={ctaPrimary}>Register your school</Link>
          <Link href="/school/subscribe" style={ctaSecondary}>See pricing</Link>
        </div>
        {remaining > 0 ? (
          <p style={{ marginTop: '16px', fontSize: '0.9375rem' }}>
            <strong>Free for 12 months</strong> for our first {FOUNDING_SCHOOLS_CAP} founding schools. {remaining} places remaining.
          </p>
        ) : (
          <p style={{ marginTop: '16px', fontSize: '0.9375rem' }}>
            Founding-school places taken. <Link href="/school/subscribe">Contact us for current pricing</Link>.
          </p>
        )}
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={h2}>What your school sees</h2>
        <div style={featureGrid}>
          <Feature
            title="Overview"
            text="Engagement metrics, SIMD profile versus national, and a career-sector interest heatmap - at-a-glance where attention is clustering."
          />
          <Feature
            title="Subject choices"
            text="Popularity across every transition (S2 to S6), drop-off analysis, and university consequence flags that show where saved courses and chosen subjects don't match."
          />
          <Feature
            title="Students"
            text="Sortable, filterable student list with inline guidance-meeting summaries. Never shows sensitive flags - only what students have chosen to explore."
          />
          <Feature
            title="Benchmarking"
            text="School versus local authority on leaver destinations, CES capacity alignment radar, and the DYW indicator table for HMIE evidence."
          />
          <Feature
            title="Reports"
            text="One-page cohort overview, subject-choice analysis, and widening access report - ready to share with SMT. Plus CSV export for aggregate data."
          />
          <Feature
            title="Scottish, by design"
            text="Reports against Scottish Career Education Standard and DYW indicators, not English Gatsby Benchmarks. Aligned to how your school is actually measured."
          />
        </div>
      </section>

      <section style={testimonial}>
        <blockquote style={{ margin: 0, fontSize: '1.125rem', fontStyle: 'italic', opacity: 0.85 }}>
          &ldquo;&rdquo;
        </blockquote>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem', opacity: 0.7 }}>- Your school could be here.</p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2 style={h2}>Founding-school offer</h2>
        <div style={offerCard}>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>Free for 12 months. No card required.</p>
          <ul style={{ marginTop: '12px', paddingLeft: '20px', lineHeight: 1.7 }}>
            <li>Full access to every dashboard feature</li>
            <li>Unlimited staff accounts at your school</li>
            <li>Priority access to new features (work experience, employer connections in 2027)</li>
            <li>A say in the product roadmap</li>
          </ul>
          <div style={{ marginTop: '16px' }}>
            <Link href="/school/register" style={ctaPrimary}>Register your school</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div style={featureCard}>
      <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.0625rem' }}>{title}</h3>
      <p style={{ margin: '6px 0 0', fontSize: '0.9375rem' }}>{text}</p>
    </div>
  )
}

const hero: React.CSSProperties = { paddingTop: '16px' }
const h2: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.5rem' }
const featureGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '16px',
  marginTop: '16px',
}
const featureCard: React.CSSProperties = {
  padding: '16px',
  border: '1px solid var(--pf-grey-200)',
  borderRadius: '8px',
  backgroundColor: '#fff',
}
const ctaPrimary: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: 'var(--pf-blue-700, #1D4ED8)',
  color: '#fff',
  borderRadius: '8px',
  fontWeight: 700,
  textDecoration: 'none',
}
const ctaSecondary: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 20px',
  backgroundColor: '#fff',
  color: 'var(--pf-blue-700, #1D4ED8)',
  border: '1px solid var(--pf-blue-700, #1D4ED8)',
  borderRadius: '8px',
  fontWeight: 700,
  textDecoration: 'none',
}
const testimonial: React.CSSProperties = {
  marginTop: '40px',
  padding: '20px',
  border: '1px dashed var(--pf-grey-300)',
  borderRadius: '8px',
  backgroundColor: 'var(--pf-grey-50)',
}
const offerCard: React.CSSProperties = {
  padding: '20px',
  border: '2px solid var(--pf-blue-500)',
  borderRadius: '12px',
  backgroundColor: '#fff',
  marginTop: '12px',
}
