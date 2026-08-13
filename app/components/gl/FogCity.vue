<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'

/**
 * The hero's spatial backdrop: an instanced skyline receding into exponential
 * fog. Scroll dollies the camera through it, the pointer yaws it a few degrees.
 * One draw call, no lights, no textures — cheap enough to leave running.
 */
const props = withDefaults(defineProps<{ scrollTarget?: string }>(), { scrollTarget: '' })

const host = ref<HTMLElement | null>(null)
const { pointer, isFine } = usePointer()
let cleanup: (() => void) | null = null

onMounted(async () => {
  // three.js is ~150KB of the initial bundle if imported statically, and this
  // scene sits behind the intro curtain anyway — fetch it on mount instead.
  const THREE = await import('three')

  const el = host.value
  if (!el) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Software rasterisers pay per pixel and per triangle; halve both.
  const soft = isSoftwareGL()
  const dpr = soft ? 1 : Math.min(window.devicePixelRatio, 1.75)
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const FOG = new THREE.Color('#0A0B0D')
  scene.fog = new THREE.FogExp2(FOG, 0.0132)

  const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 400)

  // A portrait viewport puts the camera inside the first row of towers, which
  // reads as flat slabs. Pull back and lift so the skyline stays a skyline.
  const framing = () => {
    const portrait = el.clientWidth / el.clientHeight < 0.9
    return portrait ? { z: 86, y: 20, fov: 42 } : { z: 46, y: 7.5, fov: 52 }
  }
  let frame = framing()
  camera.fov = frame.fov
  camera.position.set(0, frame.y, frame.z)
  camera.updateProjectionMatrix()

  // ── skyline ────────────────────────────────────────────────────────────────
  const COLS = soft ? 11 : 15
  const ROWS = soft ? 9 : 13
  const geo = new THREE.BoxGeometry(1, 1, 1)
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: true })
  const count = COLS * ROWS
  const mesh = new THREE.InstancedMesh(geo, mat, count)
  const dummy = new THREE.Object3D()
  const color = new THREE.Color()
  const rand = (seed: number) => {
    const x = Math.sin(seed * 127.1) * 43758.5453
    return x - Math.floor(x)
  }

  let i = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = r * COLS + c + 1
      const h = 4 + rand(s) * (r < 5 ? 30 : 20)
      const w = 3.1 + rand(s * 2.3) * 2.4
      const x = (c - (COLS - 1) / 2) * 7.6 + (rand(s * 3.7) - 0.5) * 3.2
      const z = -r * 15 + (rand(s * 5.1) - 0.5) * 5

      dummy.position.set(x, h / 2, z)
      dummy.scale.set(w, h, w * 0.92)
      dummy.rotation.y = (rand(s * 7.3) - 0.5) * 0.18
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      // slight tonal separation so silhouettes stay legible in the fog
      const v = 0.34 + rand(s * 9.9) * 0.34
      color.setRGB(v * 0.92, v * 1.02, v * 1.2)
      mesh.setColorAt(i, color)
      i++
    }
  }
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  scene.add(mesh)

  // ── ground haze ────────────────────────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 600),
    new THREE.MeshBasicMaterial({ color: '#232E3A', fog: true })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  // sweeping searchlight: an additive cone that rakes across the towers
  const beamGeo = new THREE.ConeGeometry(9, 120, 24, 1, true)
  const beamMat = new THREE.MeshBasicMaterial({
    color: '#C8A468',
    transparent: true,
    opacity: 0.055,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false
  })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  beam.position.set(0, 46, -30)
  if (!soft) scene.add(beam)

  // a single warm marker light, far away — the one bit of brass in the scene
  const beaconGeo = new THREE.SphereGeometry(0.5, 8, 8)
  const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: '#C08B3C', fog: true }))
  beacon.position.set(14, 26, -62)
  scene.add(beacon)

  // ── motion ─────────────────────────────────────────────────────────────────
  const st = ScrollTrigger.create({
    trigger: props.scrollTarget ? document.querySelector(props.scrollTarget)! : el,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      camera.position.z = frame.z - self.progress * frame.z * 0.72
      camera.position.y = frame.y + self.progress * 5.5
    }
  })

  // On a software rasteriser this scene is pipeline-bound, so resolution cuts
  // barely help. Halving the render rate does: a steady 30 reads far better
  // than a fluctuating 23, and the camera easing hides the cadence.
  let skip = false
  let t = 0
  const tick = () => {
    if (soft) {
      skip = !skip
      if (skip) return
    }
    t += 0.0025
    const px = isFine.value ? pointer.nx : 0
    const py = isFine.value ? pointer.ny : 0
    camera.position.x += (px * 4.6 - camera.position.x) * 0.045
    camera.rotation.y += (-px * 0.055 - camera.rotation.y) * 0.05
    camera.rotation.x += (-py * 0.028 - camera.rotation.x) * 0.05
    beacon.material.opacity = 1
    beacon.scale.setScalar(0.85 + Math.sin(t * 22) * 0.15)

    // rake the beam back and forth, tilting as it goes
    beam.rotation.z = Math.PI + Math.sin(t * 1.6) * 0.5
    beam.rotation.x = Math.sin(t * 1.1) * 0.22
    beamMat.opacity = 0.045 + (Math.sin(t * 3.2) * 0.5 + 0.5) * 0.05
    renderer.render(scene, camera)
  }
  gsap.ticker.add(tick)

  const onResize = () => {
    if (!el.clientWidth) return
    frame = framing()
    camera.aspect = el.clientWidth / el.clientHeight
    camera.fov = frame.fov
    camera.position.z = frame.z
    camera.position.y = frame.y
    camera.updateProjectionMatrix()
    renderer.setSize(el.clientWidth, el.clientHeight)
  }
  window.addEventListener('resize', onResize)

  // stop rendering when the hero has scrolled away
  const io = new IntersectionObserver(
    ([e]) => (e!.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
    { threshold: 0 }
  )
  io.observe(el)

  cleanup = () => {
    gsap.ticker.remove(tick)
    io.disconnect()
    window.removeEventListener('resize', onResize)
    st.kill()
    geo.dispose()
    mat.dispose()
    beaconGeo.dispose()
    beamGeo.dispose()
    beamMat.dispose()
    renderer.dispose()
    el.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="fog" aria-hidden="true" />
</template>

<style scoped lang="scss">
.fog {
  position: absolute;
  inset: 0;
  overflow: hidden;

  :deep(canvas) {
    width: 100% !important;
    height: 100% !important;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(120% 66% at 50% 100%, rgba(192, 139, 60, 0.34), transparent 54%),
      linear-gradient(180deg, rgba(10, 11, 13, 0.7) 0%, rgba(10, 11, 13, 0) 56%, rgba(10, 11, 13, 0.44) 100%);
    pointer-events: none;
  }
}
</style>
