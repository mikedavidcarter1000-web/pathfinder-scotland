// Refetches campus photos for 14 institutions where Phase 1 (commit 8513c83)
// landed on the Wikipedia lead image -- which for most Scottish universities
// and several colleges is an SVG coat-of-arms rather than a building photo.
//
// Priority chain per institution:
//   1. Wikimedia Commons category (best: curated building photos, CC-licensed)
//   2. Wikipedia article images (prop=images)
//   3. Institution website og:image meta tag
//
// Filters applied at every stage:
//   - SKIP any filename matching /coat|arms|crest|logo|seal|badge|flag|banner/i
//   - SKIP any .svg file
//   - PREFER filenames containing /building|campus|tower|entrance|main|exterior|hall|quad|college/i
//   - PREFER images wider or taller than 1000 px when imageinfo is available
//
// Outputs per institution (overwrites existing):
//   public/images/institutions/<type>/<slug>-card.webp  (640 x 400)
//   public/images/institutions/<type>/<slug>-hero.webp  (1200 x 400)
//
// When two distinct images are selected, card gets image 1 and hero gets
// image 2 so the detail page doesn't look like a stretched repeat of the
// card. When only one qualifies, the same source feeds both sizes.
//
// Also updates card_image_url / hero_image_url for each row (via Supabase
// service-role client). The paths are convention-based so the URL columns
// don't actually change for the 9 universities (same slugs; files
// overwritten in place); they change from NULL to populated for the 5
// colleges that had no image at all.
//
// Usage: node scripts/fix-institution-images.js

const fs = require('node:fs')
const fsp = require('node:fs/promises')
const path = require('node:path')
const sharp = require('sharp')
const { createClient } = require('@supabase/supabase-js')

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'images', 'institutions')
const REQUEST_TIMEOUT_MS = 10_000
// Wikimedia robot policy requires a contact URL / email in parentheses:
// https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy
const USER_AGENT =
  'PathfinderScotland/1.0 (https://pathfinderscot.co.uk; mike.david.carter1000@gmail.com) node-fetch'

const POLITE_DELAY_MS = 300

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

const SKIP_RE = /\b(coat|arms|crest|logo|seal|badge|flag|banner|paterson|engraving|wellcome|order|listed[ _-]bodies|statutory|ordinance|ceremony|coat_of_arms|mackintosh_rose|logo)\b/i
// Only accept genuinely photographic raster formats; PDFs and TIFFs are
// usually historical documents or government papers indexed against the
// institution's name.
const ACCEPT_EXT_RE = /\.(jpe?g|png|webp)$/i
const PREFER_RE = /\b(building|campus|tower|entrance|main|exterior|hall|quad|college|library|aerial|fa[cç]ade|facade|view)\b/i
// Historical engraving / old black-and-white bias: any year 1800-1969 in the
// filename is treated as "probably not a contemporary photo". (Geograph.org.uk
// IDs are 7-digit numbers without leading 1800/1900, so this is safe.)
const OLD_YEAR_RE = /\b1[89]\d\d\b|\b19[0-6]\d\b/

