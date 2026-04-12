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
