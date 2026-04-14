'use client'

import { useOAuthSignIn, type OAuthProvider } from '@/hooks/use-auth'

interface SocialLoginButtonsProps {
  redirectTo?: string
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export function SocialLoginButtons({ redirectTo }: SocialLoginButtonsProps) {
  const oauthSignIn = useOAuthSignIn()

  const handleGoogleLogin = () => {
    oauthSignIn.mutate({ provider: 'google' as OAuthProvider, redirectTo })
  }

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={oauthSignIn.isPending}
      className="w-full flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
      style={{
        minHeight: '44px',
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid var(--pf-grey-300)',
        backgroundColor: 'var(--pf-white)',
        color: 'var(--pf-grey-900)',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 500,
        fontSize: '0.9375rem',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-blue-50)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--pf-white)')}
    >
      <GoogleIcon />
      Sign in with Google
    </button>
  )
}

export function SocialLoginDivider() {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full" style={{ borderTop: '1px solid var(--pf-grey-300)' }} />
      </div>
      <div className="relative flex justify-center" style={{ fontSize: '0.875rem' }}>
        <span
          style={{
            padding: '0 16px',
            backgroundColor: 'var(--pf-white)',
            color: 'var(--pf-grey-600)',
          }}
        >
          or continue with email
        </span>
      </div>
    </div>
  )
}
