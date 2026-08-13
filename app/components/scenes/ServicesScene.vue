<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'
import { services } from '~/data/site'

/**
 * The service explorer. Desktop pairs the list with a large sticky diagram
 * that swaps as you hover or scroll; mobile gives every row its own inline
 * diagram. The visuals are live canvases, not stills.
 */
const root = ref<HTMLElement | null>(null)
const active = ref(0)
const hovering = ref(false)

useScene((_ctx, el) => {
  const rows = gsap.utils.toArray<HTMLElement>('.srv__row', el)

  gsap.fromTo(
    rows,
    { yPercent: 40, autoAlpha: 0 },
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1,
      stagger: 0.07,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.srv__list', start: 'top 84%', once: true }
    }
  )

  matchScene({
    desktop: () => {
      gsap.fromTo(
        el.querySelector('.srv__stage'),
        { autoAlpha: 0, scale: 0.92, clipPath: 'inset(12% 0% 12% 0%)' },
        {
          autoAlpha: 1,
          scale: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 76%', once: true }
        }
      )

      // scroll advances the active row when you are not pointing at one
      ScrollTrigger.create({
        trigger: '.srv__list',
        start: 'top 62%',
        end: 'bottom 62%',
        onUpdate: (self) => {
          if (hovering.value) return
          active.value = Math.min(services.length - 1, Math.floor(self.progress * services.length))
        }
      })
    }
  })
}, root)

/** Cross-dissolve the stage layers whenever the active service changes. */
watch(active, (n, o) => {
  const layers = root.value?.querySelectorAll<HTMLElement>('.srv__layer')
  if (!layers?.length || n === o) return
  gsap.killTweensOf([layers[n]!, layers[o]!])
  gsap
    .timeline({ defaults: { ease: 'expo.inOut', overwrite: 'auto' } })
    .to(layers[o]!, { autoAlpha: 0, clipPath: 'inset(0% 0% 100% 0%)', duration: 0.62 }, 0)
    .fromTo(
      layers[n]!,
      { autoAlpha: 1, clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.9 },
      0
    )

  const num = root.value?.querySelector('.srv__stage-n')
  if (num) gsap.fromTo(num, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'expo.out' })
})

const enter = (i: number) => {
  hovering.value = true
  active.value = i
}
const leave = () => (hovering.value = false)
</script>

<template>
  <section ref="root" class="srv section on-paper stage" @pointerleave="leave">
    <div class="srv__head shell">
      <span class="meta meta--brass">06 — Hizmetler</span>
      <MotionKineticHeading class="srv__title" :lines="['NE YAPIYORUZ']" :drift="[-4]" />
    </div>

    <div class="srv__grid shell">
      <ol class="srv__list">
        <li
          v-for="(s, i) in services"
          :key="s.n"
          class="srv__row"
          :class="active === i && 'is-on'"
          @pointerenter="enter(i)"
        >
          <button class="srv__hit" type="button" @focus="enter(i)" @click="enter(i)">
            <span class="srv__n serif-num">{{ s.n }}</span>
            <span class="srv__name">{{ s.title }}</span>
            <span class="srv__desc">{{ s.desc }}</span>
            <span class="srv__arw">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 19 19 5M9 5h10v10" fill="none" stroke="currentColor" stroke-width="1.3" />
              </svg>
            </span>
          </button>

          <!-- mobile: the diagram lives inside the row -->
          <div class="srv__inline">
            <GlServiceCanvas
              :variant="s.canvas.variant"
              :seed="(s.canvas.seed ?? 0) + 200"
              :speed="s.canvas.speed"
              :density="0.75"
              :mirror="!s.canvas.mirror"
            />
          </div>
        </li>
      </ol>

      <!-- desktop: one large sticky stage -->
      <div class="srv__stage">
        <div class="srv__stage-inner">
          <div v-for="(s, i) in services" :key="s.n" class="srv__layer" :style="{ zIndex: i }">
            <GlServiceCanvas
              :variant="s.canvas.variant"
              :seed="s.canvas.seed"
              :speed="s.canvas.speed"
              :density="s.canvas.density"
              :mirror="s.canvas.mirror"
              :active="active === i"
            />
          </div>

          <div class="srv__stage-ui">
            <ul class="srv__points">
              <li v-for="pt in services[active]!.points.slice(0, 3)" :key="pt">{{ pt }}</li>
            </ul>
            <div class="srv__stage-foot">
              <span class="srv__stage-n serif-num">{{ services[active]!.n }}</span>
              <span class="meta">Canlı şema · imleçle etkileşimli</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.srv {
  position: relative;
  z-index: 6;
  padding-block: clamp(74px, 13vh, 180px) clamp(70px, 12vh, 170px);
}

.srv__head {
  display: grid;
  gap: 0.9rem;
  margin-bottom: clamp(2rem, 6vh, 4.5rem);
}

