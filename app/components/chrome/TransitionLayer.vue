<script setup lang="ts">
import { gsap, stopScroll, startScroll, scrollToTop } from '~/composables/useMotion'
import { lerpShape, toPath, type Pt } from '~/composables/useMorph'

/**
 * Owns both the first-load intro and every route change. The same slab curtain
 * does the work: on load it lifts away, on navigation it closes over the old
 * page and opens on the new one, so nothing ever just pops.
 */
const root = ref<HTMLElement | null>(null)
const counter = ref(0)
const introDone = ref(false)

const curtain = useCurtain()

// Route-to-route navigation only (never the first-load intro): shows where
// you're headed while the curtain is closed, so the wait reads as progress
// instead of a blank flash.
const navLabel = ref('')
const navShown = ref(false)
const navIdx = computed(() => navLabel.value.split(' — ')[0] ?? '')
const navName = computed(() => navLabel.value.split(' — ')[1] ?? navLabel.value)

/**
 * The route curtain is a morphing sheet, not a straight edge: a curved leading
 * lip flattens as it covers and bows again as it leaves, so the page change
 * reads as one continuous shape transforming.
 */
const sheet = ref('')
const W = 100
const H = 100

const arc = (bow: number): Pt[] => {
  const pts: Pt[] = []
  const N = 24
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * W
    pts.push([x, Math.sin((i / N) * Math.PI) * bow])
  }
  return pts
}

const drawSheet = (y: number, bow: number) => {
  const lip = arc(bow)
  let d = `M0,${(y + lip[0]![1]).toFixed(2)}`
  for (let i = 1; i < lip.length; i++) {
    const prev = lip[i - 1]!
    const cur = lip[i]!
    const cx = (prev[0] + cur[0]) / 2
    d += `Q${cx.toFixed(2)},${(y + prev[1]).toFixed(2)} ${cur[0].toFixed(2)},${(y + cur[1]).toFixed(2)}`
  }
  d += `L${W},${H + 40}L0,${H + 40}Z`
  sheet.value = d
}
drawSheet(H + 40, 0)

const slabs = () => gsap.utils.toArray<HTMLElement>('.trs__slab', root.value!)

