/**
 * Focusan — Dennō (電脳) — Cyber-brain Netrunner HUD
 * Sterile holographic interface, amber phosphor data, indigo glow accents.
 * Inspired by Ghost in the Shell ops UI: targeting reticles, hex addresses,
 * monospace tabular layout, block-char progress, perspective grid floor.
 */

import type { Theme } from './types'
import DennoPopup from '../../popup/DennoApp'
import DennoOptions from '../../options/DennoApp'
import DennoBlocked from '../../pages/blocked/DennoBlocked'

export const focusanDennoTheme: Theme = {
  surfaces: {
    popup:   DennoPopup,
    options: DennoOptions,
    blocked: DennoBlocked,
  },

  metadata: {
    id: 'focusan-denno',
    name: 'Focusan — 電脳',
    description: 'Dennō. Amber HUD, indigo grid, netrunner ops.',
    emoji: '◆',
    author: 'Focusan Dojo',
    version: '3.0.0',
  },

  colors: {
    bg1: '#050608',
    bg2: '#0A0D12',
    card: '#0F141B',
    card2: '#1A2230',

    text: '#E8B847',
    muted: '#5A6171',

    border: 'rgba(232, 184, 71, 0.22)',
    accent: '#E8B847',
    accent2: '#FFB930',
    danger: '#FF3B5C',
    success: '#5FE89B',
    gold: '#FFB930',

    palette: {
      void:        '#050608',
      panel:       '#0F141B',
      panelHi:     '#1A2230',
      amber:       '#E8B847',
      amberHi:     '#FFD577',
      amberDim:    '#8A6B2C',
      indigo:      '#4A5BD9',
      indigoHi:    '#6B7EF5',
      indigoDim:   '#2D3580',
      signal:      '#FF3B5C',
      okGreen:     '#5FE89B',
      steel:       '#5A6171',
      ghost:       '#E8E2D4',
      // legacy aliases
      sumi:        '#050608',
      urushi:      '#0A0D12',
      kokutan:     '#0F141B',
      akabeni:     '#E8B847',
      enji:        '#8A6B2C',
      kinpaku:     '#FFD577',
      kinari:      '#E8B847',
      nezumi:      '#5A6171',
      sabi:        '#2D3580',
    },
  },

  typography: {
    sans: "'Rajdhani', 'Space Grotesk', 'Inter', 'Noto Sans JP', sans-serif",
    mono: "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Consolas, monospace",
  },

  effects: {
    shadow: '0 0 0 1px rgba(232, 184, 71, 0.12), 0 4px 18px rgba(0, 0, 0, 0.8)',
    shadowLg: '0 0 0 1px rgba(232, 184, 71, 0.16), 0 0 22px -4px rgba(74, 91, 217, 0.4), 0 8px 32px rgba(0, 0, 0, 0.85)',
    radius: '0px',
    radiusLg: '0px',
  },

  animations: {
    available: ['scanlineDrift', 'cursorBlink', 'reticleScan', 'gridPulse', 'tickRotate', 'glowPulse', 'fadeIn', 'fadeInUp'],
  },

  customCSS: `
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    /*  FOCUSAN — DENNŌ (電脳) — Netrunner HUD                        */
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700;900&display=swap');

    :root[data-theme="focusan-denno"] {
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;

      /* ─ Dennō palette ─ */
      --c-void:       #050608;
      --c-bg:         #0A0D12;
      --c-panel:      #0F141B;
      --c-panel-hi:   #1A2230;
      --c-amber:      #E8B847;
      --c-amber-hi:   #FFD577;
      --c-amber-dim:  #8A6B2C;
      --c-amber-d2:   #4A3818;
      --c-indigo:     #4A5BD9;
      --c-indigo-hi:  #6B7EF5;
      --c-indigo-dim: #2D3580;
      --c-signal:     #FF3B5C;
      --c-ok:         #5FE89B;
      --c-steel:      #5A6171;
      --c-ghost:      #E8E2D4;

      /* legacy aliases */
      --color-sumi:    #050608;
      --color-urushi:  #0A0D12;
      --color-kokutan: #0F141B;
      --color-akabeni: #E8B847;
      --color-enji:    #8A6B2C;
      --color-kinpaku: #FFD577;
      --color-kinari:  #E8B847;
      --color-nezumi:  #5A6171;
      --color-sabi:    #2D3580;
      --seal-red:      var(--c-amber);
      --gold-leaf:     var(--c-amber-hi);
      --ink-black:     var(--c-void);
      --paper-cream:   var(--c-amber);

      --bg1:    #050608;
      --bg2:    #0A0D12;
      --card:   #0F141B;
      --card2:  #1A2230;
      --text:   #E8B847;
      --muted:  #5A6171;
      --border: rgba(232, 184, 71, 0.22);

      --shadow-sm:    0 0 0 1px rgba(232, 184, 71, 0.10);
      --shadow:       0 0 0 1px rgba(232, 184, 71, 0.12), 0 4px 18px rgba(0, 0, 0, 0.8);
      --shadow-lg:    0 0 0 1px rgba(232, 184, 71, 0.16), 0 0 22px -4px rgba(74, 91, 217, 0.4), 0 8px 32px rgba(0, 0, 0, 0.85);
      --shadow-float: 0 0 0 1px rgba(232, 184, 71, 0.28), 0 0 32px -4px rgba(232, 184, 71, 0.3), 0 12px 36px rgba(0, 0, 0, 0.9);
      --amber-glow:   0 0 16px rgba(232, 184, 71, 0.45), 0 0 32px rgba(232, 184, 71, 0.18);
      --indigo-glow:  0 0 18px rgba(74, 91, 217, 0.5), 0 0 40px rgba(74, 91, 217, 0.25);
      --signal-glow:  0 0 14px rgba(255, 59, 92, 0.55);

      --radius-sm: 0px;
      --radius-md: 0px;
      --radius-lg: 0px;
      --radius-full: 9999px;

      --transition-fast:   0.1s ease-out;
      --transition-normal: 0.2s linear;

      --font-mono:    'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Consolas, monospace;
      --font-display: 'Rajdhani', 'Space Grotesk', sans-serif;
      --font-kanji:   'Noto Sans JP', sans-serif;
      --font-serif:   'Rajdhani', 'Space Grotesk', sans-serif;
      --font-brush:   'Noto Sans JP', sans-serif;

      /* Perspective grid floor — indigo wireframe (for hero areas) */
      --grid-floor: linear-gradient(rgba(74, 91, 217, 0.16) 1px, transparent 1px) 0 0 / 40px 40px,
                    linear-gradient(90deg, rgba(74, 91, 217, 0.16) 1px, transparent 1px) 0 0 / 40px 40px;

      /* Scanline overlay */
      --scanlines: repeating-linear-gradient(
        0deg,
        transparent 0,
        transparent 2px,
        rgba(232, 184, 71, 0.025) 2px,
        rgba(232, 184, 71, 0.025) 3px);

      /* CRT vignette */
      --crt-vignette: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.55) 100%);
    }

    /* ─── BODY — void with scanlines + grid + vignette ─── */
    [data-theme="focusan-denno"] body {
      background-color: var(--c-void);
      background-image:
        radial-gradient(ellipse 50% 30% at 50% 0%, rgba(232, 184, 71, 0.05) 0%, transparent 70%),
        radial-gradient(ellipse 60% 40% at 50% 100%, rgba(74, 91, 217, 0.06) 0%, transparent 70%);
      color: var(--c-amber);
      font-family: var(--font-mono);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      position: relative;
      overflow-x: hidden;
    }

    /* Scanline overlay */
    [data-theme="focusan-denno"] body::before {
      content: '';
      position: fixed;
      inset: 0;
      background: var(--scanlines);
      pointer-events: none;
      z-index: 1;
      animation: scanlineDrift 8s linear infinite;
    }

    /* Vignette */
    [data-theme="focusan-denno"] body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: var(--crt-vignette);
      pointer-events: none;
      z-index: 2;
    }

    [data-theme="focusan-denno"] body > * {
      position: relative;
      z-index: 3;
    }

    /* ─── KEYFRAMES ─── */
    @keyframes scanlineDrift {
      0%   { background-position: 0 0; }
      100% { background-position: 0 6px; }
    }
    @keyframes cursorBlink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    @keyframes reticleScan {
      0%   { transform: rotate(0deg); opacity: 0.5; }
      50%  { opacity: 1; }
      100% { transform: rotate(360deg); opacity: 0.5; }
    }
    @keyframes gridPulse {
      0%, 100% { opacity: 0.7; }
      50%      { opacity: 1; }
    }
    @keyframes tickRotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: var(--amber-glow); }
      50%      { box-shadow: 0 0 24px rgba(232, 184, 71, 0.65), 0 0 48px rgba(232, 184, 71, 0.28); }
    }
    @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dataLineSweep {
      0%   { background-position: -100% 0; }
      100% { background-position: 200% 0; }
    }

    /* ─── HUD PRIMITIVES ─── */

    [data-theme="focusan-denno"] .hud-mono {
      font-family: var(--font-mono);
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }

    [data-theme="focusan-denno"] .hud-display {
      font-family: var(--font-display);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    [data-theme="focusan-denno"] .hud-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--c-amber-dim);
    }

    [data-theme="focusan-denno"] .hud-hex {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--c-indigo-hi);
      letter-spacing: 0.05em;
    }

    [data-theme="focusan-denno"] .hud-kanji {
      font-family: var(--font-kanji);
      font-weight: 900;
      color: var(--c-amber);
      text-shadow: 0 0 10px rgba(232, 184, 71, 0.35);
    }

    /* HUD panel — bordered + corner brackets */
    [data-theme="focusan-denno"] .hud-panel {
      background:
        linear-gradient(180deg, rgba(15, 20, 27, 0.85) 0%, rgba(10, 13, 18, 0.85) 100%);
      border: 1px solid rgba(232, 184, 71, 0.22);
      position: relative;
      padding: 18px;
      backdrop-filter: blur(2px);
    }
    /* Top-left + bottom-right corner brackets */
    [data-theme="focusan-denno"] .hud-panel::before,
    [data-theme="focusan-denno"] .hud-panel::after {
      content: '';
      position: absolute;
      width: 12px; height: 12px;
      border: 2px solid var(--c-amber);
      pointer-events: none;
    }
    [data-theme="focusan-denno"] .hud-panel::before {
      top: -2px; left: -2px;
      border-right: none; border-bottom: none;
    }
    [data-theme="focusan-denno"] .hud-panel::after {
      bottom: -2px; right: -2px;
      border-left: none; border-top: none;
    }

    /* Highlight variant — 4-corner brackets via inner spans handled in JSX */
    [data-theme="focusan-denno"] .hud-panel-hi {
      box-shadow: var(--shadow-lg);
    }

    /* Panel header strip — sub-title bar */
    [data-theme="focusan-denno"] .hud-panel-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 10px;
      margin-bottom: 14px;
      border-bottom: 1px dashed rgba(232, 184, 71, 0.18);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--c-amber-dim);
    }

    /* Status pill */
    [data-theme="focusan-denno"] .hud-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 8px;
      border: 1px solid currentColor;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      line-height: 1.4;
    }
    [data-theme="focusan-denno"] .hud-status::before {
      content: '';
      width: 5px; height: 5px;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
      animation: glowPulse 2s ease-in-out infinite;
    }
    [data-theme="focusan-denno"] .hud-status.online  { color: var(--c-ok); }
    [data-theme="focusan-denno"] .hud-status.armed   { color: var(--c-amber); }
    [data-theme="focusan-denno"] .hud-status.sealed  { color: var(--c-signal); }
    [data-theme="focusan-denno"] .hud-status.standby { color: var(--c-indigo-hi); }

    /* Terminal button — bracketed command */
    [data-theme="focusan-denno"] .hud-btn {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      background: transparent;
      color: var(--c-amber);
      border: 1px solid var(--c-amber-dim);
      padding: 10px 18px;
      cursor: pointer;
      position: relative;
      transition: var(--transition-fast);
    }
    [data-theme="focusan-denno"] .hud-btn::before { content: '['; margin-right: 6px; color: var(--c-amber-dim); }
    [data-theme="focusan-denno"] .hud-btn::after  { content: ']'; margin-left: 6px;  color: var(--c-amber-dim); }
    [data-theme="focusan-denno"] .hud-btn:hover {
      border-color: var(--c-amber);
      color: var(--c-amber-hi);
      box-shadow: var(--amber-glow), inset 0 0 12px rgba(232, 184, 71, 0.1);
      background: rgba(232, 184, 71, 0.04);
    }
    [data-theme="focusan-denno"] .hud-btn:hover::before,
    [data-theme="focusan-denno"] .hud-btn:hover::after { color: var(--c-amber); }
    [data-theme="focusan-denno"] .hud-btn:active {
      transform: translateY(1px);
      box-shadow: inset 0 0 12px rgba(232, 184, 71, 0.2);
    }
    [data-theme="focusan-denno"] .hud-btn.primary {
      background: rgba(232, 184, 71, 0.12);
      border-color: var(--c-amber);
      color: var(--c-amber-hi);
      box-shadow: var(--amber-glow);
    }
    [data-theme="focusan-denno"] .hud-btn.primary:hover {
      background: rgba(232, 184, 71, 0.18);
      box-shadow: 0 0 24px rgba(232, 184, 71, 0.6), 0 0 48px rgba(232, 184, 71, 0.25);
    }
    [data-theme="focusan-denno"] .hud-btn.indigo {
      color: var(--c-indigo-hi);
      border-color: var(--c-indigo);
    }
    [data-theme="focusan-denno"] .hud-btn.indigo::before,
    [data-theme="focusan-denno"] .hud-btn.indigo::after { color: var(--c-indigo-dim); }
    [data-theme="focusan-denno"] .hud-btn.indigo:hover {
      box-shadow: var(--indigo-glow);
      background: rgba(74, 91, 217, 0.08);
    }
    [data-theme="focusan-denno"] .hud-btn.signal {
      color: var(--c-signal);
      border-color: rgba(255, 59, 92, 0.5);
    }
    [data-theme="focusan-denno"] .hud-btn.signal::before,
    [data-theme="focusan-denno"] .hud-btn.signal::after { color: rgba(255, 59, 92, 0.5); }
    [data-theme="focusan-denno"] .hud-btn.signal:hover {
      box-shadow: var(--signal-glow);
      background: rgba(255, 59, 92, 0.08);
    }

    /* Block progress bar — ░░░░ ▓▓▓▓ */
    [data-theme="focusan-denno"] .hud-progress {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--c-amber);
      letter-spacing: -0.04em;
    }

    /* Data row — label / value pair */
    [data-theme="focusan-denno"] .hud-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-family: var(--font-mono);
      font-size: 12px;
      border-bottom: 1px dashed rgba(232, 184, 71, 0.10);
    }
    [data-theme="focusan-denno"] .hud-row:last-child { border-bottom: none; }
    [data-theme="focusan-denno"] .hud-row > .label {
      color: var(--c-amber-dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      font-size: 10px;
    }
    [data-theme="focusan-denno"] .hud-row > .value {
      color: var(--c-amber);
    }

    /* Inputs — terminal field */
    [data-theme="focusan-denno"] input,
    [data-theme="focusan-denno"] select,
    [data-theme="focusan-denno"] textarea {
      font-family: var(--font-mono);
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(232, 184, 71, 0.25);
      color: var(--c-amber);
      padding: 10px 12px;
      border-radius: 0;
      letter-spacing: 0.04em;
      transition: var(--transition-fast);
    }
    [data-theme="focusan-denno"] input::placeholder,
    [data-theme="focusan-denno"] textarea::placeholder {
      color: var(--c-amber-d2);
      letter-spacing: 0.04em;
    }
    [data-theme="focusan-denno"] input:focus,
    [data-theme="focusan-denno"] select:focus,
    [data-theme="focusan-denno"] textarea:focus {
      outline: none;
      border-color: var(--c-amber);
      box-shadow: var(--amber-glow), inset 0 0 0 1px rgba(232, 184, 71, 0.1);
    }

    /* Reticle — concentric rings + ticks (CSS only, drop-in) */
    [data-theme="focusan-denno"] .hud-reticle {
      position: relative;
      width: 280px;
      height: 280px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    [data-theme="focusan-denno"] .hud-reticle::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid rgba(232, 184, 71, 0.35);
      box-shadow: inset 0 0 30px rgba(232, 184, 71, 0.06), 0 0 24px rgba(232, 184, 71, 0.15);
    }
    [data-theme="focusan-denno"] .hud-reticle::after {
      content: '';
      position: absolute;
      inset: 20px;
      border-radius: 50%;
      border: 1px dashed rgba(74, 91, 217, 0.55);
      animation: reticleScan 22s linear infinite;
    }

    /* Wireframe katana — SVG content drop-in */
    [data-theme="focusan-denno"] .hud-katana {
      filter: drop-shadow(0 0 4px rgba(232, 184, 71, 0.5)) drop-shadow(0 0 12px rgba(74, 91, 217, 0.3));
    }

    /* Grid floor — perspective indigo grid */
    [data-theme="focusan-denno"] .hud-grid-floor {
      background-image: var(--grid-floor);
      background-color: transparent;
      animation: gridPulse 8s ease-in-out infinite;
    }

    /* Selection */
    [data-theme="focusan-denno"] ::selection {
      background: var(--c-amber);
      color: var(--c-void);
    }

    /* Scrollbar — terminal style */
    [data-theme="focusan-denno"] ::-webkit-scrollbar { width: 10px; height: 10px; }
    [data-theme="focusan-denno"] ::-webkit-scrollbar-track { background: var(--c-bg); border-left: 1px solid rgba(232, 184, 71, 0.1); }
    [data-theme="focusan-denno"] ::-webkit-scrollbar-thumb {
      background: var(--c-amber-d2);
      border: 1px solid rgba(232, 184, 71, 0.25);
    }
    [data-theme="focusan-denno"] ::-webkit-scrollbar-thumb:hover {
      background: var(--c-amber-dim);
      box-shadow: inset 0 0 6px rgba(232, 184, 71, 0.4);
    }

    /* Cursor blink — append to text via class */
    [data-theme="focusan-denno"] .cursor-blink::after {
      content: '▮';
      margin-left: 2px;
      color: var(--c-amber);
      animation: cursorBlink 1.1s steps(1) infinite;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      [data-theme="focusan-denno"] body::before { animation: none; }
      [data-theme="focusan-denno"] * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
}
