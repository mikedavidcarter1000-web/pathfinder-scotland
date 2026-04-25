'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCohortValue } from '@/lib/authority/disclosure'
import type { GenderBalanceFlag, StemGenderRow } from '@/lib/authority/subjects-queries'

const FEMALE_COLOUR = '#1B3A5C'
const MALE_COLOUR = '#85AAD0'
const ROW_HEIGHT = 56

const BALANCE_BG: Record<GenderBalanceFlag, string> = {
  balanced: '#dcfce7',
  imbalanced: '#fef3c7',
  severely_imbalanced: '#fee2e2',
}

const BALANCE_FG: Record<GenderBalanceFlag, string> = {
  balanced: '#166534',
  imbalanced: '#92400e',
  severely_imbalanced: '#991b1b',
}

const BALANCE_LABEL: Record<GenderBalanceFlag, string> = {
  balanced: 'Balanced',
  imbalanced: 'Imbalanced',
  severely_imbalanced: 'Severely imbalanced',
}

export interface StemGenderChartProps {
  rows: StemGenderRow[]
}

export function StemGenderChart({ rows }: StemGenderChartProps) {
  const chartData = rows.map((r) => ({
    label: r.subject_name,
    Female: r.female_count ?? 0,
    Male: r.male_count ?? 0,
  }))
  const computedHeight = Math.max(ROW_HEIGHT * Math.max(rows.length, 1) + 40, 200)

  return (
    <div>
      <div style={{ width: '100%', height: computedHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 24, left: 0 }}
            barCategoryGap={10}
          >
            <CartesianGrid horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={170}
              tick={{ fontSize: 12, fill: '#1a1a2e' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              contentStyle={{ fontSize: '0.8125rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '8px' }} />
            <Bar dataKey="Female" fill={FEMALE_COLOUR} radius={[2, 2, 2, 2]} isAnimationActive={false} />
            <Bar dataKey="Male" fill={MALE_COLOUR} radius={[2, 2, 2, 2]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8125rem',
            minWidth: '640px',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
              <Th>Subject</Th>
              <Th align="right">Female</Th>
              <Th align="right">Male</Th>
              <Th align="right">Other</Th>
              <Th align="right">Total</Th>
              <Th>Balance</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.subject_id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <Td>{r.subject_name}</Td>
                <Td align="right">
                  {formatCohortValue(r.female_count)}
                  {r.female_count != null && r.female_percentage != null && (
                    <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '4px' }}>
                      ({r.female_percentage.toFixed(1)}%)
                    </span>
                  )}
                </Td>
                <Td align="right">
                  {formatCohortValue(r.male_count)}
                  {r.male_count != null && r.male_percentage != null && (
                    <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '4px' }}>
                      ({r.male_percentage.toFixed(1)}%)
                    </span>
                  )}
                </Td>
                <Td align="right">{formatCohortValue(r.other_count)}</Td>
                <Td align="right">{formatCohortValue(r.total_count)}</Td>
                <Td>
                  {r.gender_balance_flag ? (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        backgroundColor: BALANCE_BG[r.gender_balance_flag],
                        color: BALANCE_FG[r.gender_balance_flag],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {BALANCE_LABEL[r.gender_balance_flag]}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No data</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        padding: '10px 14px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: align,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td
      style={{
        padding: '10px 14px',
        verticalAlign: 'top',
        textAlign: align,
        color: '#1a1a2e',
      }}
    >
      {children}
    </td>
  )
}
