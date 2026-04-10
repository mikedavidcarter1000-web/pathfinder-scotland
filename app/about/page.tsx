import Link from 'next/link'

export const metadata = {
  title: 'About — Pathfinder Scotland',
  description: 'About Pathfinder Scotland, a free platform helping Scottish students plan their path to higher education.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <span className="text-gray-900">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">About Pathfinder Scotland</h1>
      <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
        <p>
          Pathfinder Scotland is a free platform that helps Scottish students navigate
          university applications — from choosing S3 subjects through to submitting a
          UCAS application.
        </p>
        <p>
          We focus on the Scottish education system: SQA qualifications, widening access
          programmes like SWAP and REACH, and SIMD-adjusted entry requirements. Everything
          is tailored to the pathways Scottish students actually take, not a generic
          UK-wide view.
        </p>
        <p>
          The platform is free for students. If you have feedback or want to get in touch,
          please use the <Link href="/help" className="text-blue-600 hover:text-blue-700">Help Centre</Link>.
        </p>
      </div>
    </div>
  )
}
