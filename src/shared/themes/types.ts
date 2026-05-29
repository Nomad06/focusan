/**
 * Theme System Types
 * Defines the structure for switchable themes in the extension
 */

import type React from 'react'

export interface ThemeColors {
  // Background colors
  bg1: string
  bg2: string
  card: string
  card2: string

  // Text colors
  text: string
  muted: string

  // UI colors
  border: string
  accent: string
  accent2: string
  danger: string
  success?: string
  gold?: string

  // Additional palette (optional)
  palette?: Record<string, string>
}

export interface ThemeTypography {
  sans: string
  mono: string
}

export interface ThemeEffects {
  shadow: string
  shadowLg?: string
  radius: string
  radiusLg?: string
}

export interface ThemeAnimations {
  // CSS animation names that this theme provides
  available: string[]
}

export interface ThemeMetadata {
  id: string
  name: string
  description: string
  emoji: string
  author?: string
  version?: string
}

/**
 * Surfaces a theme can override.
 * Themes that only swap CSS leave this empty; themes that want a different
 * page shape provide one or more components, which get rendered in place
 * of the default surfaces by the corresponding main.tsx entry.
 */
export interface ThemeSurfaces {
  popup?: React.ComponentType
  options?: React.ComponentType
  blocked?: React.ComponentType
}

/**
 * Complete theme definition
 */
export interface Theme {
  metadata: ThemeMetadata
  colors: ThemeColors
  typography: ThemeTypography
  effects: ThemeEffects
  animations?: ThemeAnimations

  // Custom CSS that gets injected
  customCSS?: string

  // Optional JSX-level surface overrides — present only on "deep" themes
  surfaces?: ThemeSurfaces
}

/**
 * Theme preference stored in chrome.storage
 */
export interface ThemePreference {
  themeId: string
  appliedAt: number
}

/**
 * Helper type for theme registry
 */
export type ThemeRegistry = Record<string, Theme>
