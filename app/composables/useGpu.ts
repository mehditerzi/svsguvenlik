let cached: boolean | null = null

/**
 * True when WebGL is running on a software rasteriser (SwiftShader, llvmpipe,
 * SVGA3D…). Those machines exist — remote desktops, VMs, machines with GPU
 * acceleration disabled — and a scene that is trivial on a real GPU can drop
 * them to ~20fps. The GL scenes use this to shed work rather than stutter.
 */
export function isSoftwareGL(): boolean {
  if (cached !== null) return cached
  if (import.meta.server) return false
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    const name = info ? String(gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    cached = /swiftshader|llvmpipe|software|svga3d|basic render/i.test(name)
  } catch {
    cached = false
  }
  return cached
}
