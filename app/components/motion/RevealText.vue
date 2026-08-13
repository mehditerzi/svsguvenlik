<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'

/**
 * Scroll-scrubbed word illumination: the paragraph starts dim and each word
 * lifts to full contrast as the block crosses the viewport. Used for long-form
 * statements where a one-shot reveal would be over too quickly.
 */
const props = withDefaults(
  defineProps<{ text: string; as?: string; accent?: string[]; end?: string }>(),
  { as: 'p', end: 'bottom 62%' }
)

const root = ref<HTMLElement | null>(null)
const words = computed(() => props.text.split(' '))
const isAccent = (w: string) => props.accent?.some((a) => w.replace(/[.,;:]/g, '') === a)

useScene((_ctx, el) => {
  const items = el.querySelectorAll<HTMLElement>('.rt__w')
  gsap.fromTo(
    items,
    { opacity: 0.17 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.6,
      scrollTrigger: { trigger: el, start: 'top 78%', end: props.end, scrub: 0.6 }
    }
  )
}, root)
</script>

<template>
  <component :is="as" ref="root" class="rt">
    <span v-for="(w, i) in words" :key="i" class="rt__w" :class="{ 'rt__w--a': isAccent(w) }">{{ w }}</span>
  </component>
</template>

<style scoped lang="scss">
.rt__w {
  display: inline-block;
  margin-right: 0.26em;
  will-change: opacity;
}
.rt__w--a {
  color: var(--brass);
}
</style>
