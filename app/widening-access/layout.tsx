import type { Metadata } from 'next'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is widening access in Scotland?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Widening access is the Scottish Government\u2019s commitment to ensuring students from under-represented backgrounds get a fair chance at university. Universities offer reduced entry requirements, contextualised admissions, and additional support to students who meet specific criteria — such as living in a SIMD20 or SIMD40 postcode, being care experienced, being a young carer, or being the first in their family to attend university.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I know if I qualify for widening access?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You may qualify if you live in one of the 40% most deprived Scottish postcodes (SIMD40), have been in care at any point, provide unpaid care for a family member, or would be the first in your immediate family to go to university. Pathfinder checks all of these automatically when you create a profile and enter your postcode.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is SIMD and how does it affect my application?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SIMD stands for Scottish Index of Multiple Deprivation. It divides Scotland into 6,976 small datazones ranked from most to least deprived. Each postcode sits inside a datazone and is grouped into deciles: deciles 1\u20132 are SIMD20 (the 20% most deprived), and deciles 1\u20134 are SIMD40. Universities use your SIMD decile alongside your grades when considering your application.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much lower are the adjusted entry requirements?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It varies by course and university, but typical adjustments range from one to two grades lower than the standard offer. For example, a course asking for AAAA might accept AABB under a widening access scheme. Pathfinder shows the exact adjusted offer for every course where the university has published one.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which Scottish universities participate in widening access?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All 15 Scottish universities participate in widening access in some form. Major programmes include LEAPS (Lothians), FOCUS West (Glasgow and the west), Aspire North (Aberdeen area), REACH (run by Edinburgh, St Andrews, Glasgow and Heriot-Watt), and the Scottish Wider Access Programme (SWAP) for mature students.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to apply separately for widening access?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No \u2014 widening access is automatic at most universities. When you apply through UCAS, the admissions team checks your postcode and any flags you\u2019ve declared (care experience, young carer, etc.). Some dedicated programmes like REACH or LEAPS require separate registration in S5 or S6, and offer extra support like summer schools and mentoring.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is widening access the same as contextual admissions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'They overlap but aren\u2019t identical. Contextual admissions is the broader practice of considering your background alongside your grades. Widening access is a Scottish-specific policy framework that sets targets and funding for this work. In practice, students often benefit from both at the same time.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Pathfinder cost anything to check my eligibility?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Creating a Pathfinder account is free, and eligibility checking is part of the free tier. We automatically look up your SIMD decile from your postcode and compare it against every course\u2019s widening access offer, so you can see the personalised requirements without paying anything.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Widening Access Support',
  description:
    'Reduced entry requirements at Scottish universities for students from widening participation backgrounds. Check your eligibility, understand the schemes, and find courses where you have a stronger chance.',
  alternates: { canonical: '/widening-access' },
  openGraph: {
    title: 'Widening Access Support | Pathfinder Scotland',
    description:
      'Reduced entry requirements at Scottish universities for students from widening participation backgrounds. Check your eligibility, understand the schemes, and find courses where you have a stronger chance.',
    url: '/widening-access',
    type: 'website',
  },
}

export default function WideningAccessLayout({ children }: { children: React.ReactNode }) {
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
