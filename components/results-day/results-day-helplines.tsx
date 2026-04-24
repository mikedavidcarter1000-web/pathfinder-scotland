const HELPLINES = [
  {
    name: 'UCAS',
    detail: 'For Clearing, Track issues, and application questions',
    phone: '0371 468 0468',
    href: 'tel:03714680468',
    hours: 'Mon-Fri 8am-7pm, Sat 9am-5pm on Results Day',
  },
  {
    name: 'SDS Results Helpline',
    detail: 'Skills Development Scotland - free careers advice on Results Day',
    phone: '0808 100 8000',
    href: 'tel:08081008000',
    hours: 'Live from 8am on Results Day',
  },
  {
    name: 'SAAS',
    detail: 'For student funding queries',
    phone: '0300 555 0505',
    href: 'tel:03005550505',
    hours: 'Mon, Wed, Fri 9am-4pm',
  },
  {
    name: 'Breathing Space Scotland',
    detail: 'Free, confidential helpline for stress or anxiety on Results Day',
    phone: '0800 83 85 87',
    href: 'tel:08008385 87',
    hours: 'Mon-Thu 6pm-2am, Fri 6pm-Mon 6am',
  },
  {
    name: 'Samaritans',
    detail: 'Round-the-clock emotional support - you do not need to be in crisis',
    phone: '116 123',
    href: 'tel:116123',
    hours: '24 hours, 7 days',
  },
  {
    name: 'Your school',
    detail: 'Many schools have guidance staff available on Results Day',
    phone: 'Ask your school',
    href: null,
    hours: 'Often 8am-noon',
  },
] as const

export function ResultsDayHelplines() {
  return (
    <section className="pf-section pf-section-white">
      <div className="pf-container" style={{ maxWidth: '760px' }}>
        <h2 style={{ marginBottom: '8px' }}>Need to talk to someone?</h2>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px', lineHeight: 1.6 }}>
          Results Day is a big day. If you need advice, funding help, or just someone to talk to,
          these lines are here for you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {HELPLINES.map((line) => (
            <div
              key={line.name}
              className="pf-card"
              style={{ padding: '18px 22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--pf-blue-100)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  {line.name}
                </p>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-600)',
                    marginBottom: '6px',
                    lineHeight: 1.5,
                  }}
                >
                  {line.detail}
                </p>
                {line.href ? (
                  <a
                    href={line.href}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--pf-blue-700)',
                      textDecoration: 'none',
                    }}
                  >
                    {line.phone}
                  </a>
                ) : (
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--pf-grey-700)',
                    }}
                  >
                    {line.phone}
                  </span>
                )}
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-500)',
                    marginTop: '2px',
                  }}
                >
                  {line.hours}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
