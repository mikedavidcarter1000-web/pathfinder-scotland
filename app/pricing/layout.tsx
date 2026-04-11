import type { Metadata } from 'next'

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Pathfinder Scotland free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our Free plan includes browsing every Scottish university, viewing course requirements, the basic eligibility checker, and saving up to five courses. Paid plans add unlimited saves, personalised recommendations and application support.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my subscription at any time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can cancel from your account settings at any time. You will keep access to paid features until the end of your current billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Pathfinder cover widening access programmes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every plan — including the Free tier — includes widening access information. We automatically identify schemes you may qualify for through SIMD, care experience, or first-generation status.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your data is stored on Supabase infrastructure hosted in the EU, encrypted at rest. We do not sell personal data or share it with advertisers. See our Privacy Policy for full details.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer discounts for schools or groups?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are exploring school and local authority partnerships. Get in touch via our contact form if you would like to discuss access for a cohort of students.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing. Start free and upgrade when you need unlimited saved courses, personalised recommendations, and application support.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Pathfinder Scotland',
    description:
      'Simple, transparent pricing. Start free and upgrade when you need unlimited saved courses, personalised recommendations, and application support.',
    url: '/pricing',
    type: 'website',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
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
