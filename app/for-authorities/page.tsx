import Link from 'next/link'

export const metadata = {
  title: 'For Local Authorities | Pathfinder Scotland',
  description: 'Real-time subject choice, equity, and career pathway insight across all schools in your local authority.',
}

function calcPrice(n: number) {
  const tier1 = Math.min(n, 10) * 1500
  const tier2 = Math.max(0, Math.min(n, 20) - 10) * 1250
  const tier3 = Math.max(0, n - 20) * 1000
  return 5000 + tier1 + tier2 + tier3
}

const PRICING_EXAMPLES = [
  { name: 'Orkney', schools: 3 },
  { name: 'Edinburgh City', schools: 23 },
  { name: 'Glasgow City', schools: 30 },
]

const FEATURES = [
  {
    icon: '📊',
    title: 'Subject choice dashboards',
    desc: 'Track N5, Higher, and Advanced Higher subject selections in real time across every school in your authority — broken down by year group, gender, and SIMD decile.',
  },
  {
    icon: '⚖️',
    title: 'Equity & widening access lens',
    desc: 'Instantly surface where deprivation (SIMD), care experience, or rurality is driving subject restriction. Monitor progress against your equity improvement plan.',
  },
  {
    icon: '🗺️',
    title: 'Career pathway tracking',
    desc: 'See which career sectors pupils are exploring and how subject choices align — or misalign — with local employment demand and Scotland-wide growth sectors.',
  },
  {
    icon: '📐',
    title: 'Curriculum breadth reports',
    desc: 'Assess CfE curriculum area coverage, identify narrowing, and benchmark against comparable authorities (optional national data sharing).',
  },
  {
    icon: '🔔',
    title: 'Automated alerts',
    desc: 'Configure school-level alerts for early warning signals: subjects falling below viability thresholds, equity gaps widening, or career coverage dropping.',
  },
  {
    icon: '📋',
    title: 'Custom report builder',
    desc: 'Build and schedule reports tailored to your Quality Improvement cycle, inspection cycle, or committee reporting requirements.',
  },
  {
    icon: '🔌',
    title: 'Data analyst API access',
    desc: "Pull anonymised, authority-scoped data directly into your team's own tools — Power BI, R, Python — via a secure API with role-based access control.",
  },
  {
    icon: '👥',
    title: 'Team management',
    desc: 'Invite QIOs, data analysts, and additional LA administrators. Permissions are role-based and auditable — every data access action is logged.',
  },
]

type TickValue = boolean | 'partial'
const COMPARISON: { feature: string; pathfinder: TickValue; insight: TickValue; seemis: TickValue; lgbf: TickValue }[] = [
  { feature: 'Real-time subject choice data', pathfinder: true, insight: false, seemis: 'partial', lgbf: false },
  { feature: 'Cross-school equity analytics (SIMD)', pathfinder: true, insight: 'partial', seemis: false, lgbf: false },
  { feature: 'Career exploration insight', pathfinder: true, insight: false, seemis: false, lgbf: false },
  { feature: 'NIF / HGIOS4 evidence support', pathfinder: true, insight: true, seemis: 'partial', lgbf: true },
  { feature: 'School-level drill-down', pathfinder: true, insight: true, seemis: true, lgbf: false },
  { feature: 'Automated alerts', pathfinder: true, insight: false, seemis: 'partial', lgbf: false },
  { feature: 'Custom reports & data export', pathfinder: true, insight: 'partial', seemis: 'partial', lgbf: false },
  { feature: 'Student-facing tools included', pathfinder: true, insight: false, seemis: false, lgbf: false },
]

function Tick({ value }: { value: boolean | 'partial' }) {
  if (value === true) return <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '1.125rem' }}>✓</span>
  if (value === 'partial') return <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.875rem' }}>Partial</span>
  return <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '1.125rem' }}>—</span>
}

