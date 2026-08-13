export type CursorMode = 'default' | 'label' | 'drag' | 'hidden'

const mode = ref<CursorMode>('default')
const label = ref('')
const magnet = ref(0)

/** Shared state for the custom cursor; any element can claim it on hover. */
export function useCursor() {
  const set = (m: CursorMode, text = '') => {
    mode.value = m
    label.value = text
  }
  const reset = () => {
    mode.value = 'default'
    label.value = ''
  }
  return { mode, label, magnet, set, reset }
}
