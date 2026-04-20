import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { HorizonRatings } from '@/components/careers/HorizonRatings'
import { getAnonSupabase } from '@/lib/supabase-public'
import type { Database } from '@/types/database'

interface CareerStage {
  stage: string
  title: string
  years: string
  salary_min: number
  salary_max: number
  notes?: string
}

type RoleRow = Database['public']['Tables']['career_roles']['Row']
type ProfileRow = Database['public']['Tables']['role_profiles']['Row']
type SectorRow = Database['public']['Tables']['career_sectors']['Row']

type SectorSummary = Pick<SectorRow, 'id' | 'name' | 'description'>
type FullRole = RoleRow & { career_sectors: SectorSummary }

export async function generateStaticParams() {
  const supabase = getAnonSupabase()
  if (!supabase) return []
  const { data } = await supabase.from('career_roles').select('id, career_sector_id')
  return (data ?? []).map((r) => ({
    sectorId: r.career_sector_id,
    roleId: r.id,
  }))
}

async function fetchRoleAndProfile(sectorId: string, roleId: string) {
  const supabase = getAnonSupabase()
  if (!supabase) return { role: null, profile: null }

  const [roleRes, profileRes] = await Promise.all([
    supabase
      .from('career_roles')
      .select('*, career_sectors!inner(id, name, description)')
      .eq('id', roleId)
      .eq('career_sector_id', sectorId)
      .maybeSingle(),
    supabase
      .from('role_profiles')
      .select('*')
      .eq('career_role_id', roleId)
      .maybeSingle(),
  ])

  const role = (roleRes.data as FullRole | null) ?? null
  const profile = (profileRes.data as ProfileRow | null) ?? null

  return { role, profile }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectorId: string; roleId: string }>
}): Promise<Metadata> {
  const { sectorId, roleId } = await params
  const { role, profile } = await fetchRoleAndProfile(sectorId, roleId)

  if (!role) {
    return { title: 'Role not found | Pathfinder Scotland' }
  }

  const sector = role.career_sectors
  const description =
    profile?.description && profile.description.trim().length > 0
      ? profile.description.trim().slice(0, 160)
      : `Explore the ${role.title} role in Scotland — typical salary, day-to-day work, and progression.`

  return {
    title: `${role.title} | ${sector.name} | Pathfinder Scotland`,
    description,
  }
}

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ sectorId: string; roleId: string }>
}) {
  const { sectorId, roleId } = await params
  const { role, profile } = await fetchRoleAndProfile(sectorId, roleId)

  if (!role) notFound()

  const rp = profile
  const sector = role.career_sectors

  const careerProgression = parseCareerProgression(rp?.career_progression)

  const salaryEntry = role.salary_entry ?? role.salary_entry_uk ?? null
  const salaryExperienced = role.salary_experienced ?? role.salary_experienced_uk ?? null
  const hasSalary = salaryEntry != null || salaryExperienced != null

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
      {/* Section 1 + 2 — Breadcrumb + Hero */}
      <div style={{ backgroundColor: 'var(--pf-white)' }}>
        <div className="pf-container pt-8 pb-6 sm:pt-10 sm:pb-8">
          <nav
            className="flex items-center gap-2"
            style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginBottom: '12px' }}
          >
            <Link href="/careers" style={{ color: 'var(--pf-blue-500)' }}>
              Careers
            </Link>
            <span>/</span>
            <Link href={`/careers/${sector.id}`} style={{ color: 'var(--pf-blue-500)' }}>
              {sector.name}
            </Link>
            <span>/</span>
            <span className="truncate" style={{ color: 'var(--pf-grey-900)' }}>
              {role.title}
            </span>
          </nav>

          <h1 style={{ marginBottom: '12px', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
            {role.title}
          </h1>

          <div className="flex flex-wrap items-center" style={{ gap: '8px', marginBottom: '12px' }}>
            <Link
              href={`/careers/${sector.id}`}
              className="inline-flex items-center no-underline hover:no-underline"
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: 'var(--pf-blue-100)',
                color: 'var(--pf-blue-700)',
              }}
            >
              {sector.name}
            </Link>

            {role.is_new_ai_role === true && (
              <span
                className="inline-flex items-center"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  color: 'var(--pf-green-500)',
                }}
              >
                AI-era role
              </span>
            )}

            {role.growth_outlook && (
              <span
                className="inline-flex items-center"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--pf-grey-100)',
                  color: 'var(--pf-grey-900)',
                }}
              >
                {role.growth_outlook}
              </span>
            )}
          </div>

          {hasSalary && (
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1rem',
                  color: 'var(--pf-grey-900)',
                  margin: 0,
                }}
              >
                {salaryEntry != null && (
                  <>
                    <span style={{ color: 'var(--pf-grey-600)' }}>Entry: </span>
                    <strong>£{salaryEntry.toLocaleString('en-GB')}</strong>
                  </>
                )}
                {salaryEntry != null && salaryExperienced != null && (
                  <span style={{ color: 'var(--pf-grey-400)' }}> · </span>
                )}
                {salaryExperienced != null && (
                  <>
                    <span style={{ color: 'var(--pf-grey-600)' }}>Experienced: </span>
                    <strong>£{salaryExperienced.toLocaleString('en-GB')}</strong>
                  </>
                )}
              </p>
              {role.salary_needs_verification === true && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--pf-amber-500)',
                    marginTop: '4px',
                    fontStyle: 'italic',
                  }}
                >
                  Salary figures are indicative — verify with current sources.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pf-container pt-6 sm:pt-8 pb-12 sm:pb-16 space-y-10">
        {/* Section 3 — About this role */}
        {rp?.description && (
          <section>
            <h2 style={{ marginBottom: '12px' }}>About this role</h2>
            <Prose text={rp.description} />
          </section>
        )}

        {/* Section 4 — A day in the life */}
        {rp?.day_in_the_life && (
          <section>
            <h2 style={{ marginBottom: '12px' }}>A day in the life</h2>
            <div
              className="pf-card"
              style={{
                padding: '20px 24px',
                borderLeft: '3px solid var(--pf-blue-700)',
                backgroundColor: 'var(--pf-blue-50)',
              }}
            >
              <Prose text={rp.day_in_the_life} />
            </div>
          </section>
        )}

        {/* Section 5 — Career progression */}
        {careerProgression.length > 0 && (
          <section>
            <h2 style={{ marginBottom: '12px' }}>Career progression</h2>
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {careerProgression.map((step, idx) => (
                <li
                  key={`${step.stage}-${idx}`}
                  className="pf-card"
                  style={{
                    padding: '18px 22px',
                    borderLeft: '3px solid var(--pf-blue-500)',
                  }}
                >
                  <div
                    className="flex flex-wrap items-baseline"
                    style={{ gap: '8px', marginBottom: '4px' }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                        color: 'var(--pf-blue-700)',
                      }}
                    >
                      {step.stage}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      {step.title}
                    </span>
                    {step.years && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                        · {step.years}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      margin: 0,
                    }}
                  >
                    £{step.salary_min.toLocaleString('en-GB')} — £
                    {step.salary_max.toLocaleString('en-GB')}
                  </p>
                  {step.notes && (
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--pf-grey-600)',
                        marginTop: '6px',
                        lineHeight: 1.5,
                      }}
                    >
                      {step.notes}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Section 6 — What the work is like */}
        <WorkLikeSection rp={rp} />

        {/* Section 7 — Pay and conditions */}
        <PayConditionsSection rp={rp} />

        {/* Section 8 — Entry requirements */}
        <EntryRequirementsSection rp={rp} />

        {/* Section 9 — Where in Scotland */}
        {(rp?.geographic_availability || rp?.geographic_notes) && (
          <section>
            <h2 style={{ marginBottom: '12px' }}>Where in Scotland</h2>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              {rp?.geographic_availability && (
                <span
                  className="inline-flex items-center"
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--pf-blue-100)',
                    color: 'var(--pf-blue-700)',
                    marginBottom: rp?.geographic_notes ? '12px' : 0,
                  }}
                >
                  {rp.geographic_availability}
                </span>
              )}
              {rp?.geographic_notes && <Prose text={rp.geographic_notes} />}
            </div>
          </section>
        )}

        {/* Section 10 — AI and automation outlook */}
        <AiOutlookSection role={role} />

        {/* Section 11 — Back navigation */}
        <section>
          <Link
            href={`/careers/${sector.id}`}
            className="pf-btn-ghost inline-flex items-center"
            style={{ fontSize: '0.9375rem', gap: '6px' }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to {sector.name}
          </Link>
        </section>
      </div>
    </div>
  )
}

