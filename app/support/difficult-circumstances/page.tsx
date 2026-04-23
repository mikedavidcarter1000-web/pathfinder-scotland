import Link from 'next/link'
import type { Metadata } from 'next'
import { VerificationCaveat } from '@/components/ui/VerificationCaveat'
import { SupportGroupOffers } from '@/components/offers/support-group-offers'

export const metadata: Metadata = {
  title: 'Extenuating Circumstances Support',
  description:
    'Guidance for Scottish students dealing with illness, bereavement, or other difficult circumstances that have affected their studies or exam results.',
  alternates: { canonical: '/support/difficult-circumstances' },
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
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
)

export default function DifficultCircumstancesPage() {
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
            <span style={{ color: 'var(--pf-grey-900)' }}>Difficult circumstances</span>
          </nav>
          <h1 style={{ marginBottom: '16px' }}>Support for difficult circumstances</h1>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              maxWidth: '660px',
            }}
          >
            Illness, bereavement, family breakdown, and other serious events can affect your grades
            and your university application. There are formal processes to make sure your situation
            is taken into account — this page explains what they are and how to use them.
          </p>
        </div>
      </section>

      {/* Section 1 — SQA exam adjustments */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>SQA exam adjustments</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            If something goes wrong on or just before an exam — illness, a bereavement, or another
            serious event — SQA has an exceptional circumstances process that can adjust your grade
            or take your situation into account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                SQA Exceptional Circumstances
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                If you are seriously ill or affected by a bereavement during the exam diet, your
                school can submit an exceptional circumstances form to SQA on your behalf. SQA will
                consider this when awarding your grade. You cannot submit this form yourself — it
                must go through your school.
              </p>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  marginBottom: '12px',
                }}
              >
                Tell your guidance teacher or head teacher as soon as possible. The sooner it is
                recorded, the stronger the submission.
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
                SQA exceptional circumstances guidance
                <ExternalIcon />
              </a>
              <VerificationCaveat
                org="SQA"
                url="https://www.qualifications.gov.scot"
                year="2025-26"
              />
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                What counts as an exceptional circumstance
              </h3>
              <ul
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  paddingLeft: '20px',
                  margin: 0,
                }}
              >
                <li>Serious illness on the day of the exam or in the days immediately before it</li>
                <li>
                  A bereavement — the death of someone close to you — shortly before or during the
                  exam diet
                </li>
                <li>
                  A serious accident, hospitalisation, or trauma that prevented you from sitting or
                  preparing
                </li>
                <li>
                  A significant family crisis — for example, a parent being hospitalised — that
                  severely affected your ability to prepare
                </li>
              </ul>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Access arrangements</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                If you have a disability, long-term health condition, or additional support need,
                you may be entitled to exam accommodations — such as extra time, a reader, or a
                separate room. These must be requested through your school before the exam diet, not
                on the day.{' '}
                <Link href="/support/disability" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                  See our disabled students guide
                </Link>{' '}
                for more detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Exceptional circumstances during the year */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Exceptional circumstances during the year</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Circumstances that affect you over a longer period — ongoing illness, a bereavement
            months before exams, or a serious family situation — also matter and can be recorded
            formally.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Tell your school as soon as possible
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                Speak to your guidance teacher or head of year. Ask them to make a formal note of
                your situation and the dates it affected you. You do not need to share every detail
                — just enough for a record to exist. This note can be included in your school
                reference on UCAS and used to support any applications for mitigating circumstances.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Keep evidence where possible</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                Evidence supports your case — at SQA, at UCAS, and at university. Useful evidence
                includes:
              </p>
              <ul
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  paddingLeft: '20px',
                  margin: 0,
                }}
              >
                <li>A letter from your GP or hospital (covering dates and impact on studies)</li>
                <li>A death certificate or funeral notice (for bereavement)</li>
                <li>
                  A letter from a social worker, counsellor, or welfare professional who is aware
                  of your situation
                </li>
                <li>
                  School attendance records, if relevant
                </li>
              </ul>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  marginTop: '12px',
                  fontStyle: 'italic',
                }}
              >
                You do not need to attach evidence to UCAS — keep it safely in case a university
                asks for it after you apply.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Mentioning it in your personal statement
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                You can briefly mention serious circumstances in your UCAS personal statement — for
                example, that a health issue or bereavement affected your predicted grades. Keep it
                factual and concise: one or two sentences is enough. Focus on what you did to
                continue studying despite the difficulty. Universities view this positively as
                evidence of resilience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — University admissions guidance */}
      <section className="pf-section pf-section-grey">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>University admissions guidance</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Scottish universities have formal processes to consider extenuating circumstances —
            both when you apply and after results day if your grades fall short.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Contextualised admissions</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                All Scottish universities use contextualised admissions — they consider your grades
                in the context of your circumstances. Documented extenuating circumstances can lead
                to a lower conditional offer or more flexible consideration of your application.
                Declare your circumstances on any contextual data form your chosen university
                provides, and ensure your school reference mentions them.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Extenuating circumstances after results day
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  marginBottom: '8px',
                }}
              >
                If your grades fall short of your conditional offer, contact your university
                admissions team directly — do not wait for them to contact you. Most universities
                have an extenuating circumstances or mitigating circumstances process that allows
                them to reconsider your application. Have your evidence ready.
              </p>
              <p
                style={{
                  backgroundColor: 'var(--pf-blue-50)',
                  borderLeft: '3px solid var(--pf-blue-700)',
                  padding: '10px 14px',
                  borderRadius: '0 6px 6px 0',
                  color: 'var(--pf-grey-700)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                <strong>On results day:</strong> phone the admissions team — do not rely on email
                alone. Scottish universities are supportive; a direct conversation is more effective
                than waiting in a queue.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>UCAS Clearing</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                If your offer is not confirmed, UCAS Clearing opens courses with available places.
                You can explain your circumstances during a Clearing call — admissions staff on
                Clearing phones have authority to make decisions quickly.{' '}
                <Link href="/results-day" style={{ color: 'var(--pf-blue-700)', fontWeight: 600 }}>
                  See our Results Day guide
                </Link>{' '}
                for more on Clearing and what to do if your results are not what you hoped for.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Deferring your entry</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                If you are not well enough to start university, you can ask to defer your place to
                the following year. Most Scottish universities will agree to this for genuine
                medical or personal reasons. Contact the admissions team with a brief explanation
                and your GP or consultant&apos;s letter if you have one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Information for parents and carers */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>For parents and carers</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            If your child is going through a difficult time, there are practical steps you can take
            to protect their university application.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>Contact the school early</h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                Ask the guidance teacher or pastoral head to record what has happened and the
                dates it affected your child&apos;s attendance or ability to study. Schools can include
                this in the UCAS reference — but only if they know about it.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Keep a family record
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                Keep any relevant documents — medical letters, correspondence from the school,
                or any records that show the dates and nature of the difficulty. You may need
                these if a university asks for evidence later.
              </p>
            </div>

            <div className="pf-card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>
                Help your child contact universities directly
              </h3>
              <p
                style={{
                  color: 'var(--pf-grey-600)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}
              >
                On results day, universities prefer to speak to the applicant directly — but you
                can sit with your child and help them prepare what to say. Admissions staff are
                experienced in these conversations and are there to help, not to judge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 — Helplines and crisis support */}
      <section className="pf-section" style={{ backgroundColor: 'var(--pf-blue-50)' }}>
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '8px' }}>Helplines and crisis support</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Difficult circumstances can affect your mental health. These services are free,
            confidential, and available around the clock.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                name: 'Breathing Space',
                detail: 'Free, confidential Scottish helpline for people experiencing low mood or anxiety',
                phone: '0800 83 85 87',
                hours: 'Mon–Thu 6pm–2am, Fri 6pm–Mon 6am',
                href: 'tel:08008385 87',
              },
              {
                name: 'Samaritans',
                detail: 'Confidential emotional support — you do not need to be in crisis to call',
                phone: '116 123',
                hours: '24 hours, 7 days',
                href: 'tel:116123',
              },
              {
                name: 'Childline',
                detail: 'For anyone under 19 — call, chat online, or email',
                phone: '0800 1111',
                hours: '24 hours, 7 days (free, does not appear on your phone bill)',
                href: 'tel:08001111',
              },
              {
                name: 'NHS 24',
                detail: 'Urgent medical or mental health advice from NHS Scotland',
                phone: '111',
                hours: '24 hours, 7 days',
                href: 'tel:111',
              },
              {
                name: 'Young Minds Crisis Text Line',
                detail: 'Free text support for young people in crisis',
                phone: 'Text YM to 85258',
                hours: '24 hours, 7 days',
                href: 'sms:85258?body=YM',
              },
            ].map((line) => (
              <div
                key={line.name}
                className="pf-card"
                style={{ padding: '18px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--pf-blue-100)',
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      color: 'var(--pf-grey-900)',
                      marginBottom: '2px',
                    }}
                  >
                    {line.name}
                  </p>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--pf-grey-600)',
                      marginBottom: '6px',
                      lineHeight: 1.5,
                    }}
                  >
                    {line.detail}
                  </p>
                  <a
                    href={line.href}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--pf-blue-700)',
                      textDecoration: 'none',
                    }}
                  >
                    {line.phone}
                  </a>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      color: 'var(--pf-grey-500)',
                      marginTop: '2px',
                    }}
                  >
                    {line.hours}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offers & entitlements */}
      <SupportGroupOffers supportGroup="difficult-circumstances" background="white" />

      {/* Section 6 — What to do next */}
      <section className="pf-section pf-section-white">
        <div className="pf-container" style={{ maxWidth: '720px' }}>
          <h2 style={{ marginBottom: '16px' }}>What to do next</h2>
          <p
            style={{
              color: 'var(--pf-grey-600)',
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}
          >
            The most important step is to tell someone at your school what has happened — your
            guidance teacher, head of year, or head teacher. Once it is recorded, they can support
            your SQA submission and UCAS reference. You do not need to face this alone.
          </p>

          <div className="grid sm:grid-cols-2 gap-4" style={{ marginBottom: '32px' }}>
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
                  Results Day guide
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  What to do if your grades are not what you hoped for
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

            <a
              href="https://www.qualifications.gov.scot"
              target="_blank"
              rel="noopener noreferrer"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                  SQA exceptional circumstances
                  <ExternalIcon />
                </p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--pf-grey-600)' }}>
                  Official SQA guidance for schools and students
                </p>
              </div>
            </a>

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
