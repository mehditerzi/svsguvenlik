<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { projects } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const { set, reset } = useCursor()
const { isFine } = usePointer()

useScene((_ctx, el) => {
  // each frame opens its own mask; the picture inside keeps drifting afterwards
  gsap.utils.toArray<HTMLElement>('.prj__card', el).forEach((card) => {
    const frame = card.querySelector('.prj__frame') as HTMLElement
    const img = card.querySelector('img') as HTMLElement
    const metaRows = card.querySelectorAll('.prj__rev')

    gsap.set(frame, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.set(img, { scale: 1.28 })

    gsap
      .timeline({ scrollTrigger: { trigger: card, start: 'top 86%', once: true } })
      .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' })
      .to(img, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.05)
      .fromTo(metaRows, { yPercent: 118 }, { yPercent: 0, duration: 0.95, stagger: 0.06, ease: 'expo.out' }, 0.35)

    matchScene({
      desktop: () => {
        gsap.fromTo(
          img,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        )
      }
    })
  })

  // the section header pins briefly and hands over to the grid
  matchScene({
    desktop: () => {
      gsap.fromTo(
        '.prj__aside',
        { y: 0 },
        {
          y: -80,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true }
        }
      )
    }
  })
}, root)

const onEnter = () => isFine.value && set('label', 'İncele')
const onLeave = () => reset()
</script>

<template>
  <section ref="root" class="prj section on-ink stage">
    <header class="prj__head shell">
      <div class="prj__aside">
        <span class="meta meta--brass">04 — Referanslar</span>
        <MotionSplitText
          as="h2"
          class="display d-md prj__title"
          :lines="['Sahada kanıtlanmış', 'operasyonlar.']"
        />
      </div>
      <p class="prj__note body-s">
        Her saha kendi riskini taşır. Aşağıdaki işler, kurulan sistemin gerçek koşullar altında nasıl davrandığını
        gösterir.
      </p>
    </header>

    <div class="prj__grid shell">
      <article
        v-for="(p, i) in projects"
        :key="p.id"
        class="prj__card"
        :class="`prj__card--${p.size}`"
        @pointerenter="onEnter"
        @pointerleave="onLeave"
      >
        <NuxtLink :to="`/referanslar#${p.id}`" class="prj__hit">
          <figure class="prj__frame plate plate--graded">
            <NuxtImg :src="p.image" :alt="p.title" loading="lazy" decoding="async" />
            <figcaption class="prj__badge meta">{{ String(i + 1).padStart(2, '0') }}</figcaption>
          </figure>

          <div class="prj__info">
            <h3 class="prj__name">
              <span class="line-mask"><span class="prj__rev">{{ p.title }}</span></span>
            </h3>
            <div class="prj__row">
              <span class="line-mask"><span class="prj__rev meta">{{ p.sector }}</span></span>
              <span class="line-mask"><span class="prj__rev meta">{{ p.city }} · {{ p.year }}</span></span>
            </div>
            <p class="prj__scope body-s">{{ p.scope }}</p>
          </div>
        </NuxtLink>
      </article>

      <div class="prj__outro">
        <p class="prj__outro-t display d-sm">Sahanız hangi risk profilinde?</p>
        <p class="body-s">
          Mevcut kurulumunuzu yerinde inceleyip kapsam, kadro ve teknoloji ihtiyacını tek raporda çıkarıyoruz.
        </p>
        <MotionMagneticButton to="/referanslar" label="Tüm referanslar" variant="ghost" cursor="Aç" />
      </div>
    </div>

    <div class="prj__hint shell">
      <span class="prj__hint-line" />
      <span class="meta">Kaydırın</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.prj {
  position: relative;
  z-index: 5;
  padding-block: clamp(80px, 14vh, 190px) clamp(70px, 12vh, 160px);
}

.prj__head {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: clamp(1.6rem, 4vw, 5rem);
  align-items: end;
  margin-bottom: clamp(2.6rem, 8vh, 6rem);
}

.prj__aside {
  display: grid;
  gap: 1.1rem;
  will-change: transform;
}

.prj__note {
  max-width: 38ch;
  padding-bottom: 0.4rem;
}

/* An editorial grid, not a card matrix: spans and offsets do the composing. */
.prj__grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(2rem, 4vw, 4rem) clamp(1.2rem, 2.4vw, 2.6rem);
}

.prj__card {
  position: relative;
}

