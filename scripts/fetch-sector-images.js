// Fetches hero and card images for the 19 career sectors.
//
// Tries three sources in order, stopping on first success:
//   A) Wikimedia Commons search API (filtered for safe modern photos)
//   B) Unsplash search-page scrape (commercial use OK, no attribution required)
//   C) Pixabay  search-page scrape (commercial use OK, no attribution required)
//
// Each sector produces two WebP files in public/images/career-sectors/:
//   <slug>-hero.webp  (1200 x 400)
//   <slug>-card.webp  (640  x 360)
//
// Usage: node scripts/fetch-sector-images.js

const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'career-sectors')
const RESULT_FILE = path.join(__dirname, '..', 'docs', 'sector-images-fetch-result.json')

const REQUEST_TIMEOUT_MS = 10_000
const POLITE_DELAY_MS = 500
const MIN_WIDTH = 1000
const USER_AGENT =
  'PathfinderScotland/1.0 (https://pathfinderscot.co.uk; contact@pathfinderscot.co.uk) sector-image-fetcher'

const BAD_FILENAME_RE = /(coat|arms|logo|seal|badge|wellcome|engraving|lithograph|woodcut|sketch|drawing|painting|illustration|diagram|map|chart|page_\d+|\.webm)/i
const BAD_EXT_RE = /\.(svg|pdf|tif|tiff)$/i
// Reject obviously historical filenames: any 4-digit year 1500-1969 in the
// title (e.g. "...(1916)..." or "...1947 in her laboratory..."). 1970+ is
// allowed because that catches modern colour-photography era.
const HISTORICAL_YEAR_RE = /(?:^|[^0-9])(1[5-9][0-9]{2}|19[0-6][0-9])(?:[^0-9]|$)/