const TARGETS = [
  // 9 universities where the Phase 1 result was a coat-of-arms render.
  {
    id: '09a13240-bb0a-41df-ab61-81465cfa39f1',
    name: 'University of Glasgow',
    slug: 'glasgow',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'Main_building_of_the_University_of_Glasgow',
      'University_of_Glasgow',
    ],
    wikipediaArticle: 'University_of_Glasgow',
    website: 'https://www.gla.ac.uk',
  },
  {
    id: 'b46b546a-6283-4a50-9960-f3daa88deae1',
    name: 'University of St Andrews',
    slug: 'st-andrews',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      "St_Salvator's_Quad,_St_Andrews",
      'Buildings_of_the_University_of_St_Andrews',
      'University_of_St_Andrews',
    ],
    wikipediaArticle: 'University_of_St_Andrews',
    website: 'https://www.st-andrews.ac.uk',
  },
  {
    id: '02362909-4ff2-41d5-99a9-9f179f57c8b8',
    name: 'University of Dundee',
    slug: 'dundee',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'Tower_Building,_University_of_Dundee',
      'University_of_Dundee',
    ],
    wikipediaArticle: 'University_of_Dundee',
    website: 'https://www.dundee.ac.uk',
  },
  {
    id: 'a9c693ec-bc56-44ef-9c52-e26ca447f6ee',
    name: 'University of Stirling',
    slug: 'stirling',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [],
    commonsSearch: [
      '"University of Stirling campus" geograph',
      'University of Stirling geograph colour',
    ],
    wikipediaArticle: 'University_of_Stirling',
    website: 'https://www.stir.ac.uk',
  },
  {
    id: '429f13e5-4500-4b90-9690-c89765632653',
    name: 'University of Strathclyde',
    slug: 'strathclyde',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'University_of_Strathclyde',
      'Royal_College_Building',
    ],
    wikipediaArticle: 'University_of_Strathclyde',
    website: 'https://www.strath.ac.uk',
  },
  {
    id: 'c303cfbb-d936-40d8-aa10-e8308b9871de',
    name: 'Heriot-Watt University',
    slug: 'heriot-watt',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'Heriot-Watt_University',
      'Riccarton_Campus',
    ],
    wikipediaArticle: 'Heriot-Watt_University',
    website: 'https://www.hw.ac.uk',
  },
  {
    id: '30b5a864-7750-4fe8-ab17-153b37e70100',
    name: 'Robert Gordon University',
    slug: 'robert-gordon',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'Robert_Gordon_University',
      'Garthdee',
    ],
    wikipediaArticle: 'Robert_Gordon_University',
    website: 'https://www.rgu.ac.uk',
  },
  {
    id: '8f039a85-07be-4b42-b631-130ffe3c038e',
    name: 'University of the West of Scotland',
    slug: 'uws',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: [
      'University_of_the_West_of_Scotland',
      'University_of_Paisley',
    ],
    wikipediaArticle: 'University_of_the_West_of_Scotland',
    website: 'https://www.uws.ac.uk',
  },
  {
    id: '7d24935a-6e6b-4e50-941c-7d89b1e019be',
    name: 'Glasgow Caledonian University',
    slug: 'glasgow-caledonian',
    table: 'universities',
    typeDir: 'universities',
    commonsCategories: ['Glasgow_Caledonian_University'],
    wikipediaArticle: 'Glasgow_Caledonian_University',
    website: 'https://www.gcu.ac.uk',
  },

  // 5 colleges with no image at all.
  {
    id: '76a20fdf-0c64-462e-aec0-38d2bb6a7fd2',
    name: 'City of Glasgow College',
    slug: 'city-of-glasgow',
    table: 'colleges',
    typeDir: 'colleges',
    commonsCategories: [
      'City_of_Glasgow_College_City_Campus',
      'City_of_Glasgow_College',
    ],
    wikipediaArticle: 'City_of_Glasgow_College',
    website: 'https://www.cityofglasgowcollege.ac.uk',
  },
  {
    id: 'f7ed49f1-aae8-4bb9-a9e2-7ab45b1704d0',
    name: 'Glasgow Clyde College',
    slug: 'glasgow-clyde',
    table: 'colleges',
    typeDir: 'colleges',
    commonsCategories: [
      'Glasgow_Clyde_College',
      'Anniesland_College',
      'Cardonald_College',
      'Langside_College',
    ],
    commonsSearch: ['"Anniesland College"', '"Cardonald College"', '"Langside College" Glasgow'],
    wikipediaArticle: 'Glasgow_Clyde_College',
    website: 'https://www.glasgowclyde.ac.uk',
  },
  // UHI Orkney / UHI Perth / UHI Shetland deferred -- no campus photos exist
  // on Wikimedia Commons or their institutional websites, and the best
  // candidates from general search (Ness of Brodgar archaeological dig,
  // Booth of Gremista historic building) misrepresent the actual campus.
  // Phase 2: commission photography or source images direct from the UHI
  // communications team.
]

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

