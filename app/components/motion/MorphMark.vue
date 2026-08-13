<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { blob, circle, lerpShape, morphSequence, polygon, shield, toPath } from '~/composables/useMorph'

/**
 * A shape that transforms rather than fades.
 *
 *   scroll  — walks shield → hexagon → circle → square as the section passes
 *   focus   — snaps to the next shape on hover/focus, so interactive elements
 *             physically change form instead of just changing colour
 */
const props = withDefaults(
  defineProps<{
    mode?: 'scroll' | 'focus'
    size?: number
    stroke?: number
    label?: string
    /** Element that drives the scroll morph. Defaults to the enclosing section —
     *  the mark itself is far too small to make a usable scroll range. */
    trigger?: string
  }>(),
  { mode: 'scroll', size: 120, stroke: 1.5 }
)

const root = ref<SVGSVGElement | null>(null)
const path = ref('')
const S = computed(() => props.size)

const SHAPES = [shield(1), polygon(6, 1, 0.16), circle(1), polygon(4, 1, 0.28), shield(1)]
const progress = { t: 0 }

const render = () => {
  const pts = morphSequence(SHAPES, progress.t)
  path.value = toPath(pts, S.value / 2, S.value / 2, S.value * 0.36)
}
render()

const to = (v: number) => gsap.to(progress, { t: v, duration: 0.9, ease: 'expo.out', onUpdate: render })

let host: HTMLElement | null = null
let cleanupScroll: (() => void) | null = null
const onEnter = () => to(0.5)
const onLeave = () => to(0)

onMounted(() => {
  const el = root.value
  if (!el) return

  if (props.mode === 'scroll') {
    const trigger =
      (props.trigger ? document.querySelector<HTMLElement>(props.trigger) : null) ??
      el.closest('section') ??
      el

    const st = ScrollTrigger.create({
      trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progress.t = self.progress
        render()
      }
    })

    // This mounts before the pinned scenes have expanded the document, so the
    // first measurement is stale. Re-measure once the layout has settled.
    const remeasure = () => st.refresh()
    requestAnimationFrame(remeasure)
    window.addEventListener('site:ready', remeasure)
    const late = setTimeout(remeasure, 1200)

    cleanupScroll = () => {
      window.removeEventListener('site:ready', remeasure)
      clearTimeout(late)
      st.kill()
    }
    return
  }

  // Focus mode listens on the enclosing control: the mark is a decoration
  // inside a link or button, and often sits under another layer.
  host = el.closest('a, button') ?? el
  host.addEventListener('pointerenter', onEnter)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('focusin', onEnter)
  host.addEventListener('focusout', onLeave)
})

onBeforeUnmount(() => {
  cleanupScroll?.()
  host?.removeEventListener('pointerenter', onEnter)
  host?.removeEventListener('pointerleave', onLeave)
  host?.removeEventListener('focusin', onEnter)
  host?.removeEventListener('focusout', onLeave)
})

defineExpose({ to })
</script>

<template>
  <svg
    ref="root"
    class="mm"
    :viewBox="`0 0 ${S} ${S}`"
    :width="S"
    :height="S"
    role="img"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <path :d="path" fill="none" stroke="currentColor" :stroke-width="stroke" vector-effect="non-scaling-stroke" />
  </svg>
</template>

<style scoped lang="scss">
.mm {
  display: block;
  overflow: visible;
}
</style>