const SECTORS = [
  { id: '8e706fbe-1f19-4156-80a1-631faf1c211c', name: 'Healthcare & Medicine',           slug: 'healthcare-medicine',          q: 'hospital ward nurse' },
  { id: 'd5dedc2d-1b24-433f-a962-df70f0ebeb97', name: 'Engineering & Manufacturing',     slug: 'engineering-manufacturing',    q: 'mechanical engineer factory' },
  { id: 'aec5b7f6-b5a2-4bc3-92f8-3a3b13d2b991', name: 'Computing & Digital Technology',  slug: 'computing-digital-technology', q: 'software developer computer programming' },
  { id: '510bc0b4-0b71-44f4-8ca0-f8680fd49a56', name: 'Science & Research',              slug: 'science-research',             q: 'scientist laboratory microscope' },
  { id: '0862ec29-22ae-460e-a045-1d3bf0794e89', name: 'Law & Justice',                   slug: 'law-justice',                  q: 'courtroom barrister law court' },
  { id: 'fa8a16a4-127a-4830-8bfc-f80e3880a376', name: 'Education & Teaching',            slug: 'education-teaching',           q: 'teacher classroom whiteboard' },
  { id: '13a2285b-3e6b-4e24-9129-5dcf652d8d89', name: 'Business & Finance',              slug: 'business-finance',             q: 'business office meeting finance' },
  { id: 'a7814001-4ed2-4488-9a8f-36c35273c747', name: 'Creative Arts & Design',          slug: 'creative-arts-design',         q: 'graphic designer artist studio' },
  { id: '21db3f18-165c-4445-81fa-6c04058b7a8e', name: 'Media & Communications',          slug: 'media-communications',         q: 'journalist newsroom broadcast' },
  { id: '79a0b9b2-5a56-487f-91d9-f0f34c65103d', name: 'Social Work & Community',         slug: 'social-work-community',        q: 'social worker community care' },
  { id: '921f0029-cd39-43c2-acfc-1f22b376420b', name: 'Sport & Fitness',                 slug: 'sport-fitness',                q: 'personal trainer gym fitness' },
  { id: 'c263fef0-a0b2-408c-b349-2a4e787fd09f', name: 'Hospitality & Tourism',           slug: 'hospitality-tourism',          q: 'hotel chef hospitality kitchen' },
  { id: '5d65f7b5-4f66-4c64-aaac-18ff258866c9', name: 'Construction & Trades',           slug: 'construction-trades',          q: 'construction worker building site hard hat' },
  { id: 'a0f982aa-766b-4483-8b7d-63dd538c5575', name: 'Public Services & Government',    slug: 'public-services-government',   q: 'firefighter paramedic emergency services' },
  { id: 'bc0f3119-e8d4-4226-8035-fd11ba01cae1', name: 'Agriculture & Environment',       slug: 'agriculture-environment',      q: 'farmer agriculture tractor field' },
  { id: 'd15e7308-51f0-4210-ac5f-9655d8cf2f2f', name: 'Performing Arts & Entertainment', slug: 'performing-arts-entertainment',q: 'theatre stage performance actor' },
  { id: '1bd743a3-24c8-4960-b259-8f535aef86c5', name: 'Retail & Customer Service',       slug: 'retail-customer-service',      q: 'retail shop store assistant' },
  { id: 'bfedf558-8f23-4063-822b-ef35db3b58cb', name: 'Transport & Logistics',           slug: 'transport-logistics',          q: 'lorry driver logistics warehouse' },
  { id: '80c3a8db-fd9c-42ec-a717-3df66dff0a4c', name: 'Armed Forces',                    slug: 'armed-forces',                 q: 'military training soldiers' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function timedFetch(url, opts = {}) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(url, {
    ...opts,
    signal: controller.signal,
    headers: { 'User-Agent': USER_AGENT, ...(opts.headers || {}) },
  }).finally(() => clearTimeout(t))
}

async function fetchBuffer(url) {
  const res = await timedFetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

// --- Source A: Wikimedia Commons -----------------------------------------

async function searchCommonsCandidates(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=20&format=json`
  const res = await timedFetch(url)
  if (!res.ok) return []
  const body = await res.json()
  const hits = body?.query?.search || []
  return hits
    .map((h) => h.title) // 'File:Foo.jpg'
    .filter((title) => !BAD_EXT_RE.test(title))
    .filter((title) => !BAD_FILENAME_RE.test(title))
    .filter((title) => !HISTORICAL_YEAR_RE.test(title))
}

async function getCommonsImageInfo(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1600&format=json`
  const res = await timedFetch(url)
  if (!res.ok) return null
  const body = await res.json()
  const pages = body?.query?.pages
  if (!pages) return null
  const firstKey = Object.keys(pages)[0]
  const ii = pages[firstKey]?.imageinfo?.[0]
  if (!ii) return null
  // Prefer thumb if available, fall back to original.
  const url2 = ii.thumburl || ii.url
  if (!url2) return null
  if (BAD_EXT_RE.test(url2)) return null
  const w = ii.thumbwidth || ii.width
  const h = ii.thumbheight || ii.height
  return { url: url2, width: w, height: h, mime: ii.mime }
}

async function tryCommons(query) {
  const titles = await searchCommonsCandidates(query)
  for (const title of titles) {
    await sleep(POLITE_DELAY_MS)
    const info = await getCommonsImageInfo(title)
    if (!info) continue
    // Want landscape, >= MIN_WIDTH, raster image.
    if (!info.width || !info.height) continue
    if (info.width < MIN_WIDTH) continue
    if (info.width <= info.height) continue
    if (info.mime && info.mime.startsWith('image/svg')) continue
    try {
      const buf = await fetchBuffer(info.url)
      return { source: 'Commons', buffer: buf, sourceUrl: info.url }
    } catch (err) {
      console.warn(`  [commons] download failed: ${err.message}`)
      continue
    }
  }
  return null
}

// --- Source B: Unsplash search page scrape -------------------------------

async function tryUnsplash(query) {
  try {
    const pageUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query.replace(/ /g, '-'))}`
    const res = await timedFetch(pageUrl)
    if (!res.ok) return null
    const html = await res.text()
    // Find images.unsplash.com/photo-... URLs in the HTML.
    const re = /https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9_-]+/g
    const seen = new Set()
    const ids = []
    let m
    while ((m = re.exec(html)) !== null) {
      if (seen.has(m[0])) continue
      seen.add(m[0])
      ids.push(m[0])
      if (ids.length >= 6) break
    }
    for (const baseUrl of ids) {
      const requestUrl = `${baseUrl}?w=1600&fit=crop&auto=format&q=80`
      try {
        const buf = await fetchBuffer(requestUrl)
        // Validate dimensions via sharp metadata (landscape, wide enough).
        const meta = await sharp(buf).metadata()
        if (!meta.width || !meta.height) continue
        if (meta.width < MIN_WIDTH) continue
        if (meta.width <= meta.height) continue
        return { source: 'Unsplash', buffer: buf, sourceUrl: requestUrl }
      } catch (err) {
        console.warn(`  [unsplash] candidate failed: ${err.message}`)
        continue
      }
    }
    return null
  } catch (err) {
    console.warn(`  [unsplash] ${err.message}`)
    return null
  }
}

// --- Source C: Pixabay search page scrape --------------------------------

async function tryPixabay(query) {
  try {
    const pageUrl = `https://pixabay.com/images/search/${encodeURIComponent(query.replace(/ /g, '%20'))}/`
    const res = await timedFetch(pageUrl)
    if (!res.ok) return null
    const html = await res.text()
    // Pixabay serves images at cdn.pixabay.com/photo/.../*.jpg
    const re = /https:\/\/cdn\.pixabay\.com\/photo\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[0-9]{2}\/[A-Za-z0-9_-]+\.(jpg|jpeg|png)/g
    const seen = new Set()
    const candidates = []
    let m
    while ((m = re.exec(html)) !== null) {
      if (seen.has(m[0])) continue
      seen.add(m[0])
      candidates.push(m[0])
      if (candidates.length >= 8) break
    }
    for (const url of candidates) {
      // Pixabay URLs end in _150.jpg / _640.jpg / _960.jpg / _1280.jpg.
      // Force the largest available variant (_1280) for hero use.
      const upgraded = url.replace(/_(\d+)(\.(?:jpg|jpeg|png))$/, '_1280$2')
      try {
        const buf = await fetchBuffer(upgraded)
        const meta = await sharp(buf).metadata()
        if (!meta.width || !meta.height) continue
        if (meta.width < MIN_WIDTH) continue
        if (meta.width <= meta.height) continue
        return { source: 'Pixabay', buffer: buf, sourceUrl: upgraded }
      } catch (err) {
        console.warn(`  [pixabay] candidate failed: ${err.message}`)
        continue
      }
    }
    return null
  } catch (err) {
    console.warn(`  [pixabay] ${err.message}`)
    return null
  }
}

