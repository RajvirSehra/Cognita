import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from '@/registerServiceWorker'

describe('registerServiceWorker', () => {
  const originalServiceWorker = (navigator as unknown as { serviceWorker?: unknown }).serviceWorker

  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('does nothing when the browser has no serviceWorker support (offline-capable degrades gracefully)', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: undefined, configurable: true })
    expect(() => registerServiceWorker()).not.toThrow()
  })

  it('registers /sw.js on window load when supported and not in dev mode', () => {
    const register = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true })
    const originalDev = import.meta.env.DEV
    import.meta.env.DEV = false

    registerServiceWorker()
    window.dispatchEvent(new Event('load'))

    expect(register).toHaveBeenCalledWith('/sw.js')

    import.meta.env.DEV = originalDev
  })
})
