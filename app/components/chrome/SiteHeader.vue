<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { brand, nav } from '~/data/site'

const menu = useMenu()
const root = ref<HTMLElement | null>(null)
const theme = useHeaderTheme()

/**
 * Hit-test the paper bands against the header line on each scroll update.
 *
 * Range-based ScrollTriggers were wrong here twice over: they measure before
 * the pinned scenes expand the document, and when two bands touch the outgoing
 * `onLeave` lands after the incoming `onEnter` and stomps it. Reading rects
 * directly is a handful of measurements against elements that are already laid
 * out, and it cannot go stale.
 */
const HEADER_LINE = 46
let bands: HTMLElement[] = []

const collectBands = () => {
  bands = gsap.utils.toArray<HTMLElement>('.on-paper')
}

const syncTheme = () => {
  for (const b of bands) {
    const r = b.getBoundingClientRect()
    if (r.top <= HEADER_LINE && r.bottom > HEADER_LINE) {
      theme.value = 'paper'
      return
    }
  }
  theme.value = 'ink'
}

const route = useRoute()
watch(
  () => route.fullPath,
  async () => {
    theme.value = 'ink'
    await nextTick()
    setTimeout(() => {
      collectBands()
      syncTheme()
      ScrollTrigger.refresh()
    }, 120)
  }
)

onMounted(() => {
  const el = root.value!
  const bar = el.querySelector('.hdr__bar') as HTMLElement

  nextTick(() => {
    collectBands()
    syncTheme()
  })

  // entrance: the header drops in after the hero headline has started
  gsap.set(el, { yPercent: -100 })
  const reveal = () => gsap.to(el, { yPercent: 0, duration: 1.15, ease: 'expo.out', delay: 0.25 })
  if (document.documentElement.classList.contains('is-ready')) reveal()
  else window.addEventListener('site:ready', reveal, { once: true })

  // page progress hairline
  const bar2 = el.querySelector('.hdr__prog span') as HTMLElement
  const setProg = gsap.quickSetter(bar2, 'scaleX')

  // condense + hide-on-scroll-down, reveal-on-scroll-up
  let last = 0
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll()
      const condensed = y > 40
      el.classList.toggle('is-condensed', condensed)
      if (y > 620 && y > last && !menu.open.value) gsap.to(el, { yPercent: -100, duration: 0.55, ease: 'power3.inOut' })
      else gsap.to(el, { yPercent: 0, duration: 0.55, ease: 'power3.out' })
      last = y
      gsap.set(bar, { '--bar-blur': condensed ? '14px' : '0px' })
      setProg(self.progress)
      syncTheme()
    }
  })
})

</script>

<template>
  <header ref="root" class="hdr" :class="[`hdr--${theme}`, menu.open.value && 'hdr--menu']">
    <div class="hdr__bar shell">
      <NuxtLink to="/" class="hdr__logo" aria-label="SVS Shadow VIP Security — ana sayfa">
        <span class="hdr__mark" aria-hidden="true" />
        <span class="hdr__word">
          <span class="hdr__name">{{ brand.name }}</span>
          <span class="hdr__sub">SHADOW VIP SECURITY</span>
        </span>
      </NuxtLink>

      <nav class="hdr__nav" aria-label="Ana menü">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" class="hdr__link">
          <span class="hdr__lw">
            <span class="hdr__lt">{{ item.label }}</span>
            <span class="hdr__lt hdr__lt--dup" aria-hidden="true">{{ item.label }}</span>
          </span>
        </NuxtLink>
      </nav>

      <div class="hdr__right">
        <NuxtLink to="/iletisim" class="hdr__cta">
          <span class="hdr__lw">
            <span class="hdr__lt">Teklif Alın</span>
            <span class="hdr__lt hdr__lt--dup" aria-hidden="true">Teklif Alın</span>
          </span>
        </NuxtLink>

        <button class="hdr__burger" :aria-expanded="menu.open.value" aria-label="Menü" @click="menu.toggle()">
          <span class="hdr__burger-lines"><i /><i /></span>
          <span class="hdr__burger-txt">{{ menu.open.value ? 'Kapat' : 'Menü' }}</span>
        </button>
      </div>
    </div>
    <div class="hdr__rule" />
    <div class="hdr__prog" aria-hidden="true"><span /></div>
  </header>
