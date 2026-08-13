<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'

const root = ref<HTMLElement | null>(null)
const { pointer, isFine } = usePointer()

useScene((_ctx, el) => {
  const lines = gsap.utils.toArray<HTMLElement>('.stm__l', el)

  // reveal
  gsap.fromTo(
    lines.map((l) => l.querySelector('span')),
    { yPercent: 112 },
    {
      yPercent: 0,
      duration: 1.3,
      stagger: 0.075,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 76%', once: true }
    }
  )

  matchScene({
    desktop: () => {
      // each line travels at its own rate — the block never reads as one object
      const drift = [-11, 8, -6, 13]
      lines.forEach((line, i) => {
        gsap.fromTo(
          line,
          { xPercent: -(drift[i] ?? 0) * 0.6 },
          {
            xPercent: drift[i] ?? 0,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
          }
        )
      })

      // the two plates cross the type in opposite directions and different depths
      gsap.fromTo(
        '.stm__plate--back',
        { yPercent: 22, scale: 1.14 },
        {
          yPercent: -18,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )
      gsap.fromTo(
        '.stm__plate--front',
        { yPercent: -30 },
        {
          yPercent: 26,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      )

      if (isFine.value) {
        const fx = gsap.quickTo('.stm__plate--front', 'x', { duration: 1.4, ease: 'power3.out' })
        const bx = gsap.quickTo('.stm__plate--back', 'x', { duration: 1.8, ease: 'power3.out' })
        gsap.ticker.add(() => {
          fx(pointer.nx * 34)
          bx(pointer.nx * -22)
        })
      }
    }
  })

}, root)
</script>

<template>
  <section ref="root" class="stm section on-paper stage">
    <div class="stm__head shell">
      <span class="meta">03 — Duruş</span>
    </div>

    <div class="stm__type">
      <figure class="stm__plate stm__plate--back plate plate--graded">
        <NuxtImg src="/media/statement-back.webp" alt="" loading="lazy" decoding="async" />
      </figure>

      <h2 class="stm__h display">
        <span class="stm__l stm__l--1 line-mask"><span>GERÇEK</span></span>
        <span class="stm__l stm__l--2 line-mask"><span>SAHA</span></span>
        <span class="stm__l stm__l--3 line-mask"><span>KOŞULLARI</span></span>
        <span class="stm__l stm__l--4 line-mask"><span>İÇİN</span></span>
      </h2>

      <figure class="stm__plate stm__plate--front plate plate--graded plate--flat">
        <NuxtImg src="/media/statement-front.webp" alt="" loading="lazy" decoding="async" />
      </figure>
    </div>

    <div class="stm__foot shell">
      <p class="stm__note lede">
        Yağmurda, gece vardiyasında, elektrik kesintisinde de aynı prosedür işler. Sistemlerimizi ideal koşullar için
        değil, sahanın gerçeği için kuruyoruz.
      </p>
      <span class="meta">Operasyon standardı · SVS-OPS 4.2</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.stm {
  position: relative;
  z-index: 4;
  padding-block: clamp(74px, 14vh, 200px) clamp(64px, 12vh, 170px);
}

.stm__type {
  position: relative;
  margin-block: clamp(2rem, 6vh, 5rem);
}

.stm__h {
  position: relative;
  display: grid;
  /* .line-mask carries a negative top margin so diacritics can overflow; in a
     grid that eats into the row above, so give the rows their gap back. */
  row-gap: 0.22em;
  font-size: clamp(2.7rem, 16.5vw, 21rem);
  line-height: 0.82;
  letter-spacing: -0.055em;
  z-index: 2;

  span span {
    display: block;
    will-change: transform;
  }
}

.stm__l {
  display: block;
  will-change: transform;
  white-space: nowrap;
}

/* lines deliberately break the gutter and leave the viewport */
.stm__l--1 { padding-left: 2vw; }
.stm__l--2 { padding-left: 26vw; }
.stm__l--3 { padding-left: 8vw; }
.stm__l--4 { padding-left: 46vw; }

.stm__plate {
  position: absolute;
  will-change: transform;
}

/* sits behind the type */
.stm__plate--back {
  top: -6%;
  left: 4vw;
  width: clamp(200px, 34vw, 560px);
  height: clamp(260px, 46vw, 700px);
  z-index: 1;
}

/* sits in front of the type */
.stm__plate--front {
  right: 5vw;
  bottom: -12%;
  width: clamp(140px, 22vw, 340px);
  height: clamp(190px, 30vw, 460px);
  z-index: 3;
}

.stm__foot {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: end;
  position: relative;
  z-index: 4;
}

.stm__note {
  max-width: 46ch;
  margin-left: auto;
  text-align: right;
}

@media (max-width: 1024px) {
  .stm__l--2 { padding-left: 12vw; }
  .stm__l--3 { padding-left: 4vw; }
  .stm__l--4 { padding-left: 26vw; }

  /* keep the plates to the outer edges so they frame the words instead of
     sitting on top of them */
  .stm__plate--back {
    width: 38vw;
    height: 50vw;
    top: -2%;
    left: -6vw;
  }
  .stm__plate--front {
    width: 30vw;
    height: 38vw;
    right: -4vw;
    bottom: -4%;
  }

  .stm__foot {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .stm__note {
    text-align: left;
    margin-left: 0;
  }
}
</style>
