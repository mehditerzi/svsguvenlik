<template>
  <div class="grain" aria-hidden="true" />
</template>

<style scoped lang="scss">
/**
 * Film grain as a static tiling texture.
 *
 * This used to be an animated SVG `feTurbulence` under `mix-blend-mode:
 * overlay`. Both are traps at full-viewport size: the blend mode forces every
 * layer beneath it — including the live canvases — to be re-composited each
 * frame, which cost roughly 26fps on its own. A pre-baked tile with plain
 * alpha costs a single texture upload.
 */
.grain {
  position: fixed;
  inset: -64px;
  z-index: 900;
  pointer-events: none;
  opacity: 0.042;
  background-image: url('/media/noise.png');
  background-repeat: repeat;
  background-size: 128px 128px;
  animation: grain-shift 0.7s steps(1) infinite;
}

/* Stepping the background position keeps the flicker without moving a layer. */
@keyframes grain-shift {
  0% { background-position: 0 0; }
  25% { background-position: -37px 22px; }
  50% { background-position: 26px -31px; }
  75% { background-position: -19px -14px; }
  100% { background-position: 0 0; }
}

@media (prefers-reduced-motion: reduce) {
  .grain { animation: none; }
}
</style>