// --- Output ---------------------------------------------------------------

async function writeWebp(buffer, outPath, width, height) {
  await sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(outPath)
}

async function processSector(sector) {
  console.log(`\n[${sector.name}] (${sector.slug}) -- search: "${sector.q}"`)

  let result = null
  if (!process.env.SKIP_COMMONS) {
    try {
      result = await tryCommons(sector.q)
      if (result) console.log(`  -> Commons hit: ${result.sourceUrl}`)
    } catch (err) {
      console.warn(`  [commons] error: ${err.message}`)
    }
  }

  if (!result) {
    await sleep(POLITE_DELAY_MS)
    try {
      result = await tryUnsplash(sector.q)
      if (result) console.log(`  -> Unsplash hit: ${result.sourceUrl}`)
    } catch (err) {
      console.warn(`  [unsplash] error: ${err.message}`)
    }
  }

  if (!result) {
    await sleep(POLITE_DELAY_MS)
    try {
      result = await tryPixabay(sector.q)
      if (result) console.log(`  -> Pixabay hit: ${result.sourceUrl}`)
    } catch (err) {
      console.warn(`  [pixabay] error: ${err.message}`)
    }
  }

  if (!result) {
    console.log(`  -> FAILED (all three sources)`)
    return {
      slug: sector.slug,
      name: sector.name,
      source: 'FAILED',
      heroFile: null,
      cardFile: null,
      status: 'failed',
    }
  }

  const heroPath = path.join(OUT_DIR, `${sector.slug}-hero.webp`)
  const cardPath = path.join(OUT_DIR, `${sector.slug}-card.webp`)
  try {
    await writeWebp(result.buffer, heroPath, 1200, 400)
    await writeWebp(result.buffer, cardPath, 640, 360)
    return {
      slug: sector.slug,
      name: sector.name,
      source: result.source,
      heroFile: path.basename(heroPath),
      cardFile: path.basename(cardPath),
      status: 'ok',
      sourceUrl: result.sourceUrl,
    }
  } catch (err) {
    console.warn(`  [sharp] failed: ${err.message}`)
    return {
      slug: sector.slug,
      name: sector.name,
      source: result.source,
      heroFile: null,
      cardFile: null,
      status: 'sharp-failed',
    }
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  // Optional: pass slugs as argv to limit which sectors are processed.
  const slugFilter = process.argv.slice(2)
  const list = slugFilter.length
    ? SECTORS.filter((s) => slugFilter.includes(s.slug))
    : SECTORS

  const results = []
  for (const sector of list) {
    const r = await processSector(sector)
    results.push(r)
    await sleep(POLITE_DELAY_MS)
  }

  console.log('\n===== Summary table =====')
  const lines = [
    ['Sector', 'Source', 'Hero file', 'Status'].join(' | '),
    ['------', '------', '---------', '------'].join(' | '),
  ]
  for (const r of results) {
    lines.push([r.name, r.source, r.heroFile || '-', r.status].join(' | '))
  }
  console.log(lines.join('\n'))

  const failed = results.filter((r) => r.status !== 'ok')
  console.log(`\nOK: ${results.length - failed.length} / ${results.length}`)
  if (failed.length) {
    console.log('Failures:')
    for (const f of failed) console.log(`  - ${f.name} (${f.status})`)
  }

  await fs.writeFile(RESULT_FILE, JSON.stringify(results, null, 2))
  console.log(`\nWrote ${RESULT_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
