import { gsap, requestScrollRefresh } from './useMotion'

/**
 * Runs `build` once the component is mounted and the scroll engine exists,
 * inside a GSAP context so every tween/ScrollTrigger it creates is reverted
 * together on unmount. This is how all scenes register their choreography —
 * one context per scene, no stray watchers.
 */
export function useScene(build: (ctx: gsap.Context, root: HTMLElement) => void, rootRef?: Ref<HTMLElement | null>) {
  const fallback = ref<HTMLElement | null>(null)
  const root = rootRef ?? fallback
  let ctx: gsap.Context | null = null

  onMounted(async () => {
    useScrollEngine()
    await nextTick()
    if (!root.value) return
    ctx = gsap.context((self) => build(self, root.value as HTMLElement), root.value)
    requestScrollRefresh()
  })

  onBeforeUnmount(() => ctx?.revert())

  return root
}

/** Media-query aware helper: desktop-only choreography, simplified on mobile. */
export function matchScene(handlers: {
  desktop?: (ctx: gsap.Context) => void
  mobile?: (ctx: gsap.Context) => void
  all?: (ctx: gsap.Context) => void
}) {
  const mm = gsap.matchMedia()
  if (handlers.desktop) mm.add('(min-width: 1025px)', handlers.desktop as any)
  if (handlers.mobile) mm.add('(max-width: 1024px)', handlers.mobile as any)
  if (handlers.all) mm.add('all', handlers.all as any)
  return mm
}
