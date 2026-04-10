import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Pathfinder Scotland',
  description: 'Terms and conditions for using Pathfinder Scotland.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Terms of Service</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: 10 April 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
        <p>
          This is a placeholder summary — the full terms will be published before public
          launch.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Using Pathfinder</h2>
        <p>
          Pathfinder Scotland is a free research and planning tool. Course data, entry
          requirements and widening access information are offered for guidance only.
          Always confirm the current requirements on the university&apos;s official website
          before applying.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Your account</h2>
        <p>
          You are responsible for keeping your account credentials secure. You can delete
          your account and all associated data at any time from your settings page.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Content ownership</h2>
        <p>
          The Pathfinder Scotland name, logo and platform are the property of Pathfinder
          Scotland. Course information is sourced from publicly available data published
          by SQA, UCAS and Scottish universities.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
        <p>
          Questions about these terms can be sent via our <Link href="/help" className="text-blue-600 hover:text-blue-700">Help Centre</Link>.
        </p>
      </div>
    </div>
  )
}
