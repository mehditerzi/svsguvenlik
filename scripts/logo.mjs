/**
 * Derives the site's logo assets from the supplied master PNG.
 *
 * Three outputs, because the mark has to work on both themes:
 *   logo-mark.png       full-colour shield, for dark surfaces
 *   logo-mark-mask.png  alpha-only silhouette, used as a CSS mask so the header
 *                       mark inherits `currentColor` and stays legible when the
 *                       nav flips to ink over the paper sections
 *   logo-full.png       shield + wordmark + tagline, for the footer and loader
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = process.argv[2] || '/Users/ostamai/Desktop/svsguvenlik-logo.png'
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/media')
mkdirSync(OUT, { recursive: true })

// Measured from the master's alpha channel: the shield sits in its own band
// above the wordmark, so it can be lifted cleanly.
const MARK = { left: 391, top: 212, width: 230, height: 361 }

// sharp reorders extract/trim inside one pipeline, so the crop is materialised
// on its own before anything else touches it
const markBuf = await sharp(SRC).extract(MARK).png().toBuffer()

await sharp(markBuf).resize({ width: 320 }).webp({ quality: 90, effort: 6 }).toFile(`${OUT}/logo-mark.webp`)
await sharp(markBuf).resize({ width: 320 }).png().toFile(`${OUT}/logo-mark.png`)

// alpha → white silhouette on transparent, for use as a mask
const { data, info } = await sharp(markBuf).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true })
const mask = Buffer.alloc(info.width * info.height * 4)
for (let i = 0; i < info.width * info.height; i++) {
  mask[i * 4] = 255
  mask[i * 4 + 1] = 255
  mask[i * 4 + 2] = 255
  mask[i * 4 + 3] = data[i * 4 + 3]
}
await sharp(mask, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ width: 220 })
  .png({ compressionLevel: 9, palette: true })
  .toFile(`${OUT}/logo-mark-mask.png`)

// The lockup renders at ~210px in the loader and ~130px in the footer, so a
// 900px PNG was 312KB of dead weight — and it was fetched twice. WebP at 2×
// the largest render size covers both.
const fullBuf = await sharp(SRC).extract({ left: 182, top: 212, width: 664, height: 597 }).png().toBuffer()
await sharp(fullBuf).resize({ width: 440 }).webp({ quality: 88, effort: 6 }).toFile(`${OUT}/logo-full.webp`)

// favicon straight from the mark
await sharp(markBuf)
  .resize(160, 160, { fit: 'contain', background: { r: 10, g: 11, b: 13, alpha: 1 } })
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: '#0A0B0D' })
  .flatten({ background: '#0A0B0D' })
  .png()
  .toFile(resolve(OUT, '../favicon.png'))

const { statSync } = await import('node:fs')
for (const f of ['logo-mark.webp', 'logo-mark-mask.png', 'logo-full.webp']) {
  console.log(`✓ ${f.padEnd(20)} ${Math.round(statSync(`${OUT}/${f}`).size / 1024)}KB`)
}