function readEnv(envPath) {
  const out = {}
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

// ---------- Filename filtering ----------

function passesFilters(filename) {
  if (!filename) return false
  if (!ACCEPT_EXT_RE.test(filename)) return false
  if (SKIP_RE.test(filename)) return false
  return true
}

function scoreFilename(filename) {
  // Higher is better; used to sort candidate lists.
  let s = 0
  if (PREFER_RE.test(filename)) s += 10
  if (ACCEPT_EXT_RE.test(filename)) s += 2
  // Penalise obviously-tiny thumbnails / people shots / graduation crowds.
  if (/\b(thumb|small|portrait|graduation|crowd|staff|student|class|award|ceremony)\b/i.test(filename)) s -= 3
  // Penalise historical engravings / vintage scans with pre-1970 year markers.
  if (OLD_YEAR_RE.test(filename)) s -= 8
  // Geograph.org.uk imports are typically well-captioned modern photos.
  if (/geograph/i.test(filename)) s += 3
  return s
}

// ---------- Wikimedia Commons ----------

async function listCommonsCategoryFiles(category) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmtype=file&cmlimit=50&format=json`
  const res = await timedFetch(api)
  if (!res.ok) return []
  const body = await res.json()
  const members = body?.query?.categorymembers ?? []
  return members
    .map((m) => m.title) // e.g. "File:Some Building.jpg"
    .filter((t) => typeof t === 'string' && t.startsWith('File:'))
    .map((t) => t.slice('File:'.length))
}

async function commonsImageInfo(filenames) {
  // Batch imageinfo lookup (up to 50 titles per request).
  if (filenames.length === 0) return []
  const titles = filenames.map((f) => `File:${f}`).join('|')
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json`
  const res = await timedFetch(api)
  if (!res.ok) return []
  const body = await res.json()
  const pages = body?.query?.pages ?? {}
  return Object.values(pages)
    .map((p) => {
      const info = p?.imageinfo?.[0]
      if (!info) return null
      return {
        filename: (p.title || '').replace(/^File:/, ''),
        url: info.thumburl || info.url,
        width: info.thumbwidth || info.width || 0,
        height: info.thumbheight || info.height || 0,
      }
    })
    .filter(Boolean)
}

async function commonsFileSearch(query) {
  // Fallback when a category returns nothing: full-text search for files.
  const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json`
  const res = await timedFetch(api)
  if (!res.ok) return []
  const body = await res.json()
  const pages = body?.query?.pages ?? {}
  return Object.values(pages)
    .map((p) => {
      const info = p?.imageinfo?.[0]
      if (!info) return null
      const filename = (p.title || '').replace(/^File:/, '')
      return {
        filename,
        url: info.thumburl || info.url,
        width: info.thumbwidth || info.width || 0,
        height: info.thumbheight || info.height || 0,
      }
    })
    .filter(Boolean)
}

async function pickCommonsImages(categories, searchQueries) {
  // Returns up to 2 distinct candidate {url, filename} objects.
  const seen = new Set()
  const allFiles = []
  for (const cat of categories) {
    let files
    try {
      files = await listCommonsCategoryFiles(cat)
      await sleep(POLITE_DELAY_MS)
    } catch (err) {
      console.warn(`    [commons] category ${cat} failed: ${err.message}`)
      continue
    }
    for (const f of files) {
      if (seen.has(f)) continue
      if (!passesFilters(f)) continue
      seen.add(f)
      allFiles.push(f)
    }
  }
  if (allFiles.length === 0) {
    // Fallback: full-text search on Commons for each query string.
    for (const q of searchQueries || []) {
      try {
        const hits = await commonsFileSearch(q)
        await sleep(POLITE_DELAY_MS)
        const big = hits.filter((h) => passesFilters(h.filename) && (h.width >= 800 || h.height >= 800))
        if (big.length > 0) {
          big.sort((a, b) => scoreFilename(b.filename) - scoreFilename(a.filename))
          return big.slice(0, 2)
        }
      } catch (err) {
        console.warn(`    [commons] search "${q}" failed: ${err.message}`)
      }
    }
    return []
  }

  // Sort by preference score (desc), stable.
  const scored = allFiles
    .map((f) => ({ filename: f, score: scoreFilename(f) }))
    .sort((a, b) => b.score - a.score)

  // Look up imageinfo for the top 20 so large-enough bias is applied.
  const top = scored.slice(0, 20).map((x) => x.filename)
  let info
  try {
    info = await commonsImageInfo(top)
  } catch (err) {
    console.warn(`    [commons] imageinfo failed: ${err.message}`)
    info = []
  }
  // Keep only large-enough files.
  const big = info.filter((i) => i.width >= 1000 || i.height >= 1000)
  const pool = big.length > 0 ? big : info
  // Re-sort pool by filename score since imageinfo order is arbitrary.
  pool.sort((a, b) => scoreFilename(b.filename) - scoreFilename(a.filename))
  return pool.slice(0, 2)
}

// ---------- Wikipedia article fallback ----------

async function pickWikipediaImages(article) {
  if (!article) return []
  try {
    const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(article)}&prop=images&imlimit=50&format=json&redirects=1`
    const res = await timedFetch(api)
    if (!res.ok) return []
    const body = await res.json()
    const pages = body?.query?.pages ?? {}
    const first = Object.values(pages)[0]
    const images = first?.images ?? []
    const filenames = images
      .map((i) => (i.title || '').replace(/^File:/, ''))
      .filter((f) => passesFilters(f))
    if (filenames.length === 0) return []
    filenames.sort((a, b) => scoreFilename(b) - scoreFilename(a))
    // Imageinfo lookup via Commons (Wikipedia images are really on Commons).
    const info = await commonsImageInfo(filenames.slice(0, 10))
    const big = info.filter((i) => i.width >= 1000 || i.height >= 1000)
    const pool = big.length > 0 ? big : info
    pool.sort((a, b) => scoreFilename(b.filename) - scoreFilename(a.filename))
    return pool.slice(0, 2)
  } catch (err) {
    console.warn(`    [wiki] article ${article} failed: ${err.message}`)
    return []
  }
}