.srv__title {
  font-size: clamp(3rem, 13vw, 15rem);
  letter-spacing: -0.05em;
}

.srv__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: clamp(1.6rem, 4vw, 4.5rem);
  align-items: start;
}

.srv__list {
  display: grid;
  border-top: 1px solid var(--rule);
}

.srv__row {
  position: relative;
  border-bottom: 1px solid var(--rule);
  will-change: transform, opacity;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.66s var(--ease);
  }
}

.srv__hit {
  position: relative;
  z-index: 1;
  width: 100%;
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr) 2rem;
  grid-template-areas:
    'n name arw'
    'n desc arw';
  align-items: center;
  gap: 0.3rem 1.2rem;
  text-align: left;
  padding-block: clamp(1rem, 2.6vh, 1.9rem);
  transition: padding 0.6s var(--ease), color 0.5s var(--ease);
}

.srv__n {
  grid-area: n;
  font-size: clamp(1.3rem, 1.9vw, 2rem);
  opacity: 0.5;
  transition: color 0.5s var(--ease), opacity 0.5s var(--ease);
}

.srv__name {
  grid-area: name;
  font-size: clamp(1.35rem, 2.5vw, 2.5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.02;
}

.srv__desc {
  grid-area: desc;
  font-size: clamp(0.9rem, 0.98vw, 1.02rem);
  line-height: 1.42;
  opacity: 0.6;
  max-width: 44ch;
}

.srv__arw {
  grid-area: arw;
  justify-self: end;
  opacity: 0;
  transform: translate(-8px, 8px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);

  svg {
    width: 24px;
    height: 24px;
  }
}

.srv__row.is-on {
  color: var(--paper);

  &::before {
    transform: scaleY(1);
    transform-origin: top;
  }
  .srv__hit {
    padding-inline: 1.1rem;
  }
  .srv__n {
    color: var(--brass);
    opacity: 1;
  }
  .srv__arw {
    opacity: 1;
    transform: translate(0, 0);
  }
}

/* ── the stage ───────────────────────────────────────────────────────────── */
.srv__stage {
  position: sticky;
  top: 16vh;
  will-change: transform, opacity;
}

.srv__stage-inner {
  position: relative;
  aspect-ratio: 4 / 5;
  max-height: 68svh;
  margin-left: auto;
  width: 100%;
  overflow: hidden;
  background: var(--ink);
}

.srv__layer {
  position: absolute;
  inset: 0;
  will-change: clip-path, transform;

  &:not(:first-child) {
    visibility: hidden;
  }
}

.srv__stage-ui {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 20;
  display: grid;
  gap: 1rem;
  padding: clamp(0.9rem, 2vw, 1.6rem);
  color: var(--paper);
  pointer-events: none;
  background: linear-gradient(180deg, rgba(10, 11, 13, 0) 0%, rgba(10, 11, 13, 0.8) 46%);
}

.srv__points {
  display: grid;
  gap: 0.34rem;

  li {
    position: relative;
    padding-left: 1rem;
    font-size: 0.9rem;
    line-height: 1.32;
    opacity: 0.86;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 5px;
      height: 5px;
      background: var(--brass);
    }
  }
}

.srv__stage-foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.srv__stage-n {
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  color: var(--brass);
  line-height: 0.8;
}

.srv__inline {
  display: none;
}

@media (max-width: 1024px) {
  .srv__grid {
    grid-template-columns: 1fr;
  }
  .srv__stage {
    display: none;
  }

  /* Explicit placement rather than re-declaring template areas: the named
     areas on the children come from the desktop rule and were still winning,
     which left the copy sitting beside the title in a squeezed column. */
  .srv__hit {
    grid-template-columns: 2.8rem minmax(0, 1fr);
    grid-template-areas: none;
    align-items: start;
    padding-block: 1.4rem;
  }
  /* `.srv__hit > *` outranks the children's own `grid-area`, so the column is
     settled in one place and each child only picks its row. */
  .srv__hit > * {
    grid-area: auto;
    grid-column: 2;
  }
  .srv__hit > .srv__n {
    grid-column: 1;
    grid-row: 1;
  }
  .srv__hit > .srv__name {
    grid-row: 1;
  }
  .srv__hit > .srv__desc {
    grid-row: 2;
    margin-top: 0.45rem;
    max-width: none;
  }
  .srv__arw {
    display: none;
  }

  /* every row carries its own live diagram */
  .srv__inline {
    display: block;
    position: relative;
    z-index: 1;
    aspect-ratio: 16 / 10;
    margin-bottom: 1.4rem;
  }

  .srv__row::before {
    display: none;
  }
  .srv__row.is-on {
    color: inherit;
  }
  .srv__row .srv__n {
    color: var(--brass);
    opacity: 1;
  }
}
</style>
