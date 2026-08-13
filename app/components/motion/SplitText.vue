<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'

/**
 * Mask-based text reveal. Splits into lines (from explicit `lines`) then into
 * words or characters. Everything animates from below a clipping mask — never
 * a bare opacity fade.
 */
const props = withDefaults(
  defineProps<{
    lines: string[] | string
    as?: string
    mode?: 'line' | 'word' | 'char'
    stagger?: number
    delay?: number
    duration?: number
    /** 'scroll' waits for the element, 'load' waits for the intro sequence. */
    trigger?: 'scroll' | 'load' | 'manual'
    start?: string
    y?: string
    rotate?: number
  }>(),
  {
    as: 'div',
    mode: 'word',
    stagger: 0.055,
    delay: 0,
    duration: 1.05,
    trigger: 'scroll',
    start: 'top 82%',
    y: '110%',
    rotate: 0
  }
)

const root = ref<HTMLElement | null>(null)
const lineList = computed(() => (Array.isArray(props.lines) ? props.lines : [props.lines]))

const pieces = computed(() =>
  lineList.value.map((line) => {
    if (props.mode === 'line') return [line]
    if (props.mode === 'char') return line.split('')
    return line.split(' ')
  })
)

let tl: gsap.core.Timeline | null = null

const play = () => tl?.play()
defineExpose({ play })

onMounted(() => {
  if (!root.value) return
  const items = root.value.querySelectorAll<HTMLElement>('.st__i')
  gsap.set(items, { yPercent: 108, rotate: props.rotate })

  tl = gsap.timeline({ paused: true }).to(items, {
    yPercent: 0,
    rotate: 0,
    duration: props.duration,
    stagger: props.stagger,
    ease: 'expo.out',
    delay: props.delay
  })

  if (props.trigger === 'scroll') {
    ScrollTrigger.create({ trigger: root.value, start: props.start, once: true, onEnter: () => tl?.play() })
  } else if (props.trigger === 'load') {
    const go = () => tl?.play()
    if (document.documentElement.classList.contains('is-ready')) go()
    else window.addEventListener('site:ready', go, { once: true })
  }
})

onBeforeUnmount(() => tl?.kill())
</script>

<template>
  <component :is="as" ref="root" class="st">
    <span v-for="(line, li) in pieces" :key="li" class="line-mask st__line">
      <span v-for="(p, pi) in line" :key="pi" class="st__i" :class="{ 'st__i--char': mode === 'char' }">{{
        p
      }}<template v-if="mode === 'word' && pi < line.length - 1">&nbsp;</template></span>
    </span>
  </component>
</template>

<style scoped lang="scss">
.st__line {
  display: block;
}
.st__i {
  display: inline-block;
  will-change: transform;
}
.st__i--char {
  white-space: pre;
}
</style>
