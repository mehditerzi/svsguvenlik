<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const { pointer, isFine } = usePointer()
const { mode, label } = useCursor()

const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)

let tick: (() => void) | null = null

onMounted(async () => {
  if (!isFine.value) return
  // <ClientOnly> renders on the next tick, so the refs aren't there yet
  await nextTick()
  const d = dot.value
  const r = ring.value
  if (!d || !r) return

  document.documentElement.classList.add('has-cursor')

  let rx = pointer.x
  let ry = pointer.y

  tick = () => {
    // the dot tracks tightly, the ring trails — two speeds read as physical
    rx += (pointer.x - rx) * 0.13
    ry += (pointer.y - ry) * 0.13
    d.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`
    r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
  }
  gsap.ticker.add(tick)
})

onBeforeUnmount(() => {
  if (tick) gsap.ticker.remove(tick)
  document.documentElement.classList.remove('has-cursor')
})
</script>

<template>
  <ClientOnly>
    <div v-if="isFine" class="cur" :class="`cur--${mode}`" aria-hidden="true">
      <div ref="ring" class="cur__ring">
        <span class="cur__label">{{ label }}</span>
      </div>
      <div ref="dot" class="cur__dot" />
    </div>
  </ClientOnly>
</template>

<style scoped lang="scss">
.cur {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

/* Blend per-layer so the knocked-out label reads against any backdrop. */
.cur__dot,
.cur__ring {
  mix-blend-mode: difference;
}

.cur__dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  transition: opacity 0.4s var(--ease), width 0.4s var(--ease), height 0.4s var(--ease);
}

.cur__ring {
  position: absolute;
  top: 0;
  left: 0;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: width 0.55s var(--ease), height 0.55s var(--ease), background-color 0.55s var(--ease),
    border-color 0.55s var(--ease), opacity 0.4s var(--ease), border-radius 0.55s var(--ease),
    rotate 0.7s var(--ease);
}

.cur__label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #fff;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.4s var(--ease), transform 0.5s var(--ease);
  white-space: nowrap;
}

.cur--drag .cur__ring {
  width: 74px;
  height: 74px;
  border-radius: 26%;
  rotate: 45deg;
  background: rgba(255, 255, 255, 0.12);
  border-color: transparent;
}
.cur--drag .cur__dot {
  opacity: 0;
}

.cur--label .cur__ring {
  width: 108px;
  height: 108px;
  border-radius: 42%;
  background: #fff;
  border-color: transparent;
}
.cur--label .cur__label {
  opacity: 1;
  transform: translateY(0);
  color: #000;
}
.cur--label .cur__dot {
  opacity: 0;
}

.cur--hidden .cur__ring,
.cur--hidden .cur__dot {
  opacity: 0;
}
</style>
