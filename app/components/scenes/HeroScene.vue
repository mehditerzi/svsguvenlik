<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const root = ref<HTMLElement | null>(null)
const spot = ref<HTMLElement | null>(null)
const { pointer, isFine } = usePointer()

// live-looking telemetry — small, constant movement is what sells "operational"
const sites = ref(214)
const resp = ref(538)

useScene((_ctx, el) => {
  const stage = el.querySelector('.hero__stage') as HTMLElement
  const lines = gsap.utils.toArray<HTMLElement>('.hero__line span', el)
  const plate = el.querySelector('.hero__plate') as HTMLElement
  const foot = gsap.utils.toArray<HTMLElement>('.hero__foot > *', el)
  const cue = el.querySelector('.hero__cue') as HTMLElement
  const hud = el.querySelector('.hero__hud') as HTMLElement
  const brackets = el.querySelectorAll('.hero__bracket')

  // ── entrance ───────────────────────────────────────────────────────────────
  gsap.set(lines, { yPercent: 116 })
  gsap.set(plate, { clipPath: 'inset(100% 0% 0% 0%)' })
  gsap.set(plate.querySelector('img'), { scale: 1.35 })
  gsap.set(foot, { yPercent: 120, autoAlpha: 0 })
  gsap.set(cue, { autoAlpha: 0, y: -14 })
  gsap.set(hud, { autoAlpha: 0, x: 26 })
  gsap.set(brackets, { scale: 0.4, autoAlpha: 0 })

  const intro = gsap
    .timeline({ paused: true })
    .to(lines, { yPercent: 0, duration: 1.35, stagger: 0.085, ease: 'expo.out' })
    .to(plate, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' }, 0.25)
    .to(plate.querySelector('img'), { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.3)
    .to(foot, { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.09, ease: 'expo.out' }, 0.72)
    .to(hud, { autoAlpha: 1, x: 0, duration: 1, ease: 'expo.out' }, 0.95)
    .to(brackets, { scale: 1, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'expo.out' }, 1.05)
    .to(cue, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.15)

  if (document.documentElement.classList.contains('is-ready')) intro.play()
  else window.addEventListener('site:ready', () => intro.play(), { once: true })

  // ── scroll exit: three layers leave at three speeds ────────────────────────
  const out = gsap.timeline({
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.65 }
  })
  out
    .to('.hero__type', { yPercent: -46, ease: 'none' }, 0)
    .to('.hero__plate', { yPercent: -14, scale: 1.08, ease: 'none' }, 0)
    .to('.hero__foot', { yPercent: 90, autoAlpha: 0, ease: 'none' }, 0)
    .to('.hero__hud', { xPercent: 40, autoAlpha: 0, ease: 'none' }, 0)
    .to('.hero__veil', { opacity: 1, ease: 'none' }, 0)
    .to(stage, { scale: 0.94, ease: 'none' }, 0)

  // ── telemetry: drifts continuously, never repeats the same second ─────────
  const tick = gsap.timeline({ repeat: -1 })
  tick.to({}, {
    duration: 2.4,
    repeat: -1,
    onRepeat: () => {
      sites.value = 210 + Math.round(Math.random() * 9)
      resp.value = 505 + Math.round(Math.random() * 70)
    }
  })

  // ── pointer drift ──────────────────────────────────────────────────────────
  if (isFine.value) {
    const qx = gsap.quickTo('.hero__plate', 'x', { duration: 1.3, ease: 'power3.out' })
    const qy = gsap.quickTo('.hero__plate', 'y', { duration: 1.3, ease: 'power3.out' })
    const tx = gsap.quickTo('.hero__type', 'x', { duration: 1.6, ease: 'power3.out' })
    // the spotlight follows with more weight than the plates
    const sx = gsap.quickTo(spot.value!, 'x', { duration: 0.9, ease: 'power3.out' })
    const sy = gsap.quickTo(spot.value!, 'y', { duration: 0.9, ease: 'power3.out' })

    gsap.ticker.add(() => {
      qx(pointer.nx * -26)
      qy(pointer.ny * -16)
      tx(pointer.nx * 12)
      sx(pointer.x)
      sy(pointer.y)
    })
  }
}, root)
</script>

<template>
  <section ref="root" class="hero section">
    <div class="hero__sticky">
      <div class="hero__stage">
        <GlFogCity scroll-target=".hero" />

        <!-- pointer spotlight: lifts the city out of the dark where you look -->
        <div ref="spot" class="hero__spot" aria-hidden="true" />
        <div class="hero__vignette" aria-hidden="true" />
        <div class="hero__veil" />

        <figure class="hero__plate plate plate--graded">
          <NuxtImg src="/media/hero-tower.webp" alt="" preload />
        </figure>

        <div class="hero__type shell">
          <h1 class="hero__h display d-xl">
            <span class="hero__line line-mask hero__line--a"><span>SAHAYI</span></span>
            <span class="hero__line line-mask hero__line--b"><span>GÖREN</span></span>
            <span class="hero__line line-mask hero__line--c"><span>GÜVENLİK</span></span>
          </h1>
        </div>

        <div class="hero__foot shell">
          <div class="hero__meta">
            <span class="meta meta--brass">Est. 2008</span>
            <span class="meta">81 il · 7/24 komuta merkezi</span>
          </div>

          <p class="hero__lede lede">
            Özel güvenlik, tesis yönetimi ve güvenlik teknolojilerini tek operasyon masasında birleştiriyoruz.
          </p>

          <NuxtLink to="/faaliyet-alanlari" class="hero__link">
            <span>Faaliyet alanlarımız</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.3" /></svg>
          </NuxtLink>
        </div>

        <!-- live operations read-out -->
        <div class="hero__hud" aria-hidden="true">
          <span class="hero__bracket hero__bracket--tl" />
          <span class="hero__bracket hero__bracket--tr" />
          <div class="hero__hud-rows">
            <div class="hero__hud-row">
              <span class="meta">Aktif saha</span>
              <span class="hero__hud-v">{{ sites }}</span>
            </div>
            <div class="hero__hud-row">
              <span class="meta">Müdahale</span>
              <span class="hero__hud-v">{{ resp }}<i>sn</i></span>
            </div>
            <div class="hero__hud-row">
              <span class="meta">Komuta</span>
              <span class="hero__hud-v hero__hud-v--live">Çevrimiçi</span>
            </div>
          </div>
        </div>

        <div class="hero__cue">
          <span class="hero__cue-line"><i /></span>
          <span class="meta">Kaydır</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  height: 118svh;
  background: var(--ink);
}

