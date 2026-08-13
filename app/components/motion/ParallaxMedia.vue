<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

/**
 * Depth layer: scroll parallax on the Y axis plus an optional pointer drift.
 * `depth` is the only knob callers need — everything else derives from it.
 */
const props = withDefaults(
  defineProps<{ depth?: number; pointer?: number; scale?: number; disableOnMobile?: boolean }>(),
  { depth: 12, pointer: 0, scale: 1, disableOnMobile: true }
)

const root = ref<HTMLElement | null>(null)
const { pointer: ptr, isFine } = usePointer()

useScene((_ctx, el) => {
  matchScene({
    desktop: () => {
      gsap.fromTo(
        el,
        { yPercent: -props.depth, scale: props.scale },
        {
          yPercent: props.depth,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )

      if (props.pointer && isFine.value) {
        const qx = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' })
        const qy = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' })
        gsap.ticker.add(() => {
          qx(ptr.nx * props.pointer)
          qy(ptr.ny * props.pointer * 0.6)
        })
      }
    },
    mobile: () => {
      if (props.disableOnMobile) return
      gsap.fromTo(
        el,
        { yPercent: -props.depth * 0.45 },
        {
          yPercent: props.depth * 0.45,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )
    }
  })
}, root)
</script>

<template>
  <div ref="root" class="pmx"><slot /></div>
</template>

<style scoped lang="scss">
.pmx {
  will-change: transform;
  height: 100%;
}
</style>
