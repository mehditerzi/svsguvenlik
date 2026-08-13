<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const root = ref<HTMLElement | null>(null)

/** Cities cycle as the globe turns — the caption is driven by the 3D object. */
const cities = [
  { name: 'İstanbul', note: 'Komuta merkezi · 24 saha' },
  { name: 'Ankara', note: 'Bölge müdürlüğü · 11 saha' },
  { name: 'İzmir', note: 'Etkinlik operasyonu · 9 saha' },
  { name: 'Kocaeli', note: 'Endüstriyel saha · 7 saha' },
  { name: 'Bursa', note: 'Kampüs & tesis · 6 saha' },
  { name: 'Antalya', note: 'Turizm tesisleri · 5 saha' },
  { name: 'Gaziantep', note: 'Lojistik hattı · 4 saha' },
  { name: 'Trabzon', note: 'Liman & çevre · 3 saha' },
  { name: 'Erzurum', note: 'Mobil devriye · 2 saha' },
  { name: 'Diyarbakır', note: 'Kritik altyapı · 3 saha' },
  { name: 'Samsun', note: 'Perakende ağı · 4 saha' },
  { name: 'Konya', note: 'Fabrika sahası · 5 saha' }
]

const idx = ref(0)
const city = computed(() => cities[idx.value % cities.length]!)

const onNode = (n: number) => {
  if (n < 0) return
  const next = Math.floor(n / 7) % cities.length
  if (next === idx.value) return
  idx.value = next
  const el = root.value?.querySelector('.cov__city')
  if (el) gsap.fromTo(el, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' })
}

useScene((_ctx, el) => {
  gsap.fromTo(
    el.querySelectorAll('.cov__rev'),
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 1.15,
      stagger: 0.07,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 78%', once: true }
    }
  )

  gsap.fromTo(
    el.querySelector('.cov__stage'),
    { autoAlpha: 0, scale: 0.86 },
    {
      autoAlpha: 1,
      scale: 1,
      duration: 1.5,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 76%', once: true }
    }
  )

  gsap.fromTo(
    el.querySelectorAll('.cov__fig'),
    { y: 30, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.cov__figs', start: 'top 88%', once: true }
    }
  )
}, root)
</script>

<template>
  <section ref="root" class="cov section on-ink stage">
    <div class="cov__grid shell">
      <div class="cov__copy">
        <div class="cov__mark">
          <MotionMorphMark mode="scroll" :size="70" :stroke="1.2" />
          <span class="meta meta--brass">04 — Kapsama</span>
        </div>
        <h2 class="cov__h display d-md">
          <span class="line-mask"><span class="cov__rev">81 ilde</span></span>
          <span class="line-mask"><span class="cov__rev">tek komuta.</span></span>
        </h2>
        <p class="body-s cov__note">
          Her saha aynı prosedürle kurulur, aynı ekrandan izlenir. Küreyi çevirerek ağın nasıl yayıldığını görün.
        </p>

        <div class="cov__city">
          <p class="cov__city-name">{{ city.name }}</p>
          <p class="meta">{{ city.note }}</p>
        </div>
      </div>

      <div class="cov__stage">
        <GlCoverageSphere @node="onNode" />
      </div>
    </div>

    <div class="cov__figs shell">
      <div class="cov__fig">
        <span class="serif-num cov__fig-n">81</span>
        <span class="meta">İl kapsaması</span>
      </div>
      <div class="cov__fig">
        <span class="serif-num cov__fig-n">7/24</span>
        <span class="meta">Kesintisiz izleme</span>
      </div>
      <div class="cov__fig">
        <span class="serif-num cov__fig-n">9 dk</span>
        <span class="meta">Ortalama müdahale</span>
      </div>
      <div class="cov__fig">
        <span class="serif-num cov__fig-n">1.240+</span>
        <span class="meta">Saha personeli</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cov {
  position: relative;
  z-index: 4;
  padding-block: clamp(74px, 13vh, 180px) clamp(60px, 10vh, 140px);
}

.cov__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: clamp(1.6rem, 5vw, 5rem);
  align-items: center;
}

.cov__mark {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--brass);
}

.cov__copy {
  display: grid;
  gap: 1.1rem;
  align-content: center;
}

.cov__h {
  font-weight: 500;
}

.cov__rev {
  display: block;
}

.cov__note {
  max-width: 34ch;
}

.cov__city {
  margin-top: clamp(0.6rem, 2vh, 1.4rem);
  border-top: 1px solid var(--rule);
  padding-top: 0.9rem;
  display: grid;
  gap: 0.3rem;
}

.cov__city-name {
  font-size: clamp(1.4rem, 2.4vw, 2.3rem);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--brass);
}

.cov__stage {
  position: relative;
  aspect-ratio: 1 / 1;
  max-height: 74svh;
  margin-inline: auto;
  width: 100%;
  will-change: transform, opacity;
}

.cov__figs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 3vw, 3rem);
  margin-top: clamp(2rem, 6vh, 5rem);
  border-top: 1px solid var(--rule);
  padding-top: clamp(1.2rem, 3vh, 2.2rem);
}

.cov__fig {
  display: grid;
  gap: 0.5rem;
}

.cov__fig-n {
  font-size: clamp(2rem, 3.6vw, 3.6rem);
  color: var(--brass);
}

@media (max-width: 1024px) {
  .cov__grid {
    grid-template-columns: 1fr;
    gap: 1.6rem;
  }
  .cov__stage {
    max-height: 58svh;
    order: -1;
  }
  .cov__figs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.4rem;
  }
}
</style>
