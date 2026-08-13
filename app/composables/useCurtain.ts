type CurtainApi = { cover: (label?: string) => Promise<void>; reveal: () => Promise<void> }

let api: CurtainApi | null = null

export function useCurtain() {
  return {
    register(next: CurtainApi) {
      api = next
    },
    cover: (label?: string) => api?.cover(label) ?? Promise.resolve(),
    reveal: () => api?.reveal() ?? Promise.resolve()
  }
}
