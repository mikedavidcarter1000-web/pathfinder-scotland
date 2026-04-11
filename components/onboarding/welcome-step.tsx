'use client'

interface WelcomeStepProps {
  onStart: () => void
}

const BULLETS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l9-5-9-5-9 5 9 5z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
        />
      </svg>
    ),
    text: 'Your school stage — so we show you relevant subjects and choices.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    text: 'Your postcode — to check if you qualify for widening access support.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    text: 'Your grades — to match you with university courses (optional).',
  },
]

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div
          className="inline-flex items-center justify-center mx-auto"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '9999px',
            backgroundColor: 'var(--pf-teal-100)',
          }}
        >
          <svg
            className="w-9 h-9"
            style={{ color: 'var(--pf-teal-700)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.75rem)' }}>Let&apos;s set up your Pathfinder profile</h1>
        <p
          style={{
            color: 'var(--pf-grey-600)',
            fontSize: '1rem',
            maxWidth: '480px',
            margin: '0 auto',
          }}
        >
          This takes about 2 minutes. We&apos;ll ask a few questions to personalise your
          experience.
        </p>
      </div>

      <div
        className="rounded-lg space-y-3"
        style={{
          padding: '20px 24px',
          backgroundColor: 'var(--pf-teal-50)',
          border: '1px solid var(--pf-teal-100)',
        }}
      >
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '0.875rem',
            color: 'var(--pf-teal-900)',
            textTransform: 'none',
          }}
        >
          We&apos;ll ask about
        </p>
        <ul className="space-y-3">
          {BULLETS.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 inline-flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--pf-white)',
                  color: 'var(--pf-teal-700)',
                }}
              >
                {bullet.icon}
              </span>
              <span
                style={{
                  fontSize: '0.9375rem',
                  color: 'var(--pf-grey-900)',
                  marginTop: '5px',
                }}
              >
                {bullet.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="flex items-start gap-3"
        style={{
          padding: '14px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--pf-grey-100)',
        }}
      >
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          style={{ color: 'var(--pf-grey-600)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
          Your data is private and you can change or delete it anytime.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full pf-btn pf-btn-primary justify-center"
        style={{ minHeight: '48px' }}
      >
        Let&apos;s go
      </button>
    </div>
  )
}
