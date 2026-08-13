<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { units } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const { pointer, isFine } = usePointer()

useScene((_ctx, el) => {
  gsap.utils.toArray<HTMLElement>('.unt__item', el).forEach((item, i) => {
    const fig = item.querySelector('.unt__fig') as HTMLElement
    const img = item.querySelector('img') as HTMLElement
    const name = item.querySelector('.unt__name span') as HTMLElement
    const role = item.querySelector('.unt__role span') as HTMLElement

    gsap.set(fig, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.set(img, { scale: 1.3 })
    gsap.set([name, role], { yPercent: 116 })

    gsap
      .timeline({ scrollTrigger: { trigger: item, start: 'top 82%', once: true } })
      .to(fig, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' })
      .to(img, { scale: 1, duration: 2, ease: 'expo.out' }, 0.05)
      .to([name, role], { yPercent: 0, duration: 1.05, stagger: 0.07, ease: 'expo.out' }, 0.3)

    matchScene({
      desktop: () => {
        gsap.fromTo(
          fig,
          { yPercent: i % 2 ? -8 : 8 },
          {
            yPercent: i % 2 ? 8 : -8,
            ease: 'none',
            scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        )

        // the caption slides under/over the portrait as it passes
        gsap.fromTo(
          item.querySelector('.unt__label'),
          { xPercent: i % 2 ? 12 : -12 },
          {
            xPercent: i % 2 ? -6 : 6,
            ease: 'none',
            scrollTrigger: { trigger: item, start: 'top bottom', end: 'bottom top', scrub: 1 }
          }
        )

        if (isFine.value) {
          const qx = gsap.quickTo(img, 'x', { duration: 1.4, ease: 'power3.out' })
          const qy = gsap.quickTo(img, 'y', { duration: 1.4, ease: 'power3.out' })
          gsap.ticker.add(() => {
            qx(pointer.nx * 14 * (i % 2 ? -1 : 1))
            qy(pointer.ny * 10)
          })
        }
      }
    })
  })
}, root)
</script>

<template>
  <section ref="root" class="unt section on-paper stage">
    <header class="unt__head shell">
      <span class="meta meta--brass">06 — Ekip</span>
      <MotionSplitText
        as="h2"
        class="display d-md unt__title"
        :lines="['Sahayı üç birim', 'birlikte tutar.']"
      />
      <p class="body-s unt__note">
        Kişilerden değil, birbirini yedekleyen birimlerden oluşuyoruz. Vardiya değişir, prosedür değişmez.
      </p>
    </header>

    <div class="unt__list">
      <article v-for="(u, i) in units" :key="u.n" class="unt__item" :class="`unt__item--${i % 2 ? 'r' : 'l'}`">
        <figure class="unt__fig plate plate--graded">
          <NuxtImg :src="u.image" :alt="u.title" loading="lazy" decoding="async" />
        </figure>

        <div class="unt__label">
          <h3 class="unt__name display"><span>{{ u.title }}</span></h3>
          <p class="unt__role meta"><span>{{ u.n }} — {{ u.role }}</span></p>
        </div>

        <div class="unt__side">
          <p class="unt__stat serif-num">{{ u.stat }}</p>
          <p class="unt__desc body-s">{{ u.desc }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.unt {
  position: relative;
  z-index: 6;
  padding-block: clamp(74px, 13vh, 180px) clamp(70px, 12vh, 170px);
}

.unt__head {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: clamp(1.2rem, 4vw, 4rem);
  align-items: end;
  margin-bottom: clamp(2.4rem, 8vh, 6rem);

  .meta {
    grid-column: 1 / -1;
  }
}

.unt__note {
  max-width: 34ch;
  padding-bottom: 0.4rem;
}

.unt__list {
  display: grid;
  gap: clamp(3rem, 9vh, 8rem);
}

/* One row per unit: image on 8 columns, figures and copy on the remaining 4,
   and the name crossing the image edge on its own layer. */
.unt__item {
  position: relative;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: clamp(1rem, 2.4vw, 2.6rem);
  align-items: center;
  padding-inline: var(--gut);
}

.unt__fig {
  grid-row: 1;
  aspect-ratio: 16 / 10;
  will-change: transform, clip-path;
}

.unt__item--l .unt__fig { grid-column: 1 / span 8; }
.unt__item--r .unt__fig { grid-column: 5 / span 8; }

.unt__label {
  grid-row: 1;
  align-self: end;
  z-index: 3;
  pointer-events: none;
  will-change: transform;
  mix-blend-mode: difference;
  color: #fff;
  /* margin, not transform: GSAP owns this element's transform for the
     scroll-linked drift, and a CSS translate would be overwritten. */
  margin-bottom: clamp(-3.2rem, -4vw, -1.2rem);
}

.unt__item--l .unt__label { grid-column: 3 / span 9; }
.unt__item--r .unt__label { grid-column: 1 / span 9; text-align: right; }

.unt__name {
  font-size: clamp(2rem, 6vw, 6.2rem);
  line-height: 0.9;
  overflow: hidden;
  padding: 0.2em 0 0.08em;
  margin: -0.2em 0 -0.08em;

  span {
    display: block;
    will-change: transform;
  }
}

.unt__role {
  overflow: hidden;
  padding-top: 0.4em;
  margin-top: 0.4rem;
  color: rgba(255, 255, 255, 0.72);

  span { display: block; }
}

.unt__side {
  grid-row: 1;
  align-self: center;
  display: grid;
  gap: 0.9rem;
  align-content: center;
}

.unt__item--l .unt__side { grid-column: 9 / span 4; }
.unt__item--r .unt__side { grid-column: 1 / span 4; text-align: right; }

.unt__stat {
  font-size: clamp(2.4rem, 4.4vw, 4.6rem);
  color: var(--brass);
}

.unt__desc {
  max-width: 30ch;
}

.unt__item--r .unt__desc { margin-left: auto; }

@media (max-width: 1024px) {
  .unt__head {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .unt__item {
    row-gap: 1.1rem;
  }
  .unt__item--l .unt__fig,
  .unt__item--r .unt__fig {
    grid-column: 1 / span 12;
    aspect-ratio: 4 / 3;
  }
  /* On a phone the straddled caption reads as a clipping bug, so the label
     sits inside the frame instead, over the plate's own bottom scrim. */
  .unt__item--l .unt__label,
  .unt__item--r .unt__label {
    grid-column: 1 / span 12;
    text-align: left;
    margin-bottom: 1.1rem;
    margin-left: 1rem;
    mix-blend-mode: normal;
    color: var(--paper);
  }

  .unt__role {
    color: rgba(237, 233, 225, 0.72);
  }
  .unt__item--l .unt__side,
  .unt__item--r .unt__side {
    grid-row: 2;
    grid-column: 1 / span 12;
    text-align: left;
    margin-top: 1.6rem;
  }
  .unt__item--r .unt__desc { margin-left: 0; }
}
</style>
