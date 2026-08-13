<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { sectors } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const active = ref(0)
const progress = ref(0)

useScene((_ctx, el) => {
  const n = sectors.length
  const media = gsap.utils.toArray<HTMLElement>('.sec__shot', el)
  const titles = gsap.utils.toArray<HTMLElement>('.sec__title', el)
  const panels = gsap.utils.toArray<HTMLElement>('.sec__panel', el)

  // initial state — only the first layer is live
  media.forEach((m, i) => gsap.set(m, { autoAlpha: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 1.16 }))
  titles.forEach((t, i) => gsap.set(t.querySelector('span'), { yPercent: i === 0 ? 0 : 112 }))
  panels.forEach((p, i) => gsap.set(p, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 26 }))

  let current = 0

  /**
   * Force every inactive layer back to its parked state. Fast scrolling can
   * start a new transition while the previous one is still mid-flight, which
   * would otherwise leave two panels stacked at full opacity.
   */
  const settle = (idx: number) => {
    media.forEach((m, i) => i !== idx && gsap.set(m, { autoAlpha: 0 }))
    panels.forEach((p, i) => i !== idx && gsap.set(p, { autoAlpha: 0 }))
    titles.forEach((t, i) => i !== idx && gsap.set(t.querySelector('span'), { yPercent: 112 }))
  }

  const go = (next: number, dir: number) => {
    if (next === current) return
    const prev = current
    current = next
    active.value = next

    gsap
      .timeline({
        // `overwrite` so a newer transition takes sole ownership of a layer the
        // previous one was still animating.
        defaults: { ease: 'expo.inOut', overwrite: 'auto' },
        onComplete: () => current === next && settle(next)
      })
      // outgoing image pushes away in the scroll direction while the new one settles
      .to(media[prev]!, { autoAlpha: 0, scale: 1.14, yPercent: -6 * dir, duration: 1.1 }, 0)
      .fromTo(
        media[next]!,
        { autoAlpha: 0, scale: 1.2, yPercent: 8 * dir },
        { autoAlpha: 1, scale: 1, yPercent: 0, duration: 1.25 },
        0
      )
      .to(titles[prev]!.querySelector('span'), { yPercent: -112 * dir, duration: 0.85 }, 0)
      .fromTo(
        titles[next]!.querySelector('span'),
        { yPercent: 112 * dir },
        { yPercent: 0, duration: 1.05, ease: 'expo.out' },
        0.08
      )
      .to(panels[prev]!, { autoAlpha: 0, y: -18 * dir, duration: 0.5 }, 0)
      .fromTo(
        panels[next]!,
        { autoAlpha: 0, y: 22 * dir },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.24
      )
  }

  matchScene({
    desktop: () => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * n * 0.95}`,
        pin: '.sec__pin',
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          progress.value = self.progress
          const raw = self.progress * n
          const idx = Math.min(n - 1, Math.max(0, Math.floor(raw - 0.12)))
          go(idx, self.direction)
        }
      })

      // slow continuous drift on whichever image is live
      gsap.to(media, {
        scale: 1.07,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true }
      })
    },
    mobile: () => {
      // Mobile gets its own interaction: a snap rail you swipe through, with the
      // index, title and progress reacting live — not a passive vertical stack.
      const rail = el.querySelector('.sec__rail') as HTMLElement
      if (!rail) return

      const sync = () => {
        const card = rail.firstElementChild as HTMLElement
        if (!card) return
        const step = card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || '0')
        const i = Math.round(rail.scrollLeft / step)
        active.value = Math.min(sectors.length - 1, Math.max(0, i))
        progress.value = rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth)
      }
      rail.addEventListener('scroll', sync, { passive: true })
      sync()

      gsap.fromTo(
        rail.querySelectorAll('.sec__m'),
        { yPercent: 14, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 76%', once: true }
        }
      )
    }
  })
}, root)

const jump = (i: number) => {
  const el = root.value
  if (!el) return
  const top = el.offsetTop + (window.innerHeight * sectors.length * 0.95 * (i + 0.35)) / sectors.length
  useLenis()?.scrollTo(top, { duration: 1.4 })
}
</script>

<template>
  <section ref="root" class="sec section on-ink">
    <!-- ── desktop: pinned cinema ─────────────────────────────────────────── -->
    <div class="sec__pin">
      <div class="sec__media">
        <div v-for="(s, i) in sectors" :key="s.id" class="sec__shot">
          <GlServiceCanvas
            :variant="s.canvas.variant"
            :seed="s.canvas.seed"
            :speed="s.canvas.speed"
            :density="s.canvas.density"
            :mirror="s.canvas.mirror"
            :active="active === i"
            bare
          />
        </div>
        <div class="sec__scrim" />
      </div>

      <div class="sec__ui shell">
        <div class="sec__top">
          <span class="meta meta--brass">02 — Faaliyet alanları</span>
          <span class="meta">{{ String(active + 1).padStart(2, '0') }} / {{ String(sectors.length).padStart(2, '0') }}</span>
        </div>

        <ol class="sec__list">
          <li v-for="(s, i) in sectors" :key="s.id" :class="active === i && 'is-on'">
            <button @click="jump(i)">
              <span class="meta sec__li-n">{{ s.index }}</span>
              <span class="sec__li-t">{{ s.title }}</span>
            </button>
          </li>
        </ol>

        <div class="sec__center">
          <h2 v-for="(s, i) in sectors" :key="s.id" class="sec__title display" :class="active === i && 'is-on'">
            <span>{{ s.title }}</span>
          </h2>
        </div>

        <div class="sec__panels">
          <div v-for="(s, i) in sectors" :key="s.id" class="sec__panel" :class="active === i && 'is-on'">
            <p class="sec__lead">{{ s.lead }}</p>
            <p class="sec__body body-s">{{ s.body }}</p>
            <dl class="sec__meta">
              <div v-for="m in s.meta" :key="m.k">
                <dt class="meta">{{ m.k }}</dt>
                <dd>{{ m.v }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="sec__progress"><span :style="{ transform: `scaleX(${progress})` }" /></div>
      </div>
    </div>

    <!-- ── mobile: swipeable rail ─────────────────────────────────────────── -->
    <div class="sec__mobile">
      <div class="sec__m-top shell">
        <span class="meta meta--brass">02 — Faaliyet alanları</span>
        <span class="meta">{{ String(active + 1).padStart(2, '0') }} / {{ String(sectors.length).padStart(2, '0') }}</span>
      </div>

      <h2 class="sec__m-title display shell">{{ sectors[active]!.title }}</h2>

      <div class="sec__rail">
        <article v-for="(s, i) in sectors" :key="s.id" class="sec__m" :class="active === i && 'is-on'">
          <figure class="sec__m-fig">
            <GlServiceCanvas
              :variant="s.canvas.variant"
              :seed="(s.canvas.seed ?? 0) + 100"
              :speed="s.canvas.speed"
              :density="0.7"
              :mirror="!s.canvas.mirror"
              :active="Math.abs(active - i) <= 1"
            />
            <figcaption class="sec__m-idx meta">{{ s.index }}</figcaption>
          </figure>
          <div class="sec__m-body">
            <p class="sec__lead">{{ s.lead }}</p>
            <p class="body-s">{{ s.body }}</p>
            <dl class="sec__m-meta">
              <div v-for="m in s.meta" :key="m.k">
                <dt class="meta">{{ m.k }}</dt>
                <dd>{{ m.v }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>

      <div class="sec__m-bar shell">
        <span class="sec__m-track"><i :style="{ transform: `scaleX(${Math.max(0.08, progress)})` }" /></span>
        <span class="meta">Kaydırın</span>
      </div>
    </div>

  </section>
</template>

<style scoped lang="scss">
.sec {
  position: relative;
  z-index: 3;
}

.sec__pin {
  position: relative;
  height: 100svh;
  overflow: clip;
}

.sec__media {
  position: absolute;
  inset: 0;
}

.sec__shot {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;

  &::after {
    display: none;
  }
}

.sec__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 9, 11, 0.5) 0%, rgba(8, 9, 11, 0) 38%, rgba(8, 9, 11, 0.66) 100%),
    linear-gradient(90deg, rgba(8, 9, 11, 0.5) 0%, rgba(8, 9, 11, 0) 46%);
}

.sec__ui {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding-block: clamp(96px, 13svh, 150px) clamp(34px, 6svh, 62px);
  color: var(--paper);
}

.sec__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.sec__list {
  position: absolute;
  left: var(--gut);
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  gap: clamp(0.3rem, 1.1vh, 0.8rem);
  z-index: 3;

  li {
    opacity: 0.36;
    transition: opacity 0.6s var(--ease);
  }
  li.is-on {
    opacity: 1;
  }

  button {
    display: flex;
    align-items: baseline;
    gap: 0.85rem;
    text-align: left;
  }
}

.sec__li-n {
  transition: color 0.6s var(--ease);
}
.is-on .sec__li-n {
  color: var(--brass);
}

.sec__li-t {
  font-size: clamp(0.98rem, 1.15vw, 1.22rem);
  letter-spacing: -0.02em;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    height: 1px;
    width: 100%;
    background: var(--brass);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.7s var(--ease);
  }
}
.is-on .sec__li-t::after {
  transform: scaleX(1);
}

.sec__center {
  position: relative;
  display: grid;
  place-items: center;
  align-self: center;
  z-index: 2;
  pointer-events: none;
}

.sec__title {
  grid-area: 1 / 1;
  font-size: clamp(3.2rem, 11.5vw, 13rem);
  line-height: 0.88;
  overflow: hidden;
  padding: 0.2em 0 0.1em;
  margin: -0.2em 0 -0.1em;

  span {
    display: block;
    will-change: transform;
  }
}

.sec__panels {
  position: relative;
  display: grid;
  align-items: end;
  min-height: 190px;
}

.sec__panel {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr) auto;
  gap: clamp(1.4rem, 4vw, 4rem);
  align-items: end;
  will-change: transform, opacity;
}

.sec__lead {
  font-size: clamp(1.1rem, 1.5vw, 1.55rem);
  letter-spacing: -0.025em;
  line-height: 1.14;
  max-width: 14ch;
}

.sec__body {
  max-width: 44ch;
}

.sec__meta {
  display: grid;
  gap: 0.7rem;
  text-align: right;
  min-width: 190px;

  dd {
    font-size: 0.98rem;
    margin-top: 0.15rem;
  }
}

.sec__progress {
  position: absolute;
  left: var(--gut);
  right: var(--gut);
  bottom: clamp(16px, 3svh, 28px);
  height: 1px;
  background: rgba(237, 233, 225, 0.14);

  span {
    display: block;
    height: 100%;
    background: var(--brass);
    transform-origin: left;
    will-change: transform;
  }
}

.sec__mobile {
  display: none;
}

@media (max-width: 1024px) {
  .sec__pin {
    display: none;
  }
  .sec__mobile {
    display: block;
    padding-block: clamp(56px, 9vh, 96px);
  }

  .sec__m-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 0.7rem;
  }

  .sec__m-title {
    font-size: clamp(2.6rem, 13vw, 5rem);
    line-height: 0.92;
    margin-bottom: 1.2rem;
  }

  /* the rail itself: snap points, edge padding so cards peek */
  .sec__rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 78%;
    column-gap: 14px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--gut);
    padding-inline: var(--gut);
    padding-bottom: 0.6rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }

  .sec__m {
    scroll-snap-align: start;
    display: grid;
    gap: 0.9rem;
    align-content: start;
    opacity: 0.5;
    transition: opacity 0.5s var(--ease);

    &.is-on { opacity: 1; }
  }

  .sec__m-fig {
    position: relative;
    aspect-ratio: 3 / 4;
  }

  .sec__m-idx {
    position: absolute;
    top: 0.8rem;
    left: 0.8rem;
    color: var(--paper);
  }

  .sec__m-body {
    display: grid;
    gap: 0.55rem;
  }

  .sec__m-meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
    border-top: 1px solid var(--rule);
    padding-top: 0.7rem;
    margin-top: 0.3rem;

    dd { font-size: 0.9rem; margin-top: 0.15rem; }
  }

  .sec__m-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.2rem;
  }

  .sec__m-track {
    flex: 1;
    height: 1px;
    background: rgba(237, 233, 225, 0.16);

    i {
      display: block;
      height: 100%;
      background: var(--brass);
      transform-origin: left;
      transition: transform 0.2s linear;
    }
  }
}
</style>
