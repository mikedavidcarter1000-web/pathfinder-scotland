'use client'

import { useState } from 'react'
import Link from 'next/link'

type Outcome = 'better' | 'got-it' | 'missed-by-one' | 'missed' | 'not-hoped' | null

const OUTCOMES: Array<{ value: Exclude<Outcome, null>; label: string; tone: 'green' | 'blue' | 'amber' | 'red' | 'grey' }> = [
  { value: 'better', label: 'Better than expected', tone: 'green' },
  { value: 'got-it', label: 'Got what I needed', tone: 'green' },
  { value: 'missed-by-one', label: 'Missed my offer by one grade', tone: 'amber' },
  { value: 'missed', label: 'Missed my offer', tone: 'red' },
  { value: 'not-hoped', label: 'Did not get what I hoped', tone: 'grey' },
]

const TONE_COLOURS: Record<'green' | 'blue' | 'amber' | 'red' | 'grey', { bg: string; fg: string; border: string }> = {
  green: { bg: 'rgba(16, 185, 129, 0.08)', fg: 'var(--pf-green-500)', border: 'rgba(16, 185, 129, 0.4)' },
  blue: { bg: 'var(--pf-blue-50)', fg: 'var(--pf-blue-700)', border: 'var(--pf-blue-100)' },
  amber: { bg: 'rgba(245, 158, 11, 0.08)', fg: 'var(--pf-amber-500)', border: 'rgba(245, 158, 11, 0.4)' },
  red: { bg: 'rgba(239, 68, 68, 0.08)', fg: 'var(--pf-red-500)', border: 'rgba(239, 68, 68, 0.4)' },
  grey: { bg: 'var(--pf-grey-100)', fg: 'var(--pf-grey-700)', border: 'var(--pf-grey-300)' },
}

