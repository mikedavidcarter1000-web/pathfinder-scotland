import type { RoleComparisonData } from './ComparisonGrid'

export interface EarningsSectionProps {
  roles: RoleComparisonData[]
}

export function EarningsSection({ roles }: EarningsSectionProps) {
  return (
    <div
      style={{
        padding: '12px 0',
        fontSize: '0.875rem',
        color: 'var(--pf-grey-600)',
      }}
    >
      Lifetime earnings chart arrives in Session 5. Roles under comparison:{' '}
      {roles.map((r) => r.title).join(', ')}.
    </div>
  )
}
