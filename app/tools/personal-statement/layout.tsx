import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UCAS Personal Statement Guide',
  description:
    'How to answer the three UCAS personal statement questions for 2026 entry. Annotated examples from real Scottish students, plus a guided writing tool.',
  keywords: [
    'UCAS personal statement 2026',
    'personal statement examples Scotland',
    'how to write UCAS statement',
    'personal statement tips',
    'Scottish UCAS application',
  ],
  alternates: { canonical: '/tools/personal-statement' },
  openGraph: {
    title: 'UCAS Personal Statement Guide | Pathfinder Scotland',
    description:
      'How to answer the three UCAS personal statement questions for 2026 entry. Annotated examples from real Scottish students.',
    url: '/tools/personal-statement',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UCAS Personal Statement Guide | Pathfinder Scotland',
    description:
      'How to answer the three UCAS personal statement questions for 2026 entry. Annotated examples from real Scottish students.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How long is the UCAS personal statement for 2026 entry?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'From 2026 entry the personal statement is three structured questions totalling 4,000 characters, with a minimum of 350 characters per question. Each question is answered separately rather than as a single long essay.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the three UCAS personal statement questions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Question 1: Why do you want to study this course? Question 2: How have your studies prepared you for this course? Question 3: What else have you done that is relevant to this course? You must answer all three; the 4,000 character limit is shared across them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use AI to write my personal statement?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. UCAS runs similarity and AI detection on every submission. AI-generated text is easy for trained admissions tutors to spot and may be flagged. Use AI to brainstorm or proofread if you want, but the words must be your own.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should Scottish students mention widening access or caring roles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, when it is relevant. Scottish universities actively look for students who have achieved in difficult circumstances. Care experience, young-carer status, first-generation status, and financial hardship can be mentioned honestly as evidence of resilience and self-direction, not as a request for sympathy.',
      },
    },
  ],
}

export default function PersonalStatementLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