export function ResultsDayDecisionTree() {
  const [selected, setSelected] = useState<Outcome>(null)

  return (
    <section className="pf-section pf-section-white">
      <div className="pf-container" style={{ maxWidth: '760px' }}>
        <h2 style={{ marginBottom: '8px' }}>What happens next?</h2>
        <p style={{ color: 'var(--pf-grey-600)', marginBottom: '24px', lineHeight: 1.6 }}>
          Whatever your results, there is a clear next step. Pick the option that fits how the day went.
        </p>

        <div
          role="radiogroup"
          aria-label="How did your results go?"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {OUTCOMES.map((opt) => {
            const isActive = selected === opt.value
            const colour = TONE_COLOURS[opt.tone]
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelected(opt.value)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: `2px solid ${isActive ? colour.fg : 'var(--pf-grey-200)'}`,
                  backgroundColor: isActive ? colour.bg : 'var(--pf-white)',
                  color: isActive ? colour.fg : 'var(--pf-grey-700)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  minHeight: '60px',
                  transition: 'all 120ms ease',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {selected && (
          <div
            role="region"
            aria-live="polite"
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: TONE_COLOURS[OUTCOMES.find((o) => o.value === selected)!.tone].bg,
              border: `1px solid ${TONE_COLOURS[OUTCOMES.find((o) => o.value === selected)!.tone].border}`,
            }}
          >
            <DecisionContent outcome={selected} />
          </div>
        )}
      </div>
    </section>
  )
}

function DecisionContent({ outcome }: { outcome: Exclude<Outcome, null> }) {
  if (outcome === 'better') {
    return (
      <DecisionPanel
        heading="Use UCAS Adjustment to look at higher-tariff courses"
        body={[
          'If you exceeded your firm offer, you can use UCAS Adjustment to search for a course at a university with higher entry requirements.',
          'Adjustment opens on Results Day and runs until 31 August.',
          'You keep your original offer while you search - it is risk-free.',
        ]}
        links={[
          { label: 'UCAS Adjustment guidance', href: 'https://www.ucas.com/undergraduate/results-confirmation-and-clearing/ucas-adjustment', external: true },
          { label: 'Browse Pathfinder courses', href: '/courses' },
        ]}
      />
    )
  }
  if (outcome === 'got-it') {
    return (
      <DecisionPanel
        heading="Congratulations - your place should be confirmed today"
        body={[
          'Your offer should be confirmed on UCAS Track by the end of Results Day.',
          'Next: confirm your SAAS funding, book accommodation if you have not already, and start preparing for freshers.',
        ]}
        links={[
          { label: 'Living costs planner', href: '/tools/living-costs' },
          { label: 'Starting uni checklist', href: '/starting-uni' },
          { label: 'UCAS Track', href: 'https://www.ucas.com/students', external: true },
        ]}
      />
    )
  }
  if (outcome === 'missed-by-one') {
    return (
      <DecisionPanel
        heading="Phone your university directly - many will still accept you"
        body={[
          'Universities often accept students who missed by one grade, especially if your application is otherwise strong. Do not wait for them to contact you.',
          'Be polite, explain any extenuating circumstances, and ask whether they can still consider you.',
          'If you have widening access status (SIMD 1-2), remind the admissions office - many courses have adjusted offers for WA applicants.',
        ]}
        links={[
          { label: 'University contact list', href: '#university-contacts' },
          { label: 'Extenuating circumstances guide', href: '/support/extenuating-circumstances' },
          { label: 'Widening Access', href: '/widening-access' },
        ]}
      />
    )
  }
  if (outcome === 'missed') {
    return (
      <DecisionPanel
        heading="UCAS Clearing opens on Results Day"
        body={[
          'Thousands of courses are available in Clearing, including at Russell Group and ancient universities. Do not panic - take time to find the right course.',
          'Check UCAS Track first - if you are in Clearing, your Clearing number will be shown there.',
          'Search ucas.com/clearing or use Pathfinder courses to find available places.',
          'Phone the university directly. Lines open at 8am on Results Day.',
        ]}
        links={[
          { label: 'How Clearing works', href: '#clearing' },
          { label: 'University contact list', href: '#university-contacts' },
          { label: 'UCAS Clearing search', href: 'https://www.ucas.com/undergraduate/results-confirmation-and-clearing/what-clearing', external: true },
        ]}
      />
    )
  }
  return (
    <DecisionPanel
      heading="There are several routes forward"
      body={[
        'Resit specific subjects in S6 - many students improve their grades the second time.',
        'Start at college on an HNC or HND that articulates into university Year 2 or 3.',
        'Consider a Foundation Apprenticeship or Modern Apprenticeship - paid learning with employer experience.',
        'Take a gap year and reapply with a stronger application next cycle.',
      ]}
      links={[
        { label: 'College and articulation routes', href: '/pathways/alternatives' },
        { label: 'Apprenticeships in Scotland', href: '/pathways/alternatives' },
        { label: 'Grade sensitivity tool', href: '/tools/grade-sensitivity' },
      ]}
    />
  )
}

function DecisionPanel({
  heading,
  body,
  links,
}: {
  heading: string
  body: string[]
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <>
      <h3 style={{ fontSize: '1.0625rem', marginBottom: '14px', color: 'var(--pf-grey-900)' }}>
        {heading}
      </h3>
      <ul className="space-y-2" style={{ marginBottom: '20px', paddingLeft: 0, listStyle: 'none' }}>
        {body.map((line, i) => (
          <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--pf-grey-700)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
            <span style={{ color: 'var(--pf-grey-400)', flexShrink: 0, marginTop: '6px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--pf-grey-400)', display: 'inline-block' }} />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {links.map((link, i) =>
          link.external ? (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 no-underline hover:no-underline"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--pf-blue-700)',
              }}
            >
              {link.label}
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <Link
              key={i}
              href={link.href}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--pf-blue-700)',
              }}
            >
              {link.label} &rarr;
            </Link>
          )
        )}
      </div>
    </>
  )
}
