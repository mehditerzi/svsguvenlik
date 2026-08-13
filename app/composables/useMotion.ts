import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

let registered = false
let lenis: Lenis | null = null
let rafHooked = false

/**
 * Single source of truth for the scroll engine. Lenis drives the page, GSAP's
 * ticker drives Lenis, and ScrollTrigger reads scroll position back from Lenis
 * so scrub timelines stay in lockstep with the smoothed scroll value.
 */
export function useScrollEngine() {
  if (import.meta.server) return { lenis: null }

  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    gsap.defaults({ ease: 'power3.out' })
    registered = true
  }

  if (!lenis) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.95,
      lerp: undefined
    })

    lenis.on('scroll', ScrollTrigger.update)

    if (!rafHooked) {
      gsap.ticker.add((time) => lenis?.raf(time * 1000))
      gsap.ticker.lagSmoothing(320, 24)
      rafHooked = true
    }

    // No scrollerProxy: Lenis drives native window scroll, so ScrollTrigger's
    // default scroller is already correct. Proxying it here would flip pinning
    // to transform-based pins and break pinned scenes.
    ScrollTrigger.defaults({ invalidateOnRefresh: true })
  }

  return { lenis }
}

export function useLenis() {
  return lenis
}

export function stopScroll() {
  lenis?.stop()
}

export function startScroll() {
  lenis?.start()
}

export function scrollToTop(immediate = true) {
  lenis?.scrollTo(0, { immediate })
}

let refreshQueued = false

/**
 * ScrollTrigger.refresh() walks every trigger on the page and forces a
 * layout read for each — cheap once, ruinous when every mounting scene
 * calls it individually (a content-heavy page can fire a dozen full-page
 * refreshes on a single navigation). Collapse same-frame requests into one.
 */
export function requestScrollRefresh() {
  if (import.meta.server || refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => {
    refreshQueued = false
    ScrollTrigger.refresh()
  })
}

export { gsap, ScrollTrigger }
