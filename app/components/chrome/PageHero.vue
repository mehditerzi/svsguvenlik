<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const props = defineProps<{ index: string; title: string[]; lead: string; image?: string }>()

const root = ref<HTMLElement | null>(null)
const theme = useHeaderTheme()

onMounted(() => {
  theme.value = 'ink'
  const el = root.value!
  const lines = el.querySelectorAll('.phr__l span')
  const rest = el.querySelectorAll('.phr__fade')
  const fig = el.querySelector('.phr__fig')

  gsap.set(lines, { yPercent: 118 })
  gsap.set(rest, { y: 26, autoAlpha: 0 })
  if (fig) {
    gsap.set(fig, { clipPath: 'inset(0% 0% 100% 0%)' })
    gsap.set(fig.querySelector('img'), { scale: 1.3 })
  }

  const tl = gsap
    .timeline({ paused: true })
    .to(lines, { yPercent: 0, duration: 0.95, stagger: 0.06, ease: 'expo.out' })
    .to(rest, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.055, ease: 'expo.out' }, 0.22)

  if (fig) {
    tl.to(fig, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'expo.inOut' }, 0.12).to(
      fig.querySelector('img'),
      { scale: 1, duration: 1.5, ease: 'expo.out' },
      0.15
    )
  }

  const play = () => tl.play()
  if (document.documentElement.classList.contains('is-ready')) play()
  else window.addEventListener('site:ready', play, { once: true })
  window.addEventListener('site:ready', play)
  onBeforeUnmount(() => {
    window.removeEventListener('site:ready', play)
    tl.kill()
  })
})
</script>

<template>
  <header ref="root" class="phr on-ink stage">
    <div class="phr__inner shell">
      <span class="meta meta--brass phr__fade">{{ index }}</span>
      <h1 class="phr__h display d-lg">
        <span v-for="(l, i) in title" :key="i" class="phr__l line-mask"><span>{{ l }}</span></span>
      </h1>
      <p class="lede phr__lead phr__fade">{{ lead }}</p>
    </div>

    <figure v-if="image" class="phr__fig plate plate--graded">
      <NuxtImg :src="image" alt="" preload />
    </figure>
  </header>
</template>

<style scoped lang="scss">
.phr {
  position: relative;
  padding-top: clamp(120px, 20svh, 230px);
  padding-bottom: clamp(40px, 8vh, 90px);
}

.phr__inner {
  display: grid;
  gap: clamp(0.9rem, 3vh, 2rem);
}

.phr__h {
  max-width: 16ch;
}

.phr__l span {
  display: block;
  will-change: transform;
}

.phr__lead {
  max-width: 46ch;
  opacity: 0.76;
}

.phr__fig {
  margin-top: clamp(2rem, 6vh, 4.5rem);
  margin-inline: var(--gut);
  aspect-ratio: 21 / 9;
  will-change: clip-path;
}

@media (max-width: 640px) {
  .phr__fig {
    aspect-ratio: 4 / 3;
  }
}
</style>