onMounted(() => {
  stopScroll()
  scrollToTop()

  const el = root.value!
  const brandEl = el.querySelector('.trs__brand')!
  const barEl = el.querySelector('.trs__bar-fill')!

  // The intro is a first-impression, not a toll booth. Returning within the
  // session skips straight to a quick wipe — nobody should watch a counter
  // fill twice.
  const seen = sessionStorage.getItem('svs:seen') === '1'
  sessionStorage.setItem('svs:seen', '1')

  const done = () => {
    introDone.value = true
    startScroll()
    document.documentElement.classList.add('is-ready')
    window.dispatchEvent(new Event('site:ready'))
  }

  if (seen) {
    gsap
      .timeline()
      .set(slabs(), { yPercent: 0 })
      .set([brandEl, el.querySelector('.trs__meta')!], { autoAlpha: 0 })
      .to(slabs(), { yPercent: -100, duration: 0.5, stagger: 0.03, ease: 'expo.inOut' }, 0.05)
      .add(done, '-=0.34')
    return
  }

  const o = { v: 0 }
  gsap
    .timeline()
    .set(slabs(), { yPercent: 0 })
    .fromTo(brandEl, { yPercent: 120 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, 0.05)
    .to(barEl, { scaleX: 1, duration: 0.62, ease: 'power2.inOut' }, 0.1)
    .to(o, { v: 100, duration: 0.62, ease: 'power2.inOut', onUpdate: () => (counter.value = Math.round(o.v)) }, 0.1)
    .to(brandEl, { yPercent: -120, duration: 0.42, ease: 'expo.in' }, '+=0.02')
    .to(el.querySelector('.trs__meta')!, { autoAlpha: 0, duration: 0.3 }, '<')
    .to(slabs(), { yPercent: -100, duration: 0.62, stagger: 0.03, ease: 'expo.inOut' }, '-=0.18')
    .add(done, '-=0.42')
})

// Self-healing: if the GSAP tween never fires onComplete (a stalled rAF, a
// tab-visibility hiccup, anything), the caller's own timeout only unblocks
// Vue's transition state machine — the ink sheet would stay visually stuck
// covering the screen forever. Race each tween against a timeout that snaps
// straight to the end state, so the curtain always actually resolves.
const settleOnce = (resolve: () => void) => {
  let settled = false
  return (forceEnd?: () => void, timeoutMs?: number) => {
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    if (timeoutMs != null) {
      setTimeout(() => {
        if (settled) return
        forceEnd?.()
        finish()
      }, timeoutMs)
    }
    return finish
  }
}

// wire the curtain API used by the router hooks
curtain.register({
  cover: (label) =>
    new Promise<void>((resolve) => {
      const settle = settleOnce(resolve)
      stopScroll()
      gsap.set(slabs(), { yPercent: 100, autoAlpha: 0 })
      if (introDone.value && label) {
        navLabel.value = label
        navShown.value = true
      }
      const o = { y: H + 40, bow: 26 }
      const finish = settle(() => drawSheet(0, 0), 900)
      gsap.to(o, {
        y: 0,
        bow: 0,
        duration: 0.34,
        ease: 'power3.inOut',
        onUpdate: () => drawSheet(o.y, o.bow),
        onComplete: finish
      })
    }),
  reveal: () =>
    new Promise<void>((resolve) => {
      const settle = settleOnce(resolve)
      // Hand control back immediately: the new page plays its entrance while
      // the sheet is still lifting, instead of waiting for it to clear.
      startScroll()
      window.dispatchEvent(new Event('site:ready'))
      navShown.value = false

      const o = { y: 0, bow: 0 }
      const finish = settle(() => drawSheet(-(H + 40), -26), 1200)
      gsap.to(o, {
        y: -(H + 40),
        bow: -26,
        duration: 0.62,
        ease: 'expo.inOut',
        onUpdate: () => drawSheet(o.y, o.bow),
        onComplete: finish
      })
    })
})
</script>

<template>
  <div ref="root" class="trs" :class="introDone && 'trs--idle'" aria-hidden="true">
    <div class="trs__slabs">
      <span v-for="n in 5" :key="n" class="trs__slab" />
    </div>

    <!-- morphing route sheet -->
    <svg class="trs__sheet" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <path :d="sheet" />
    </svg>

    <!-- route-change label: not shown for the first-load intro -->
    <div class="trs__navlabel shell" :class="navShown && 'trs__navlabel--on'">
      <span class="meta meta--brass trs__navlabel-idx">{{ navIdx }}</span>
      <span class="trs__navlabel-name">{{ navName }}</span>
      <div class="trs__bar trs__navlabel-bar"><span class="trs__bar-fill" /></div>
    </div>

    <div class="trs__content shell">
      <div class="trs__brand-mask">
        <div class="trs__brand">
          <img class="trs__logo" src="/media/logo-full.webp" alt="SVS Shadow VIP Security" width="440" height="396" fetchpriority="high" decoding="async" />
        </div>
      </div>
      <div class="trs__meta">
        <div class="trs__bar"><span class="trs__bar-fill" /></div>
        <span class="meta">Sistem yükleniyor — {{ counter }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.trs {
  position: fixed;
  inset: 0;
  z-index: 950;
  pointer-events: none;
}

.trs__slabs {
  position: absolute;
  inset: 0;
  display: flex;
}

.trs__slab {
  flex: 1;
  background: var(--ink-2);
  will-change: transform;

  & + & {
    margin-left: -1px;
  }
}

.trs__sheet {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;

  path {
    fill: var(--ink-2);
  }
}

.trs__content {
  position: absolute;
  inset: auto 0 0 0;
  padding-bottom: clamp(28px, 6vh, 64px);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  color: var(--paper);
}

.trs--idle .trs__content {
  display: none;
}

.trs__brand-mask {
  overflow: hidden;
}

.trs__brand {
  display: flex;
  align-items: flex-end;
  will-change: transform;
}

.trs__logo {
  width: clamp(120px, 15vw, 210px);
  height: auto;
}

.trs__word--dim {
  font-size: 0.28em;
  font-family: var(--font-mono);
  font-weight: 400;
  letter-spacing: 0.3em;
  opacity: 0.55;
}

.trs__meta {
  display: grid;
  gap: 0.7rem;
  justify-items: end;
  min-width: 220px;
}

.trs__bar {
  width: 100%;
  height: 1px;
  background: rgba(237, 233, 225, 0.18);
}

.trs__bar-fill {
  display: block;
  height: 100%;
  background: var(--brass);
  transform: scaleX(0);
  transform-origin: left;
}

.trs__navlabel {
  position: absolute;
  inset: auto 0 0 0;
  padding-bottom: clamp(28px, 6vh, 64px);
  display: grid;
  gap: 0.6rem;
  justify-items: start;
  color: var(--paper);
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.32s var(--ease), transform 0.32s var(--ease);
}

.trs__navlabel--on {
  opacity: 1;
  transform: translateY(0);
}

.trs__navlabel-name {
  font-size: clamp(1.6rem, 4vw, 3rem);
  font-weight: 500;
  letter-spacing: -0.03em;
}

.trs__navlabel-bar {
  width: clamp(160px, 22vw, 280px);
  margin-top: 0.4rem;

  .trs__bar-fill {
    transition: transform 0.85s var(--ease);
  }
}

.trs__navlabel--on .trs__navlabel-bar .trs__bar-fill {
  transform: scaleX(1);
}

@media (max-width: 640px) {
  .trs__content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.6rem;
  }
  .trs__meta {
    justify-items: start;
    width: 100%;
  }
}
</style>
