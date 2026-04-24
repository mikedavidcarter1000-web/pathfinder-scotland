'use client'

import { useState, useMemo } from 'react'

// Type must match LanguageBlock in app/parent/welcome/page.tsx
type LanguageBlock = {
  languageName: string
  languageNameNative: string
  bcp47: string
  dir: 'ltr' | 'rtl'
  fontFamily?: string
  text: string
  flag?: string
  needs_verification: true
}

const GROUPS: { title: string; codes: string[] }[] = [
  { title: 'Languages of Scotland', codes: ['gd', 'sco'] },
  {
    title: 'European community languages',
    codes: ['pl', 'ro', 'lt', 'it', 'es', 'fr', 'pt', 'lv', 'bg', 'cs', 'sk', 'ru', 'uk', 'hu'],
  },
  { title: 'South Asian community languages', codes: ['ur', 'pa', 'pnb', 'bn', 'hi'] },
  { title: 'East Asian languages', codes: ['zh-Hans', 'zh-Hant'] },
  {
    title: 'Middle Eastern and African languages',
    codes: ['ar', 'ckb', 'fa', 'tr', 'so', 'ti', 'am'],
  },
]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--pf-grey-600)',
        borderBottom: '1px solid var(--pf-grey-200)',
        paddingBottom: '6px',
        marginTop: '32px',
        marginBottom: '12px',
      }}
    >
      {children}
    </h2>
  )
}

function BlockText({ block }: { block: LanguageBlock }) {
  return (
    <p
      lang={block.bcp47}
      dir={block.dir}
      style={{
        lineHeight: 1.7,
        fontFamily: block.fontFamily,
        textAlign: block.dir === 'rtl' ? 'right' : 'left',
        margin: 0,
        fontSize: '0.9375rem',
      }}
    >
      {block.text}
    </p>
  )
}

function SummaryContent({ block }: { block: LanguageBlock }) {
  return (
    <>
      {block.flag && (
        <span aria-hidden="true" style={{ fontSize: '1.2rem', marginRight: '6px' }}>
          {block.flag}
        </span>
      )}
      <span lang={block.bcp47} style={{ fontFamily: block.fontFamily }}>
        {block.languageNameNative}
      </span>
      <span
        style={{
          color: 'var(--pf-grey-500)',
          fontWeight: 400,
          fontSize: '0.875rem',
          marginLeft: '8px',
        }}
      >
        — {block.languageName}
      </span>
    </>
  )
}

export function LanguageBlocks({ blocks }: { blocks: LanguageBlock[] }) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLowerCase()

  const filtered = useMemo(
    () =>
      query
        ? blocks.filter(
            (b) =>
              b.languageName.toLowerCase().includes(query) ||
              b.languageNameNative.toLowerCase().includes(query)
          )
        : null,
    [query, blocks]
  )

  return (
    <div>
      {/* Search / filter */}
      <div style={{ marginBottom: '28px' }}>
        <label
          htmlFor="lang-search"
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '6px',
            color: 'var(--pf-grey-700)',
          }}
        >
          Find your language / Lorg do chànan
        </label>
        <input
          id="lang-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="e.g. Polski, Arabic, Français..."
          className="pf-input"
          style={{ maxWidth: '400px' }}
          aria-controls="lang-list"
        />
      </div>

      <div id="lang-list">
        {filtered !== null ? (
          // Search results: render expanded (no accordion wrapper)
          filtered.length === 0 ? (
            <p style={{ color: 'var(--pf-grey-500)', fontSize: '0.9375rem' }}>
              No languages found matching &quot;{search}&quot;. Try searching in your own
              language.
            </p>
          ) : (
            <div>
              {filtered.map((block) => (
                <div
                  key={block.bcp47 + block.languageName}
                  id={`lang-${block.bcp47}-${slugify(block.languageName)}`}
                  style={{
                    marginBottom: '24px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid var(--pf-grey-100)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      marginBottom: '10px',
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <SummaryContent block={block} />
                  </div>
                  <BlockText block={block} />
                </div>
              ))}
            </div>
          )
        ) : (
          // Default: grouped, collapsible accordions
          GROUPS.map((group) => {
            const groupBlocks = blocks.filter((b) => group.codes.includes(b.bcp47))
            if (groupBlocks.length === 0) return null
            return (
              <div key={group.title}>
                <GroupHeading>{group.title}</GroupHeading>
                {groupBlocks.map((block) => (
                  <details
                    key={block.bcp47 + block.languageName}
                    id={`lang-${block.bcp47}-${slugify(block.languageName)}`}
                    style={{ borderBottom: '1px solid var(--pf-grey-100)' }}
                  >
                    <summary
                      style={{
                        cursor: 'pointer',
                        padding: '10px 2px',
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: 'var(--pf-grey-900)',
                      }}
                    >
                      <SummaryContent block={block} />
                    </summary>
                    <div style={{ padding: '4px 4px 16px 4px' }}>
                      <BlockText block={block} />
                    </div>
                  </details>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
