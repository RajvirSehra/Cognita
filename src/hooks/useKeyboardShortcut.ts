import { useEffect } from 'react'

interface ShortcutOptions {
  /** Skip firing while focus is inside an input, textarea, or select. */
  ignoreWhenTyping?: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/** Fires `handler` when `key` is pressed without modifier keys held. */
export function useKeyboardShortcut(key: string, handler: () => void, options: ShortcutOptions = {}): void {
  const { ignoreWhenTyping = true } = options

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (ignoreWhenTyping && isTypingTarget(event.target)) return
      handler()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler, ignoreWhenTyping])
}
