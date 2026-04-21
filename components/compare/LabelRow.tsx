import { Fragment } from 'react'

export interface LabelRowEntry {
  careerName: string
  value: string | null
}

export interface LabelRowProps {
  fieldName: string
  entries: LabelRowEntry[]
}

export function LabelRow({ fieldName, entries }: LabelRowProps) {
  return (
    <div
      role="group"
      aria-label={fieldName}
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '8px 16px',
        alignItems: 'baseline',
        padding: '12px 0',
        borderTop: '1px solid var(--pf-grey-100)',
      }}
    >
      <div
        style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--pf-grey-600)',
          textTransform: 'none',
        }}
      >
        {fieldName}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))`,
          gap: '12px',
        }}
        className="pf-labelrow-values"
      >
        {entries.map((entry, i) => (
          <Fragment key={`${entry.careerName}-${i}`}>
            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '2px',
                }}
              >
                {entry.careerName}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--pf-grey-900)',
                }}
              >
                {entry.value ?? '\u2014'}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
