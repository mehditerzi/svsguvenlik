<script setup lang="ts">
import { requestScrollRefresh, scrollToTop } from '~/composables/useMotion'

useScrollEngine()
usePointer()

const curtain = useCurtain()
const route = useRoute()

const NAV_LABELS: Record<string, string> = {
  '/': '00 — Anasayfa',
  '/kurumsal': '01 — Kurumsal',
  '/faaliyet-alanlari': '02 — Faaliyet alanları',
  '/referanslar': '03 — Referanslar',
  '/iletisim': '04 — İletişim'
}

// Cover/reveal resolve on their own GSAP tween, but if anything ever keeps
// either promise from settling, this ceiling still lets the transition
// finish instead of leaving the curtain stuck shut indefinitely.
const withTimeout = (p: Promise<void>, ms: number) =>
  Promise.race([p, new Promise<void>((resolve) => setTimeout(resolve, ms))])

const pageTransition = {
  name: 'page',
  mode: 'out-in' as const,
  async onLeave(_el: Element, done: () => void) {
    await withTimeout(curtain.cover(NAV_LABELS[route.path]), 1500)
    done()
  },
  async onEnter(_el: Element, done: () => void) {
    scrollToTop()
    // Every scene mounting on the new page schedules its own refresh;
    // requestScrollRefresh() collapses them all into one same-frame call
    // instead of walking every trigger once per scene.
    requestScrollRefresh()
    await withTimeout(curtain.reveal(), 1500)
    done()
  }
}
</script>

<template>
  <div class="root">
    <ChromeTransitionLayer />
    <ChromeSiteMenu />
    <ChromeSiteHeader />

    <div class="page-shell">
      <NuxtPage :transition="pageTransition" />
      <ChromeSiteFooter />
    </div>

    <ChromeMobileBar />
    <ChromeGrainLayer />
    <MotionCustomCursor />
  </div>
</template>

<style lang="scss">
/* Deliberately no `will-change` / `transform` here: either would turn this
   into a containing block for `position: fixed`, which is exactly what
   ScrollTrigger uses to pin scenes. The menu timeline sets will-change
   itself for the duration of its own tween. */
.page-shell {
  position: relative;
  transform-origin: center 40%;
}
</style>
