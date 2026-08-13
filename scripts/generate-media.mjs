/**
 * Builds the site's image system.
 *
 * There is no stock photography in this project: every plate is composed here
 * as SVG (architectural masses, perimeter rhythms, sensor grids, haze) and
 * rendered to webp. That keeps the art direction consistent — one palette, one
 * grain, one atmosphere — instead of a folder of mismatched photos.
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/media')
mkdirSync(OUT, { recursive: true })

const INK = '#08090B'
const INK2 = '#0E1216'
const BRASS = '#C08B3C'

// deterministic noise so rebuilds are byte-stable
const rnd = (s) => {
  const x = Math.sin(s * 127.1) * 43758.5453
  return x - Math.floor(x)
}

const defs = (seed) => `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3A4855"/>
      <stop offset="46%" stop-color="#212C36"/>
      <stop offset="100%" stop-color="#111820"/>
    </linearGradient>
    <radialGradient id="haze" cx="50%" cy="86%" r="62%">
      <stop offset="0%" stop-color="#8FA4B8" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#8FA4B8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="${18 + rnd(seed) * 64}%" cy="${20 + rnd(seed * 3) * 40}%" r="46%">
      <stop offset="0%" stop-color="${BRASS}" stop-opacity="0.46"/>
      <stop offset="100%" stop-color="${BRASS}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${INK}" stop-opacity="0"/>
      <stop offset="62%" stop-color="${INK}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0.72"/>
    </linearGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="soft2"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#FFFFFF" opacity="0.09"/>
    </pattern>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="#FFFFFF" stroke-opacity="0.10" stroke-width="1"/>
    </pattern>
  </defs>`

const frame = (W, H, seed, inner, overlay = '') => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs(seed)}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  ${inner}
  <rect width="${W}" height="${H}" fill="url(#haze)" opacity="0.62"/>
  ${overlay}
  <rect width="${W}" height="${H}" fill="url(#fade)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.17" style="mix-blend-mode:overlay"/>
</svg>`

/** Layered skyline: three depth bands, back bands lighter and hazier. */
const skyline = (W, H, seed, bands = 4) => {
  let out = ''
  for (let b = 0; b < bands; b++) {
    const depth = b / (bands - 1)
    const tone = 8 + depth * 0 + (1 - depth) * 0
    const fill = `rgb(${Math.round(20 + depth * 26)},${Math.round(27 + depth * 30)},${Math.round(35 + depth * 34)})`
    const base = H * (0.78 + depth * 0.14)
    let path = `M0 ${H}`
    let x = -60
    let i = 0
    while (x < W + 60) {
      const s = seed * 13 + b * 71 + i * 7
      const w = 40 + rnd(s) * (110 - depth * 40)
      const h = (0.24 + rnd(s * 2.1) * (0.68 - depth * 0.26)) * H
      const top = base - h
      path += ` L${x} ${top} L${x + w} ${top}`
      // window rhythm on the nearest band only
      if (b === 0 && rnd(s * 3.3) > 0.45) {
        out += `<g opacity="${0.4 + rnd(s * 5) * 0.45}">`
        for (let wy = top + 22; wy < base - 18; wy += 26) {
          for (let wx = x + 12; wx < x + w - 12; wx += 18) {
            if (rnd(wx * wy * 0.013 + s) > 0.5)
              out += `<rect x="${wx}" y="${wy}" width="6" height="9" fill="${rnd(wx + wy) > 0.8 ? BRASS : '#C8D6E4'}"/>`
          }
        }
        out += `</g>`
      }
      x += w + 4
      i++
    }
    path += ` L${W} ${H} Z`
    out = `<path d="${path}" fill="${fill}" ${b > 1 ? 'filter="url(#soft2)"' : ''} opacity="${1 - depth * 0.12}"/>` + out
  }
  return out
}

