import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Extenuating Circumstances: What to Do When Things Go Wrong',
  description:
    'If illness, bereavement, family problems, or other circumstances affected your exams, there are formal processes to make sure you are treated fairly.',
  alternates: { canonical: '/support/extenuating-circumstances' },
}

const ExternalIcon = () => (
  <svg
    width="11"
    height="11"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
    style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'baseline' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
)

export default function ExtenuatingCircumstancesPage() {
  return (
    <>
      {/* Header */}
      <section
        style={{
          backgroundColor: 'var(--pf-white)',
          borderBottom: '1px solid var(--pf-grey-300)',
          paddingTop: '56px',
          paddingBottom: '40px',
        }}
      >
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: '0.875rem', color: 'var(--pf-grey-600)', marginBottom: '16px' }}
          >
            <Link href="/" style={{ color: 'var(--pf-grey-600)' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href="/support" style={{ color: 'var(--pf-grey-600)' }}>Support</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--pf-grey-900)' }}>Extenuating circumstances</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>
            Extenuating circumstances: what to do when things go wrong
          </h1>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              maxWidth: '660px',
            }}
          >
            Sometimes life gets in the way of exams. If something happened before or during your
            exam period that affected your performance &mdash; illness, bereavement, family crisis,
            mental health &mdash; there are formal processes to make sure this is taken into account.
            You are not alone, and asking for help is not a sign of weakness.
          </p>
        </div>
      </section>

      {/* Section 1 — What counts */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>What counts as extenuating circumstances?</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Universities and Qualifications Scotland recognise a wide range of circumstances that
            can affect exam performance.
          </p>

          <div className="pf-card" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <ul
              style={{
                color: 'var(--pf-grey-700)',
                fontSize: '0.9375rem',
                lineHeight: 1.8,
                paddingLeft: '20px',
                margin: 0,
              }}
            >
              <li>Serious illness (physical or mental) during the exam period</li>
              <li>Bereavement of a close family member or friend</li>
              <li>Family breakdown or domestic disruption</li>
              <li>Being a victim of crime, including assault, harassment or stalking</li>
              <li>Caring responsibilities, such as looking after a seriously ill family member</li>
              <li>Homelessness or housing crisis</li>
              <li>Involvement in a serious accident</li>
              <li>A previously unrecognised learning difficulty diagnosed during exams</li>
              <li>Sudden financial hardship affecting your ability to study</li>
            </ul>
          </div>

          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--pf-amber-50, #fffbeb)',
              border: '1px solid var(--pf-amber-200, #fde68a)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--pf-grey-700)',
              lineHeight: 1.6,
            }}
          >
            <strong>Note:</strong> Day-to-day stress, poor time management, and foreseeable
            commitments (such as a holiday or sports fixture) do not usually qualify as
            extenuating circumstances.
          </div>
        </div>
      </section>

      {/* Section 2 — At school (Qualifications Scotland) */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>At school: Qualifications Scotland</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            If circumstances affected your Qualifications Scotland exams, your school can submit
            an exceptional circumstances request on your behalf. Qualifications Scotland replaced
            the SQA on 1 February 2026; the exceptional circumstances process continues under the
            new body.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Tell your guidance teacher as soon as possible
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                Ideally, do this before the exam &mdash; certainly before your results are issued.
                The earlier the school records your situation, the stronger any submission to
                Qualifications Scotland will be. You cannot submit the form yourself; it must go
                through your school.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                What your school will submit
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                Your school gathers evidence (medical notes, counsellor letters, attendance
                records) and submits an exceptional circumstances claim. Possible outcomes include
                an estimated grade based on coursework and prelim results, or a discretionary
                grade uplift in line with the exceptional circumstances policy.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Post-results review (formerly &ldquo;appeal&rdquo;)
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                If you receive a result that you believe does not reflect your performance, you
                can ask your school to request a post-results review after results day. Reviews
                are submitted by the school and can result in your grade being raised, kept the
                same, or in rare cases lowered.
              </p>
              <a
                href="https://www.qualifications.gov.scot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1"
                style={{
                  color: 'var(--pf-blue-700)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Qualifications Scotland exceptional circumstances guidance
                <ExternalIcon />
              </a>
              <VerificationCaveat
                org="Qualifications Scotland"
                url="https://www.qualifications.gov.scot"
                year="2025-26"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — At university (applying) */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>At university: applying</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            If circumstances affected your exam results and you are applying to university, you
            can &mdash; and should &mdash; disclose this in your UCAS application. Universities
            take it into account through contextual admissions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Where to disclose</h3>
              <ul
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  paddingLeft: '20px',
                  margin: 0,
                }}
              >
                <li>
                  In the additional information section of your UCAS application
                </li>
                <li>
                  In your school reference (ask your guidance teacher to mention it)
                </li>
                <li>
                  Directly to university admissions offices, especially if you are close to an
                  offer threshold
                </li>
                <li>
                  On any contextual data form your chosen university provides
                </li>
              </ul>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Scottish universities and contextual admissions
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                All Scottish universities consider applications in context. Many have dedicated
                widening access or contextualised admissions teams that look at extenuating
                circumstances alongside SIMD data, school performance, and care experience. A
                documented disclosure can lead to a lower conditional offer or extra flexibility
                at results day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — At university (during studies) */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>At university: during your studies</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            If circumstances affect coursework or exams once you are at university, every
            institution has a formal extenuating circumstances process. The exact name varies
            (mitigating circumstances, MCs, ECs, good cause) but the principle is the same.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>The typical process</h3>
              <ol
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  paddingLeft: '20px',
                  margin: 0,
                }}
              >
                <li>Submit an extenuating circumstances form to your school or department</li>
                <li>Attach supporting evidence (medical, bereavement, etc.)</li>
                <li>Do this within the deadline &mdash; usually 5 working days after the assessment</li>
                <li>The board considers your case and decides on an outcome</li>
              </ol>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Possible outcomes</h3>
              <ul
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  paddingLeft: '20px',
                  margin: 0,
                }}
              >
                <li>An extension to a coursework deadline</li>
                <li>A deferred exam in the next diet, marked as a first attempt</li>
                <li>Your grade calculated without the affected assessment</li>
                <li>An additional resit opportunity</li>
              </ul>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Where to get help</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                Your university Student Support, Wellbeing, or Disability Service can help you
                navigate the process. So can your students&apos; association advice team &mdash;
                they are independent of the university and free to use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Evidence */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Evidence you might need</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Evidence supports your case at every stage &mdash; school, UCAS, and university. Keep
            originals safely; submit copies when asked.
          </p>

          <div className="pf-card" style={{ padding: '20px 24px' }}>
            <ul
              style={{
                color: 'var(--pf-grey-700)',
                fontSize: '0.9375rem',
                lineHeight: 1.8,
                paddingLeft: '20px',
                margin: 0,
              }}
            >
              <li>Medical certificate or GP letter (covering dates and impact on study)</li>
              <li>Hospital admission or discharge records</li>
              <li>Death certificate or funeral notice (for bereavement)</li>
              <li>Police report number (for crime)</li>
              <li>Letter from a counsellor, social worker, or support organisation</li>
              <li>School attendance records</li>
              <li>Letter from a youth worker, carer support team, or charity caseworker</li>
            </ul>
            <p
              style={{
                color: 'var(--pf-grey-600)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                marginTop: '14px',
                fontStyle: 'italic',
              }}
            >
              If you do not have formal evidence, talk to your guidance teacher or university
              support team. They can advise on alternatives and may be able to write a supporting
              statement based on what they know about you.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6 — Key contacts */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Key contacts</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Below are the organisations most useful for extenuating circumstances claims and the
            support that goes alongside them.
          </p>

          <div
            className="pf-card"
            style={{ padding: '0', overflow: 'hidden', marginBottom: '16px' }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9375rem',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: 'var(--pf-grey-50, #f9fafb)' }}>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--pf-grey-700)',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Organisation
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--pf-grey-700)',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Contact
                    </th>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: 600,
                        color: 'var(--pf-grey-700)',
                        fontSize: '0.8125rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      What they help with
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: 'Your school guidance teacher',
                      contact: 'Ask at your school',
                      help: 'First point of contact for school-level extenuating circumstances',
                    },
                    {
                      name: 'Qualifications Scotland',
                      contact: (
                        <a
                          href="https://www.qualifications.gov.scot"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--pf-blue-700)' }}
                        >
                          qualifications.gov.scot
                        </a>
                      ),
                      help: 'Exceptional circumstances for national qualifications',
                    },
                    {
                      name: 'UCAS',
                      contact: (
                        <a href="tel:03714680468" style={{ color: 'var(--pf-blue-700)' }}>
                          0371 468 0468
                        </a>
                      ),
                      help: 'Disclosing circumstances in your application',
                    },
                    {
                      name: 'SAAS',
                      contact: (
                        <a href="tel:03005550505" style={{ color: 'var(--pf-blue-700)' }}>
                          0300 555 0505
                        </a>
                      ),
                      help: 'If circumstances affect your funding (Mon, Wed, Fri 9am&ndash;4pm)',
                    },
                    {
                      name: 'sparqs',
                      contact: (
                        <a
                          href="https://www.sparqs.ac.uk"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--pf-blue-700)' }}
                        >
                          sparqs.ac.uk
                        </a>
                      ),
                      help: 'Student rights and partnership in Scottish higher education',
                    },
                    {
                      name: 'Breathing Space',
                      contact: (
                        <a href="tel:08008385 87" style={{ color: 'var(--pf-blue-700)' }}>
                          0800 83 85 87
                        </a>
                      ),
                      help: 'Free Scottish helpline for low mood and anxiety',
                    },
                    {
                      name: 'Samaritans',
                      contact: (
                        <a href="tel:116123" style={{ color: 'var(--pf-blue-700)' }}>
                          116 123
                        </a>
                      ),
                      help: '24/7 emotional support &mdash; you do not need to be in crisis',
                    },
                  ].map((row) => (
                    <tr
                      key={row.name}
                      style={{ borderTop: '1px solid var(--pf-grey-200)' }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 600,
                          color: 'var(--pf-grey-900)',
                          verticalAlign: 'top',
                        }}
                      >
                        {row.name}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: 'var(--pf-grey-700)',
                          verticalAlign: 'top',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.contact}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          color: 'var(--pf-grey-600)',
                          verticalAlign: 'top',
                          lineHeight: 1.5,
                        }}
                      >
                        {row.help}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <VerificationCaveat
            org="Qualifications Scotland"
            url="https://www.qualifications.gov.scot"
            year="April 2026"
            customText="This information was verified in April 2026. Processes and contact details may change. Always check with the official provider."
          />
        </div>
      </section>

      {/* Offers */}
      <SupportGroupOffers supportGroup="difficult-circumstances" background="grey" />

      {/* Section 7 — Closing + cross-links */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>You are not alone</h2>
          <p
            style={{
              color: 'var(--pf-grey-700)',
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              marginBottom: '24px',
            }}
          >
            Asking for help when you need it is not cheating &mdash; it is making sure the system
            treats you fairly. Every year, thousands of students in Scotland have their
            circumstances taken into account. If something happened to you, speak up.
          </p>

          <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '24px' }}>
            <Link
              href="/support/difficult-circumstances"
              className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
              style={{ padding: '20px' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 94, 184, 0.1)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  Difficult circumstances support
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  Wider emotional and practical support around difficult times
                </p>
              </div>
            </Link>

            <Link
              href="/results-day"
              className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
              style={{ padding: '20px' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--pf-green-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  Results Day hub
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  What to do if your grades are not what you hoped
                </p>
              </div>
            </Link>

            <Link
              href="/tools/personal-statement"
              className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
              style={{ padding: '20px' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: 'var(--pf-amber-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  Personal statement tool
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  Guidance on how to mention circumstances in your application
                </p>
              </div>
            </Link>

            <Link
              href="/support"
              className="pf-card-hover no-underline hover:no-underline flex items-start gap-3"
              style={{ padding: '20px' }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 94, 184, 0.08)',
                  color: 'var(--pf-blue-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: 'var(--pf-grey-900)',
                    marginBottom: '2px',
                  }}
                >
                  All support groups
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  Back to the full support hub
                </p>
              </div>
            </Link>
          </div>

          <Link
            href="/support"
            className="inline-flex items-center gap-2"
            style={{
              color: 'var(--pf-blue-700)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to support hub
          </Link>
        </div>
      </section>
    </>
  )
}
