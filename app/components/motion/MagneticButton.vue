<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const props = withDefaults(
  defineProps<{
    to?: string
    label: string
    strength?: number
    variant?: 'solid' | 'ghost' | 'huge'
    cursor?: string
  }>(),
  { strength: 0.42, variant: 'solid', cursor: '' }
)

// When `to` is set, `tag` resolves to NuxtLink — a component, not a DOM
// node — so a template ref on it yields the component instance rather than
// an element. `$el` is always present on a component's public instance and
// points at its root DOM node, so it works for both the `button` and
// NuxtLink cases.
const root = ref<HTMLElement | { $el: HTMLElement } | null>(null)
const inner = ref<HTMLElement | null>(null)
const el = computed<HTMLElement | null>(() => {
  const v = root.value as any
  return v ? (v.$el ?? v) : null
})
const { set, reset } = useCursor()
const { isFine } = usePointer()

let qx: ((v: number) => void) | null = null
let qy: ((v: number) => void) | null = null
let ix: ((v: number) => void) | null = null
let iy: ((v: number) => void) | null = null

onMounted(() => {
  if (!el.value || !inner.value) return
  qx = gsap.quickTo(el.value, 'x', { duration: 0.7, ease: 'power3.out' })
  qy = gsap.quickTo(el.value, 'y', { duration: 0.7, ease: 'power3.out' })
  ix = gsap.quickTo(inner.value, 'x', { duration: 0.9, ease: 'power3.out' })
  iy = gsap.quickTo(inner.value, 'y', { duration: 0.9, ease: 'power3.out' })
})

const onMove = (e: PointerEvent) => {
  if (!el.value || !isFine.value) return
  const r = el.value.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  qx?.(dx * props.strength)
  qy?.(dy * props.strength)
  ix?.(dx * props.strength * 0.34)
  iy?.(dy * props.strength * 0.34)
}

const onLeave = () => {
  qx?.(0)
  qy?.(0)
  ix?.(0)
  iy?.(0)
  reset()
}

const onEnter = () => props.cursor && set('label', props.cursor)

const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))
</script>

<template>
  <component
    :is="tag"
    :to="to"
    ref="root"
    class="mag"
    :class="`mag--${variant}`"
    @pointermove="onMove"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <span ref="inner" class="mag__inner">
      <span class="mag__labels">
        <span class="mag__l">{{ label }}</span>
        <span class="mag__l mag__l--dup" aria-hidden="true">{{ label }}</span>
      </span>
      <svg class="mag__arw" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4" />
      </svg>
    </span>
  </component>
</template>

<style scoped lang="scss">
.mag {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  will-change: transform;
  -webkit-tap-highlight-color: transparent;
}

.mag__inner {
  display: inline-flex;
  align-items: center;
  gap: 0.9em;
  will-change: transform;
}

.mag__labels {
  position: relative;
  display: block;
  overflow: hidden;
}

.mag__l {
  display: block;
  transition: transform 0.62s var(--ease);
}

.mag__l--dup {
  position: absolute;
  inset: 0;
  transform: translateY(105%);
}

.mag:hover .mag__l {
  transform: translateY(-105%);
}
.mag:hover .mag__l--dup {
  transform: translateY(0);
}

.mag__arw {
  width: 1.15em;
  height: 1.15em;
  overflow: visible;
  transition: transform 0.62s var(--ease);
}
.mag:hover .mag__arw,
.mag:focus-visible .mag__arw {
  transform: translateX(0.32em);
}

/* variants */
.mag--solid {
  padding: 1.15em 2.1em;
  /* the shape itself transforms on interaction, not just its colour */
  border-radius: 999px;
  transition: border-radius 0.6s var(--ease), background-color 0.5s var(--ease);
  background: var(--fg);
  color: var(--bg);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: -0.015em;
}

.mag--ghost {
  padding: 1.05em 1.9em;
  border-radius: 999px;
  border: 1px solid var(--rule);
  font-size: 0.86rem;
  font-weight: 500;
  transition: border-color 0.5s var(--ease), background-color 0.5s var(--ease),
    border-radius 0.6s var(--ease);
}
.mag--ghost:hover,
.mag--ghost:focus-visible {
  border-color: color-mix(in srgb, var(--fg) 46%, transparent);
  border-radius: 10px;
}

/* Shape morphs on interaction — declared after the variants so it wins. */
.mag--solid:hover,
.mag--solid:focus-visible {
  border-radius: 12px;
}

.mag--huge {
  width: clamp(150px, 15.5vw, 250px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--brass);
  color: var(--ink);
  font-size: clamp(0.86rem, 1.02vw, 1.02rem);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.055em;

  .mag__inner {
    flex-direction: column;
    gap: 0.55em;
  }
  .mag__arw {
    width: 1.5em;
    height: 1.5em;
    transform: rotate(-45deg);
  }
  &:hover .mag__arw {
    transform: rotate(-45deg) translateX(0.3em);
  }
}
</style>
