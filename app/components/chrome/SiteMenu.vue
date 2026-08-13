<script setup lang="ts">
import { gsap, ScrollTrigger, stopScroll, startScroll } from '~/composables/useMotion'
import { brand, nav, sectors } from '~/data/site'

const menu = useMenu()
const root = ref<HTMLElement | null>(null)
const route = useRoute()

let tl: gsap.core.Timeline | null = null

onMounted(() => {
  const el = root.value!
  const panel = el.querySelector('.mnu__panel')!
  const items = el.querySelectorAll('.mnu__item .mnu__t')
  const cols = el.querySelectorAll('.mnu__aside > *')
  const shell = document.querySelector('.page-shell') as HTMLElement | null

  gsap.set(el, { autoAlpha: 0 })

  tl = gsap
    .timeline({
      paused: true,
      onStart: () => gsap.set(el, { autoAlpha: 1 }),
      onReverseComplete: () => {
        gsap.set(el, { autoAlpha: 0 })
        // A lingering transform on the shell would become a containing block
        // for the pinned scenes, so it has to go once the menu is closed.
        if (shell) gsap.set(shell, { clearProps: 'transform,filter,willChange' })
        ScrollTrigger.refresh()
      }
    })
    .fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 1.05, ease: 'expo.inOut' })
    .fromTo(items, { yPercent: 118, rotate: 3 }, { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.075, ease: 'expo.out' }, 0.42)
    .fromTo(cols, { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.85, stagger: 0.08 }, 0.72)

  if (shell) {
    // `.to()` rather than `.fromTo()`: a paused fromTo would immediately stamp
    // transform/filter onto the shell, and either one makes it a containing
    // block for the pinned scenes even at their identity values.
    tl.to(shell, { scale: 0.955, filter: 'brightness(0.55)', duration: 1.05, ease: 'expo.inOut' }, 0)
  }

  watch(
    () => menu.open.value,
    (v) => {
      if (v) {
        stopScroll()
        document.body.classList.add('is-locked')
        tl?.timeScale(1).play()
        setTimeout(() => root.value?.querySelector<HTMLElement>('a[href]')?.focus(), 620)
      } else {
        tl?.timeScale(1.5).reverse()
        document.body.classList.remove('is-locked')
        startScroll()
      }
    }
  )
})

watch(() => route.fullPath, () => menu.close())

/**
 * Escape closes the menu, and while it is open focus is kept inside the panel
 * so tabbing can't wander onto the page behind it.
 */
const onKeydown = (e: KeyboardEvent) => {
  if (!menu.open.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    menu.close()
    ;(document.querySelector('.hdr__burger') as HTMLElement | null)?.focus()
    return
  }

  if (e.key !== 'Tab') return
  const items = root.value?.querySelectorAll<HTMLElement>('a[href], button')
  if (!items?.length) return
  const first = items[0]!
  const last = items[items.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  tl?.kill()
})
</script>

<template>
  <div ref="root" class="mnu" :aria-hidden="!menu.open.value">
    <div class="mnu__panel">
      <div class="mnu__grid shell">
        <nav class="mnu__list" aria-label="Tam ekran menü">
          <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="mnu__item">
            <span class="meta mnu__idx">{{ item.index }}</span>
            <span class="line-mask"><span class="mnu__t display">{{ item.label }}</span></span>
          </NuxtLink>
        </nav>

        <div class="mnu__aside">
          <div class="mnu__block">
            <p class="meta">Faaliyet alanları</p>
            <ul class="mnu__sectors">
              <li v-for="s in sectors" :key="s.id">
                <NuxtLink :to="`/faaliyet-alanlari#${s.id}`">{{ s.title }}</NuxtLink>
              </li>
            </ul>
          </div>
          <div class="mnu__block">
            <p class="meta">İletişim</p>
            <a :href="`tel:${brand.phone.replace(/\s/g, '')}`" class="mnu__line">{{ brand.phone }}</a>
            <a :href="`mailto:${brand.mail}`" class="mnu__line">{{ brand.mail }}</a>
          </div>
          <div class="mnu__block">
            <p class="meta">Merkez</p>
            <p v-for="l in brand.address" :key="l" class="mnu__line mnu__line--dim">{{ l }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mnu {
  position: fixed;
  inset: 0;
  z-index: 690;
  pointer-events: none;
}
.mnu[aria-hidden='false'] {
  pointer-events: auto;
}

.mnu__panel {
  position: absolute;
  inset: 0;
  background: var(--ink-2);
  color: var(--paper);
  will-change: transform;
  display: flex;
  align-items: flex-end;
  padding-block: 120px clamp(32px, 6vh, 72px);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(85% 65% at 12% 100%, rgba(192, 139, 60, 0.16), transparent 68%);
    pointer-events: none;
  }
}

.mnu__grid {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 6rem);
  align-items: end;
}

.mnu__item {
  display: flex;
  align-items: baseline;
  gap: clamp(0.8rem, 1.6vw, 1.8rem);
  padding-block: clamp(0.1rem, 0.6vh, 0.5rem);
}

.mnu__idx {
  flex: none;
  transform: translateY(-0.9em);
  transition: color 0.5s var(--ease);
}

.mnu__t {
  display: block;
  font-size: clamp(2.3rem, 6.2vw, 6.6rem);
  line-height: 0.94;
  white-space: nowrap;
  transition: color 0.55s var(--ease), transform 0.7s var(--ease);
  will-change: transform;
}

@media (hover: hover) {
  .mnu__item:hover .mnu__t {
    color: var(--brass);
    transform: translateX(1.2vw);
  }
  .mnu__item:hover .mnu__idx {
    color: var(--brass);
  }
}

.mnu__aside {
  display: grid;
  gap: clamp(1.4rem, 3vh, 2.6rem);
  padding-bottom: 0.6rem;
}

.mnu__block {
  display: grid;
  gap: 0.55rem;
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
}

.mnu__sectors {
  display: grid;
  gap: 0.2rem;
  font-size: 1.02rem;

  a {
    opacity: 0.72;
    transition: opacity 0.4s var(--ease), transform 0.5s var(--ease);
    display: inline-block;
  }
  a:hover {
    opacity: 1;
    transform: translateX(6px);
  }
}

.mnu__line {
  font-size: 1.02rem;
  letter-spacing: -0.015em;
  opacity: 0.86;
}
.mnu__line--dim {
  opacity: 0.5;
}

@media (max-width: 1024px) {
  .mnu__grid {
    grid-template-columns: 1fr;
    gap: 2.4rem;
  }
  .mnu__panel {
    align-items: flex-start;
    padding-top: 96px;
    overflow-y: auto;
  }
  .mnu__aside {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .mnu__aside {
    grid-template-columns: 1fr;
  }
}
</style>
