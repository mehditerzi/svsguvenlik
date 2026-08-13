export default defineNuxtPlugin((nuxtApp) => {
  // A component that throws while mounting the incoming page would otherwise
  // leave the curtain closed forever — onEnter never runs, so reveal() never
  // fires. Force it open so a broken page reads as broken, not as a stuck
  // loader with no way out.
  nuxtApp.hook('vue:error', (err) => {
    console.error('[svs] route render error, forcing curtain open', err)
    useCurtain().reveal()
  })
})