function Prose({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
  return (
    <div style={{ color: 'var(--pf-grey-900)', fontSize: '0.9375rem', lineHeight: 1.7 }}>
      {paragraphs.map((para, idx) => (
        <p key={idx} style={{ margin: idx === 0 ? 0 : '12px 0 0' }}>
          {para}
        </p>
      ))}
    </div>
  )
}

function WorkLikeSection({ rp }: { rp: ProfileRow | null }) {
  const dayToDay: Array<[string, string | null]> = [
    ['Hours pattern', rp?.hours_pattern ?? null],
    ['On-call', rp?.on_call ?? null],
    ['Travel', rp?.travel_requirement ?? null],
    ['Working location', rp?.working_location ?? null],
    ['Antisocial hours', rp?.antisocial_hours ?? null],
    ['Physical demands', rp?.physical_demands ?? null],
  ]
  const people: Array<[string, string | null]> = [
    ['Stress level', rp?.stress_level ?? null],
    ['Emotionally demanding', rp?.emotionally_demanding ?? null],
    ['Works with the public', rp?.deals_with_public ?? null],
    ['Works with vulnerable people', rp?.works_with_vulnerable ?? null],
    ['Team or solo', rp?.team_vs_solo ?? null],
    ['Customer facing', rp?.customer_facing ?? null],
  ]

  const hasDay = dayToDay.some(([, v]) => hasValue(v))
  const hasPeople = people.some(([, v]) => hasValue(v))
  if (!hasDay && !hasPeople) return null

  return (
    <section>
      <h2 style={{ marginBottom: '12px' }}>What the work is like</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {hasDay && (
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <h3
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--pf-grey-600)',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              Day-to-day
            </h3>
            <ChipGrid items={dayToDay} />
          </div>
        )}
        {hasPeople && (
          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <h3
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--pf-grey-600)',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              People and environment
            </h3>
            <ChipGrid items={people} />
            {rp?.emotionally_demanding &&
              rp.emotionally_demanding !== 'None' &&
              rp?.emotionally_demanding_notes && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--pf-grey-600)',
                    marginTop: '12px',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}
                >
                  {rp.emotionally_demanding_notes}
                </p>
              )}
          </div>
        )}
      </div>
    </section>
  )
}