/** Perimeter rhythm — vertical posts receding to a vanishing point. */
const perimeter = (W, H, seed) => {
  let out = `<rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="#141C24"/>`
  const vy = H * 0.6
  for (let i = 0; i < 26; i++) {
    const t = i / 25
    const x = W * (0.06 + Math.pow(t, 1.7) * 1.02)
    const h = H * (0.42 - t * 0.3)
    const o = 0.5 - t * 0.34
    out += `<rect x="${x}" y="${vy - h}" width="${Math.max(2, 12 - t * 9)}" height="${h}" fill="#54646F" opacity="${o + 0.45}"/>`
  }
  for (let i = 0; i < 4; i++) {
    const y = vy - H * 0.34 + i * H * 0.09
    out += `<line x1="0" y1="${y + 14}" x2="${W}" y2="${y - 30}" stroke="#5A6B77" stroke-width="1.8" opacity="0.55"/>`
  }
  out += `<rect x="${W * 0.52}" y="${H * 0.16}" width="${W * 0.3}" height="${H * 0.46}" fill="#232E39" opacity="0.9"/>`
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 7; c++) {
      const sd = seed + r * 11 + c * 3
      out += `<rect x="${W * 0.535 + c * W * 0.041}" y="${H * 0.18 + r * H * 0.048}" width="${W * 0.026}" height="${H * 0.03}" fill="${rnd(sd) > 0.9 ? BRASS : '#C6D5E3'}" opacity="${0.12 + rnd(sd * 2) * 0.5}"/>`
    }
  out += `<circle cx="${W * 0.78}" cy="${H * 0.22}" r="7" fill="${BRASS}" opacity="0.9"/>`
  out += `<circle cx="${W * 0.78}" cy="${H * 0.22}" r="46" fill="${BRASS}" opacity="0.12" filter="url(#soft2)"/>`
  return out
}

/** Facility plan: filled rooms, corridors, and a lit service core. */
const planGrid = (W, H, seed) => {
  let out = `<rect width="${W}" height="${H}" fill="#18212A"/>`
  const cols = 11
  const rows = 8
  const cw = W / cols
  const ch = H / rows

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sd = seed + r * 31 + c * 7
      const v = rnd(sd)
      if (v < 0.1) continue
      const span = v > 0.86 && c < cols - 1 ? 2 : 1
      const x = c * cw + 3
      const y = r * ch + 3
      const w = cw * span - 6
      const h = ch - 6
      const tone = Math.round(34 + rnd(sd * 2) * 26)
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgb(${tone},${tone + 7},${tone + 14})"/>`
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#8CA0B4" stroke-width="1.3" opacity="${0.3 + rnd(sd * 5) * 0.45}"/>`
      if (rnd(sd * 9) > 0.88) out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${BRASS}" opacity="0.42"/>`
      if (rnd(sd * 11) > 0.6)
        out += `<rect x="${x + w * 0.18}" y="${y + h * 0.62}" width="${w * 0.42}" height="2.5" fill="#C6D5E3" opacity="0.4"/>`
    }
  }
  // circulation spine + core
  out += `<rect y="${ch * 3 - 4}" width="${W}" height="8" fill="#0D1319" opacity="0.85"/>`
  out += `<rect x="${cw * 4}" y="${ch * 2}" width="${cw * 2.4}" height="${ch * 3}" fill="#0F161D"/>`
  out += `<rect x="${cw * 4}" y="${ch * 2}" width="${cw * 2.4}" height="${ch * 3}" fill="none" stroke="${BRASS}" stroke-width="2.4" opacity="0.7"/>`
  return out
}

/** Optical / sensor motif: concentric rings plus a scan sweep. */
const optic = (W, H, seed) => {
  const cx = W * 0.56
  const cy = H * 0.48
  let out = ''
  for (let i = 12; i > 0; i--) {
    const r = i * (H * 0.085)
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8496A8" stroke-width="${i % 4 === 0 ? 3.2 : 1.4}" opacity="${0.2 + (12 - i) * 0.055}"/>`
  }
  out += `<circle cx="${cx}" cy="${cy}" r="${H * 0.14}" fill="#0E141A"/>`
  out += `<circle cx="${cx}" cy="${cy}" r="${H * 0.14}" fill="url(#haze)" opacity="0.5"/>`
  out += `<circle cx="${cx}" cy="${cy}" r="${H * 0.14}" fill="none" stroke="${BRASS}" stroke-width="3" opacity="0.8"/>`
  out += `<path d="M${cx} ${cy} L${cx + W} ${cy - H * 0.62} A ${W} ${W} 0 0 0 ${cx + W} ${cy + H * 0.24} Z" fill="${BRASS}" opacity="0.16"/>`
  for (let i = 0; i < 70; i++) {
    const s = seed + i * 11
    out += `<circle cx="${rnd(s) * W}" cy="${rnd(s * 2) * H}" r="${1.5 + rnd(s * 3) * 2.5}" fill="#A9B8C6" opacity="${0.2 + rnd(s * 4) * 0.5}"/>`
  }
  return out
}

