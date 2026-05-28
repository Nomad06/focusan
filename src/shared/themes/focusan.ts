/**
 * Focusan Theme — Bushido / Dojo Discipline
 * Black lacquer (urushi), crimson seal (akabeni), gold leaf (kinpaku).
 * Inspired by samurai dojo aesthetics, hanko stamps, sumi-e ink, and
 * the seven virtues of bushidō: 義 勇 仁 礼 誠 名誉 忠.
 */

import type { Theme } from './types'

export const focusanTheme: Theme = {
  metadata: {
    id: 'focusan',
    name: 'Focusan — 武士道',
    description: 'Bushidō. Black lacquer, crimson seal, gold leaf. The dojo of focus.',
    emoji: '⛩',
    author: 'Focusan Dojo',
    version: '3.0.0',
  },

  colors: {
    // Backgrounds — urushi (lacquerware)
    bg1: '#0B0A0A',     // Sumi — deep ink black
    bg2: '#141110',     // Kuro-urushi — black lacquer
    card: '#1A1614',    // Kokutan — ebony panel
    card2: '#221C18',   // Koge — charred wood

    // Text — washi over ink
    text: '#F2E9D8',    // Kinari — unbleached silk
    muted: '#8A7E6F',   // Nezumi — ash mouse-grey

    // UI — crimson seal & gold leaf
    border: 'rgba(212, 175, 55, 0.14)', // gold leaf edge
    accent: '#B82E2E',   // Akabeni — crimson hanko ink
    accent2: '#7A1818',  // Enji — deeper sealed crimson
    danger: '#E63946',   // Hi-iro — flame red (warnings)
    success: '#9C8B3F',  // Ougon — antique gold success
    gold: '#D4AF37',     // Kinpaku — gold leaf

    palette: {
      sumi:       '#0B0A0A',
      urushi:     '#141110',
      kokutan:    '#1A1614',
      koge:       '#221C18',
      akabeni:    '#B82E2E',
      enji:       '#7A1818',
      hiiro:      '#E63946',
      kinpaku:    '#D4AF37',
      ougon:      '#9C8B3F',
      kinari:     '#F2E9D8',
      shiro:      '#FFFFFF',
      nezumi:     '#8A7E6F',
      sabi:       '#5C4A38', // patina brown
    },
  },

  typography: {
    sans: "'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },

  effects: {
    shadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
    shadowLg: '0 12px 32px -8px rgba(0, 0, 0, 0.8), 0 4px 8px -2px rgba(184, 46, 46, 0.15)',
    radius: '2px',     // sharp dojo geometry
    radiusLg: '4px',
  },

  animations: {
    available: ['fadeInUp', 'fadeIn', 'breath', 'breathInner', 'sealStamp', 'inkBleed', 'goldShimmer'],
  },

  customCSS: `
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    /*  FOCUSAN — BUSHIDŌ THEME                                       */
    /*  武士道 — The Way of the Warrior                                */
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700;900&family=Noto+Serif+JP:wght@400;700;900&family=Shippori+Mincho:wght@500;700;900&display=swap');

    :root[data-theme="focusan"] {
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;

      --shadow-sm: 0 1px 2px rgba(0,0,0,0.6);
      --shadow-md: 0 6px 16px -4px rgba(0,0,0,0.7), 0 2px 4px -1px rgba(0,0,0,0.4);
      --shadow-float: 0 18px 40px -10px rgba(0,0,0,0.9), 0 6px 12px -4px rgba(184,46,46,0.18);
      --seal-glow: 0 0 0 1px rgba(184,46,46,0.6), 0 0 18px -2px rgba(184,46,46,0.4);
      --gold-glow: 0 0 24px -4px rgba(212,175,55,0.55);

      --radius-sm: 2px;
      --radius-md: 3px;
      --radius-lg: 4px;
      --radius-full: 9999px;

      --transition-fast: 0.15s ease-out;
      --transition-normal: 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
      --transition-seal: 0.45s cubic-bezier(0.6, -0.2, 0.3, 1.4);

      --font-serif: 'Shippori Mincho', 'Noto Serif JP', serif;
      --font-brush: 'Shippori Mincho', 'Noto Serif JP', serif;

      --color-sumi: #0B0A0A;
      --color-urushi: #141110;
      --color-kokutan: #1A1614;
      --color-akabeni: #B82E2E;
      --color-enji: #7A1818;
      --color-kinpaku: #D4AF37;
      --color-kinari: #F2E9D8;
      --color-nezumi: #8A7E6F;
      --color-sabi: #5C4A38;

      /* Hanko (seal) red — used everywhere a stamp would appear */
      --seal-red: #B82E2E;
      --gold-leaf: #D4AF37;
      --ink-black: #0B0A0A;
      --paper-cream: #F2E9D8;

      /* Asanoha (hemp leaf) pattern — subtle background texture */
      --asanoha-pattern: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23D4AF37' stroke-opacity='0.04' stroke-width='0.6'><path d='M30 0 L60 30 L30 60 L0 30 Z'/><path d='M30 0 L30 60 M0 30 L60 30 M0 0 L60 60 M60 0 L0 60'/></g></svg>");
      --paper-grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    }

    /* ─── BODY ─── */
    [data-theme="focusan"] body {
      background-color: var(--color-sumi);
      background-image:
        radial-gradient(ellipse at top, rgba(184,46,46,0.04) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(212,175,55,0.025) 0%, transparent 60%),
        var(--asanoha-pattern);
      color: var(--color-kinari);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ─── KEYFRAMES ─── */
    @keyframes breath {
      0%   { transform: scale(0.85); opacity: 0.15; }
      100% { transform: scale(1.15); opacity: 0.30; }
    }
    @keyframes breathInner {
      0%   { transform: scale(0.92); }
      100% { transform: scale(1.08); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes sealStamp {
      0%   { transform: scale(1.6) rotate(-8deg); opacity: 0; }
      60%  { transform: scale(0.94) rotate(2deg); opacity: 1; }
      80%  { transform: scale(1.04) rotate(-1deg); }
      100% { transform: scale(1) rotate(0); opacity: 1; }
    }
    @keyframes inkBleed {
      0%   { filter: blur(8px); opacity: 0; transform: translateY(8px); }
      40%  { filter: blur(2px); opacity: 0.7; }
      100% { filter: blur(0); opacity: 1; transform: translateY(0); }
    }
    @keyframes goldShimmer {
      0%, 100% { background-position: -200% 0; }
      50%      { background-position: 200% 0; }
    }
    @keyframes lanternFlicker {
      0%, 100% { opacity: 0.85; filter: brightness(1); }
      45%      { opacity: 0.95; filter: brightness(1.15); }
      48%      { opacity: 0.75; filter: brightness(0.9); }
    }

    .seal-stamp { animation: sealStamp 0.45s cubic-bezier(0.6,-0.2,0.3,1.4) both; }
    .ink-bleed  { animation: inkBleed 0.6s ease-out both; }
    .gold-shimmer {
      background: linear-gradient(90deg, var(--gold-leaf) 0%, #FFF1B8 50%, var(--gold-leaf) 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: goldShimmer 4s ease-in-out infinite;
    }
    .lantern-flicker { animation: lanternFlicker 4s ease-in-out infinite; }

    /* ─── BUTTONS — Press the seal ─── */
    [data-theme="focusan"] button {
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    [data-theme="focusan"] button:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-float);
    }
    [data-theme="focusan"] button:active {
      transform: translateY(1px) scale(0.98);
      box-shadow: var(--seal-glow);
    }

    /* ─── CARDS — Lacquered panels ─── */
    [data-theme="focusan"] .card,
    [data-theme="focusan"] [class*="card"] {
      background: var(--color-kokutan);
      border: 1px solid rgba(212, 175, 55, 0.08);
      box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.02);
      border-radius: var(--radius-md);
      position: relative;
    }

    /* ─── INPUTS — Ink on parchment ─── */
    [data-theme="focusan"] input,
    [data-theme="focusan"] select,
    [data-theme="focusan"] textarea {
      border-radius: var(--radius-sm);
      border: 1px solid rgba(212, 175, 55, 0.12);
      background: rgba(0, 0, 0, 0.35);
      color: var(--color-kinari);
      transition: var(--transition-fast);
    }
    [data-theme="focusan"] input::placeholder,
    [data-theme="focusan"] textarea::placeholder {
      color: var(--color-nezumi);
      opacity: 0.6;
      font-style: italic;
    }
    [data-theme="focusan"] input:focus,
    [data-theme="focusan"] select:focus,
    [data-theme="focusan"] textarea:focus {
      outline: none;
      border-color: var(--color-akabeni);
      box-shadow: 0 0 0 2px rgba(184, 46, 46, 0.18);
    }

    /* Tabular nums */
    [data-theme="focusan"] .timer,
    [data-theme="focusan"] .stat,
    [data-theme="focusan"] [class*="time"],
    [data-theme="focusan"] [class*="count"] {
      font-feature-settings: "tnum";
      font-variant-numeric: tabular-nums;
    }

    /* Serif for kanji */
    [data-theme="focusan"] .bushido-quote,
    [data-theme="focusan"] .kanji,
    [data-theme="focusan"] .quote,
    [data-theme="focusan"] [data-bushido] {
      font-family: var(--font-serif);
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    /* Vertical kanji rail */
    [data-theme="focusan"] .tategaki-rail {
      writing-mode: vertical-rl;
      text-orientation: upright;
      letter-spacing: 0.4em;
      font-family: var(--font-serif);
      color: var(--color-akabeni);
      opacity: 0.55;
    }

    /* Hanko seal — crimson square stamp */
    [data-theme="focusan"] .hanko {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-akabeni);
      color: var(--color-kinari);
      font-family: var(--font-serif);
      font-weight: 900;
      padding: 0.15em 0.35em;
      border-radius: 2px;
      box-shadow: var(--seal-glow);
      transform: rotate(-2deg);
      text-shadow: 0 1px 0 rgba(0,0,0,0.3);
    }

    /* Brushstroke divider */
    [data-theme="focusan"] .brush-divider {
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(212,175,55,0.5) 15%,
        rgba(212,175,55,0.8) 50%,
        rgba(212,175,55,0.5) 85%,
        transparent 100%);
      border-radius: 9999px;
    }

    /* Gold leaf text accent */
    [data-theme="focusan"] .gold-leaf {
      color: var(--color-kinpaku);
      text-shadow: 0 0 14px rgba(212,175,55,0.35);
    }

    /* Animation easing default */
    [data-theme="focusan"] * {
      transition-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
    }

    /* Custom scrollbar — sumi rail */
    [data-theme="focusan"] ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    [data-theme="focusan"] ::-webkit-scrollbar-track {
      background: var(--color-sumi);
    }
    [data-theme="focusan"] ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--color-akabeni), var(--color-enji));
      border-radius: 2px;
    }
    [data-theme="focusan"] ::-webkit-scrollbar-thumb:hover {
      background: var(--color-akabeni);
    }

    /* Text selection — crimson */
    [data-theme="focusan"] ::selection {
      background: var(--color-akabeni);
      color: var(--color-kinari);
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      [data-theme="focusan"] * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
}
