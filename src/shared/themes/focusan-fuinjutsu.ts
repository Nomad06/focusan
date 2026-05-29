/**
 * Focusan — Fūinjutsu (封印術) — The Sealing Art
 * Makimono scroll UI. Parchment ground, sumi ink, cinnabar seal.
 * Surfaces using this theme render their own JSX (Makimono components),
 * so this CSS only sets palette + base typography. No bushidō shell overrides.
 */

import type { Theme } from './types'
import FuinjutsuPopup from '../../popup/FuinjutsuApp'
import FuinjutsuOptions from '../../options/FuinjutsuApp'
import FuinjutsuBlocked from '../../pages/blocked/FuinjutsuBlocked'

export const focusanFuinjutsuTheme: Theme = {
  surfaces: {
    popup:   FuinjutsuPopup,
    options: FuinjutsuOptions,
    blocked: FuinjutsuBlocked,
  },
  metadata: {
    id: 'focusan-fuinjutsu',
    name: 'Focusan — 封印',
    description: 'Fūinjutsu. Makimono scroll, sumi ink, cinnabar seal.',
    emoji: '巻',
    author: 'Focusan Dojo',
    version: '3.0.0',
  },

  colors: {
    bg1: '#1F1A14',     // burnt-umber surround (outside scroll)
    bg2: '#15110C',     // deeper surround
    card: '#E8DCB8',    // parchment (scroll surface)
    card2: '#D4C49A',   // parchment shadow

    text: '#1A1410',    // sumi ink
    muted: '#6B5232',   // faded sumi

    border: '#8B6F3A',  // scroll rolled-edge
    accent: '#C8252C',  // cinnabar seal
    accent2: '#8B1418', // sealed blood
    danger: '#C8252C',
    success: '#5C7548',
    gold: '#D4A057',    // tassel gold

    palette: {
      surround:     '#1F1A14',
      surroundDeep: '#15110C',
      parchment:    '#E8DCB8',
      parchmentDim: '#D4C49A',
      foxing:       '#B89968',
      scrollEdge:   '#8B6F3A',
      bambooLight:  '#9B8456',
      bambooMid:    '#6B5232',
      bambooDark:   '#3A2A18',
      cordRope:     '#2A1F14',
      tasselGold:   '#D4A057',
      sumi:         '#1A1410',
      sumiFaded:    '#4A3A30',
      cinnabar:     '#C8252C',
      cinnabarDeep: '#8B1418',
      // legacy aliases
      kokutan:    '#E8DCB8',
      urushi:     '#1F1A14',
      akabeni:    '#C8252C',
      enji:       '#8B1418',
      kinpaku:    '#D4A057',
      kinari:     '#1A1410',
      nezumi:     '#6B5232',
      sabi:       '#8B6F3A',
    },
  },

  typography: {
    sans: "'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },

  effects: {
    shadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 18px 48px -12px rgba(0, 0, 0, 0.65), 0 6px 16px -4px rgba(139, 20, 24, 0.18)',
    radius: '0px',
    radiusLg: '0px',
  },

  animations: {
    available: ['fadeInUp', 'fadeIn', 'sealSlam', 'inkBleed', 'scrollUnroll', 'tasselSway'],
  },

  customCSS: `
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    /*  FOCUSAN — FŪINJUTSU (封印術) · Makimono Scroll                 */
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@400;500;700;900&family=Shippori+Mincho:wght@500;700;900&family=Klee+One:wght@600&display=swap');

    :root[data-theme="focusan-fuinjutsu"] {
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 24px;
      --spacing-xl: 32px;
      --spacing-2xl: 48px;

      /* ─ Fūinjutsu palette ─ */
      --c-surround:      #1F1A14;
      --c-surround-deep: #15110C;
      --c-parchment:     #E8DCB8;
      --c-parchment-dim: #D4C49A;
      --c-foxing:        #B89968;
      --c-scroll-edge:   #8B6F3A;
      --c-bamboo-light:  #9B8456;
      --c-bamboo-mid:    #6B5232;
      --c-bamboo-dark:   #3A2A18;
      --c-cord-rope:     #2A1F14;
      --c-tassel-gold:   #D4A057;
      --c-sumi:          #1A1410;
      --c-sumi-faded:    #4A3A30;
      --c-cinnabar:      #C8252C;
      --c-cinnabar-deep: #8B1418;

      /* Legacy aliases */
      --color-sumi:    #1A1410;
      --color-urushi:  #1F1A14;
      --color-kokutan: #E8DCB8;
      --color-akabeni: #C8252C;
      --color-enji:    #8B1418;
      --color-kinpaku: #D4A057;
      --color-kinari:  #1A1410;
      --color-nezumi:  #6B5232;
      --color-sabi:    #8B6F3A;

      --seal-red:    #C8252C;
      --gold-leaf:   #D4A057;
      --ink-black:   #1A1410;
      --paper-cream: #E8DCB8;

      --bg1:    #1F1A14;
      --bg2:    #15110C;
      --card:   #E8DCB8;
      --card2:  #D4C49A;
      --text:   #1A1410;
      --muted:  #6B5232;
      --border: #8B6F3A;

      --shadow-sm:    0 1px 3px rgba(0, 0, 0, 0.4);
      --shadow:       0 6px 18px -4px rgba(0, 0, 0, 0.5);
      --shadow-md:    0 10px 28px -6px rgba(0, 0, 0, 0.55);
      --shadow-lg:    0 18px 48px -12px rgba(0, 0, 0, 0.65), 0 6px 16px -4px rgba(139, 20, 24, 0.18);
      --shadow-float: 0 26px 60px -14px rgba(0, 0, 0, 0.75);
      --seal-glow:    0 0 0 2px rgba(200, 37, 44, 0.5);
      --paper-glow:   0 0 24px -4px rgba(232, 220, 184, 0.4);

      --radius-sm: 0px;
      --radius-md: 0px;
      --radius-lg: 0px;
      --radius-full: 9999px;

      --transition-fast:   0.15s ease-out;
      --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      --transition-seal:   0.55s cubic-bezier(0.5, 1.8, 0.4, 1);

      --font-serif:   'Shippori Mincho', 'Noto Serif JP', serif;
      --font-brush:   'Klee One', 'Shippori Mincho', 'Noto Serif JP', serif;
      --font-display: 'Shippori Mincho', 'Noto Serif JP', serif;

      /* Aged paper texture — slight noise, organic */
      --paper-grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E");
      /* Foxing — random brown stains on aged paper */
      --foxing-stains: radial-gradient(ellipse 80px 50px at 10% 20%, rgba(139, 105, 60, 0.12), transparent 60%),
                       radial-gradient(ellipse 60px 40px at 85% 75%, rgba(139, 105, 60, 0.10), transparent 60%),
                       radial-gradient(ellipse 40px 30px at 40% 90%, rgba(139, 105, 60, 0.08), transparent 60%),
                       radial-gradient(ellipse 50px 35px at 70% 15%, rgba(139, 105, 60, 0.10), transparent 60%);
    }

    /* ─── BODY — burnt-umber surround ─── */
    [data-theme="focusan-fuinjutsu"] body {
      background-color: var(--c-surround);
      background-image:
        radial-gradient(ellipse at center, rgba(80, 60, 40, 0.18) 0%, transparent 60%),
        radial-gradient(ellipse at top, rgba(200, 37, 44, 0.04) 0%, transparent 50%);
      color: var(--c-sumi);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ─── KEYFRAMES ─── */
    @keyframes sealSlam {
      0%   { transform: scale(3) rotate(-25deg); opacity: 0; filter: blur(8px); }
      55%  { transform: scale(0.85) rotate(8deg); opacity: 1; filter: blur(0); }
      72%  { transform: scale(1.05) rotate(-2deg); }
      100% { transform: scale(1) rotate(-4deg); opacity: 1; }
    }
    @keyframes inkBleed {
      0%   { filter: blur(6px); opacity: 0; transform: translateY(8px); }
      40%  { filter: blur(2px); opacity: 0.7; }
      100% { filter: blur(0); opacity: 1; transform: translateY(0); }
    }
    @keyframes scrollUnroll {
      0%   { clip-path: inset(50% 0 50% 0); opacity: 0; }
      100% { clip-path: inset(0 0 0 0); opacity: 1; }
    }
    @keyframes tasselSway {
      0%, 100% { transform: rotate(-2deg); }
      50%      { transform: rotate(2deg); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ─── MAKIMONO PRIMITIVES (used by Fūinjutsu-aware surfaces) ─── */

    [data-theme="focusan-fuinjutsu"] .makimono-surround {
      min-height: 100vh;
      background:
        radial-gradient(ellipse at center, rgba(50, 38, 25, 0.25) 0%, transparent 70%),
        var(--c-surround);
      position: relative;
      overflow: hidden;
    }

    [data-theme="focusan-fuinjutsu"] .makimono-scroll {
      background:
        var(--foxing-stains),
        var(--paper-grain),
        linear-gradient(180deg, var(--c-parchment) 0%, var(--c-parchment-dim) 50%, var(--c-parchment) 100%);
      color: var(--c-sumi);
      box-shadow:
        inset 0 0 60px rgba(139, 105, 60, 0.2),
        inset 0 0 0 1px rgba(139, 111, 58, 0.3),
        0 24px 60px -12px rgba(0, 0, 0, 0.7),
        0 8px 24px -6px rgba(0, 0, 0, 0.5);
      position: relative;
      animation: scrollUnroll 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    /* Scroll vertical edges — slight rolled-paper shading */
    [data-theme="focusan-fuinjutsu"] .makimono-scroll::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0; left: 0;
      width: 8px;
      background: linear-gradient(90deg, rgba(58, 42, 24, 0.4), transparent);
      pointer-events: none;
    }
    [data-theme="focusan-fuinjutsu"] .makimono-scroll::after {
      content: '';
      position: absolute;
      top: 0; bottom: 0; right: 0;
      width: 8px;
      background: linear-gradient(-90deg, rgba(58, 42, 24, 0.4), transparent);
      pointer-events: none;
    }

    /* Bamboo rod — top & bottom of scroll */
    [data-theme="focusan-fuinjutsu"] .bamboo-rod {
      height: 26px;
      background:
        radial-gradient(ellipse at center top, rgba(255, 220, 160, 0.25), transparent 60%),
        linear-gradient(180deg,
          var(--c-bamboo-light) 0%,
          var(--c-bamboo-mid) 35%,
          var(--c-bamboo-dark) 70%,
          var(--c-bamboo-mid) 100%);
      position: relative;
      box-shadow:
        inset 0 1px 0 rgba(255, 220, 160, 0.3),
        inset 0 -2px 4px rgba(0, 0, 0, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.45);
      border-top: 1px solid rgba(255, 220, 160, 0.2);
      border-bottom: 1px solid rgba(0, 0, 0, 0.4);
    }
    /* Bamboo end caps — left & right (rod ends with rope wrap) */
    [data-theme="focusan-fuinjutsu"] .bamboo-rod::before,
    [data-theme="focusan-fuinjutsu"] .bamboo-rod::after {
      content: '';
      position: absolute;
      top: -4px;
      bottom: -4px;
      width: 18px;
      background:
        repeating-linear-gradient(90deg,
          var(--c-cord-rope) 0px,
          var(--c-cord-rope) 1.5px,
          #4A3520 1.5px,
          #4A3520 3px);
      border: 1px solid rgba(0, 0, 0, 0.6);
      box-shadow:
        inset 0 1px 0 rgba(180, 140, 90, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.5);
    }
    [data-theme="focusan-fuinjutsu"] .bamboo-rod::before { left: -8px; }
    [data-theme="focusan-fuinjutsu"] .bamboo-rod::after  { right: -8px; }

    /* Tassel (cord drop with gold knot) — hangs from scroll edges */
    [data-theme="focusan-fuinjutsu"] .tassel {
      position: absolute;
      width: 3px;
      background: linear-gradient(180deg, var(--c-cord-rope), #4A3520);
      transform-origin: top center;
      animation: tasselSway 6s ease-in-out infinite;
      pointer-events: none;
    }
    [data-theme="focusan-fuinjutsu"] .tassel::after {
      content: '';
      position: absolute;
      bottom: -14px;
      left: 50%;
      width: 18px;
      height: 18px;
      background: radial-gradient(circle at 35% 35%, #F0C674, var(--c-tassel-gold) 60%, #8B6020 100%);
      border-radius: 50%;
      transform: translateX(-50%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 240, 200, 0.5);
    }

    /* Brush text — Klee One handwriting for body kanji */
    [data-theme="focusan-fuinjutsu"] .brush-text {
      font-family: var(--font-brush);
      font-weight: 600;
      color: var(--c-sumi);
      letter-spacing: 0.03em;
    }
    [data-theme="focusan-fuinjutsu"] .ink-heading {
      font-family: var(--font-serif);
      font-weight: 900;
      color: var(--c-sumi);
      letter-spacing: 0.04em;
      text-shadow: 0 1px 0 rgba(232, 220, 184, 0.5);
    }
    [data-theme="focusan-fuinjutsu"] .sumi-stroke {
      font-family: var(--font-brush);
      font-weight: 600;
      color: var(--c-sumi);
    }
    [data-theme="focusan-fuinjutsu"] .sumi-faded {
      color: var(--c-sumi-faded);
    }

    /* Cinnabar seal stamp — the big 封 stamp */
    [data-theme="focusan-fuinjutsu"] .seal-stamp-cinnabar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--c-cinnabar);
      color: var(--c-parchment);
      font-family: var(--font-serif);
      font-weight: 900;
      padding: 0.3em 0.45em;
      border-radius: 4px;
      box-shadow:
        inset 0 0 0 2px rgba(232, 220, 184, 0.35),
        inset 0 0 12px rgba(139, 20, 24, 0.6),
        0 2px 6px rgba(0, 0, 0, 0.5);
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
      transform: rotate(-4deg);
      position: relative;
    }
    /* Stamp ink-bleed edge */
    [data-theme="focusan-fuinjutsu"] .seal-stamp-cinnabar::before {
      content: '';
      position: absolute;
      inset: -3px;
      background: var(--c-cinnabar);
      opacity: 0.18;
      filter: blur(2px);
      z-index: -1;
      border-radius: 6px;
    }
    [data-theme="focusan-fuinjutsu"] .seal-slam {
      animation: sealSlam 0.55s cubic-bezier(0.5, 1.8, 0.4, 1) both;
    }

    /* Vertical kanji (tategaki) for blocked-page anchor text */
    [data-theme="focusan-fuinjutsu"] .vert-kanji {
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-family: var(--font-serif);
      font-weight: 900;
      color: var(--c-sumi);
      letter-spacing: 0.4em;
      text-shadow: 0 1px 0 rgba(232, 220, 184, 0.4);
    }

    /* Buttons on parchment — sumi-ink outlined, hover = inked fill */
    [data-theme="focusan-fuinjutsu"] .scroll-btn {
      font-family: var(--font-serif);
      font-weight: 700;
      letter-spacing: 0.08em;
      background: transparent;
      color: var(--c-sumi);
      border: 1.5px solid var(--c-sumi);
      padding: 12px 28px;
      cursor: pointer;
      transition: var(--transition-fast);
      position: relative;
      border-radius: 0;
    }
    [data-theme="focusan-fuinjutsu"] .scroll-btn:hover {
      background: var(--c-sumi);
      color: var(--c-parchment);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    [data-theme="focusan-fuinjutsu"] .scroll-btn:active {
      transform: translateY(1px);
    }
    [data-theme="focusan-fuinjutsu"] .scroll-btn.cinnabar {
      background: var(--c-cinnabar);
      color: var(--c-parchment);
      border-color: var(--c-cinnabar-deep);
      box-shadow: 0 4px 0 var(--c-cinnabar-deep), 0 6px 14px rgba(139, 20, 24, 0.35);
    }
    [data-theme="focusan-fuinjutsu"] .scroll-btn.cinnabar:hover {
      background: var(--c-cinnabar-deep);
      box-shadow: 0 5px 0 var(--c-cinnabar-deep), 0 8px 18px rgba(139, 20, 24, 0.45);
    }
    [data-theme="focusan-fuinjutsu"] .scroll-btn.cinnabar:active {
      transform: translateY(2px);
      box-shadow: 0 1px 0 var(--c-cinnabar-deep), 0 2px 6px rgba(139, 20, 24, 0.35);
    }

    /* Cord-knot section divider */
    [data-theme="focusan-fuinjutsu"] .cord-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 0;
      color: var(--c-sumi-faded);
    }
    [data-theme="focusan-fuinjutsu"] .cord-divider::before,
    [data-theme="focusan-fuinjutsu"] .cord-divider::after {
      content: '';
      flex: 1;
      height: 2px;
      background:
        repeating-linear-gradient(90deg,
          var(--c-cord-rope) 0,
          var(--c-cord-rope) 4px,
          transparent 4px,
          transparent 7px);
      opacity: 0.5;
    }

    /* Selection */
    [data-theme="focusan-fuinjutsu"] ::selection {
      background: var(--c-cinnabar);
      color: var(--c-parchment);
    }

    /* Scrollbar */
    [data-theme="focusan-fuinjutsu"] ::-webkit-scrollbar { width: 10px; height: 10px; }
    [data-theme="focusan-fuinjutsu"] ::-webkit-scrollbar-track { background: var(--c-surround); }
    [data-theme="focusan-fuinjutsu"] ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, var(--c-bamboo-light), var(--c-bamboo-dark));
      border-radius: 0;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.4);
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      [data-theme="focusan-fuinjutsu"] * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
}