/** Coverage map: a dense measurement grid with lit operation nodes over a
 *  distant skyline, so the frame reads as territory rather than empty space. */
const network = (W, H, seed) => {
  let out = `<rect width="${W}" height="${H}" fill="#161F28"/>`

  // graticule
  for (let x = 0; x <= W; x += W / 26)
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#7C8FA2" stroke-width="1" opacity="0.13"/>`
  for (let y = 0; y <= H; y += H / 14)
    out += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#7C8FA2" stroke-width="1" opacity="0.13"/>`

  // distant skyline anchoring the base
  let path = `M0 ${H}`
  for (let i = 0, x = 0; x < W + 40; i++) {
    const sd = seed + i * 9
    const w = 30 + rnd(sd) * 70
    const top = H * (0.7 + rnd(sd * 2) * 0.16)
    path += ` L${x} ${top} L${x + w} ${top}`
    x += w + 3
  }
  out += `<path d="${path} L${W} ${H} Z" fill="#0F171F" opacity="0.95"/>`

  const pts = []
  for (let i = 0; i < 40; i++) pts.push([rnd(seed + i * 5) * W, H * (0.12 + rnd(seed + i * 9) * 0.6)])
  pts.forEach((p, i) => {
    const q = pts[(i * 7 + 3) % pts.length]
    out += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#8FA2B5" stroke-width="1.2" opacity="0.3"/>`
  })
  pts.forEach((p, i) => {
    const hot = i % 5 === 0
    out += `<circle cx="${p[0]}" cy="${p[1]}" r="${hot ? 7 : 3}" fill="${hot ? BRASS : '#C3D2E0'}" opacity="${hot ? 1 : 0.75}"/>`
    if (hot) {
      out += `<circle cx="${p[0]}" cy="${p[1]}" r="34" fill="${BRASS}" opacity="0.2" filter="url(#soft2)"/>`
      out += `<circle cx="${p[0]}" cy="${p[1]}" r="22" fill="none" stroke="${BRASS}" stroke-width="1.4" opacity="0.5"/>`
    }
  })
  return out
}

/** Monitor wall for the control-room plate. */
const monitors = (W, H, seed) => {
  let out = `<rect width="${W}" height="${H}" fill="#10161C"/>`
  const cols = 5
  const rows = 4
  const mw = (W * 0.9) / cols
  const mh = (H * 0.74) / rows
  const ox = W * 0.05
  const oy = H * 0.05
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = seed + r * 17 + c * 5
      const x = ox + c * mw
      const y = oy + r * mh
      out += `<rect x="${x + 5}" y="${y + 5}" width="${mw - 12}" height="${mh - 12}" fill="#243441" stroke="#5D7183" stroke-width="1.2"/>`
      out += `<rect x="${x + 5}" y="${y + 5}" width="${mw - 12}" height="${mh - 12}" fill="url(#scan)"/>`
      const v = rnd(s)
      if (v > 0.72)
        out += `<rect x="${x + 5}" y="${y + 5}" width="${mw - 12}" height="${mh - 12}" fill="${BRASS}" opacity="0.32"/>`
      out += `<rect x="${x + 14}" y="${y + mh - 30}" width="${(mw - 30) * (0.25 + rnd(s * 3) * 0.6)}" height="3" fill="#C3D2DF" opacity="0.68"/>`
    }
  }
  // console desk anchoring the bottom of the frame
  out += `<rect x="0" y="${H * 0.8}" width="${W}" height="${H * 0.2}" fill="#0D1319"/>`
  out += `<rect x="${W * 0.06}" y="${H * 0.83}" width="${W * 0.88}" height="${H * 0.05}" fill="#222D38"/>`
  for (let i = 0; i < 9; i++) {
    const x = W * (0.09 + i * 0.095)
    out += `<rect x="${x}" y="${H * 0.845}" width="${W * 0.05}" height="${H * 0.022}" fill="#38454F" opacity="0.9"/>`
    if (i % 3 === 0) out += `<circle cx="${x + W * 0.025}" cy="${H * 0.9}" r="${H * 0.008}" fill="${BRASS}" opacity="0.8"/>`
  }
  return out
}

