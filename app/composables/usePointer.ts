import { gsap } from './useMotion'

type PointerState = {
  x: number
  y: number
  /** −1 … 1 normalised around viewport centre, lerped. */
  nx: number
  ny: number
  down: boolean
}

const state = reactive<PointerState>({ x: 0, y: 0, nx: 0, ny: 0, down: false })

let bound = false
let raw = { x: 0, y: 0 }

/**
 * One global pointer signal, lerped on the GSAP ticker. Components read from it
 * instead of each attaching their own mousemove listener.
 */
export function usePointer() {
  if (import.meta.server) return { pointer: state, isFine: ref(false) }

  const isFine = useState('pointer-fine', () => false)

  if (!bound) {
    bound = true
    isFine.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    if (isFine.value) {
      raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      state.x = raw.x
      state.y = raw.y

      window.addEventListener(
        'pointermove',
        (e) => {
          raw.x = e.clientX
          raw.y = e.clientY
        },
        { passive: true }
      )
      window.addEventListener('pointerdown', () => (state.down = true), { passive: true })
      window.addEventListener('pointerup', () => (state.down = false), { passive: true })

      gsap.ticker.add(() => {
        state.x += (raw.x - state.x) * 0.14
        state.y += (raw.y - state.y) * 0.14
        state.nx = (state.x / window.innerWidth) * 2 - 1
        state.ny = (state.y / window.innerHeight) * 2 - 1
      })
    }
  }

  return { pointer: state, isFine }
}
