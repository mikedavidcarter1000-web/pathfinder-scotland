/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Resend tracking pixels and Vercel Analytics use inline scripts.
              // 'unsafe-inline' is kept because Next.js' runtime still emits inline bootstrap scripts.
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.vercel-insights.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              // Supabase auth uses websockets; Resend posts to their API from the reminders send cron.
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.resend.com https://*.vercel-insights.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "form-action 'self' https://checkout.stripe.com",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/auth/sign-up',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/sign-up',
        permanent: true,
      },
      {
        source: '/cost-calculator',
        destination: '/tools/roi-calculator',
        permanent: true,
      },
      {
        source: '/tools/cost-calculator',
        destination: '/tools/roi-calculator',
        permanent: true,
      },
      {
        source: '/grades',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/explore',
        destination: '/discover',
        permanent: true,
      },
      {
        source: '/plan',
        destination: '/pathways',
        permanent: true,
      },
      {
        source: '/tools/career-quiz',
        destination: '/quiz',
        permanent: true,
      },
      {
        source: '/grade-sensitivity',
        destination: '/tools/grade-sensitivity',
        permanent: true,
      },
      {
        source: '/support/estranged',
        destination: '/support/estranged-students',
        permanent: true,
      },
      {
        source: '/support/mature',
        destination: '/support/mature-students',
        permanent: true,
      },
      {
        source: '/support/refugees',
        destination: '/support/refugees-asylum-seekers',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
