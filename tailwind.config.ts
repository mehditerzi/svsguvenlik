import type { Config } from 'tailwindcss'

/**
 * Tailwind is kept deliberately thin here: preflight is off (we ship our own
 * reset) and the design system lives in SCSS tokens. Utilities are only used
 * for one-off layout plumbing, never for the site's visual language.
 */
export default <Partial<Config>>{
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue'
  ],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: '#0A0B0D',
        paper: '#EDE9E1',
        brass: '#C08B3C'
      }
    }
  }
}
