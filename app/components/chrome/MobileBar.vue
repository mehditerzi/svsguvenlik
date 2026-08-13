<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { brand } from '~/data/site'

/**
 * Touch-only action bar. It rises once the hero is behind you and drops away
 * again at the footer, so the primary actions are always a thumb away without
 * ever covering the closing CTA.
 */
const root = ref<HTMLElement | null>(null)
const menu = useMenu()

onMounted(() => {
  const el = root.value
  if (!el) return
  if (window.matchMedia('(min-width: 1025px)').matches) return

  gsap.set(el, { yPercent: 140 })

  const show = () => gsap.to(el, { yPercent: 0, duration: 0.6, ease: 'expo.out', overwrite: true })
  const hide = () => gsap.to(el, { yPercent: 140, duration: 0.45, ease: 'power3.in', overwrite: true })

  ScrollTrigger.create({
    start: () => window.innerHeight * 1.1,
    end: 'max',
    onEnter: show,
    onEnterBack: show,
    onLeaveBack: hide
  })

  const footer = document.querySelector('.ftr') as HTMLElement | null
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 92%',
      onEnter: hide,
      onLeaveBack: show
    })
  }

  watch(() => menu.open.value, (v) => (v ? hide() : show()))
})
</script>

<template>
  <div ref="root" class="mbar">
    <a class="mbar__btn mbar__btn--ghost" :href="`tel:${brand.phone.replace(/\s/g, '')}`">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
      <span>Ara</span>
    </a>
    <NuxtLink to="/iletisim" class="mbar__btn mbar__btn--solid">
      <span>Teklif alın</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
.mbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 680;
  display: none;
  gap: 10px;
  padding: 10px var(--gut) calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(10, 11, 13, 0) 0%, rgba(10, 11, 13, 0.86) 42%);
  backdrop-filter: blur(10px);
  will-change: transform;
}

@media (max-width: 1024px) {
  .mbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }
}

.mbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6em;
  height: 50px;
  padding-inline: 1.2em;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: -0.015em;
  -webkit-tap-highlight-color: transparent;

  svg {
    width: 1.05em;
    height: 1.05em;
  }
}

.mbar__btn--ghost {
  color: var(--paper);
  border: 1px solid rgba(237, 233, 225, 0.28);
  aspect-ratio: 1;
  padding-inline: 0;
  width: 50px;

  span {
    display: none;
  }
}

.mbar__btn--solid {
  background: var(--brass);
  color: var(--ink);
}

.mbar__btn--solid:active {
  transform: scale(0.985);
}
</style>
