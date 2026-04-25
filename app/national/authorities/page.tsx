// Authority-15: placeholder LA list for the national tier. Authority-16
// will surface scorecard tiles and per-LA drill-downs.

import { redirect } from 'next/navigation'
import { getNationalStaffContext } from '@/lib/national/auth'
import { getAdminClient } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

type AuthorityRow = {
  id: string
  name: string
  code: string
  slug: string
  share_national: boolean
  is_challenge_authority: boolean
  school_count: number
}

export default async function NationalAuthoritiesPage() {
  const ctx = await getNationalStaffContext()
  if (!ctx) redirect('/auth/sign-in?redirect=/national/authorities')

  const admin = getAdminClient()
  if (!admin) {
    return <p style={{ padding: '32px' }}>Service unavailable.</p>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from('local_authorities')
    .select('id, name, code, slug, share_national, is_challenge_authority, school_count')
    .order('name')

  const authorities = (data ?? []) as AuthorityRow[]
  const optedIn = authorities.filter((a) => a.share_national).length
  const challenge = authorities.filter((a) => a.is_challenge_authority).length

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div className="pf-container" style={{ padding: '40px 16px', maxWidth: '1100px' }}>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: '6px',
          }}
        >
          Local authorities
        </h1>
        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9375rem' }}>
          {authorities.length} authorities · {optedIn} opted in to national data sharing · {challenge} Challenge Authorities
        </p>

        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px 16px', color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>Authority</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Code</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Schools</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Sharing</th>
                  <th style={{ padding: '12px 16px', color: '#475569' }}>Challenge Authority</th>
                </tr>
              </thead>
              <tbody>
                {authorities.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#1a1a2e', fontWeight: 600 }}>{a.name}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.code}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{a.school_count ?? 0}</td>
                    <td style={{ padding: '12px 16px', color: a.share_national ? '#166534' : '#a16207', fontWeight: 600 }}>
                      {a.share_national ? 'Opted in' : 'Not opted in'}
                    </td>
                    <td style={{ padding: '12px 16px', color: a.is_challenge_authority ? '#1d4ed8' : '#94a3b8', fontWeight: 600 }}>
                      {a.is_challenge_authority ? 'Yes' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '16px' }}>
          Per-LA drill-down and the cross-LA comparison builder will arrive in Authority-16.
        </p>
      </div>
    </main>
  )
}
