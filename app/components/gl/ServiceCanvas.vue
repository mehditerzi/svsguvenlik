<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

/**
 * Live diagrams for the service list — one canvas per service, each drawing
 * what that service actually does and reacting to the pointer.
 *
 *   patrol    perimeter route, the guard's vision cone tracks your cursor
 *   crowd     people flow through a gate; the cursor parts the stream
 *   optics    camera arcs sweep until one locks onto the cursor
 *   facility  floor plan scan; the zone under the cursor lights up
 *   risk      a risk profile that swells on the axis you point at
 *
 * All five share one ticker, pause off-screen, and fall back to a single
 * static frame under prefers-reduced-motion.
 */
const props = withDefaults(
  defineProps<{
    variant: 'patrol' | 'crowd' | 'optics' | 'facility' | 'risk' | 'dispatch'
    /** Shifts every randomised position and phase — same language, new layout. */
    seed?: number
    /** Tempo multiplier. */
    speed?: number
    /** Element count multiplier. */
    density?: number
    /** Mirrors the composition horizontally. */
    mirror?: boolean
    /** Stop drawing without unmounting (stacked layers that aren't showing). */
    active?: boolean
    /** Drop the built-in vignette where the scene already supplies a scrim. */
    bare?: boolean
  }>(),
  { seed: 0, speed: 1, density: 1, mirror: false, active: true, bare: false }
)

const host = ref<HTMLElement | null>(null)
const cnv = ref<HTMLCanvasElement | null>(null)

const INK = '#0A0B0D'
const PAPER = '#EDE9E1'
const BRASS = '#C08B3C'
const STEEL = '#7C8794'

let cleanup: (() => void) | null = null

