export function useMenu() {
  const open = useState('menu-open', () => false)

  const toggle = () => (open.value = !open.value)
  const close = () => (open.value = false)

  return { open, toggle, close }
}

/** Which colour the fixed header should render in for the current scroll band. */
export function useHeaderTheme() {
  return useState<'ink' | 'paper'>('header-theme', () => 'ink')
}
