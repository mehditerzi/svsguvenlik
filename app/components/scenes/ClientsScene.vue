<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { clients } from '~/data/site'

const root = ref<HTMLElement | null>(null)

useScene((_ctx, el) => {
  // Two counter-running belts. Scroll velocity bends their speed and skew, so
  // the band physically reacts to how hard the user is scrolling.
  const belts = gsap.utils.toArray<HTMLElement>('.cli__belt', el)
  const tweens = belts.map((belt, i) =>
    gsap.to(belt, {
      xPercent: i % 2 === 0 ? -50 : 50,
      duration: 34,
      ease: 'none',
      repeat: -1
    })
  )

  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-2.6, 2.6, self.getVelocity() / 620)
      tweens.forEach((t, i) => {
        t.timeScale(1 + Math.abs(v) * 1.6)
        gsap.to(belts[i]!, { skewX: v * (i % 2 === 0 ? 2.4 : -2.4), duration: 0.6, overwrite: 'auto' })
      })
    }
  })

  gsap.fromTo(
    '.cli__rule',
    { scaleX: 0 },
    { scaleX: 1, duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 82%', once: true } }
  )
}, root)

const doubled = [...clients, ...clients]
</script>

<template>
  <section ref="root" class="cli section on-ink">
    <div class="cli__head shell">
      <span class="meta meta--brass">Bize güvenen kurumlar</span>
      <span class="meta">Uzun soluklu iş ortaklıkları</span>
    </div>
    <span class="cli__rule rule" />

    <div class="cli__track">
      <div class="cli__belt">
        <span v-for="(c, i) in doubled" :key="`a${i}`" class="cli__item">
          {{ c }}<i class="cli__dot" />
        </span>
      </div>
    </div>

    <div class="cli__track cli__track--alt">
      <div class="cli__belt">
        <span v-for="(c, i) in doubled" :key="`b${i}`" class="cli__item cli__item--ghost">
          {{ c }}<i class="cli__dot" />
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cli {
  position: relative;
  z-index: 5;
  padding-block: clamp(52px, 9vh, 120px) clamp(56px, 10vh, 130px);
  overflow: clip;
}

.cli__head {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 1.1rem;
}

.cli__rule {
  margin-inline: var(--gut);
  width: auto;
}

.cli__track {
  margin-top: clamp(1.4rem, 4vh, 3rem);
  overflow: hidden;
}
.cli__track--alt {
  margin-top: 0.2rem;
}

.cli__belt {
  display: flex;
  width: max-content;
  will-change: transform;
}

.cli__item {
  display: inline-flex;
  align-items: center;
  gap: clamp(1.4rem, 3vw, 3rem);
  padding-right: clamp(1.4rem, 3vw, 3rem);
  font-size: clamp(2rem, 5.4vw, 5.4rem);
  font-weight: 500;
  letter-spacing: -0.045em;
  line-height: 1.06;
  white-space: nowrap;
}

.cli__item--ghost {
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--paper) 30%, transparent);
}

.cli__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--brass);
  flex: none;
}

.cli__item--ghost .cli__dot {
  background: color-mix(in srgb, var(--paper) 22%, transparent);
}
</style>
