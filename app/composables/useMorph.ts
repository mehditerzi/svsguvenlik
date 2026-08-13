export type Pt = [number, number]

/**
 * Point-array shape morphing.
 *
 * GSAP's MorphSVG is a paid plugin, so shapes are authored here as equal-length
 * point arrays and interpolated directly. Every shape is sampled to the same
 * count, which is what makes a clean morph possible without any path solver.
 */
const SAMPLES = 64

/** Regular n-gon, optionally with rounded "corner pull" toward a circle. */
export function polygon(sides: number, r = 1, round = 0, rotate = -Math.PI / 2): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES
    const a = t * Math.PI * 2 + rotate
    // distance to the polygon edge along this angle
    const seg = Math.PI * 2 / sides
    const half = seg / 2
    const local = ((a - rotate) % seg) - half
    const poly = Math.cos(half) / Math.cos(local)
    const rad = r * (poly * (1 - round) + round)
    out.push([Math.cos(a) * rad, Math.sin(a) * rad])
  }
  return out
}

export function circle(r = 1): Pt[] {
  return polygon(4, r, 1)
}

/** A shield: flat shoulders, tapering to a point — the brand mark. */
export function shield(r = 1): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / SAMPLES
    const a = t * Math.PI * 2 - Math.PI / 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    // top half is a squared arc, bottom half tapers to the tip
    const top = 1 / Math.max(Math.abs(c), Math.abs(s) * 0.92)
    const taper = 1 - Math.pow(Math.max(0, s), 1.5) * 0.42
    const rad = r * Math.min(1.18, top) * taper
    out.push([c * rad, s * rad])
  }
  return out
}

/** Soft blob with a seeded wobble, for the transition sheet. */
export function blob(r = 1, amp = 0.14, seed = 1): Pt[] {
  const out: Pt[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const a = (i / SAMPLES) * Math.PI * 2
    const w =
      Math.sin(a * 3 + seed) * amp + Math.sin(a * 5 - seed * 1.7) * amp * 0.5
    out.push([Math.cos(a) * r * (1 + w), Math.sin(a) * r * (1 + w)])
  }
  return out
}

/** Linear interpolation between two equal-length point arrays. */
export function lerpShape(a: Pt[], b: Pt[], t: number): Pt[] {
  const n = Math.min(a.length, b.length)
  const out: Pt[] = new Array(n)
  for (let i = 0; i < n; i++) {
    out[i] = [a[i]![0] + (b[i]![0] - a[i]![0]) * t, a[i]![1] + (b[i]![1] - a[i]![1]) * t]
  }
  return out
}

/** Walk a list of shapes with a single 0..1 progress value. */
export function morphSequence(shapes: Pt[][], t: number): Pt[] {
  if (shapes.length === 1) return shapes[0]!
  const scaled = Math.min(0.9999, Math.max(0, t)) * (shapes.length - 1)
  const i = Math.floor(scaled)
  return lerpShape(shapes[i]!, shapes[i + 1]!, scaled - i)
}

/** Render points as a closed SVG path using Catmull-Rom → cubic smoothing. */
export function toPath(pts: Pt[], cx = 0, cy = 0, scale = 1): string {
  const n = pts.length
  if (!n) return ''
  const p = (i: number): Pt => {
    const q = pts[((i % n) + n) % n]!
    return [cx + q[0] * scale, cy + q[1] * scale]
  }
  let d = `M${p(0)[0].toFixed(2)},${p(0)[1].toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1)
    const p1 = p(i)
    const p2 = p(i + 1)
    const p3 = p(i + 2)
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return `${d}Z`
}
