import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'University Cost Calculator | Pathfinder Scotland',
  description:
    'Calculate the real cost of studying at a Scottish university. Scottish students pay no tuition fees — see how affordable university can be.',
  alternates: { canonical: '/tools/roi-calculator' },
  openGraph: {
    title: 'University Cost Calculator | Pathfinder Scotland',
    description:
      'Calculate the real cost of studying at a Scottish university. Scottish students pay no tuition fees — see how affordable university can be.',
    url: '/tools/roi-calculator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'University Cost Calculator | Pathfinder Scotland',
    description:
      'Calculate the real cost of studying at a Scottish university. Scottish students pay no tuition fees — see how affordable university can be.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do Scottish students pay tuition fees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Student Awards Agency for Scotland (SAAS) pays tuition fees in full for Scottish domiciled students studying their first undergraduate degree at a Scottish university. Scottish students who study in England, Wales, or Northern Ireland, or who already hold a degree, are not covered.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does it cost to live as a student in Scotland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most Scottish students spend between £8,000 and £12,000 per year on rent and living costs while away from home, depending on the city and accommodation type. Students who live at home with family typically spend only £1,500–£2,500 per year on personal costs. Our calculator breaks this down by city, accommodation, household income, and part-time work.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my SAAS support enough to live on?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most students, SAAS support (a combination of non-repayable bursary and tuition-fee paid loans) covers tuition in full and contributes meaningfully to living costs. Students from lower-income households receive more support. Many students also work part-time or receive family contributions to cover the remainder.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I study in England?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Scottish students studying at English universities have to pay tuition fees (£9,250 per year for 2025/26), which is not covered by SAAS. Over a four-year degree that is £37,000 in tuition alone, on top of living costs. For this reason most Scottish students remain in Scotland for their undergraduate degree.',
      },
    },
  ],
}

export default function RoiCalculatorLayout({ children }: { children: React.ReactNode }) {
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
