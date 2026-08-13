<script setup lang="ts">
import { gsap } from '~/composables/useMotion'
import { brand, nav, sectors } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const year = new Date().getFullYear()

useScene((_ctx, el) => {
  // the footer is revealed by the page sliding off it, not by scrolling into it
  matchScene({
    desktop: () => {
      gsap.fromTo(
        el.querySelector('.ftr__inner'),
        { yPercent: -32 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true }
        }
      )
    }
  })

  gsap.fromTo(
    el.querySelector('.ftr__word'),
    { yPercent: 42, opacity: 0.15 },
    {
      yPercent: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom bottom', scrub: 0.8 }
    }
  )
}, root)
</script>

<template>
  <footer ref="root" class="ftr">
    <div class="ftr__inner">
      <div class="ftr__top shell">
        <div class="ftr__col ftr__col--brand">
          <img class="ftr__logo" src="/media/logo-full.webp" alt="SVS Shadow VIP Security" width="440" height="396" loading="lazy" decoding="async" />
        </div>
        <div class="ftr__col">
          <p class="meta">Merkez</p>
          <p v-for="l in brand.address" :key="l" class="ftr__line">{{ l }}</p>
        </div>
        <div class="ftr__col">
          <p class="meta">İletişim</p>
          <a :href="`tel:${brand.phone.replace(/\s/g, '')}`" class="ftr__line ftr__link">{{ brand.phone }}</a>
          <a :href="`mailto:${brand.mail}`" class="ftr__line ftr__link">{{ brand.mail }}</a>
        </div>
        <div class="ftr__col">
          <p class="meta">Sayfalar</p>
          <NuxtLink v-for="i in nav" :key="i.to" :to="i.to" class="ftr__line ftr__link">{{ i.label }}</NuxtLink>
        </div>
        <div class="ftr__col">
          <p class="meta">Alanlar</p>
          <NuxtLink v-for="s in sectors" :key="s.id" :to="`/faaliyet-alanlari#${s.id}`" class="ftr__line ftr__link">
            {{ s.title }}
          </NuxtLink>
        </div>
      </div>

      <div class="ftr__wordmark" aria-hidden="true">
        <span class="ftr__word">SHADOW VIP SECURITY</span>
      </div>

      <div class="ftr__bottom shell">
        <span class="meta">© {{ year }} {{ brand.full }} — Tüm hakları saklıdır</span>
        <span class="meta">5188 sayılı kanun kapsamında faaliyet gösterir</span>
        <span class="meta ftr__pulse">Komuta merkezi aktif</span>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.ftr {
  position: relative;
  background: var(--ink-2);
  color: var(--paper);
  overflow: clip;
  padding-top: clamp(64px, 9vh, 130px);
}

.ftr__inner {
  will-change: transform;
}

.ftr__logo {
  width: clamp(96px, 8vw, 132px);
  height: auto;
  opacity: 0.92;
}

.ftr__top {
  display: grid;
  grid-template-columns: auto repeat(4, minmax(0, 1fr));
  gap: clamp(1.6rem, 3vw, 3rem);
  padding-bottom: clamp(48px, 7vh, 92px);
}

.ftr__col {
  display: grid;
  align-content: start;
  gap: 0.34rem;

  .meta {
    margin-bottom: 0.7rem;
  }
}

.ftr__line {
  font-size: clamp(0.95rem, 1.05vw, 1.08rem);
  letter-spacing: -0.015em;
  opacity: 0.74;
}

.ftr__link {
  position: relative;
  width: fit-content;

  @media (pointer: coarse) {
    padding-block: 0.55rem;
  }

  transition: opacity 0.45s var(--ease);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.55s var(--ease);
  }
  &:hover {
    opacity: 1;
    &::after {
      transform: scaleX(1);
      transform-origin: left;
    }
  }
}

.ftr__wordmark {
  padding-inline: clamp(8px, 1.4vw, 22px);
  overflow: clip;
}

.ftr__word {
  display: block;
  width: 100%;
  font-weight: 600;
  font-size: 7.4vw;
  line-height: 0.9;
  letter-spacing: -0.055em;
  white-space: nowrap;
  text-align: center;
  color: transparent;
  background: linear-gradient(180deg, rgba(237, 233, 225, 0.92) 12%, rgba(237, 233, 225, 0.16) 96%);
  -webkit-background-clip: text;
  background-clip: text;
  will-change: transform;
}

.ftr__bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2.4rem;
  justify-content: space-between;
  padding-block: clamp(20px, 3vh, 34px);
  border-top: 1px solid var(--rule);
  margin-top: clamp(14px, 3vh, 30px);
}

.ftr__pulse {
  display: inline-flex;
  align-items: center;
  gap: 0.55em;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--brass);
    animation: ftr-pulse 2.1s ease-in-out infinite;
  }
}

@keyframes ftr-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.15); }
}

@media (max-width: 900px) {
  .ftr__top {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 2.4rem;
  }
  .ftr__col--brand {
    grid-column: 1 / -1;
  }
}
</style>