onMounted(() => {
  const el = host.value
  const canvas = cnv.value
  if (!el || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let W = 0
  let H = 0
  let dpr = 1

  // These are line-and-dot diagrams, not photographs: a full-bleed canvas at
  // DPR 2 costs 6.4M pixels of fill per frame for no visible gain. Cap the
  // ratio and hold the backing store under a fixed pixel budget.
  const PIXEL_BUDGET = 2_600_000

  const resize = () => {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const over = (r.width * r.height * dpr * dpr) / PIXEL_BUDGET
    if (over > 1) dpr = Math.max(1, dpr / Math.sqrt(over))
    W = r.width
    H = r.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  // pointer, in local space, lerped so nothing snaps
  let tx = 0.5
  let ty = 0.5
  let px = 0.5
  let py = 0.5
  let engaged = 0

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    const raw = (e.clientX - r.left) / r.width
    tx = props.mirror ? 1 - raw : raw
    ty = (e.clientY - r.top) / r.height
    engaged = 1
  }
  const onLeave = () => {
    tx = 0.5
    ty = 0.5
    engaged = 0
  }
  el.addEventListener('pointermove', onMove, { passive: true })
  el.addEventListener('pointerleave', onLeave, { passive: true })

  // ── helpers ────────────────────────────────────────────────────────────────
  const line = (x1: number, y1: number, x2: number, y2: number, c: string, w = 1, a = 1) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = c
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  }
  const dot = (x: number, y: number, r: number, c: string, a = 1) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  const ring = (x: number, y: number, r: number, c: string, a = 1, w = 1) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = c
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  const grid = (step: number, a = 0.05) => {
    ctx.save()
    ctx.globalAlpha = a
    ctx.strokeStyle = STEEL
    ctx.lineWidth = 1
    for (let x = 0; x <= W; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y <= H; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }
    ctx.restore()
  }

  // every call is offset by the instance seed, so layouts differ per placement
  const rnd = (s: number) => {
    const v = Math.sin((s + props.seed * 12.9898) * 127.1) * 43758.5453
    return v - Math.floor(v)
  }
  const phase = props.seed * 1.37

  // ── particles for the crowd variant ────────────────────────────────────────
  const parts = Array.from({ length: Math.round(90 * props.density) }, (_, i) => ({
    x: rnd(i) * 1,
    y: 0.2 + rnd(i * 3.1) * 0.6,
    v: 0.0016 + rnd(i * 7.7) * 0.0026,
    o: 0
  }))

  // ── variants ───────────────────────────────────────────────────────────────
  const drawPatrol = (t: number) => {
    grid(Math.max(28, W / 12))
    const m = Math.min(W, H) * 0.16
    const x0 = m
    const y0 = m
    const x1 = W - m
    const y1 = H - m

    // perimeter
    ctx.save()
    ctx.setLineDash([7, 7])
    ctx.strokeStyle = STEEL
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1.2
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
    ctx.restore()

    // waypoints
    const wps = [
      [x0, y0], [(x0 + x1) / 2, y0], [x1, y0], [x1, (y0 + y1) / 2],
      [x1, y1], [(x0 + x1) / 2, y1], [x0, y1], [x0, (y0 + y1) / 2]
    ] as [number, number][]

    // guard travels the perimeter
    const per = 2 * (x1 - x0) + 2 * (y1 - y0)
    let d = (t * 0.055 * per) % per
    let gx = x0
    let gy = y0
    const top = x1 - x0
    const right = y1 - y0
    if (d < top) { gx = x0 + d; gy = y0 }
    else if (d < top + right) { gx = x1; gy = y0 + (d - top) }
    else if (d < 2 * top + right) { gx = x1 - (d - top - right); gy = y1 }
    else { gx = x0; gy = y1 - (d - 2 * top - right) }

    wps.forEach((p, i) => {
      const near = Math.hypot(p[0] - gx, p[1] - gy) < Math.min(W, H) * 0.13
      dot(p[0], p[1], near ? 3.6 : 2.4, near ? BRASS : STEEL, near ? 1 : 0.55)
      if (near) ring(p[0], p[1], 8 + Math.sin(t * 6 + i) * 4, BRASS, 0.4)
    })

    // vision cone aimed at the pointer
    const targetX = px * W
    const targetY = py * H
    const ang = Math.atan2(targetY - gy, targetX - gx)
    const reach = Math.min(W, H) * (0.34 + engaged * 0.12)
    const spread = 0.42
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, reach)
    g.addColorStop(0, 'rgba(192,139,60,0.34)')
    g.addColorStop(1, 'rgba(192,139,60,0)')
    ctx.save()
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.arc(gx, gy, reach, ang - spread, ang + spread)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    line(gx, gy, gx + Math.cos(ang) * reach, gy + Math.sin(ang) * reach, BRASS, 1, 0.5)

    dot(gx, gy, 5, PAPER)
    ring(gx, gy, 11, PAPER, 0.4)
  }

  const drawCrowd = (t: number) => {
    grid(Math.max(30, W / 10), 0.04)
    const gateX = W * 0.56
    const gapY = H * 0.5
    const gap = H * 0.17

    parts.forEach((p, i) => {
      p.x += p.v * (1 + Math.sin(t + i) * 0.12)
      if (p.x > 1.05) {
        p.x = -0.05
        p.y = 0.18 + rnd(i * 13.3 + t) * 0.64
      }
      let x = p.x * W
      let y = p.y * H

      // funnel toward the gate
      const dx = (x - gateX) / W
      if (Math.abs(dx) < 0.26) {
        const pull = 1 - Math.abs(dx) / 0.26
        y += (gapY - y) * pull * 0.55
      }

      // the cursor parts the stream
      const mx = px * W
      const my = py * H
      const dist = Math.hypot(x - mx, y - my)
      const rad = Math.min(W, H) * 0.22
      if (engaged && dist < rad) {
        const f = (1 - dist / rad) * 26
        const a = Math.atan2(y - my, x - mx)
        x += Math.cos(a) * f
        y += Math.sin(a) * f
      }

      const through = p.x * W > gateX
      dot(x, y, through ? 2.1 : 1.7, through ? BRASS : PAPER, through ? 0.85 : 0.42)
    })

    // gate posts
    ctx.save()
    ctx.fillStyle = PAPER
    ctx.globalAlpha = 0.85
    ctx.fillRect(gateX - 2, H * 0.12, 4, gapY - gap / 2 - H * 0.12)
    ctx.fillRect(gateX - 2, gapY + gap / 2, 4, H * 0.88 - (gapY + gap / 2))
    ctx.restore()
    dot(gateX, gapY - gap / 2, 3.4, BRASS)
    dot(gateX, gapY + gap / 2, 3.4, BRASS)

    // throughput read-out
    const load = 0.45 + Math.sin(t * 0.9) * 0.22 + engaged * 0.14
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = STEEL
    ctx.fillRect(W * 0.1, H * 0.88, W * 0.34, 2)
    ctx.globalAlpha = 1
    ctx.fillStyle = BRASS
    ctx.fillRect(W * 0.1, H * 0.88, W * 0.34 * Math.min(1, load), 2)
    ctx.restore()
  }

  const drawOptics = (t: number) => {
    grid(Math.max(26, W / 14), 0.045)
    const cams = [
      [W * 0.16, H * 0.16],
      [W * 0.84, H * 0.2],
      [W * 0.5, H * 0.86]
    ] as [number, number][]

    const mx = px * W
    const my = py * H
    let lock = 0
    let best = Infinity
    cams.forEach((c, i) => {
      const d = Math.hypot(c[0] - mx, c[1] - my)
      if (d < best) {
        best = d
        lock = i
      }
    })

    cams.forEach((c, i) => {
      const locked = engaged && i === lock
      const base = Math.atan2(H / 2 - c[1], W / 2 - c[0])
      const ang = locked ? Math.atan2(my - c[1], mx - c[0]) : base + Math.sin(t * 0.6 + i * 2) * 0.55
      const reach = Math.min(W, H) * 0.62
      const spread = 0.3

      const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], reach)
      g.addColorStop(0, locked ? 'rgba(192,139,60,0.3)' : 'rgba(124,135,148,0.16)')
      g.addColorStop(1, 'rgba(124,135,148,0)')
      ctx.save()
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(c[0], c[1])
      ctx.arc(c[0], c[1], reach, ang - spread, ang + spread)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      dot(c[0], c[1], 4.2, locked ? BRASS : PAPER, locked ? 1 : 0.7)
      ring(c[0], c[1], 9, locked ? BRASS : STEEL, locked ? 0.8 : 0.35)
    })

    // reticle on the tracked point
    if (engaged) {
      const s = 15 + Math.sin(t * 5) * 2
      ctx.save()
      ctx.strokeStyle = BRASS
      ctx.lineWidth = 1.3
      ctx.globalAlpha = 0.95
      ;[[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
        ctx.beginPath()
        ctx.moveTo(mx + sx * s, my + sy * s - sy * 6)
        ctx.lineTo(mx + sx * s, my + sy * s)
        ctx.lineTo(mx + sx * s - sx * 6, my + sy * s)
        ctx.stroke()
      })
      ctx.restore()
      dot(mx, my, 1.8, BRASS)
    }
  }

  const drawFacility = (t: number) => {
    const cols = 6
    const rows = 4
    const pad = Math.min(W, H) * 0.08
    const cw = (W - pad * 2) / cols
    const ch = (H - pad * 2) / rows
    const sweep = (t * 0.34) % (cols + 2)

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = pad + c * cw
        const y = pad + r * ch
        const w = cw - 6
        const h = ch - 6
        const hot = px * W > x && px * W < x + w && py * H > y && py * H < y + h && engaged
        const wave = Math.max(0, 1 - Math.abs(c - sweep) * 0.9)

        ctx.save()
        ctx.globalAlpha = 0.1 + wave * 0.28 + (hot ? 0.4 : 0)
        ctx.fillStyle = hot ? BRASS : STEEL
        ctx.fillRect(x, y, w, h)
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = hot ? 0.95 : 0.32 + wave * 0.3
        ctx.strokeStyle = hot ? BRASS : STEEL
        ctx.lineWidth = hot ? 1.6 : 1
        ctx.strokeRect(x, y, w, h)
        ctx.restore()

        if (hot) {
          dot(x + w - 8, y + 8, 2.6, BRASS)
          line(x, y + h + 4, x + w, y + h + 4, BRASS, 1.4, 0.8)
        }
      }
    }

    // service riser
    line(W * 0.5, pad, W * 0.5, H - pad, PAPER, 1, 0.16)
    const riser = pad + ((t * 0.16) % 1) * (H - pad * 2)
    dot(W * 0.5, riser, 3.2, BRASS)
  }

  const drawRisk = (t: number) => {
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.33
    const N = 6
    const mx = px * W - cx
    const my = py * H - cy
    const pAng = (Math.atan2(my, mx) + Math.PI * 2) % (Math.PI * 2)

    for (let k = 1; k <= 3; k++) ring(cx, cy, (R / 3) * k, STEEL, 0.16)

    const pts: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2
      line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, STEEL, 1, 0.16)

      // the axis you point at swells
      const da = Math.abs(((a + Math.PI * 2) % (Math.PI * 2)) - pAng)
      const near = Math.min(da, Math.PI * 2 - da)
      const boost = engaged ? Math.max(0, 1 - near / 0.9) * 0.34 : 0
      const v = 0.42 + Math.sin(t * 0.8 + i * 1.7) * 0.16 + boost
      pts.push([cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v])
    }

    ctx.save()
    ctx.beginPath()
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.fillStyle = 'rgba(192,139,60,0.16)'
    ctx.fill()
    ctx.strokeStyle = BRASS
    ctx.lineWidth = 1.6
    ctx.globalAlpha = 0.9
    ctx.stroke()
    ctx.restore()
    pts.forEach((p) => dot(p[0], p[1], 2.8, BRASS))

    // threats orbiting outside the profile
    for (let i = 0; i < 5; i++) {
      const a = t * (0.3 + i * 0.07) + i * 1.9
      const rr = R * (1.25 + Math.sin(t * 0.5 + i) * 0.1)
      const x = cx + Math.cos(a) * rr
      const y = cy + Math.sin(a) * rr * 0.7
      dot(x, y, 2.2, PAPER, 0.5)
      ring(x, y, 6 + Math.sin(t * 3 + i) * 2, PAPER, 0.16)
    }
  }

  /** Command centre: a node network where dispatch pulses run along the links,
   *  and the nearest node to the cursor becomes the active incident. */
  const nodes = Array.from({ length: Math.round(12 * props.density) }, (_, i) => ({
    x: 0.12 + rnd(i * 3.7) * 0.76,
    y: 0.16 + rnd(i * 8.1) * 0.68
  }))
  const links = nodes.map((_, i) => [i, Math.floor(rnd(i * 5.5) * nodes.length)] as [number, number])

  const drawDispatch = (t: number) => {
    grid(Math.max(28, W / 11), 0.05)
    const mx = px * W
    const my = py * H

    let hot = 0
    let best = Infinity
    nodes.forEach((n, i) => {
      const d = Math.hypot(n.x * W - mx, n.y * H - my)
      if (d < best) {
        best = d
        hot = i
      }
    })

    links.forEach(([a, bIdx], i) => {
      if (a === bIdx) return
      const p1 = nodes[a]!
      const p2 = nodes[bIdx]!
      const x1 = p1.x * W
      const y1 = p1.y * H
      const x2 = p2.x * W
      const y2 = p2.y * H
      const live = engaged && (a === hot || bIdx === hot)
      line(x1, y1, x2, y2, live ? BRASS : STEEL, live ? 1.3 : 1, live ? 0.6 : 0.32)

      // dispatch pulse running the link
      const k = ((t * (0.28 + rnd(i * 2.2) * 0.3) + rnd(i)) % 1)
      dot(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, live ? 2.6 : 1.9, live ? BRASS : PAPER, live ? 1 : 0.55)
    })

    nodes.forEach((n, i) => {
      const x = n.x * W
      const y = n.y * H
      const isHot = engaged && i === hot
      dot(x, y, isHot ? 5 : 3.2, isHot ? BRASS : PAPER, isHot ? 1 : 0.75)
      if (isHot) {
        ring(x, y, 12 + Math.sin(t * 5) * 4, BRASS, 0.7)
        ring(x, y, 24 + Math.sin(t * 5) * 7, BRASS, 0.25)
      }
    })

    // command bar
    ctx.save()
    ctx.globalAlpha = 0.4
    ctx.fillStyle = STEEL
    ctx.fillRect(W * 0.08, H * 0.92, W * 0.84, 1)
    ctx.globalAlpha = 1
    ctx.fillStyle = BRASS
    const w = W * 0.84 * (0.3 + (Math.sin(t * 0.7) * 0.5 + 0.5) * 0.5)
    ctx.fillRect(W * 0.08, H * 0.92, w, 1)
    ctx.restore()
  }

  const DRAW: Record<string, (t: number) => void> = {
    patrol: drawPatrol,
    crowd: drawCrowd,
    optics: drawOptics,
    facility: drawFacility,
    risk: drawRisk,
    dispatch: drawDispatch
  }

  let t = phase
  const frame = () => {
    if (!W || !H || !props.active) return
    px += (tx - px) * 0.09
    py += (ty - py) * 0.09
    t += 0.016 * props.speed

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, W, H)

    if (props.mirror) {
      ctx.save()
      ctx.translate(W, 0)
      ctx.scale(-1, 1)
    }
    ;(DRAW[props.variant] ?? drawPatrol)(t)
    if (props.mirror) ctx.restore()
  }

  if (reduced) {
    t = 3
    frame()
  } else {
    let ticking = false
    const start = () => {
      if (ticking) return
      gsap.ticker.add(frame)
      ticking = true
    }
    const stop = () => {
      if (!ticking) return
      gsap.ticker.remove(frame)
      ticking = false
    }

    let onScreen = false
    const sync = () => (onScreen && props.active ? start() : stop())

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = !!e?.isIntersecting
        sync()
      },
      { threshold: 0 }
    )
    io.observe(el)
    // a stacked layer that is technically on-screen but not the live one must
    // not burn frames
    const stopWatch = watch(() => props.active, sync)
    cleanup = () => {
      stop()
      stopWatch()
      io.disconnect()
      ro.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
    return
  }

  cleanup = () => {
    ro.disconnect()
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="svc" :class="bare && 'svc--bare'" :data-variant="variant">
    <canvas ref="cnv" aria-hidden="true" />
  </div>
</template>

<style scoped lang="scss">
.svc {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--ink);

  canvas {
    display: block;
  }

  /* the same grain and vignette the photographic plates carry */
  &--bare::after {
    display: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(120% 100% at 50% 50%, transparent 52%, rgba(8, 9, 11, 0.72) 100%);
  }
}
</style>
