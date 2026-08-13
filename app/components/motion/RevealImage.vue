<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

/**
 * Clip-path mask opens while the picture inside settles from an over-scale.
 * The two move at different rates, which is what sells the depth.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    ratio?: string
    from?: 'bottom' | 'left' | 'right' | 'center'
    scale?: number
    parallax?: number
    start?: string
    priority?: boolean
    graded?: boolean
    flat?: boolean
  }>(),
  {
    alt: '',
    ratio: '4 / 3',
    from: 'bottom',
    scale: 1.24,
    parallax: 0,
    start: 'top 88%',
    priority: false,
    graded: true,
    flat: false
  }
)

const root = ref<HTMLElement | null>(null)

const closed: Record<string, string> = {
  bottom: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
  center: 'inset(50% 0% 50% 0%)'
}

useScene((_ctx, el) => {
  const img = el.querySelector('img') as HTMLElement
  gsap.set(el, { clipPath: closed[props.from], willChange: 'clip-path' })
  gsap.set(img, { scale: props.scale })

  gsap
    .timeline({ scrollTrigger: { trigger: el, start: props.start, once: true } })
    .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'expo.inOut' })
    .to(img, { scale: 1, duration: 1.85, ease: 'expo.out' }, 0.05)

  if (props.parallax) {
    gsap.fromTo(
      img,
      { yPercent: -props.parallax },
      {
        yPercent: props.parallax,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      }
    )
  }
}, root)
</script>

<template>
  <figure
    ref="root"
    class="plate ri"
    :class="[graded && 'plate--graded', flat && 'plate--flat']"
    :style="{ aspectRatio: ratio }"
  >
    <NuxtImg :src="src" :alt="alt" :loading="priority ? 'eager' : 'lazy'" :preload="priority" />
  </figure>
</template>

<style scoped lang="scss">
.ri {
  width: 100%;
  img {
    transform-origin: center;
  }
}
</style>