function PayConditionsSection({ rp }: { rp: ProfileRow | null }) {
  const items: Array<[string, string | null]> = [
    ['Contract type', rp?.contract_type ?? null],
    ['Job security', rp?.job_security ?? null],
    ['Sick pay', rp?.sick_pay ?? null],
    ['Pension quality', rp?.pension_quality ?? null],
    ['Bonus payments', rp?.bonus_payments ?? null],
    ['Tips or commission', rp?.tips_or_commission ?? null],
    ['Unpaid overtime', rp?.unpaid_overtime ?? null],
    ['Work-life balance', rp?.work_life_balance ?? null],
    ['Remote/hybrid realistic', rp?.remote_hybrid_realistic ?? null],
    ['Union presence', rp?.union_presence ?? null],
    ['Self-employment viability', rp?.self_employment_viability ?? null],
    ['Salary progression speed', rp?.salary_progression_speed ?? null],
  ]
  if (!items.some(([, v]) => hasValue(v))) return null

  return (
    <section>
      <h2 style={{ marginBottom: '12px' }}>Pay and conditions</h2>
      <div className="pf-card" style={{ padding: '20px 24px' }}>
        <ChipGrid items={items} />
      </div>
    </section>
  )
}

function EntryRequirementsSection({ rp }: { rp: ProfileRow | null }) {
  if (!rp) return null

  const showDisclosure = hasValue(rp.disclosure_checks)
  const showDriving =
    rp.driving_licence != null && rp.driving_licence !== 'No' && rp.driving_licence !== 'None'
  const showMinAge = rp.minimum_age != null
  const showHealth = hasValue(rp.health_fitness_requirements)
  const showDress = hasValue(rp.dress_code)
  const showEntryCosts = !!rp.entry_cost_notes && rp.entry_cost_notes.trim().length > 0
  const showCompetition = hasValue(rp.competition_level)
  const showCriminal = hasValue(rp.criminal_record_impact)
  const showVisa = hasValue(rp.visa_restrictions)

  if (
    !showDisclosure &&
    !showDriving &&
    !showMinAge &&
    !showHealth &&
    !showDress &&
    !showEntryCosts &&
    !showCompetition &&
    !showCriminal &&
    !showVisa
  ) {
    return null
  }

  return (
    <section>
      <h2 style={{ marginBottom: '12px' }}>Getting in</h2>
      <div className="pf-card" style={{ padding: '20px 24px' }}>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
        >
          {showDisclosure && (
            <LabelledField label="Disclosure checks" value={rp.disclosure_checks!}>
              {rp.disclosure_notes && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)', marginTop: '4px' }}>
                  {rp.disclosure_notes}
                </p>
              )}
            </LabelledField>
          )}
          {showDriving && (
            <LabelledField label="Driving licence required" value={rp.driving_licence!} />
          )}
          {showMinAge && (
            <LabelledField label="Minimum age" value={`${rp.minimum_age}`} />
          )}
          {showHealth && (
            <LabelledField label="Health and fitness" value={rp.health_fitness_requirements!} />
          )}
          {showDress && <LabelledField label="Dress code" value={rp.dress_code!} />}
          {showCompetition && (
            <LabelledField label="How competitive is entry" value={rp.competition_level!} />
          )}
          {showCriminal && (
            <LabelledField label="Criminal record impact" value={rp.criminal_record_impact!} />
          )}
          {showVisa && <LabelledField label="Visa restrictions" value={rp.visa_restrictions!} />}
        </div>
        {showEntryCosts && (
          <div style={{ marginTop: '20px' }}>
            <p
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--pf-grey-600)',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              Entry costs and qualifications
            </p>
            <Prose text={rp.entry_cost_notes!} />
          </div>
        )}
      </div>
    </section>
  )
}

