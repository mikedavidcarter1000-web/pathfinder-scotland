'use client'

import Script from 'next/script'
import { useEffect } from 'react'

// The Google Translate widget is only loaded on pages that render this
// component -- parent dashboard and parent welcome. Do NOT mount this
// anywhere else on the site.

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            autoDisplay: false,
          },
          'google_translate_element'
        )
      }
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: '16px',
        fontSize: '0.8125rem',
        color: 'var(--pf-grey-600)',
      }}
    >
      <div id="google_translate_element" aria-label="Translate this page" />
      <p
        style={{
          marginTop: '6px',
          marginBottom: 0,
          maxWidth: '360px',
          textAlign: 'right',
          fontStyle: 'italic',
          lineHeight: 1.4,
        }}
      >
        This translation is automatic and may not be accurate for Scottish education
        terms such as Highers, UCAS or SAAS.
      </p>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </div>
  )
}