</template>

<style scoped lang="scss">
.hdr {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 700;
  will-change: transform;
  color: var(--paper);
  mix-blend-mode: normal;
}

.hdr--paper:not(.hdr--menu) {
  color: var(--ink);
}

.hdr__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  height: 84px;
  transition: height 0.6s var(--ease), background-color 0.6s var(--ease);
  backdrop-filter: blur(var(--bar-blur, 0px));
}

.hdr.is-condensed .hdr__bar {
  height: 66px;
}

.hdr__prog {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;

  span {
    display: block;
    height: 100%;
    background: var(--brass);
    transform: scaleX(0);
    transform-origin: left;
    will-change: transform;
  }
}

.hdr__rule {
  height: 1px;
  background: currentColor;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: opacity 0.6s var(--ease), transform 0.9s var(--ease);
}
.hdr.is-condensed .hdr__rule {
  opacity: 0.14;
  transform: scaleX(1);
}

/* logo */
.hdr__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}
/* The mark is painted through its own alpha as a mask, so it inherits
   `currentColor` and stays legible when the header flips to ink over the
   paper bands — a fixed silver PNG would disappear there. */
.hdr__mark {
  width: 26px;
  height: 41px;
  flex: none;
  background: currentColor;
  -webkit-mask: url('/media/logo-mark-mask.png') center / contain no-repeat;
  mask: url('/media/logo-mark-mask.png') center / contain no-repeat;
  transition: transform 0.7s var(--ease), opacity 0.5s var(--ease);
}

.hdr__logo:hover .hdr__mark,
.hdr__logo:focus-visible .hdr__mark {
  transform: translateY(-2px) scale(1.06);
}
.hdr__word {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.hdr__name {
  font-size: 1.28rem;
  font-weight: 600;
  letter-spacing: -0.035em;
}
.hdr__sub {
  font-family: var(--font-mono);
  font-size: 7.5px;
  letter-spacing: 0.185em;
  white-space: nowrap;
  opacity: 0.62;
  margin-top: 3px;
}

/* nav */
.hdr__nav {
  display: flex;
  gap: clamp(1.2rem, 2.4vw, 2.6rem);
  font-size: 0.9rem;
  font-weight: 450;
  letter-spacing: -0.015em;
}

.hdr__lw {
  position: relative;
  display: block;
  overflow: hidden;
}
.hdr__lt {
  display: block;
  transition: transform 0.58s var(--ease);
}
.hdr__lt--dup {
  position: absolute;
  inset: 0;
  transform: translateY(105%);
  color: var(--brass);
}
.hdr__link:hover .hdr__lt,
.hdr__cta:hover .hdr__lt {
  transform: translateY(-105%);
}
.hdr__link:hover .hdr__lt--dup,
.hdr__cta:hover .hdr__lt--dup {
  transform: translateY(0);
}

.hdr__right {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}

.hdr__cta {
  font-size: 0.86rem;
  font-weight: 500;
  padding: 0.62em 1.25em;
  border: 1px solid currentColor;
  border-radius: 999px;
  opacity: 0.92;
  transition: opacity 0.5s var(--ease);
}
.hdr__cta:hover {
  opacity: 1;
}

.hdr__burger {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  /* the label is 17px tall on its own — pad it out to a real tap target */
  min-height: 44px;
  padding-inline: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.hdr__burger-lines {
  display: grid;
  gap: 5px;
  width: 22px;
  i {
    display: block;
    height: 1px;
    background: currentColor;
    transition: transform 0.55s var(--ease), width 0.55s var(--ease);
  }
  i:last-child {
    width: 14px;
    margin-left: auto;
  }
}
.hdr__burger:hover .hdr__burger-lines i:last-child {
  width: 22px;
}
.hdr--menu .hdr__burger-lines i:first-child {
  transform: translateY(3px) rotate(15deg);
}
.hdr--menu .hdr__burger-lines i:last-child {
  width: 22px;
  transform: translateY(-3px) rotate(-15deg);
}

@media (max-width: 1024px) {
  .hdr__nav,
  .hdr__cta {
    display: none;
  }
  .hdr__bar {
    height: 68px;
  }
}
</style>