function AiOutlookSection({ role }: { role: RoleRow }) {
  const hasAi = role.ai_rating_2030_2035 != null || role.ai_rating_2040_2045 != null
  const hasRobotics =
    role.robotics_rating_2030_2035 != null || role.robotics_rating_2040_2045 != null
  if (!hasAi && !hasRobotics) return null

  return (
    <section>
      <h2 style={{ marginBottom: '6px' }}>AI and automation outlook</h2>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-600)',
          marginBottom: '16px',
          maxWidth: '720px',
          lineHeight: 1.6,
        }}
      >
        These ratings indicate how likely AI or robotic systems are to perform tasks currently
        done by people in this role. 10 = high potential for displacement.
      </p>

      {hasAi && (
        <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>AI impact</h3>
          {role.ai_rating_2030_2035 != null && (
            <div style={{ marginBottom: '10px' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '6px',
                  fontWeight: 500,
                }}
              >
                2030–2035
              </p>
              <RatingBar rating={role.ai_rating_2030_2035} />
            </div>
          )}
          {role.ai_rating_2040_2045 != null && (
            <div style={{ marginBottom: '12px' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '6px',
                  fontWeight: 500,
                }}
              >
                2040–2045
              </p>
              <RatingBar rating={role.ai_rating_2040_2045} />
            </div>
          )}
          {role.ai_description && (
            <div style={{ marginTop: '12px' }}>
              <Prose text={role.ai_description} />
            </div>
          )}
        </div>
      )}

      {hasRobotics && (
        <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Robotics impact</h3>
          {role.robotics_rating_2030_2035 != null && (
            <div style={{ marginBottom: '10px' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '6px',
                  fontWeight: 500,
                }}
              >
                2030–2035
              </p>
              <RatingBar rating={role.robotics_rating_2030_2035} />
            </div>
          )}
          {role.robotics_rating_2040_2045 != null && (
            <div style={{ marginBottom: '12px' }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-600)',
                  marginBottom: '6px',
                  fontWeight: 500,
                }}
              >
                2040–2045
              </p>
              <RatingBar rating={role.robotics_rating_2040_2045} />
            </div>
          )}
          {role.robotics_description && (
            <div style={{ marginTop: '12px' }}>
              <Prose text={role.robotics_description} />
            </div>
          )}
        </div>
      )}

      {role.ai_rating_2030_2035 != null &&
        role.ai_rating_2040_2045 != null &&
        role.robotics_rating_2030_2035 != null &&
        role.robotics_rating_2040_2045 != null && (
          <HorizonRatings
            aiRating2030={role.ai_rating_2030_2035}
            aiRating2040={role.ai_rating_2040_2045}
            roboticsRating2030={role.robotics_rating_2030_2035}
            roboticsRating2040={role.robotics_rating_2040_2045}
            roboticsDescription={role.robotics_description ?? ''}
          />
        )}
    </section>
  )
}

