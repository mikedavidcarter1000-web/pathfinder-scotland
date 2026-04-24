'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

type Round = {
  id: string
  name: string
  academic_year: string
  year_group: string
  status: 'open' | 'closed' | 'finalised'
  opens_at: string | null
  closes_at: string | null
  schools: { name: string; slug: string } | null
  my_submission: {
    status: string
    submitted_at: string | null
    parent_approved_at: string | null
    parent_rejected_at: string | null
  } | null
}

export default function StudentChoicesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace('/auth/sign-in?redirect=/student/choices')
      return
    }
    fetch('/api/student/choices/available')
      .then((r) => (r.ok ? r.json() : { rounds: [] }))
      .then((d) => setRounds(d.rounds ?? []))
      .finally(() => setLoading(false))
  }, [authLoading, user, router])

  if (loading) return <div className="pf-container pt-8 pb-12"><p>Loading…</p></div>

  return (
    <div className="pf-container pt-6 pb-12" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link href="/dashboard" style={{ fontSize: '0.875rem' }}>&larr; Back to dashboard</Link>
      </div>

      <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.75rem' }}>
        Subject choices
      </h1>
      <p style={{ marginTop: 4, opacity: 0.7 }}>
        Your school sets these choice rounds. Pick your subjects within each column — see how your picks fit your saved courses and career interests as you go.
      </p>

      {rounds.length === 0 ? (
        <div style={panel}>
          <p style={{ margin: 0, opacity: 0.7 }}>No choice rounds are open for you right now. Your school will open one ahead of course choice time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {rounds.map((r) => (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.125rem' }}>{r.name}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.875rem', opacity: 0.7 }}>
                    {r.schools?.name ?? 'Your school'} · {r.year_group} · {r.academic_year}
                  </p>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StatusPill round={r} />
                    {r.closes_at && <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Closes {new Date(r.closes_at).toLocaleDateString('en-GB')}</span>}
                  </div>
                </div>
                <Link href={`/student/choices/${r.id}`} style={btnPrimary}>
                  {r.my_submission ? 'Review / edit' : 'Make choices →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPill({ round }: { round: Round }) {
  if (round.status === 'finalised') return <span style={pill('#dbeafe', '#1e40af')}>Finalised</span>
  if (round.status === 'closed') return <span style={pill('#fef3c7', '#854d0e')}>Closed</span>
  if (round.my_submission?.status === 'confirmed') return <span style={pill('#dcfce7', '#166534')}>Confirmed</span>
  if (round.my_submission?.status === 'parent_pending') return <span style={pill('#fef3c7', '#854d0e')}>Waiting for parent</span>
  if (round.my_submission?.status === 'rejected') return <span style={pill('#fee2e2', '#991b1b')}>Parent asked you to review</span>
  if (round.my_submission?.status === 'submitted') return <span style={pill('#dbeafe', '#1e40af')}>Submitted</span>
  if (round.my_submission?.status === 'draft') return <span style={pill('#fef3c7', '#854d0e')}>Draft</span>
  return <span style={pill('#dcfce7', '#166534')}>Open</span>
}

const panel: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, backgroundColor: 'white', marginTop: 16 }
const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, backgroundColor: 'white' }
function pill(bg: string, fg: string): React.CSSProperties {
  return { display: 'inline-block', padding: '2px 10px', borderRadius: 999, backgroundColor: bg, color: fg, fontSize: '0.75rem', fontWeight: 600 }
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 14px', backgroundColor: '#1B3A5C', color: 'white', border: 'none', borderRadius: '6px',
  cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block',
}