/** Facade study: a building front filling the frame, lit window grid, strong
 *  perspective wedge — the densest of the recipes. */
const massing = (W, H, seed) => {
  let out = ''
  const bands = 3
  for (let b = bands - 1; b >= 0; b--) {
    const d = b / (bands - 1)
    const tone = Math.round(30 + d * 30)
    const x = W * (-0.05 + d * 0.24) + (rnd(seed + b) - 0.5) * W * 0.06
    const w = W * (0.62 - d * 0.13)
    const y = H * (0.06 + d * 0.2)
    const h = H - y
    out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgb(${tone},${tone + 8},${tone + 16})"/>`
    // façade rhythm
    const cols = 12 - b * 2
    const rows = 16 - b * 3
    const cw = w / cols
    const ch = h / rows
    out += `<g opacity="${0.72 - d * 0.3}">`
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sd = seed + b * 91 + r * 13 + c * 5
        const lit = rnd(sd)
        const fill = lit > 0.93 ? BRASS : lit > 0.52 ? '#C6D5E3' : '#0F161D'
        const op = lit > 0.52 ? 0.24 + rnd(sd * 3) * 0.5 : 0.55
        out += `<rect x="${x + c * cw + cw * 0.18}" y="${y + r * ch + ch * 0.2}" width="${cw * 0.64}" height="${ch * 0.56}" fill="${fill}" opacity="${op}"/>`
      }
    }
    out += `</g>`
    // roof edge highlight
    out += `<rect x="${x}" y="${y}" width="${w}" height="3" fill="#D8E4EF" opacity="${0.3 - d * 0.16}"/>`
  }
  // foreground silhouette anchoring the bottom corner
  out += `<path d="M${W} ${H} L${W} ${H * 0.36} L${W * 0.74} ${H * 0.44} L${W * 0.74} ${H} Z" fill="#0E141A" opacity="0.94"/>`
  return out
}

/** Signal bars — service plates. */
const signal = (W, H, seed) => {
  let out = ''
  const n = 46
  for (let i = 0; i < n; i++) {
    const s = seed + i * 3
    const x = (W / n) * i
    const h = H * (0.16 + Math.pow(rnd(s), 1.4) * 0.8)
    out += `<rect x="${x + 2}" y="${H - h}" width="${W / n - 4}" height="${h}" fill="${rnd(s * 5) > 0.86 ? BRASS : '#43535F'}" opacity="${0.55 + rnd(s * 2) * 0.45}"/>`
  }
  return out
}

const OVERLAY_GRID = (W, H) => `<rect width="${W}" height="${H}" fill="url(#grid)" opacity="0.5"/>`
const OVERLAY_SCAN = (W, H) => `<rect width="${W}" height="${H}" fill="url(#scan)" opacity="0.6"/>`

const RECIPES = [
  { name: 'hero-tower', w: 1200, h: 1700, build: (W, H, s) => skyline(W, H, s, 4) },
  { name: 'sector-guvenlik', w: 2200, h: 1300, build: perimeter, overlay: OVERLAY_SCAN },
  { name: 'sector-tesis', w: 2200, h: 1300, build: planGrid, overlay: OVERLAY_GRID },
  { name: 'sector-teknoloji', w: 2200, h: 1300, build: optic, overlay: OVERLAY_SCAN },
  { name: 'sector-operasyon', w: 2200, h: 1300, build: network, overlay: OVERLAY_GRID },
  { name: 'statement-back', w: 1200, h: 1600, build: (W, H, s) => skyline(W, H, s, 3) },
  { name: 'statement-front', w: 900, h: 1300, build: massing },
  { name: 'project-01', w: 1800, h: 1350, build: massing },
  { name: 'project-02', w: 1200, h: 1600, build: (W, H, s) => skyline(W, H, s, 3) },
  { name: 'project-03', w: 1500, h: 1500, build: network, overlay: OVERLAY_GRID },
  { name: 'project-04', w: 2400, h: 1030, build: (W, H, s) => skyline(W, H, s, 4) },
  { name: 'project-05', w: 1200, h: 1500, build: monitors, overlay: OVERLAY_SCAN },
  { name: 'project-06', w: 1200, h: 1600, build: planGrid, overlay: OVERLAY_GRID },
  { name: 'service-01', w: 1400, h: 1800, build: perimeter },
  { name: 'service-02', w: 1400, h: 1800, build: signal },
  { name: 'service-03', w: 1400, h: 1800, build: optic, overlay: OVERLAY_SCAN },
  { name: 'service-04', w: 1400, h: 1800, build: planGrid, overlay: OVERLAY_GRID },
  { name: 'service-05', w: 1400, h: 1800, build: network },
  { name: 'unit-01', w: 2000, h: 1400, build: monitors, overlay: OVERLAY_SCAN },
  { name: 'unit-02', w: 2000, h: 1400, build: perimeter },
  { name: 'unit-03', w: 2000, h: 1400, build: massing, overlay: OVERLAY_GRID }
]

