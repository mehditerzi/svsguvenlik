<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { stats } from '~/data/site'

const root = ref<HTMLElement | null>(null)

useScene((_ctx, el) => {
  // the whole slab lifts over the hero
  gsap.fromTo(el, { yPercent: 6 }, {
    yPercent: 0,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: 0.5 }
  })

  // statistic column: each figure arrives on its own beat and drifts
  const figures = gsap.utils.toArray<HTMLElement>('.intro__stat', el)
  figures.forEach((f, i) => {
    gsap.fromTo(
      f,
      { yPercent: 34, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: f, start: 'top 90%', once: true },
        delay: i * 0.06
      }
    )
    matchScene({
      desktop: () => {
        gsap.fromTo(
          f,
          { y: 46 * (i % 2 === 0 ? 1 : -1) },
          {
            y: -46 * (i % 2 === 0 ? 1 : -1),
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        )
      }
    })
  })

  // hairline grid draws itself
  gsap.fromTo(
    '.intro__rule',
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: 1.4,
      stagger: 0.09,
      ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 72%', once: true }
    }
  )
}, root)
</script>

<template>
  <section ref="root" class="intro section on-paper stage">
    <div class="intro__head shell">
      <div class="intro__label">
        <span class="meta">01 — Kurumsal</span>
        <span class="intro__rule rule" />
      </div>

      <MotionSplitText
        as="h2"
        class="intro__kicker display d-md"
        :lines="['Güvenlik bir hizmet değil,', 'sürekli işleyen bir operasyondur.']"
        mode="word"
        :stagger="0.045"
      />
    </div>

    <div class="intro__body shell">
      <div class="intro__col">
        <MotionRevealText
          class="intro__para lede"
          text="SVS Shadow VIP Security; hastane ve tesislerde fiziki güvenlik, tesis yönetimi ve güvenlik teknolojilerini tek çatı altında yürüten entegre bir hizmet grubudur. Sahadaki her nokta, komuta merkezimizde tek bir ekrana bağlanır."
          :accent="['tek', 'ekrana']"
        />
        <MotionMagneticButton to="/kurumsal" label="Hikâyemiz" variant="ghost" cursor="AÇ" />
      </div>

      <div class="intro__stats">
        <div v-for="(s, i) in stats" :key="s.label" class="intro__stat" :class="`intro__stat--${i}`">
          <span class="intro__rule rule" />
          <p class="intro__num serif-num">
            <MotionCountUp :value="s.value" :suffix="s.suffix" />
          </p>
          <p class="intro__lab">{{ s.label }}</p>
          <p class="meta">{{ s.note }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.intro {
  position: relative;
  z-index: 2;
  padding-block: clamp(72px, 13vh, 190px) clamp(80px, 15vh, 210px);
  will-change: transform;
}

.intro__head {
  display: grid;
  gap: clamp(1.6rem, 4vh, 3.2rem);
}

.intro__label {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.4rem;
}

.intro__kicker {
  max-width: 17ch;
  font-weight: 500;
}

.intro__body {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: clamp(2rem, 6vw, 7rem);
  margin-top: clamp(3rem, 9vh, 8rem);
  align-items: start;
}

.intro__col {
  display: grid;
  gap: clamp(1.8rem, 4vh, 3rem);
  justify-items: start;
  position: sticky;
  top: 22vh;
}

.intro__para {
  max-width: 40ch;
  font-size: clamp(1.15rem, 1.62vw, 1.72rem);
  line-height: 1.3;
}

/* Deliberately uneven: figures sit on a broken baseline, not in a card row. */
.intro__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2rem, 5vw, 4.5rem) clamp(1.4rem, 3vw, 3rem);
}

.intro__stat {
  display: grid;
  gap: 0.55rem;
  will-change: transform;
}
.intro__stat--1 {
  margin-top: clamp(2rem, 8vh, 7rem);
}
.intro__stat--2 {
  margin-top: -1rem;
}
.intro__stat--3 {
  margin-top: clamp(1rem, 5vh, 4rem);
}

.intro__num {
  font-size: clamp(3.4rem, 8.2vw, 8.4rem);
  color: var(--brass);
  margin-block: 0.3rem 0.5rem;
}

.intro__lab {
  font-size: clamp(0.98rem, 1.1vw, 1.15rem);
  letter-spacing: -0.015em;
  max-width: 18ch;
}

@media (max-width: 1024px) {
  .intro__body {
    grid-template-columns: 1fr;
    gap: 3.2rem;
  }
  .intro__col {
    position: static;
  }
}

@media (max-width: 640px) {
  .intro__stats {
    gap: 2.2rem 1.2rem;
  }
  .intro__stat--1,
  .intro__stat--3 {
    margin-top: 0;
  }
}
</style>