export default function ForAuthoritiesPage() {
  const headingFont = "'Space Grotesk', sans-serif"

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
          color: '#fff',
          padding: '80px 16px 72px',
          textAlign: 'center',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '6px 18px', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '24px' }}>
            For Local Authorities
          </div>
          <h1 style={{ fontFamily: headingFont, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
            Real-time insight across<br />every school in your authority
          </h1>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxWidth: '640px', margin: '0 auto 36px' }}>
            Pathfinder gives Scottish local authorities a live view of subject choices, equity metrics, and career pathway coverage — the intelligence QIOs need to act before problems become entrenched.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/authority/register"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                borderRadius: '10px',
                backgroundColor: '#fff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                fontFamily: headingFont,
              }}
            >
              Register your authority
            </Link>
            <a
              href="mailto:hello@pathfinderscot.co.uk?subject=LA%20portal%20demo%20request"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                fontFamily: headingFont,
              }}
            >
              Request a demo
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '72px 16px', backgroundColor: '#f8fafc' }}>
        <div className="pf-container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: headingFont, fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              What you get
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.0625rem', maxWidth: '560px', margin: '0 auto' }}>
              Eight integrated capabilities, built for Scottish QI frameworks and inspection cycles.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '14px',
                  padding: '28px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  borderTop: '3px solid #1d4ed8',
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontFamily: headingFont, fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: '72px 16px', backgroundColor: '#fff' }}>
        <div className="pf-container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: headingFont, fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              How it complements existing tools
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.0625rem' }}>
              Pathfinder is complementary to Insight and SEEMIS — it covers the journey (subject choices, career exploration, equity engagement) while Insight covers the outcomes (attainment, leaver destinations).
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feature</th>
                  {[
                    { name: 'Pathfinder', highlight: true },
                    { name: 'Insight', highlight: false },
                    { name: 'SEEMIS', highlight: false },
                    { name: 'LGBF', highlight: false },
                  ].map((col) => (
                    <th
                      key={col.name}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontFamily: headingFont,
                        fontWeight: 700,
                        color: col.highlight ? '#1d4ed8' : '#374151',
                        fontSize: '0.9375rem',
                        backgroundColor: col.highlight ? '#eff6ff' : 'transparent',
                      }}
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{row.feature}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', backgroundColor: '#eff6ff' }}><Tick value={row.pathfinder} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}><Tick value={row.insight} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}><Tick value={row.seemis} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}><Tick value={row.lgbf} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '72px 16px', backgroundColor: '#0f172a', color: '#fff' }}>
        <div className="pf-container" style={{ maxWidth: '780px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: headingFont, fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.0625rem' }}>
              Annual licence. No per-user fees. All features included.
            </p>
          </div>

          {/* Price structure */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '28px 32px', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Base platform fee</p>
                <p style={{ fontFamily: headingFont, fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>£5,000 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/year</span></p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginTop: '4px' }}>Analytics, reports, alerts, staff accounts</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Schools 1–10</p>
                <p style={{ fontFamily: headingFont, fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>+£1,500 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/school</span></p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginTop: '4px' }}>Includes Standard school portal</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Schools 11–20</p>
                <p style={{ fontFamily: headingFont, fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>+£1,250 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/school</span></p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginTop: '4px' }}>Volume discount tier</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Schools 21+</p>
                <p style={{ fontFamily: headingFont, fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>+£1,000 <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>/school</span></p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginTop: '4px' }}>Best-value tier for large LAs</p>
              </div>
            </div>
          </div>

          {/* Example calculations */}
          <h3 style={{ fontFamily: headingFont, fontWeight: 700, fontSize: '1.0625rem', marginBottom: '20px', color: 'rgba(255,255,255,0.9)' }}>
            Example authorities
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {PRICING_EXAMPLES.map(({ name, schools }) => {
              const price = calcPrice(schools)
              return (
                <div key={name} style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px 24px' }}>
                  <p style={{ fontFamily: headingFont, fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', marginBottom: '12px' }}>{schools} schools</p>
                  <p style={{ fontFamily: headingFont, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                    £{price.toLocaleString('en-GB')}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: '2px 0 0' }}>per year</p>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '28px', fontSize: '0.9375rem' }}>
              All registrations start with a free 30-day trial. No payment details required to register.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/authority/register"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  borderRadius: '10px',
                  backgroundColor: '#1d4ed8',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: headingFont,
                  fontSize: '1rem',
                }}
              >
                Start free trial
              </Link>
              <a
                href="mailto:hello@pathfinderscot.co.uk?subject=LA%20pricing%20query"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: headingFont,
                  fontSize: '1rem',
                }}
              >
                Talk to us
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
