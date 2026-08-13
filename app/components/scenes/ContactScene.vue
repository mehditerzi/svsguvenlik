<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { brand } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const { pointer, isFine } = usePointer()

useScene((_ctx, el) => {
  const lines = gsap.utils.toArray<HTMLElement>('.cta__l span', el)

  gsap.fromTo(
    lines,
    { yPercent: 116 },
    {
      yPercent: 0,
      duration: 1.3,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 72%', once: true }
    }
  )

  matchScene({
    desktop: () => {
      // the whole word-block warps toward the pointer — soft, never twitchy
      if (isFine.value) {
        const rows = gsap.utils.toArray<HTMLElement>('.cta__l', el)
        const qs = rows.map((r) => ({
          x: gsap.quickTo(r, 'x', { duration: 1.5, ease: 'power3.out' }),
          y: gsap.quickTo(r, 'y', { duration: 1.5, ease: 'power3.out' })
        }))
        gsap.ticker.add(() => {
          qs.forEach((q, i) => {
            const f = 1 - i * 0.22
            q.x(pointer.nx * 34 * f)
            q.y(pointer.ny * 16 * f)
          })
        })
      }

      gsap.fromTo(
        '.cta__glow',
        { scale: 0.85, opacity: 0.35 },
        {
          scale: 1.15,
          opacity: 0.75,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )
    }
  })

  gsap.fromTo(
    '.cta__row',
    { yPercent: 60, autoAlpha: 0 },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.cta__foot', start: 'top 88%', once: true }
    }
  )
}, root)
</script>

<template>
  <section ref="root" class="cta section on-ink stage">
    <div class="cta__glow" aria-hidden="true" />

    <div class="cta__body shell">
      <span class="meta meta--brass">07 — İletişim</span>

      <h2 class="cta__h display">
        <span class="cta__l line-mask"><span>SAHANIZI</span></span>
        <span class="cta__l line-mask"><span>BİRLİKTE</span></span>
        <span class="cta__l line-mask"><span>KURALIM.</span></span>
      </h2>

      <div class="cta__btn">
        <MotionMagneticButton to="/iletisim" label="Teklif alın" variant="huge" :strength="0.5" cursor="Yaz" />
      </div>
    </div>

    <div class="cta__foot shell">
      <a class="cta__row" :href="`tel:${brand.phone.replace(/\s/g, '')}`">
        <span class="meta">Telefon</span>
        <span class="cta__val">{{ brand.phone }}</span>
      </a>
      <a class="cta__row" :href="`mailto:${brand.mail}`">
        <span class="meta">E-posta</span>
        <span class="cta__val">{{ brand.mail }}</span>
      </a>
      <div class="cta__row">
        <span class="meta">Komuta merkezi</span>
        <span class="cta__val">7/24 · 365 gün</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  position: relative;
  z-index: 7;
  padding-block: clamp(84px, 16vh, 220px) clamp(60px, 10vh, 140px);
  overflow: clip;
}

.cta__glow {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 120vw;
  height: 90vh;
  translate: -50% -50%;
  background: radial-gradient(46% 44% at 50% 50%, rgba(192, 139, 60, 0.28), rgba(192, 139, 60, 0) 68%);
  pointer-events: none;
  will-change: transform, opacity;
}

.cta__body {
  position: relative;
  display: grid;
  gap: clamp(1.4rem, 4vh, 3rem);
  justify-items: center;
  text-align: center;
}

.cta__h {
  display: grid;
  row-gap: 0.2em;
  font-size: clamp(2.6rem, 12vw, 14.5rem);
  line-height: 0.84;
  letter-spacing: -0.055em;
}

.cta__l {
  display: block;
  will-change: transform;

  span {
    display: block;
    will-change: transform;
  }
}

.cta__l:nth-child(2) {
  color: transparent;
  -webkit-text-stroke: 1.4px color-mix(in srgb, var(--paper) 62%, transparent);
}

.cta__btn {
  margin-top: clamp(0.6rem, 3vh, 2.2rem);
}

.cta__foot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.6rem;
  margin-top: clamp(3rem, 10vh, 8rem);
  border-top: 1px solid var(--rule);
  padding-top: clamp(1.4rem, 3vh, 2.4rem);
}

.cta__row {
  display: grid;
  gap: 0.5rem;
  will-change: transform, opacity;
}

.cta__val {
  font-size: clamp(1.05rem, 1.5vw, 1.5rem);
  letter-spacing: -0.028em;
  position: relative;
  width: fit-content;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 100%;
    height: 1px;
    background: var(--brass);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.6s var(--ease);
  }
}

a.cta__row:hover .cta__val::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (max-width: 640px) {
  .cta__foot {
    grid-template-columns: 1fr;
    gap: 1.3rem;
  }
}
</style>