.hero__sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: clip;
}

.hero__stage {
  position: absolute;
  inset: 0;
  will-change: transform;
}

/* Spotlight: a soft brass light that follows the pointer and lifts the city
   out of the shadows. `screen` so it only ever adds light. */
.hero__spot {
  position: absolute;
  top: 0;
  left: 0;
  width: 46vmax;
  height: 46vmax;
  margin: -23vmax 0 0 -23vmax;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: screen;
  background: radial-gradient(
    closest-side,
    rgba(206, 164, 94, 0.46) 0%,
    rgba(150, 175, 210, 0.2) 40%,
    rgba(0, 0, 0, 0) 72%
  );
  opacity: 0;
  transition: opacity 0.8s var(--ease);
}

html.has-cursor .hero__spot {
  opacity: 1;
}

/* Deepens the corners so the centre reads brighter — the contrast lift. */
.hero__vignette {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(100% 80% at 50% 46%, rgba(10, 11, 13, 0) 46%, rgba(10, 11, 13, 0.58) 100%),
    linear-gradient(180deg, rgba(10, 11, 13, 0.52) 0%, rgba(10, 11, 13, 0) 24%);
}

/* ── operations HUD ──────────────────────────────────────────────────────── */
.hero__hud {
  position: absolute;
  top: 18svh;
  right: var(--gut);
  z-index: 6;
  padding: 1rem 1.2rem;
  min-width: 190px;
  color: var(--paper);
  will-change: transform;
  border: 1px solid rgba(237, 233, 225, 0.12);
  background: rgba(10, 11, 13, 0.34);
  backdrop-filter: blur(8px);
}

