import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Widening Access - Pathfinder Scotland',
  description: 'Learn about widening access programmes at Scottish universities and how they can help you with reduced entry requirements.',
}

export default function WideningAccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Widening Access</h1>
          <p className="text-xl text-purple-100">
            Removing barriers to higher education for talented students from all backgrounds
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* What is Widening Access */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Widening Access?</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Widening access programmes help students from underrepresented backgrounds get into university.
              If you qualify, you may receive lower entry requirements, additional support, and guaranteed offers
              through schemes like SWAP, REACH, and contextualised admissions.
            </p>
            <p>
              Scotland is committed to ensuring talented students can succeed regardless of their background.
              Universities consider your circumstances alongside your grades to give everyone a fair chance.
            </p>
          </div>
        </section>

        {/* Who Qualifies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who Qualifies?</h2>
          <div className="grid gap-4">
            {[
              {
                title: 'SIMD20/40 Areas',
                description: 'Living in the 20% or 40% most deprived areas in Scotland (based on your postcode)',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Care Experience',
                description: 'Having been in care at any point in your life, including foster care, kinship care, or residential care',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
              {
                title: 'Young Carer',
                description: 'Providing unpaid care for a family member with a disability, illness, mental health condition, or addiction',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'First Generation',
                description: 'Being the first in your immediate family to attend university',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                title: 'Estranged Students',
                description: 'Having no family support or contact, studying independently',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
              },
              {
                title: 'Low-Progression Schools',
                description: 'Attending a school with historically low progression to higher education',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What is SIMD */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is SIMD?</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-gray-600 mb-4">
              SIMD stands for <strong>Scottish Index of Multiple Deprivation</strong>. It&apos;s the Scottish
              Government&apos;s official tool for identifying areas of deprivation, based on factors like:
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 mb-4">
              {['Income', 'Employment', 'Education', 'Health', 'Housing', 'Crime', 'Access to services'].map((factor) => (
                <li key={factor} className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {factor}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 mb-4">
              Scotland is divided into 6,976 small areas called &quot;datazones&quot;, each ranked from 1 (most deprived)
              to 6,976 (least deprived). These are grouped into deciles (10% bands).
            </p>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-purple-800 font-medium mb-2">Your SIMD decile:</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((decile) => (
                  <div
                    key={decile}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                      decile <= 2
                        ? 'bg-green-500 text-white'
                        : decile <= 4
                        ? 'bg-green-300 text-green-900'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {decile}
                  </div>
                ))}
              </div>
              <p className="text-sm text-purple-700 mt-2">
                Deciles 1-2 = SIMD20 (most deprived 20%) | Deciles 1-4 = SIMD40 (most deprived 40%)
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits of Widening Access</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Reduced Entry Requirements',
                description: 'Many universities offer lower grade requirements (typically 1-2 grades lower) for eligible students.',
              },
              {
                title: 'Guaranteed Interviews',
                description: 'Some programmes guarantee interviews or offers to students who meet minimum criteria.',
              },
              {
                title: 'Access Courses',
                description: 'Foundation years and access programmes designed to prepare you for degree study.',
              },
              {
                title: 'Financial Support',
                description: 'Additional bursaries and scholarships specifically for widening access students.',
              },
              {
                title: 'Mentoring & Support',
                description: 'Dedicated support services, peer mentoring, and transition programmes.',
              },
              {
                title: 'Summer Schools',
                description: 'Free summer schools to experience university life and boost your application.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Programmes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Programmes</h2>
          <div className="space-y-4">
            {[
              {
                name: 'SWAP (Scottish Wider Access Programme)',
                description: 'Provides access courses for mature students (over 21) who want to return to education. SWAP courses are free and can lead to guaranteed places at partner universities.',
                link: 'https://www.scottishwideraccess.org',
              },
              {
                name: 'REACH Programme (University of Edinburgh)',
                description: 'Supports S4-S6 students from under-represented backgrounds with mentoring, summer schools, and adjusted offers.',
                link: 'https://www.ed.ac.uk/studying/undergraduate/access-edinburgh/reach',
              },
              {
                name: 'LEAPS (Lothians Equal Access Programme for Schools)',
                description: 'Helps students in the Lothians area access higher education through school partnerships and support programmes.',
                link: 'https://www.leapsonline.org',
              },
              {
                name: 'FOCUS West',
                description: 'Partnership of universities and colleges in the West of Scotland supporting school pupils from SIMD20/40 areas.',
                link: 'https://www.focuswest.org.uk',
              },
              {
                name: 'Aspire North',
                description: 'Collaborative programme for schools in the North East of Scotland, run by University of Aberdeen and Robert Gordon University.',
                link: 'https://www.abdn.ac.uk/study/undergraduate/aspire-north.php',
              },
            ].map((programme) => (
              <div key={programme.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{programme.name}</h3>
                <p className="text-gray-600 mb-3">{programme.description}</p>
                <a
                  href={programme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Learn more
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Check Your Eligibility</h2>
          <p className="text-purple-100 mb-6 max-w-lg mx-auto">
            Create a free account to check your SIMD decile, see which programmes you qualify for,
            and discover courses with reduced entry requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="px-6 py-3 bg-white text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors"
            >
              Create free account
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse courses
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