function RatingBar({ rating }: { rating: number }) {
  const colour =
    rating <= 3
      ? 'var(--pf-green-500)'
      : rating <= 6
      ? 'var(--pf-amber-500)'
      : 'var(--pf-red-500)'
  return (
    <div className="flex items-center" style={{ gap: '12px' }}>
      <div
        style={{
          flex: 1,
          backgroundColor: 'var(--pf-grey-100)',
          borderRadius: '9999px',
          height: '8px',
        }}
      >
        <div
          style={{
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: colour,
            width: `${(rating / 10) * 100}%`,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 600,
          minWidth: '48px',
          textAlign: 'right',
          color: 'var(--pf-grey-900)',
        }}
      >
        {rating}/10
      </span>
    </div>
  )
}

function ChipGrid({ items }: { items: Array<[string, string | null]> }) {
  const visible = items.filter(([, v]) => hasValue(v))
  if (visible.length === 0) return null
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
    >
      {visible.map(([label, value]) => (
        <LabelledField key={label} label={label} value={value!} />
      ))}
    </div>
  )
}

function LabelledField({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <p
        style={{
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--pf-grey-600)',
          fontWeight: 600,
          marginBottom: '4px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--pf-grey-900)',
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {value}
      </p>
      {children}
    </div>
  )
}

function hasValue(v: string | null | undefined): v is string {
  if (v == null) return false
  const trimmed = v.trim()
  if (trimmed.length === 0) return false
  if (trimmed === 'None') return false
  return true
}

function parseCareerProgression(raw: unknown): CareerStage[] {
  if (!Array.isArray(raw)) return []
  const stages: CareerStage[] = []
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as CareerStage).stage === 'string' &&
      typeof (item as CareerStage).title === 'string' &&
      typeof (item as CareerStage).years === 'string' &&
      typeof (item as CareerStage).salary_min === 'number' &&
      typeof (item as CareerStage).salary_max === 'number'
    ) {
      const s = item as CareerStage
      stages.push({
        stage: s.stage,
        title: s.title,
        years: s.years,
        salary_min: s.salary_min,
        salary_max: s.salary_max,
        notes: typeof s.notes === 'string' ? s.notes : undefined,
      })
    }
  }
  return stages
}
