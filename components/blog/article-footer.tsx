'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BlogArticle } from '@/lib/blog-shared'

interface Props {
  article: BlogArticle
  next: BlogArticle | null
}

export function ArticleFooter({ article, next }: Props) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://pathfinder-scotland.vercel.app/blog/${article.slug}`
  const tweetText = encodeURIComponent(`${article.title} — Pathfinder Scotland`)
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(shareUrl)}`

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — silently ignore
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--pf-grey-100)',
        paddingTop: '48px',
        paddingBottom: '64px',
      }}
    >
      <div className="pf-container">
        <div style={{ maxWidth: '720px' }}>
          {/* Was this helpful */}
          <div
            className="pf-card-flat"
            style={{
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--pf-grey-900)',
                marginBottom: '12px',
              }}
            >
              Was this helpful?
            </h3>
            {feedback === null ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setFeedback('up')}
                  aria-label="Yes, this was helpful"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: 'var(--pf-white)',
                    border: '1px solid var(--pf-grey-300)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    minHeight: '44px',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Yes
                </button>
                <button
                  onClick={() => setFeedback('down')}
                  aria-label="No, this was not helpful"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: 'var(--pf-white)',
                    border: '1px solid var(--pf-grey-300)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--pf-grey-900)',
                    minHeight: '44px',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  No
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--pf-grey-600)', fontSize: '0.9375rem', margin: 0 }}>
                Thanks for the feedback.
              </p>
            )}
          </div>

          {/* Share */}
          <div
            className="pf-card-flat flex flex-wrap items-center justify-between gap-4"
            style={{ padding: '20px 24px', marginBottom: '32px' }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--pf-grey-900)',
              }}
            >
              Share this article
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--pf-white)',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-900)',
                  minHeight: '40px',
                }}
                aria-label="Copy link to article"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 no-underline hover:no-underline"
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--pf-white)',
                  border: '1px solid var(--pf-grey-300)',
                  borderRadius: '8px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: 'var(--pf-grey-900)',
                  minHeight: '40px',
                }}
                aria-label="Share on X / Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>
            </div>
          </div>

          {/* Read next */}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="pf-card-hover block no-underline hover:no-underline"
              style={{
                padding: '24px',
                borderTop: '4px solid var(--pf-blue-700)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  color: 'var(--pf-blue-700)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                Read next
              </span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: 'var(--pf-grey-900)',
                  marginBottom: '8px',
                  lineHeight: 1.3,
                }}
              >
                {next.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--pf-grey-600)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {next.description}
              </p>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
