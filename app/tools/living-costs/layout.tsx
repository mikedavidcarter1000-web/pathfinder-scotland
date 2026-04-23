import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Living Costs at Scottish Universities',
  description:
    'Compare accommodation costs, living expenses and SAAS funding at every Scottish university. See what it actually costs to study -- and how much you have left over.',
  keywords: [
    'university living costs Scotland',
    'cheapest university Scotland',
    'student accommodation costs Scottish universities',
    'can I afford university Scotland',
    'SAAS funding calculator',
    'student budget Scotland',
  ],
  alternates: { canonical: '/tools/living-costs' },
  openGraph: {
    title: 'Compare Living Costs at Scottish Universities | Pathfinder Scotland',
    description:
      'Compare accommodation costs, living expenses and SAAS funding at every Scottish university. See what it actually costs to study -- and how much you have left over.',
    url: '/tools/living-costs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Living Costs at Scottish Universities | Pathfinder Scotland',
    description:
      'Compare accommodation, food, travel and social costs against SAAS funding for every Scottish university.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which is the cheapest Scottish university to live at?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dundee, Stirling and the University of the West of Scotland (Paisley) are consistently the cheapest cities for student accommodation in Scotland. Cheap halls start from around £125-£140 per week. Edinburgh and St Andrews are the most expensive, with the cheapest halls typically £165-£200 per week.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will SAAS cover my living costs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For most Scottish students living away from home, SAAS support of £8,400-£11,400 per year covers cheap halls in cheaper cities (Dundee, Stirling, Aberdeen, Paisley) with several thousand pounds left over. In Edinburgh, the cheapest halls plus food typically equal or slightly exceed maximum SAAS support, so part-time work or family contributions may be needed. Living at home transforms the picture in any city.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I live at home or move away for university?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There is no right answer. Living at home saves £5,000-£10,000 per year, keeps you near your support network and your part-time job, and is a perfectly valid choice. Moving away builds independence and gives you the full social experience of university. The best choice depends on whether your nearest university offers your course, your finances, and what you want from university.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is included in the SAAS bursary and loan?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For 2025-26: under £21k household income gets a £2,000 bursary plus £9,400 loan (£11,400 total); £21k-£24k gets £1,125 bursary plus £9,400 loan (£10,525 total); £24k-£34k gets £500 bursary plus £9,400 loan (£9,900 total); over £34k gets £8,400 loan only. Tuition is free for Scottish students at Scottish universities and is paid directly by SAAS.',
      },
    },
  ],
}

export default function LivingCostsLayout({ children }: { children: React.ReactNode }) {
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
