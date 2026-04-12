/**
 * Page-top banner used on every support sub-page. Reassures users that figures
 * and eligibility rules are checked periodically while pointing them back to
 * the official provider for anything time-sensitive. Kept deliberately subtle
 * (soft blue tint, no close control) so it does not dominate the page.
 */
export function VerificationBanner() {
  return (
    <div
      role="note"
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        padding: '12px 16px',
        backgroundColor: 'var(--pf-blue-50)',
        borderLeft: '3px solid var(--pf-blue-500)',
        borderRadius: '8px',
        color: 'var(--pf-grey-600)',
        fontSize: '0.875rem',
        lineHeight: 1.55,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--pf-blue-700)"
        strokeWidth="2"
        aria-hidden="true"
        style={{ flexShrink: 0, marginTop: '2px' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        This information was verified in April 2026. Amounts, eligibility criteria, and
        contact details may change. Always check with the official provider before making
        decisions.
      </span>
    </div>
  )
}

interface VerificationCaveatProps {
  /** Authoritative organisation to direct the user to verify with. */
  org: string
  /** URL of the official source for the verified figures. */
  url: string
  /** Optional academic year label, e.g. "2025-26". */
  year?: string
  /** Optional override for the full caveat message. Org link is appended. */
  customText?: string
}

/**
 * Renders a small inline caveat below financial figures or other data that
 * changes annually or requires verification before use. Used on support pages
 * and /prep wherever figures may become stale between publications.
 */
export function VerificationCaveat({ org, url, year, customText }: VerificationCaveatProps) {
  const orgLink = (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'inherit', textDecoration: 'underline' }}
    >
      {org}
    </a>
  )

  const message = customText ? (
    <>
      {customText} {orgLink}
    </>
  ) : (
    <>
      Figures shown are{year ? ` for ${year}` : ''}. Check directly with {orgLink} for current
      amounts.
    </>
  )

  return (
    <span
      role="note"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '4px',
        fontSize: '0.8125rem',
        color: 'var(--pf-grey-600)',
        lineHeight: 1.5,
      }}
    >
      {/* Info icon — vertically aligned to text baseline via position offset */}
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        style={{ flexShrink: 0, position: 'relative', top: '1px' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{message}</span>
    </span>
  )
}
