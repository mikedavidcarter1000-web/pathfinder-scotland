import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'

const WIDTH = 1200
const HEIGHT = 630
const BG = '#002D72'
const ACCENT = '#0072CE'
const WHITE = '#FFFFFF'
const MUTED = 'rgba(255, 255, 255, 0.82)'

// Positioning: logo mark + wordmark left-aligned, headline bold, subtitle below.
// Fonts: system sans stacks rendered via Sharp's librsvg. Use an embedded sans
// family ("Inter, Helvetica, Arial, sans-serif") -- Sharp's librsvg falls back
// to Arial which keeps kerning sensible even if Inter is unavailable on host.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG}"/>
      <stop offset="100%" stop-color="#001a4a"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Decorative saltire accent in bottom-right corner -->
  <g opacity="0.08" transform="translate(${WIDTH - 320} ${HEIGHT - 320})">
    <path d="M0 0 L300 300" stroke="${WHITE}" stroke-width="34" stroke-linecap="round"/>
    <path d="M300 0 L0 300" stroke="${WHITE}" stroke-width="34" stroke-linecap="round"/>
  </g>

  <!-- Logo mark: Saltire-in-square, top-left -->
  <g transform="translate(80 80)">
    <rect width="96" height="96" rx="18" fill="${ACCENT}"/>
    <path d="M20 20 L76 76" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <path d="M76 20 L20 76" stroke="${WHITE}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="48" cy="48" r="6" fill="${ACCENT}"/>
    <circle cx="48" cy="48" r="2.5" fill="${WHITE}"/>
  </g>

  <!-- Brand wordmark next to mark -->
  <text x="200" y="148" fill="${WHITE}"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="40" font-weight="700" letter-spacing="-0.5">Pathfinder Scotland</text>

  <!-- Headline -->
  <text x="80" y="340" fill="${WHITE}"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="76" font-weight="700" letter-spacing="-1.5">Plan your path</text>
  <text x="80" y="430" fill="${WHITE}"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="76" font-weight="700" letter-spacing="-1.5">to university.</text>

  <!-- Subtitle -->
  <text x="80" y="508" fill="${MUTED}"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="32" font-weight="500">Subject choices to university pathways</text>

  <!-- URL footer -->
  <text x="80" y="580" fill="${MUTED}"
    font-family="Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="24" font-weight="500">pathfinderscot.co.uk</text>
</svg>`

async function main() {
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  await writeFile('public/og-default.png', png)
  console.log(`Wrote public/og-default.png (${png.length} bytes, ${WIDTH}x${HEIGHT})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
