import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'

const SRC = 'public/logo-icon.png'
const OUT_DIR = 'public'

async function squarePadded(srcBuf, size) {
  return sharp(srcBuf)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer()
}

function buildIco(pngBuffers) {
  const count = pngBuffers.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)

  const entries = []
  let offset = 6 + count * 16

  for (const { buf, size } of pngBuffers) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(buf.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    offset += buf.length
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buf)])
}

async function main() {
  const src = await readFile(SRC)

  const sizes = [16, 32, 48]
  const pngBuffers = []
  for (const size of sizes) {
    const buf = await squarePadded(src, size)
    pngBuffers.push({ buf, size })
  }

  const ico = buildIco(pngBuffers)
  await writeFile(`${OUT_DIR}/favicon.ico`, ico)
  console.log(`Wrote favicon.ico (${ico.length} bytes, sizes: ${sizes.join(', ')})`)

  const png192 = await squarePadded(src, 192)
  await writeFile(`${OUT_DIR}/favicon-192.png`, png192)
  console.log(`Wrote favicon-192.png (${png192.length} bytes)`)

  const png512 = await squarePadded(src, 512)
  await writeFile(`${OUT_DIR}/favicon-512.png`, png512)
  console.log(`Wrote favicon-512.png (${png512.length} bytes)`)

  const svgSource = await squarePadded(src, 256)
  const base64 = svgSource.toString('base64')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256"><image href="data:image/png;base64,${base64}" width="256" height="256" image-rendering="auto"/></svg>\n`
  await writeFile(`${OUT_DIR}/favicon.svg`, svg)
  console.log(`Wrote favicon.svg (${svg.length} bytes)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
