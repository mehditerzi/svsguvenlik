<script setup lang="ts">
import { gsap, ScrollTrigger } from '~/composables/useMotion'

/**
 * The site's primary 3D object: a draggable coverage sphere.
 *
 * 81 nodes (one per province) sit on a wireframe globe with a scanning ring
 * sweeping through them. It auto-rotates, accepts pointer/touch drag with
 * inertia, and the active node is picked by raycast so the label beside it
 * changes as you turn the globe. Works identically on touch.
 */
const emit = defineEmits<{ (e: 'node', index: number): void }>()

const host = ref<HTMLElement | null>(null)
const dragging = ref(false)
const hinted = ref(false)
let cleanup: (() => void) | null = null

onMounted(async () => {
  // three.js is ~150KB of the initial bundle if imported statically, and this
  // scene sits behind the intro curtain anyway — fetch it on mount instead.
  const THREE = await import('three')

  const el = host.value
  if (!el) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ antialias: !isSoftwareGL(), alpha: true, powerPreference: 'high-performance' })
  const soft = isSoftwareGL()
  renderer.setPixelRatio(soft ? 1 : Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100)
  camera.position.set(0, 0, 9.4)

  const globe = new THREE.Group()
  scene.add(globe)

  const R = 2.35
  const PAPER = new THREE.Color('#8894A2')
  const BRASS = new THREE.Color('#C08B3C')

  // ── wireframe cage: meridians + parallels, drawn as line segments ──────────
  const pts: number[] = []
  const MER = soft ? 10 : 16
  const PAR = soft ? 7 : 9
  for (let m = 0; m < MER; m++) {
    const lon = (m / MER) * Math.PI * 2
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI - Math.PI / 2
      const b = ((i + 1) / 48) * Math.PI - Math.PI / 2
      pts.push(
        R * Math.cos(a) * Math.cos(lon), R * Math.sin(a), R * Math.cos(a) * Math.sin(lon),
        R * Math.cos(b) * Math.cos(lon), R * Math.sin(b), R * Math.cos(b) * Math.sin(lon)
      )
    }
  }
  for (let p = 1; p < PAR; p++) {
    const lat = (p / PAR) * Math.PI - Math.PI / 2
    const r = R * Math.cos(lat)
    const y = R * Math.sin(lat)
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2
      const b = ((i + 1) / 64) * Math.PI * 2
      pts.push(r * Math.cos(a), y, r * Math.sin(a), r * Math.cos(b), y, r * Math.sin(b))
    }
  }
  const cageGeo = new THREE.BufferGeometry()
  cageGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  const cageMat = new THREE.LineBasicMaterial({ color: PAPER, transparent: true, opacity: 0.34 })
  const cage = new THREE.LineSegments(cageGeo, cageMat)
  globe.add(cage)

  // solid core so back-facing nodes are occluded — reads as a real volume
  const coreGeo = new THREE.SphereGeometry(R * 0.985, soft ? 28 : 48, soft ? 20 : 32)
  const coreMat = new THREE.MeshBasicMaterial({ color: '#141C25' })
  globe.add(new THREE.Mesh(coreGeo, coreMat))

  // ── 81 coverage nodes ─────────────────────────────────────────────────────
  const COUNT = 81
  const nodeGeo = new THREE.SphereGeometry(0.038, soft ? 6 : 10, soft ? 6 : 10)
  // no `vertexColors`: InstancedMesh.setColorAt drives instanceColor, and asking
  // for vertex colours would make the shader read a geometry attribute that
  // doesn't exist — which renders every node black.
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, COUNT)
  const dummy = new THREE.Object3D()
  const col = new THREE.Color()
  const nodePos: THREE.Vector3[] = []
  const hot: boolean[] = []

  for (let i = 0; i < COUNT; i++) {
    // Fibonacci sphere — even distribution without clustering at the poles
    const y = 1 - (i / (COUNT - 1)) * 2
    const rad = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * 2.399963229728653
    const v = new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad).multiplyScalar(R * 1.012)
    nodePos.push(v)
    hot.push(i % 7 === 0)
    dummy.position.copy(v)
    dummy.scale.setScalar(hot[i] ? 1.6 : 1)
    dummy.updateMatrix()
    nodes.setMatrixAt(i, dummy.matrix)
    nodes.setColorAt(i, col.copy(hot[i] ? BRASS : PAPER))
  }
  nodes.instanceMatrix.needsUpdate = true
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true
  globe.add(nodes)

  // ── scanning ring ─────────────────────────────────────────────────────────
  const ringGeo = new THREE.TorusGeometry(R * 1.06, 0.006, 6, soft ? 64 : 128)
  const ringMat = new THREE.MeshBasicMaterial({ color: BRASS, transparent: true, opacity: 0.7 })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2
  globe.add(ring)

  const haloGeo = new THREE.SphereGeometry(R * 1.055, soft ? 24 : 40, soft ? 18 : 28)
  const haloMat = new THREE.MeshBasicMaterial({
    color: BRASS,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide
  })
  globe.add(new THREE.Mesh(haloGeo, haloMat))

  // ── interaction: drag with inertia ────────────────────────────────────────
  let velX = 0.0016
  let velY = 0
  let last: { x: number; y: number } | null = null
  let idle = 0

  const down = (e: PointerEvent) => {
    dragging.value = true
    hinted.value = true
    last = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    if (!last) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    velX = dx * 0.00042
    velY = dy * 0.00034
    globe.rotation.y += dx * 0.0055
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * 0.0042, -0.85, 0.85)
    last = { x: e.clientX, y: e.clientY }
    idle = 0
  }
  const up = () => {
    dragging.value = false
    last = null
  }

  const cv = renderer.domElement
  cv.style.touchAction = 'none'
  cv.addEventListener('pointerdown', down)
  cv.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)

  // ── active node pick: whichever hot node is nearest the camera ────────────
  let activeIdx = -1
  const world = new THREE.Vector3()

  // ── loop ──────────────────────────────────────────────────────────────────
  let t = 0
  const tick = () => {
    t += 0.016
    if (!dragging.value) {
      // ease back to the idle spin
      idle = Math.min(1, idle + 0.006)
      velX += (0.0016 - velX) * 0.02
      velY += (0 - velY) * 0.05
      globe.rotation.y += velX * (0.4 + idle * 0.6) * 12
      globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + velY * 6, -0.85, 0.85)
      globe.rotation.x += (0 - globe.rotation.x) * 0.006
    }

    ring.rotation.z = t * 0.5
    ring.position.y = Math.sin(t * 0.55) * R * 0.92
    const s = Math.cos(Math.asin(THREE.MathUtils.clamp(ring.position.y / (R * 1.06), -1, 1)))
    ring.scale.setScalar(Math.max(0.05, s))

    // front-most hot node drives the caption
    let best = -1
    let bestZ = -Infinity
    for (let i = 0; i < COUNT; i++) {
      if (!hot[i]) continue
      world.copy(nodePos[i]!).applyMatrix4(globe.matrixWorld)
      if (world.z > bestZ) {
        bestZ = world.z
        best = i
      }
    }
    if (best !== activeIdx) {
      activeIdx = best
      emit('node', best)
    }

    renderer.render(scene, camera)
  }

  globe.rotation.x = 0.22
  if (!reduced) gsap.ticker.add(tick)
  else renderer.render(scene, camera)

  // scroll ties the globe into the page rhythm
  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      camera.position.z = 9.8 - self.progress * 1.0
      globe.position.y = (0.5 - self.progress) * 0.9
    }
  })

  const onResize = () => {
    if (!el.clientWidth) return
    camera.aspect = el.clientWidth / el.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(el.clientWidth, el.clientHeight)
  }
  window.addEventListener('resize', onResize)

  const io = new IntersectionObserver(
    ([e]) => {
      if (reduced) return
      e!.isIntersecting ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)
    },
    { threshold: 0 }
  )
  io.observe(el)

  cleanup = () => {
    gsap.ticker.remove(tick)
    io.disconnect()
    st.kill()
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    cv.removeEventListener('pointerdown', down)
    cv.removeEventListener('pointermove', move)
    ;[cageGeo, coreGeo, nodeGeo, ringGeo, haloGeo].forEach((g) => g.dispose())
    ;[cageMat, coreMat, nodeMat, ringMat, haloMat].forEach((m) => m.dispose())
    renderer.dispose()
    el.removeChild(cv)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="host" class="cvs" :class="[dragging && 'is-dragging', hinted && 'is-hinted']">
    <span class="cvs__hint meta">Sürükleyin</span>
  </div>
</template>

<style scoped lang="scss">
.cvs {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: grab;

  &.is-dragging {
    cursor: grabbing;
  }

  :deep(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}

.cvs__hint {
  position: absolute;
  left: 50%;
  bottom: 4%;
  transform: translateX(-50%);
  padding: 0.5em 1.1em;
  border: 1px solid var(--rule);
  border-radius: 999px;
  pointer-events: none;
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
  animation: cvs-breathe 2.6s ease-in-out infinite;
}

.is-hinted .cvs__hint {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
  animation: none;
}

@keyframes cvs-breathe {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
