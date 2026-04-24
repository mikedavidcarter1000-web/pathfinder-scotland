import contactsData from '@/data/results-day-contacts.json'

interface UniContact {
  university_name: string
  slug: string
  admissions_phone: string | null
  admissions_email: string | null
  clearing_page: string
  results_day_hours: string
  notes: string
  needs_verification: boolean
}

interface ContactsData {
  _meta: {
    description: string
    last_reviewed: string
    results_day_2026: string
    clearing_opens: string
    clearing_closes: string
  }
  universities: UniContact[]
}

const data = contactsData as ContactsData

export function ResultsDayContacts() {
  return (
    <section
      className="pf-section"
      id="university-contacts"
      style={{ backgroundColor: 'var(--pf-grey-100)' }}
    >
      <div className="pf-container" style={{ maxWidth: '900px' }}>
        <h2 style={{ marginBottom: '8px' }}>University admissions contacts</h2>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '20px', lineHeight: 1.6 }}>
          Contact details for the {data.universities.length} Scottish universities. On Results Day, lines
          open at 8am and can be busy throughout the morning - call early.
        </p>

        <div
          role="note"
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: 'var(--pf-amber-50, #fffbeb)',
            border: '1px solid var(--pf-amber-200, #fde68a)',
            borderRadius: '8px',
            color: 'var(--pf-grey-700)',
            fontSize: '0.875rem',
            lineHeight: 1.55,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--pf-amber-600, #d97706)"
            strokeWidth="2"
            aria-hidden="true"
            style={{ flexShrink: 0, marginTop: '2px' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            Each university publishes a dedicated Clearing hotline number on its Clearing page on
            Results Day. Phone numbers shown here are general admissions lines - always check the
            Clearing page link for the live hotline number.
          </span>
        </div>

        <div
          className="pf-card"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9375rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--pf-grey-50, #f9fafb)' }}>
                  <Th>University</Th>
                  <Th>Phone</Th>
                  <Th>Email</Th>
                  <Th>Clearing page</Th>
                </tr>
              </thead>
              <tbody>
                {data.universities.map((u) => (
                  <tr key={u.slug} style={{ borderTop: '1px solid var(--pf-grey-200)' }}>
                    <td
                      style={{
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--pf-grey-900)',
                        verticalAlign: 'top',
                        minWidth: '180px',
                      }}
                    >
                      {u.university_name}
                      {u.notes && (
                        <span
                          style={{
                            display: 'block',
                            fontWeight: 400,
                            fontSize: '0.8125rem',
                            color: 'var(--pf-grey-500)',
                            marginTop: '4px',
                            lineHeight: 1.45,
                          }}
                        >
                          {u.notes}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        verticalAlign: 'top',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.admissions_phone ? (
                        <a
                          href={`tel:${u.admissions_phone.replace(/\s+/g, '')}`}
                          style={{
                            color: 'var(--pf-blue-700)',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                          }}
                        >
                          {u.admissions_phone}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--pf-grey-400)', fontSize: '0.8125rem' }}>
                          See Clearing page
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        verticalAlign: 'top',
                      }}
                    >
                      {u.admissions_email ? (
                        <a
                          href={`mailto:${u.admissions_email}`}
                          style={{
                            color: 'var(--pf-blue-700)',
                            fontSize: '0.875rem',
                            wordBreak: 'break-all',
                          }}
                        >
                          {u.admissions_email}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--pf-grey-400)', fontSize: '0.8125rem' }}>
                          See website
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        verticalAlign: 'top',
                      }}
                    >
                      <a
                        href={u.clearing_page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                        style={{
                          color: 'var(--pf-blue-700)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Visit
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p
          style={{
            marginTop: '16px',
            fontSize: '0.8125rem',
            color: 'var(--pf-grey-500)',
            lineHeight: 1.55,
          }}
        >
          Last reviewed: {data._meta.last_reviewed}. Verify each contact directly on the university
          website before relying on it on Results Day.
        </p>
      </div>
    </section>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '12px 16px',
        fontWeight: 600,
        color: 'var(--pf-grey-700)',
        fontSize: '0.8125rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </th>
  )
}
