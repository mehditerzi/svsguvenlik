<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

/**
 * Display type as a moving object: each line drifts horizontally at its own
 * rate while the block is in view, so the heading never sits still and can
 * deliberately overrun the viewport edges.
 */
const props = withDefaults(
  defineProps<{ lines: string[]; drift?: number[]; as?: string; scrub?: number }>(),
  { as: 'h2', scrub: 1 }
)

const root = ref<HTMLElement | null>(null)

useScene((_ctx, el) => {
  const lines = gsap.utils.toArray<HTMLElement>('.kh__l', el)

  matchScene({
    desktop: () => {
      lines.forEach((line, i) => {
        const d = props.drift?.[i] ?? (i % 2 === 0 ? -9 : 9)
        gsap.fromTo(
          line,
          { xPercent: -d * 0.55 },
          {
            xPercent: d,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: props.scrub }
          }
        )
      })
    },
    all: () => {
      gsap.fromTo(
        lines.map((l) => l.firstElementChild),
        { yPercent: 106 },
        {
          yPercent: 0,
          duration: 1.25,
          stagger: 0.085,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      )
    }
  })
}, root)
</script>

<template>
  <component :is="as" ref="root" class="kh display">
    <span v-for="(l, i) in lines" :key="i" class="kh__l line-mask"><span class="kh__t">{{ l }}</span></span>
  </component>
</template>

<style scoped lang="scss">
.kh {
  width: 100%;
}
.kh__l {
  display: block;
  white-space: nowrap;
  will-change: transform;
}
.kh__t {
  display: block;
  will-change: transform;
}
</style>
