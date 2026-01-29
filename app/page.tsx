import Link from 'next/link'
import { Footer } from '@/components/layout/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Pathfinder</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900 font-medium">
              Courses
            </Link>
            <Link href="/universities" className="text-gray-600 hover:text-gray-900 font-medium">
              Universities
            </Link>
            <Link href="/auth/sign-in" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Path to
            <span className="block text-blue-200">Scottish Universities</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover courses, check your eligibility, and plan your journey to higher education.
            Designed for Scottish students from S3 to S6 and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Start exploring free
            </Link>
            <Link
              href="/courses"
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-lg"
            >
              Browse courses
            </Link>
          </div>
          <p className="mt-6 text-blue-200 text-sm">
            15 universities · Thousands of courses · Completely free
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to plan your future
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From discovering courses to checking entry requirements, Pathfinder helps you
              every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Discover Courses',
                description: 'Search thousands of courses across all 15 Scottish universities. Filter by subject, entry requirements, or location.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Check Eligibility',
                description: 'Enter your grades and instantly see which courses you qualify for. We factor in widening access schemes too.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
                title: 'Build Your Shortlist',
                description: 'Save courses, add notes, and prioritise your choices. Export your list when you are ready to apply through UCAS.',
              },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widening Access Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full mb-4">
                Widening Access
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Lower entry requirements could be available to you
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                If you live in an SIMD20 or SIMD40 area, have care experience, are a young carer,
                or are first in your family to attend university, you may qualify for reduced
                entry requirements at many Scottish universities.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  'Automatic SIMD lookup from your postcode',
                  'See adjusted offers based on your circumstances',
                  'Learn about access programmes like SWAP and REACH',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/widening-access"
                className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
              >
                Learn more about widening access
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="font-semibold text-gray-900 mb-4">Example: Computer Science at Edinburgh</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Standard offer</span>
                  <span className="font-semibold text-gray-900">AAAA</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">SIMD40 offer</span>
                  <span className="font-semibold text-green-600">AAAB</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">SIMD20 offer</span>
                  <span className="font-semibold text-green-600">AABB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Care experienced</span>
                  <span className="font-semibold text-green-600">AABB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All 15 Scottish Universities
            </h2>
            <p className="text-xl text-gray-600">
              From ancient institutions to modern universities, explore them all.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
            {[
              'Edinburgh', 'Glasgow', 'St Andrews', 'Aberdeen', 'Dundee',
              'Strathclyde', 'Heriot-Watt', 'Stirling', 'GCU', 'Napier',
              'RGU', 'UWS', 'QMU', 'UHI', 'RCS'
            ].map((uni) => (
              <div
                key={uni}
                className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-gray-400">{uni.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{uni}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View all universities
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your path?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Create your free account and start exploring courses in minutes.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Get started for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
