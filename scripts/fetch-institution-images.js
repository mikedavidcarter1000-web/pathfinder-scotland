// Fetches campus images for Scottish universities and colleges.
//
// Two sources per institution:
//   A) Institution website OG image (og:image meta tag)
//   B) Wikipedia page image (pageimages API, original.source)
//
// Each institution produces two WebP files in public/images/institutions/<type>/:
//   <slug>-card.webp  (640 x 400)
//   <slug>-hero.webp  (1200 x 400)
//
// Image assignment:
//   - both sources found -> OG for card, Wikipedia for hero
//   - only one source   -> use it for both
//   - neither           -> logged as MISSING
//
// Usage: node scripts/fetch-institution-images.js

const fs = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')

const DATA_FILE = path.join(__dirname, '..', 'docs', 'institution-images-data.json')
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'images', 'institutions')
const UNI_DIR = path.join(PUBLIC_DIR, 'universities')
const COL_DIR = path.join(PUBLIC_DIR, 'colleges')

const REQUEST_TIMEOUT_MS = 10_000
const USER_AGENT =
  'PathfinderScotland/1.0 (pathfinderscot.co.uk) campus-image-fetcher'

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

function absolutiseUrl(rawUrl, baseUrl) {
  if (!rawUrl) return null
  try {
    return new URL(rawUrl, baseUrl).toString()
  } catch {
    return null
  }
}

async function fetchOgImage(websiteUrl) {
  try {
    const res = await timedFetch(websiteUrl, { redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    // Find all meta tags with property/name og:image (og:image, og:image:url, twitter:image)
    const metaRe = /<meta\b[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?content\s*=\s*["']([^"']+)["'][^>]*>/gi
    const altRe  = /<meta\b[^>]*?content\s*=\s*["']([^"']+)["'][^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*>/gi
    const candidates = []
    for (const re of [metaRe, altRe]) {
      let m
      while ((m = re.exec(html)) !== null) {
        let key, val
        if (re === metaRe) { key = m[1].toLowerCase(); val = m[2] }
        else               { key = m[2].toLowerCase(); val = m[1] }
        if (key === 'og:image' || key === 'og:image:url' || key === 'og:image:secure_url') {
          candidates.unshift(val) // prefer og:image
        } else if (key === 'twitter:image' || key === 'twitter:image:src') {
          candidates.push(val)
        }
      }
    }
    if (candidates.length === 0) return null
    const imgUrl = absolutiseUrl(candidates[0], websiteUrl)
    if (!imgUrl) return null
    return await fetchBuffer(imgUrl)
  } catch (err) {
    console.warn(`  [og] failed: ${err.message}`)
    return null
  }
}

async function fetchWikipediaImage(articleName) {
  if (!articleName) return null
  try {
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${articleName}&prop=pageimages&piprop=original&format=json&redirects=1`
    const res = await timedFetch(apiUrl)
    if (!res.ok) return null
    const body = await res.json()
    const pages = body?.query?.pages
    if (!pages) return null
    const firstKey = Object.keys(pages)[0]
    const original = pages[firstKey]?.original?.source
    if (!original) return null
    return await fetchBuffer(original)
  } catch (err) {
    console.warn(`  [wiki] failed: ${err.message}`)
    return null
  }
}

async function writeWebp(buffer, outPath, width, height) {
  await sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(outPath)
}

async function processInstitution(inst, typeDir, kind) {
  console.log(`\n[${kind}] ${inst.name} (${inst.slug})`)
  const [ogBuf, wikiBuf] = await Promise.all([
    fetchOgImage(inst.website),
    fetchWikipediaImage(inst.wikipedia),
  ])

  const cardPath = path.join(typeDir, `${inst.slug}-card.webp`)
  const heroPath = path.join(typeDir, `${inst.slug}-hero.webp`)

  // Decide which buffer feeds which output.
  // both -> OG for card, Wikipedia for hero
  // one  -> that one for both
  // none -> MISSING
  let cardBuf = null
  let heroBuf = null
  let status = 'MISSING'
  if (ogBuf && wikiBuf) {
    cardBuf = ogBuf
    heroBuf = wikiBuf
    status = 'both'
  } else if (ogBuf) {
    cardBuf = ogBuf
    heroBuf = ogBuf
    status = 'og-only'
  } else if (wikiBuf) {
    cardBuf = wikiBuf
    heroBuf = wikiBuf
    status = 'wiki-only'
  }

  if (!cardBuf || !heroBuf) {
    console.log(`  -> MISSING (no OG image and no Wikipedia image)`)
    return { slug: inst.slug, name: inst.name, kind, status }
  }

  try {
    await writeWebp(cardBuf, cardPath, 640, 400)
    await writeWebp(heroBuf, heroPath, 1200, 400)
    console.log(`  -> OK (${status}): ${path.basename(cardPath)}, ${path.basename(heroPath)}`)
    return { slug: inst.slug, name: inst.name, kind, status }
  } catch (err) {
    console.warn(`  [sharp] failed: ${err.message}`)
    return { slug: inst.slug, name: inst.name, kind, status: 'sharp-failed' }
  }
}

async function main() {
  const raw = await fs.readFile(DATA_FILE, 'utf8')
  const data = JSON.parse(raw)

  await fs.mkdir(UNI_DIR, { recursive: true })
  await fs.mkdir(COL_DIR, { recursive: true })

  const results = []

  for (const u of data.universities) {
    const r = await processInstitution(u, UNI_DIR, 'university')
    results.push(r)
  }
  for (const c of data.colleges) {
    const r = await processInstitution(c, COL_DIR, 'college')
    results.push(r)
  }

  console.log('\n===== Summary =====')
  const both = results.filter((r) => r.status === 'both')
  const ogOnly = results.filter((r) => r.status === 'og-only')
  const wikiOnly = results.filter((r) => r.status === 'wiki-only')
  const missing = results.filter((r) => r.status === 'MISSING' || r.status === 'sharp-failed')
  console.log(`Both sources : ${both.length}`)
  console.log(`OG only      : ${ogOnly.length}`)
  console.log(`Wikipedia    : ${wikiOnly.length}`)
  console.log(`Missing      : ${missing.length}`)

  if (missing.length > 0) {
    console.log('\nMISSING (manual resolution needed):')
    for (const m of missing) console.log(`  - [${m.kind}] ${m.name} (${m.slug})`)
  }

  // Drop a machine-readable result too
  const resultFile = path.join(__dirname, '..', 'docs', 'institution-images-fetch-result.json')
  await fs.writeFile(resultFile, JSON.stringify(results, null, 2))
  console.log(`\nWrote ${resultFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