let seed = 3
for (const r of RECIPES) {
  seed += 17
  const svg = frame(r.w, r.h, seed, r.build(r.w, r.h, seed), r.overlay ? r.overlay(r.w, r.h) : '')
  await sharp(Buffer.from(svg), { density: 96 })
    .webp({ quality: 88, effort: 5 })
    .toFile(`${OUT}/${r.name}.webp`)
  console.log('✓', r.name, `${r.w}×${r.h}`)
}

// ── social card ──────────────────────────────────────────────────────────────
const ogSeed = 991
const ogInner = skyline(1200, 630, ogSeed, 4)
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  ${defs(ogSeed)}
  <rect width="1200" height="630" fill="url(#sky)"/>
  <rect width="1200" height="630" fill="url(#warm)"/>
  ${ogInner}
  <rect width="1200" height="630" fill="url(#haze)" opacity="0.5"/>
  <rect width="1200" height="630" fill="rgba(8,9,11,0.55)"/>
  <text x="250" y="318" fill="#EDE9E1" font-family="Helvetica,Arial,sans-serif" font-size="86" font-weight="600" letter-spacing="-4">SVS</text>
  <text x="250" y="372" fill="#EDE9E1" font-family="Helvetica,Arial,sans-serif" font-size="34" letter-spacing="4" opacity="0.8">SHADOW VIP SECURITY</text>
  <text x="250" y="440" fill="#C08B3C" font-family="Helvetica,Arial,sans-serif" font-size="30" letter-spacing="1">Sahayı gören güvenlik</text>
  <text x="72" y="566" fill="#8D97A3" font-family="Helvetica,Arial,sans-serif" font-size="23" letter-spacing="3">HASTANE · PLAZA · TESİS YÖNETİMİ · TEKNOLOJİ · 81 İL</text>
  <rect x="72" y="500" width="150" height="3" fill="#C08B3C"/>
  <rect width="1200" height="630" filter="url(#grain)" opacity="0.15" style="mix-blend-mode:overlay"/>
</svg>`
const ogMark = await sharp(`${OUT}/logo-mark.webp`).resize({ height: 210 }).toBuffer()
await sharp(Buffer.from(og))
  .composite([{ input: ogMark, top: 210, left: 76 }])
  .jpeg({ quality: 88 })
  .toFile(`${OUT}/og.jpg`)
console.log('✓ og.jpg 1200×630')

// ── tiling grain texture ─────────────────────────────────────────────────────
// A static 128px tile costs one texture upload. The previous approach — a
// full-viewport SVG turbulence filter under mix-blend-mode — forced the entire
// page (canvases included) to re-composite every frame.
{
  const N = 128
  const buf = Buffer.alloc(N * N * 4)
  for (let i = 0; i < N * N; i++) {
    const v = Math.floor(rnd(i * 1.7) * 255)
    buf[i * 4] = v
    buf[i * 4 + 1] = v
    buf[i * 4 + 2] = v
    buf[i * 4 + 3] = 255
  }
  await sharp(buf, { raw: { width: N, height: N, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/noise.png`)
  console.log('✓ noise.png 128×128')
}

// favicon comes from the real mark — see scripts/logo.mjs
