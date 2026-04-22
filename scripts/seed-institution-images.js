// Seeds card_image_url / hero_image_url on universities + colleges based on
// files that exist under public/images/institutions/<type>/.
//
// Usage: node scripts/seed-institution-images.js

const fs = require('node:fs')
const path = require('node:path')
const { createClient } = require('@supabase/supabase-js')

const DATA_FILE = path.join(__dirname, '..', 'docs', 'institution-images-data.json')
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'images', 'institutions')

function readEnv(envPath) {
  const out = {}
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    out[k] = v
  }
  return out
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const env = readEnv(envPath)
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE creds in .env.local')

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))

  const tasks = [
    { table: 'universities', dir: 'universities', items: data.universities },
    { table: 'colleges', dir: 'colleges', items: data.colleges },
  ]

  let updated = 0
  let skipped = 0
  const missing = []

  for (const t of tasks) {
    for (const inst of t.items) {
      const cardFs = path.join(PUBLIC_DIR, t.dir, `${inst.slug}-card.webp`)
      const heroFs = path.join(PUBLIC_DIR, t.dir, `${inst.slug}-hero.webp`)
      if (!fs.existsSync(cardFs) || !fs.existsSync(heroFs)) {
        missing.push(`${t.table}/${inst.slug}`)
        skipped++
        continue
      }
      const cardUrl = `/images/institutions/${t.dir}/${inst.slug}-card.webp`
      const heroUrl = `/images/institutions/${t.dir}/${inst.slug}-hero.webp`
      const { error } = await supabase
        .from(t.table)
        .update({ card_image_url: cardUrl, hero_image_url: heroUrl })
        .eq('id', inst.id)
      if (error) {
        console.error(`[${t.table}/${inst.slug}] ERROR: ${error.message}`)
        skipped++
      } else {
        console.log(`[${t.table}/${inst.slug}] OK`)
        updated++
      }
    }
  }

  console.log('\n===== Seed summary =====')
  console.log(`Updated : ${updated}`)
  console.log(`Skipped : ${skipped}`)
  if (missing.length) {
    console.log('\nNo image files for:')
    for (const m of missing) console.log(`  - ${m}`)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
