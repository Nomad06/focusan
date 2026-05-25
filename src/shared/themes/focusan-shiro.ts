/**
 * Focusan — Shiro (白) Variant
 * The dojo at sunrise: washi paper background, sumi ink text,
 * crimson hanko seal and gold leaf accents preserved.
 */

import type { Theme } from './types'

export const focusanShiroTheme: Theme = {
  metadata: {
    id: 'focusan-shiro',
    name: 'Focusan — 白',
    description: 'Bushidō on washi. Light paper, sumi ink, crimson seal.',
    emoji: '⛩',
    author: 'Focusan Dojo',
    version: '3.0.0',
  },

  colors: {
    // Backgrounds — washi / paper
    bg1: '#F4EDE0',     // unbleached silk / kinari
    bg2: '#EBE2D0',     // shadow on paper
    card: '#FAF4E8',    // pristine washi
    card2: '#EFE6D2',   // creased washi

    // Text — sumi ink
    text: '#1A1410',    // deep ink
    muted: '#7A6E5F',   // tea brown

    // UI — crimson seal + gold leaf preserved
    border: 'rgba(122, 24, 24, 0.18)', // crimson hint
    accent: '#B82E2E',   // akabeni
    accent2: '#7A1818',  // enji
    danger: '#C41E3A',   // hi-iro
    success: '#5C7A2F',  // moss
    gold: '#9C7B1F',     // darker antique gold (readable on light)

    palette: {
      sumi:       '#1A1410',
      urushi:     '#2A2018',
      kokutan:    '#FAF4E8',
      koge:       '#EFE6D2',
      akabeni:    '#B82E2E',
      enji:       '#7A1818',
      hiiro:      '#C41E3A',
      kinpaku:    '#9C7B1F',
      ougon:      '#5C7A2F',
      kinari:     '#1A1410',
      shiro:      '#FFFFFF',
      nezumi:     '#7A6E5F',
      sabi:       '#A89980',
    },
  },

  typography: {
    sans: "'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  },

  effects: {
    shadow: '0 1px 2px rgba(26, 20, 16, 0.08)',
    shadowLg: '0 8px 24px -6px rgba(26, 20, 16, 0.14), 0 2px 6px -2px rgba(184, 46, 46, 0.08)',
    radius: '2px',
    radiusLg: '4px',
  },

  animations: {
    available: ['fadeInUp', 'fadeIn', 'breath', 'breathInner', 'sealStamp', 'inkBleed', 'goldShimmer'],
  },

  customCSS: `
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    /*  FOCUSAN — SHIRO (白) — Washi Bushidō                          */
    /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700;900&family=Shippori+Mincho:wght@500;700;900&display=swap');

    :root[data-theme="focusan-shiro"] {
      /* Override legacy aliases for light mode */
      --washi-white:   #F4EDE0;
      --shiro-white:   #FAF4E8;
      --sumi-black:    #1A1410;
      --sumi-gray:     #7A6E5F;
      --kinari-cream:  #EBE2D0;
      --seiheki-blue:  #B82E2E;
      --ai-indigo:     #7A1818;
      --beni-red:      #C41E3A;
      --sakura-pink:   #9C7B1F;
      --gold-accent:   #9C7B1F;
      --bamboo-green:  #5C7A2F;
      --mist-gray:     #A89980;
      --nissho-orange: #B82E2E;

      --sumi:       #1A1410;
      --urushi:     #2A2018;
      --kokutan:    #FAF4E8;
      --koge:       #EFE6D2;
      --akabeni:    #B82E2E;
      --enji:       #7A1818;
      --hi-iro:     #C41E3A;
      --kinpaku:    #9C7B1F;
      --ougon:      #5C7A2F;
      --kinari:     #1A1410;
      --nezumi:     #7A6E5F;
      --sabi:       #A89980;

      --bg1:     #F4EDE0;
      --bg2:     #EBE2D0;
      --card:    #FAF4E8;
      --card2:   rgba(250, 244, 232, 0.7);
      --text:    #1A1410;
      --muted:   #7A6E5F;
      --border:  rgba(122, 24, 24, 0.18);

      --shadow-sm:    0 1px 2px rgba(26, 20, 16, 0.06);
      --shadow:       0 4px 14px -4px rgba(26, 20, 16, 0.1), 0 2px 4px -2px rgba(26, 20, 16, 0.05);
      --shadow-lg:    0 10px 24px -6px rgba(26, 20, 16, 0.15), 0 4px 8px -3px rgba(184, 46, 46, 0.08);
      --shadow-float: 0 18px 36px -10px rgba(26, 20, 16, 0.18), 0 6px 10px -4px rgba(184, 46, 46, 0.1);
      --seal-glow:    0 0 0 1px rgba(184, 46, 46, 0.6), 0 0 14px -2px rgba(184, 46, 46, 0.35);
      --gold-glow:    0 0 20px -4px rgba(156, 123, 31, 0.5);

      /* Asanoha pattern — sumi tint on paper */
      --asanoha: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><g fill='none' stroke='%23B82E2E' stroke-opacity='0.05' stroke-width='0.6'><path d='M30 0 L60 30 L30 60 L0 30 Z'/><path d='M30 0 L30 60 M0 30 L60 30 M0 0 L60 60 M60 0 L0 60'/></g></svg>");
      --paper-grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
    }

    [data-theme="focusan-shiro"] body {
      background-color: #F4EDE0;
      background-image:
        radial-gradient(ellipse at top, rgba(184,46,46,0.06) 0%, transparent 55%),
        radial-gradient(ellipse at bottom right, rgba(156,123,31,0.04) 0%, transparent 60%),
        var(--asanoha);
      color: #1A1410;
    }

    /* Legacy utility class overrides flip light-on-light back to right values */
    [data-theme="focusan-shiro"] [class*="bg-white"]:not([class*="text-white"]):not([class*="border-white"]),
    [data-theme="focusan-shiro"] [class*="hover:bg-white"]:hover,
    [data-theme="focusan-shiro"] [class*="bg-gray-"]:not([class*="text-gray"]):not([class*="border-gray"]) {
      background-color: #FAF4E8 !important;
    }
    [data-theme="focusan-shiro"] .bg-white\\/40, [data-theme="focusan-shiro"] .bg-white\\/50 { background-color: rgba(250,244,232,0.55) !important; }
    [data-theme="focusan-shiro"] .bg-white\\/60, [data-theme="focusan-shiro"] .bg-white\\/70 { background-color: rgba(250,244,232,0.7) !important; }
    [data-theme="focusan-shiro"] .bg-white\\/80, [data-theme="focusan-shiro"] .bg-white\\/90 { background-color: rgba(250,244,232,0.9) !important; }
    [data-theme="focusan-shiro"] .bg-gray-50\\/30, [data-theme="focusan-shiro"] .bg-gray-50\\/50 { background-color: rgba(235,226,208,0.45) !important; }
    [data-theme="focusan-shiro"] .bg-black\\/5  { background-color: rgba(26,20,16,0.04) !important; }
    [data-theme="focusan-shiro"] .bg-black\\/10 { background-color: rgba(26,20,16,0.08) !important; }
    [data-theme="focusan-shiro"] .hover\\:bg-black\\/5:hover  { background-color: rgba(26,20,16,0.05) !important; }
    [data-theme="focusan-shiro"] .hover\\:bg-black\\/10:hover { background-color: rgba(26,20,16,0.08) !important; }
    [data-theme="focusan-shiro"] .text-gray-400 { color: #A89980 !important; }
    [data-theme="focusan-shiro"] .text-gray-500 { color: #7A6E5F !important; }
    [data-theme="focusan-shiro"] .text-gray-600,
    [data-theme="focusan-shiro"] .text-gray-700,
    [data-theme="focusan-shiro"] .text-gray-800,
    [data-theme="focusan-shiro"] .text-gray-900 { color: #1A1410 !important; }
    [data-theme="focusan-shiro"] .bg-washi { background-color: #F4EDE0 !important; }

    /* Buttons — primary stays crimson, secondary needs darker outline */
    [data-theme="focusan-shiro"] .btn.secondary {
      background: transparent;
      color: #2A2018;
      border-color: rgba(122, 24, 24, 0.25);
    }
    [data-theme="focusan-shiro"] .btn.secondary:hover {
      border-color: #B82E2E;
      color: #B82E2E;
      background: rgba(184, 46, 46, 0.05);
    }
    [data-theme="focusan-shiro"] .btn.ghost { color: #7A6E5F; }
    [data-theme="focusan-shiro"] .btn.ghost:hover {
      color: #1A1410;
      background: rgba(26, 20, 16, 0.04);
    }

    /* Inputs */
    [data-theme="focusan-shiro"] .zen-input,
    [data-theme="focusan-shiro"] input,
    [data-theme="focusan-shiro"] textarea,
    [data-theme="focusan-shiro"] select {
      background: rgba(255, 252, 240, 0.7);
      color: #1A1410;
      border-color: rgba(122, 24, 24, 0.18);
    }
    [data-theme="focusan-shiro"] .zen-input::placeholder,
    [data-theme="focusan-shiro"] input::placeholder,
    [data-theme="focusan-shiro"] textarea::placeholder { color: #A89980; }

    /* Cards / panels */
    [data-theme="focusan-shiro"] .washi-card,
    [data-theme="focusan-shiro"] .kintsugi-card {
      background: #FAF4E8;
      border-color: rgba(122, 24, 24, 0.14);
    }
    [data-theme="focusan-shiro"] .washi-card::before {
      background-image: var(--paper-grain);
      opacity: 0.6;
    }

    /* Kanji rail — crimson, more visible on paper */
    [data-theme="focusan-shiro"] .kanji-rail {
      color: #B82E2E;
      opacity: 0.3;
    }

    /* Brush divider — ink instead of gold */
    [data-theme="focusan-shiro"] .brush-divider {
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(26, 20, 16, 0.0) 5%,
        rgba(26, 20, 16, 0.4) 30%,
        rgba(26, 20, 16, 0.6) 50%,
        rgba(26, 20, 16, 0.4) 70%,
        rgba(26, 20, 16, 0.0) 95%,
        transparent 100%);
    }

    /* Gold leaf adjusted for paper readability */
    [data-theme="focusan-shiro"] .gold-leaf { color: #9C7B1F; text-shadow: none; }
    [data-theme="focusan-shiro"] .sumi-heading,
    [data-theme="focusan-shiro"] .kanji-display { color: #1A1410; text-shadow: none; }

    /* Hanko stays vivid */
    [data-theme="focusan-shiro"] .hanko {
      background: #B82E2E;
      color: #FAF4E8;
      box-shadow: 0 0 0 1px rgba(184,46,46,0.4), 0 2px 6px rgba(184,46,46,0.25);
      text-shadow: 0 1px 0 rgba(0,0,0,0.3);
    }

    /* Scrollbar */
    [data-theme="focusan-shiro"] ::-webkit-scrollbar-track { background: #EBE2D0; }
    [data-theme="focusan-shiro"] ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #B82E2E, #7A1818);
    }

    /* Selection */
    [data-theme="focusan-shiro"] ::selection { background: #B82E2E; color: #FAF4E8; }

    @media (prefers-reduced-motion: reduce) {
      [data-theme="focusan-shiro"] * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
}