.hero__hud-rows {
  display: grid;
  gap: 0.55rem;
}

.hero__hud-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.2rem;
}

.hero__hud-v {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-variant-numeric: tabular-nums;
  color: var(--brass);

  i {
    font-style: normal;
    font-size: 0.66em;
    opacity: 0.7;
    margin-left: 1px;
  }
}

.hero__hud-v--live {
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  font-size: 0.74rem;
  color: var(--paper);

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #63c98a;
    animation: hero-live 1.8s ease-in-out infinite;
  }
}

@keyframes hero-live {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}

.hero__bracket {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1px solid var(--brass);

  &--tl { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
  &--tr { top: -1px; right: -1px; border-left: 0; border-bottom: 0; }
}

.hero__veil {
  position: absolute;
  inset: 0;
  background: var(--ink);
  opacity: 0;
  z-index: 5;
  pointer-events: none;
}

/* foreground media, deliberately sitting between headline lines */
.hero__plate {
  position: absolute;
  top: 12svh;
  right: clamp(20px, 6vw, 128px);
  width: clamp(180px, 24vw, 380px);
  height: clamp(280px, 46svh, 520px);
  z-index: 3;
  will-change: transform, clip-path;
}

.hero__type {
  position: absolute;
  inset: auto 0 20svh 0;
  z-index: 4;
  pointer-events: none;
  will-change: transform;
}

.hero__h {
  display: grid;
  row-gap: 0.16em;
  color: var(--paper);
}

.hero__line span {
  display: block;
  will-change: transform;
}

.hero__line--b {
  padding-left: 6.2vw;
}
.hero__line--c {
  padding-left: 1.4vw;
}

.hero__foot {
  position: absolute;
  inset: auto 0 clamp(28px, 5svh, 58px) 0;
  z-index: 6;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr) auto;
  align-items: end;
  gap: clamp(1.2rem, 3vw, 3rem);
  color: var(--paper);
  will-change: transform;
}

.hero__meta {
  display: grid;
  gap: 0.4rem;
}

.hero__lede {
  max-width: 34ch;
  opacity: 0.82;
}

.hero__link {
  display: inline-flex;
  align-items: center;
  gap: 0.7em;
  font-size: 0.94rem;
  padding-bottom: 0.3em;
  border-bottom: 1px solid color-mix(in srgb, var(--paper) 35%, transparent);
  transition: border-color 0.5s var(--ease), gap 0.5s var(--ease);

  svg {
    width: 1.05em;
    height: 1.05em;
  }
  &:hover {
    border-color: var(--brass);
    gap: 1.1em;
  }
}

/* Runs up the left gutter so it never collides with the closing paragraph. */
.hero__cue {
  position: absolute;
  left: calc(var(--gut) - 4px);
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  writing-mode: vertical-rl;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: var(--paper);
}

.hero__cue-line {
  display: block;
  width: 1px;
  height: 68px;
  background: color-mix(in srgb, var(--paper) 18%, transparent);
  overflow: hidden;

  i {
    display: block;
    width: 100%;
    height: 40%;
    background: var(--brass);
    animation: cue 2.4s cubic-bezier(0.76, 0, 0.24, 1) infinite;
  }
}

@keyframes cue {
  0% { transform: translateY(-100%); }
  55%, 100% { transform: translateY(250%); }
}

@media (max-width: 1024px) {
  .hero__hud {
    top: auto;
    bottom: 27svh;
    right: var(--gut);
    min-width: 0;
    padding: 0.7rem 0.9rem;
  }
  .hero__hud-row {
    gap: 0.9rem;
  }

  .hero__foot {
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }
  .hero__cue {
    display: none;
  }
  .hero__plate {
    top: 9svh;
    right: 20px;
    width: 44vw;
    height: 34svh;
  }
  .hero__type {
    bottom: 34svh;
  }
  .hero__line--b {
    padding-left: 10vw;
  }
}

@media (max-width: 640px) {
  .hero__type {
    bottom: 38svh;
  }
  .hero__lede {
    font-size: 1rem;
  }
}
</style>
