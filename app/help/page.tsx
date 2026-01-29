import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & Support - Pathfinder Scotland',
  description: 'Get help using Pathfinder Scotland. Find answers to frequently asked questions and learn how to make the most of the platform.',
}

export default function HelpPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'What is Pathfinder Scotland?',
          a: 'Pathfinder Scotland is a free platform that helps Scottish students discover university courses, check their eligibility based on predicted or actual grades, and build shortlists for UCAS applications. We cover all 15 Scottish universities.',
        },
        {
          q: 'Who can use Pathfinder?',
          a: 'Pathfinder is designed for S3-S6 school pupils, college students, and mature learners in Scotland who are considering applying to Scottish universities. It\'s completely free to use.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click "Sign up" on the homepage and enter your email address. You\'ll complete a short onboarding process where you enter your school stage, location, and predicted grades. This takes about 2 minutes.',
        },
      ],
    },
    {
      category: 'Grades & Eligibility',
      questions: [
        {
          q: 'How does eligibility checking work?',
          a: 'We compare your entered grades against each course\'s entry requirements. Courses show as "Eligible" (you meet requirements), "Possible" (you\'re close), or "Below Requirements" (significant gap). We also factor in widening access criteria.',
        },
        {
          q: 'Should I enter predicted or actual grades?',
          a: 'Enter whichever is most relevant to your situation. S5/S6 pupils might enter predicted grades for subjects they\'re currently studying, while also including actual grades from previous years.',
        },
        {
          q: 'What qualifications are supported?',
          a: 'We support SQA Highers, Advanced Highers, National 5s, A-Levels, and BTEC qualifications. You can add grades for multiple qualification types.',
        },
        {
          q: 'How are grade strings calculated?',
          a: 'Grade strings like "AAABB" are calculated by sorting your best grades. For Highers, we typically show your best 5 grades. This matches how universities view applications.',
        },
      ],
    },
    {
      category: 'Widening Access',
      questions: [
        {
          q: 'What is SIMD?',
          a: 'SIMD (Scottish Index of Multiple Deprivation) measures how deprived an area is. If you live in an SIMD20 or SIMD40 area, you may be eligible for reduced entry requirements at many universities.',
        },
        {
          q: 'How do I find my SIMD decile?',
          a: 'Enter your postcode in your profile, and we\'ll automatically look up your SIMD decile. Decile 1-2 is SIMD20 (most deprived 20%), and decile 1-4 is SIMD40.',
        },
        {
          q: 'What other widening access criteria exist?',
          a: 'Besides SIMD, universities consider care experience, being a young carer, being first in your family to attend university, estrangement from family, and attending a low-progression school.',
        },
        {
          q: 'How much are entry requirements reduced?',
          a: 'This varies by university and course, but typically 1-2 grades lower. For example, a course requiring AABB might accept ABBB or BBBB for widening access students.',
        },
      ],
    },
    {
      category: 'Courses & Universities',
      questions: [
        {
          q: 'How many courses are listed?',
          a: 'We list thousands of undergraduate courses across all 15 Scottish universities, covering every subject area from Arts to Engineering.',
        },
        {
          q: 'How up-to-date is the information?',
          a: 'We sync course data regularly with university websites and UCAS. However, always verify entry requirements directly with universities before applying, as they can change.',
        },
        {
          q: 'Can I save courses for later?',
          a: 'Yes! Click the heart icon on any course to save it. You can view all saved courses in your "Saved" section, add notes, set priorities, and export your list.',
        },
        {
          q: 'How does the comparison feature work?',
          a: 'Add up to 4 courses to your comparison by clicking "Compare". You can then view them side-by-side with all key details including entry requirements, UCAS points, and outcomes.',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      questions: [
        {
          q: 'Is my data secure?',
          a: 'Yes. We use industry-standard encryption and never share your personal data with third parties. Your grades and profile information are only visible to you.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes. Go to Profile > Settings > Delete Account. This will permanently remove all your data including saved courses and grades.',
        },
        {
          q: 'Do universities see my Pathfinder activity?',
          a: 'No. Pathfinder is independent of universities and UCAS. Your activity on our platform is private and not shared with any institutions.',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">
            Find answers to common questions and learn how to use Pathfinder Scotland.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            {
              title: 'Getting Started Guide',
              description: 'New to Pathfinder? Start here.',
              href: '#getting-started',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
            {
              title: 'Widening Access',
              description: 'Learn about reduced requirements.',
              href: '/widening-access',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
            },
            {
              title: 'Contact Us',
              description: 'Get in touch with our team.',
              href: '#contact',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
          ].map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                {link.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-12">
          {faqs.map((category) => (
            <section key={category.category} id={category.category.toLowerCase().replace(/\s+/g, '-')}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
                  >
                    <summary className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50">
                      <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                      <svg
                        className="w-5 h-5 text-gray-500 flex-shrink-0 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <section id="contact" className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Get in touch with our support team and we&apos;ll help you out.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:support@pathfinder-scotland.com"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Email us</p>
                <p className="text-sm text-gray-600">support@pathfinder-scotland.com</p>
              </div>
            </a>
            <a
              href="https://twitter.com/pathfinderscot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Twitter / X</p>
                <p className="text-sm text-gray-600">@pathfinderscot</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
