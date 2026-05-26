import { useEffect } from 'react'

/**
 * Calls `onEscape` when the user presses Escape while `enabled` is true.
 * Use to give modals and dropdowns a keyboard escape hatch.
 */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onEscape()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, onEscape])
}
