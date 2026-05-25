/**
 * Theme Manager
 * Supports Focusan (dark lacquer) + Focusan-Shiro (washi paper) variants.
 */

import browser from 'webextension-polyfill'
import { focusanTheme } from './focusan'
import { focusanShiroTheme } from './focusan-shiro'
import type { Theme } from './types'

const STORAGE_KEY = 'theme_preference'

export const themeRegistry: Record<string, Theme> = {
  'focusan':       focusanTheme,
  'focusan-shiro': focusanShiroTheme,
}

/**
 * Read theme id from storage, fall back to dark Focusan.
 */
export async function getCurrentTheme(): Promise<Theme> {
  try {
    const stored = await browser.storage.sync.get(STORAGE_KEY)
    const pref = stored[STORAGE_KEY] as { themeId?: string } | undefined
    if (pref?.themeId && themeRegistry[pref.themeId]) {
      return themeRegistry[pref.themeId]
    }
  } catch {
    // ignore — fall back to default
  }
  return focusanTheme
}

/**
 * Persist + apply a theme by id.
 */
export async function setTheme(themeId: string): Promise<void> {
  const theme = themeRegistry[themeId] || focusanTheme
  await browser.storage.sync.set({
    [STORAGE_KEY]: { themeId: theme.metadata.id, appliedAt: Date.now() },
  })
  applyTheme(theme)
}

/**
 * Apply theme to current document
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement

  Object.entries(theme.colors).forEach(([key, value]) => {
    if (key === 'palette' && typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([paletteKey, paletteValue]) => {
        if (typeof paletteValue === 'string') {
          root.style.setProperty(`--palette-${paletteKey}`, paletteValue)
        }
      })
    } else if (typeof value === 'string') {
      root.style.setProperty(`--${key}`, value)
    }
  })

  root.style.setProperty('--font-sans', theme.typography.sans)
  root.style.setProperty('--font-mono', theme.typography.mono)
  root.style.setProperty('--shadow', theme.effects.shadow)
  root.style.setProperty('--shadow-lg', theme.effects.shadowLg || theme.effects.shadow)
  root.style.setProperty('--radius', theme.effects.radius)
  root.style.setProperty('--radius-lg', theme.effects.radiusLg || theme.effects.radius)

  root.setAttribute('data-theme', theme.metadata.id)

  const customStyleId = `theme-custom-${theme.metadata.id}`
  let customStyle = document.getElementById(customStyleId)

  if (!customStyle && theme.customCSS) {
    customStyle = document.createElement('style')
    customStyle.id = customStyleId
    customStyle.textContent = theme.customCSS
    document.head.appendChild(customStyle)
  }

  document.querySelectorAll('style[id^="theme-custom-"]').forEach(style => {
    if (style.id !== customStyleId) {
      style.remove()
    }
  })

  console.log(`[Theme] Applied theme: ${theme.metadata.name} ${theme.metadata.emoji}`)
}

/**
 * Initialize theme on page load — reads stored preference.
 */
export async function initializeTheme(): Promise<void> {
  const theme = await getCurrentTheme()
  applyTheme(theme)
}

export type { Theme } from './types'
export { focusanTheme, focusanShiroTheme }
