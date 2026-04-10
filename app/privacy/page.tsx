import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Pathfinder Scotland',
  description: 'How Pathfinder Scotland collects, uses and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: 10 April 2026</p>

      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
        <p>
          Pathfinder Scotland takes your privacy seriously. This page is a placeholder
          summary — the full policy will be published before public launch.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">What we collect</h2>
        <p>
          We collect only the data you provide: name, email, school stage, postcode (for
          SIMD lookup), grades, and saved courses. We do not sell data or share it with
          third-party advertisers.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Your rights (UK GDPR)</h2>
        <p>
          You can export or delete all of your data from your account settings at any
          time. See our <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-700">settings page</Link>.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-6">Contact</h2>
        <p>
          Questions about privacy can be sent via our <Link href="/help" className="text-blue-600 hover:text-blue-700">Help Centre</Link>.
        </p>
      </div>
    </div>
  )
}