/* Explicit rows so the pieces interlock instead of leaving stranded columns. */
.prj__card--lg {
  grid-column: 1 / span 7;
  grid-row: 1;
  .prj__frame { aspect-ratio: 4 / 3; }
}
.prj__card--sm {
  grid-column: 9 / span 4;
  grid-row: 1;
  align-self: end;
  padding-bottom: clamp(0.5rem, 3vh, 2.4rem);
  .prj__frame { aspect-ratio: 3 / 4; }
}
.prj__card--md {
  grid-column: 1 / span 5;
  grid-row: 2;
  .prj__frame { aspect-ratio: 1 / 1; }
}
.prj__card--wide {
  grid-column: 1 / span 12;
  grid-row: 3;
  .prj__frame { aspect-ratio: 21 / 9; }
}
.prj__card:nth-child(5) {
  grid-column: 7 / span 6;
  grid-row: 2;
  margin-top: clamp(0rem, 7vh, 6rem);
  .prj__frame { aspect-ratio: 4 / 5; }
}
.prj__card:nth-child(6) {
  grid-column: 1 / span 5;
  grid-row: 4;
  .prj__frame { aspect-ratio: 3 / 4; }
}

/* fills what would otherwise be a stranded column beside the last frame */
.prj__outro {
  grid-column: 8 / span 5;
  grid-row: 4;
  align-self: end;
  display: grid;
  gap: 1.1rem;
  justify-items: start;
  padding-bottom: clamp(1rem, 6vh, 5rem);
  border-top: 1px solid var(--rule);
  padding-top: 1.4rem;
}

.prj__outro-t {
  max-width: 14ch;
}

.prj__hint {
  display: none;
  align-items: center;
  gap: 1rem;
  margin-top: 1.2rem;
}

.prj__hint-line {
  flex: 1;
  height: 1px;
  background: var(--rule);
}

.prj__frame {
  position: relative;
  width: 100%;
  will-change: clip-path;

  img {
    transition: filter 0.8s var(--ease);
  }
}

.prj__badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  color: var(--paper);
  opacity: 0.7;
}

.prj__info {
  margin-top: 1.05rem;
  display: grid;
  gap: 0.42rem;
}

.prj__name {
  font-size: clamp(1.35rem, 2.4vw, 2.35rem);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1;
}

.prj__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--rule);
  padding-top: 0.55rem;
  margin-top: 0.25rem;
}

.prj__scope {
  max-width: 42ch;
  font-size: 0.9rem;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
}

@media (hover: hover) {
  .prj__card:hover .prj__scope {
    opacity: 1;
    transform: translateY(0);
  }
  .prj__card:hover .prj__frame img {
    filter: saturate(0.72) contrast(1.06) brightness(0.95);
    transform: scale(1.045);
  }
  .prj__frame img {
    transition: filter 0.8s var(--ease), transform 1.1s var(--ease);
  }
}

@media (max-width: 1024px) {
  .prj__head {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }

  /* Mobile turns the editorial grid into a swipe rail: cards keep their
     varied ratios, the eye tracks horizontally, and nothing gets squeezed. */
  .prj__grid {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: none;
    grid-auto-columns: 76%;
    column-gap: 14px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--gut);
    padding-inline: var(--gut);
    padding-bottom: 0.4rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar { display: none; }
  }

  .prj__card,
  .prj__card--lg,
  .prj__card--sm,
  .prj__card--md,
  .prj__card--wide,
  .prj__card:nth-child(5),
  .prj__card:nth-child(6) {
    grid-column: auto;
    grid-row: 1;
    margin-top: 0;
    padding-bottom: 0;
    scroll-snap-align: start;
  }

  .prj__card--lg .prj__frame,
  .prj__card--wide .prj__frame { aspect-ratio: 4 / 3; }
  .prj__card--sm .prj__frame,
  .prj__card--md .prj__frame,
  .prj__card:nth-child(5) .prj__frame,
  .prj__card:nth-child(6) .prj__frame { aspect-ratio: 3 / 4; }

  .prj__outro {
    grid-column: auto;
    grid-row: 1;
    align-self: center;
    scroll-snap-align: start;
    padding-bottom: 0;
    border-top: 0;
  }

  .prj__scope {
    opacity: 1;
    transform: none;
  }

  .prj__hint {
    display: flex;
  }
}

@media (max-width: 640px) {
  .prj__grid {
    grid-auto-columns: 82%;
  }
}
</style>