// ---------- OG image fallback ----------

async function fetchOgImage(websiteUrl) {
  try {
    const res = await timedFetch(websiteUrl, { redirect: 'follow' })
    if (!res.ok) return null
    const html = await res.text()
    const re = /<meta\b[^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*?content\s*=\s*["']([^"']+)["'][^>]*>/gi
    const altRe = /<meta\b[^>]*?content\s*=\s*["']([^"']+)["'][^>]*?(?:property|name)\s*=\s*["']([^"']+)["'][^>]*>/gi
    const candidates = []
    for (const [pattern, orderIsKeyFirst] of [[re, true], [altRe, false]]) {
      let m
      while ((m = pattern.exec(html)) !== null) {
        const key = (orderIsKeyFirst ? m[1] : m[2]).toLowerCase()
        const val = orderIsKeyFirst ? m[2] : m[1]
        if (/^og:image(?::(?:url|secure_url))?$/.test(key)) candidates.unshift(val)
        else if (/^twitter:image(?::src)?$/.test(key)) candidates.push(val)
      }
    }
    if (candidates.length === 0) return null
    try {
      const imgUrl = new URL(candidates[0], websiteUrl).toString()
      return { url: imgUrl, filename: path.basename(imgUrl.split('?')[0] || 'og.jpg') }
    } catch {
      return null
    }
  } catch (err) {
    console.warn(`    [og] ${websiteUrl} failed: ${err.message}`)
    return null
  }
}

// ---------- Image processing ----------

async function writeWebp(buffer, outPath, width, height) {
  await sharp(buffer)
    .resize(width, height, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(outPath)
}

async function processTarget(inst) {
  console.log(`\n[${inst.typeDir}] ${inst.name} (${inst.slug})`)

  // Source 1: Commons
  let candidates = await pickCommonsImages(
    inst.commonsCategories || [],
    inst.commonsSearch || [],
  )
  let source = 'commons'

  // Source 2: Wikipedia article
  if (candidates.length === 0) {
    candidates = await pickWikipediaImages(inst.wikipediaArticle)
    source = 'wikipedia'
  }

  // Source 3: OG image
  if (candidates.length === 0) {
    const og = await fetchOgImage(inst.website)
    if (og) candidates = [og]
    source = 'og'
  }

  if (candidates.length === 0) {
    console.log(`  -> MISSING (all sources dry)`)
    return { ...inst, status: 'MISSING', source: 'none' }
  }

  console.log(`  source: ${source}, candidates: ${candidates.length}`)
  for (const c of candidates) console.log(`    - ${c.filename}`)

  // Fetch buffers. Wikimedia's upload.wikimedia.org enforces rate + robot
  // policy, so throttle between requests.
  const buffers = []
  for (const c of candidates) {
    try {
      const buf = await fetchBuffer(c.url)
      buffers.push({ buf, filename: c.filename })
      await sleep(POLITE_DELAY_MS)
    } catch (err) {
      console.warn(`    [fetch] ${c.url} failed: ${err.message}`)
    }
  }
  if (buffers.length === 0) {
    console.log(`  -> MISSING (all downloads failed)`)
    return { ...inst, status: 'MISSING', source }
  }

  const cardBuf = buffers[0].buf
  const heroBuf = buffers[1]?.buf ?? buffers[0].buf

  const outDir = path.join(PUBLIC_DIR, inst.typeDir)
  await fsp.mkdir(outDir, { recursive: true })
  const cardPath = path.join(outDir, `${inst.slug}-card.webp`)
  const heroPath = path.join(outDir, `${inst.slug}-hero.webp`)

  try {
    await writeWebp(cardBuf, cardPath, 640, 400)
    await writeWebp(heroBuf, heroPath, 1200, 400)
  } catch (err) {
    console.warn(`  [sharp] ${err.message}`)
    return { ...inst, status: 'SHARP_FAILED', source }
  }

  console.log(`  -> OK (${source}): card=${buffers[0].filename}, hero=${buffers[1]?.filename ?? buffers[0].filename}`)
  return {
    ...inst,
    status: 'OK',
    source,
    cardFile: buffers[0].filename,
    heroFile: buffers[1]?.filename ?? buffers[0].filename,
  }
}

async function tryUpdateDatabaseRows(results) {
  // Best-effort DB update via the service-role client. If .env.local's key
  // is rotated / invalid, fall back to writing a JSON file the caller can
  // hand to Supabase MCP or psql.
  const envPath = path.join(__dirname, '..', '.env.local')
  let env = {}
  try { env = readEnv(envPath) } catch { /* no .env.local */ }
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  const okResults = results.filter((r) => r.status === 'OK')
  const dbErrors = []
  let updated = 0

  if (url && key) {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    for (const r of okResults) {
      const cardUrl = `/images/institutions/${r.typeDir}/${r.slug}-card.webp`
      const heroUrl = `/images/institutions/${r.typeDir}/${r.slug}-hero.webp`
      const { error } = await supabase
        .from(r.table)
        .update({ card_image_url: cardUrl, hero_image_url: heroUrl })
        .eq('id', r.id)
      if (error) {
        console.error(`  [db] ${r.table}/${r.slug}: ${error.message}`)
        dbErrors.push({ slug: r.slug, error: error.message })
      } else {
        updated += 1
      }
    }
  } else {
    console.warn('\nNo SUPABASE creds in .env.local; DB update skipped.')
  }

  // Always write the intended SQL so a human / MCP can apply it if needed.
  const sqlLines = okResults.map((r) => {
    const card = `/images/institutions/${r.typeDir}/${r.slug}-card.webp`
    const hero = `/images/institutions/${r.typeDir}/${r.slug}-hero.webp`
    return `UPDATE ${r.table} SET card_image_url = '${card}', hero_image_url = '${hero}' WHERE id = '${r.id}';`
  })
  const sqlFile = path.join(__dirname, '..', 'docs', 'institution-images-fix-updates.sql')
  await fsp.writeFile(sqlFile, sqlLines.join('\n') + '\n')
  console.log(`\nWrote ${sqlFile} (${sqlLines.length} UPDATE statements)`)

  return { updated, dbErrors }
}

async function main() {
  const results = []
  for (const t of TARGETS) {
    try {
      const r = await processTarget(t)
      results.push(r)
    } catch (err) {
      console.error(`[${t.slug}] unhandled: ${err.message}`)
      results.push({ ...t, status: 'ERROR', source: 'none' })
    }
  }

  const { updated, dbErrors } = await tryUpdateDatabaseRows(results)

  console.log('\n===== Summary =====')
  console.log('Institution                                   | Source     | Status   | Card file')
  console.log('----------------------------------------------+------------+----------+--------------------------------')
  for (const r of results) {
    const name = r.name.padEnd(45).slice(0, 45)
    const source = String(r.source || '-').padEnd(10).slice(0, 10)
    const status = String(r.status || '-').padEnd(8).slice(0, 8)
    const card = (r.cardFile || '-').slice(0, 32)
    console.log(`${name} | ${source} | ${status} | ${card}`)
  }
  console.log(`\nDB rows updated: ${updated} / ${results.filter((r) => r.status === 'OK').length}`)
  if (dbErrors.length) {
    console.log('DB errors:')
    for (const e of dbErrors) console.log(`  - ${e.slug}: ${e.error}`)
  }
  const misses = results.filter((r) => r.status !== 'OK')
  if (misses.length) {
    console.log('\nNeeds manual resolution:')
    for (const m of misses) console.log(`  - ${m.name} (${m.slug}): ${m.status}`)
  }

  const resultFile = path.join(__dirname, '..', 'docs', 'institution-images-fix-result.json')
  await fsp.writeFile(resultFile, JSON.stringify(results, null, 2))
  console.log(`\nWrote ${resultFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
