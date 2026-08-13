<script setup lang="ts">
import { gsap } from '~/composables/useMotion'

const props = withDefaults(defineProps<{ value: number; suffix?: string; prefix?: string; decimals?: number }>(), {
  suffix: '',
  prefix: '',
  decimals: 0
})

const root = ref<HTMLElement | null>(null)
const shown = ref('0')

useScene((_ctx, el) => {
  const o = { v: 0 }
  gsap.to(o, {
    v: props.value,
    duration: 2.1,
    ease: 'expo.out',
    onUpdate: () => (shown.value = o.v.toFixed(props.decimals)),
    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
  })
}, root)
</script>

<template>
  <span ref="root" class="cu">{{ prefix }}{{ shown }}{{ suffix }}</span>
</template>

<style scoped lang="scss">
.cu {
  font-variant-numeric: tabular-nums;
  display: inline-block;
}
</style>
