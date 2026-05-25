/**
 * Rank Seals (段位印) — Bushidō achievement medallions.
 *
 * Replaces karate-belt drawings with hanko-style rank plaques: a lacquered
 * square stamp bearing a single kanji, hung from a crimson cord. Each tier
 * gets a distinct kanji + plaque color reflecting its meaning.
 */

import React from 'react'
import { AchievementType } from '../domain/achievements'

interface BeltIconProps {
  type: AchievementType
  className?: string
  size?: number | string
}

interface RankStyle {
  kanji: string       // single character on the seal
  plaque: string      // plaque fill (lacquer)
  edge: string        // border / inner-bevel
  ink: string         // kanji color
  cord: string        // hanging cord color
  glow?: string       // optional radial glow behind
}

const getRank = (type: AchievementType): RankStyle => {
  switch (type) {
    // ── 初〜三段 — kyū-tier discipline (white→amber) ──
    case AchievementType.STREAK_7:
      return { kanji: '一', plaque: '#2A2422', edge: '#5C4A38', ink: '#E5DCC8', cord: '#8A7E6F' } // shodan
    case AchievementType.STREAK_30:
      return { kanji: '二', plaque: '#3A2F18', edge: '#9C8B3F', ink: '#FFD86B', cord: '#9C8B3F' } // nidan
    case AchievementType.STREAK_100:
      return { kanji: '三', plaque: '#3A2418', edge: '#A0521C', ink: '#FFA94B', cord: '#A0521C' } // sandan

    // ── 四〜六段 — gates-sealed mastery (green→purple) ──
    case AchievementType.TOTAL_BLOCKS_100:
      return { kanji: '四', plaque: '#1F2A1A', edge: '#3F6B2F', ink: '#A8D88A', cord: '#3F6B2F' }
    case AchievementType.TOTAL_BLOCKS_500:
      return { kanji: '五', plaque: '#152538', edge: '#2F558F', ink: '#7AB0E8', cord: '#2F558F' }
    case AchievementType.TOTAL_BLOCKS_1000:
      return { kanji: '六', plaque: '#28182F', edge: '#6B2F8F', ink: '#C28AE8', cord: '#6B2F8F' }

    // ── 七〜九段 — wards-set breadth (brown→black→gold) ──
    case AchievementType.SITES_BLOCKED_10:
      return { kanji: '七', plaque: '#2A1D14', edge: '#5C3A20', ink: '#C8A878', cord: '#5C3A20' }
    case AchievementType.SITES_BLOCKED_50:
      return { kanji: '八', plaque: '#0A0A0A', edge: '#3A3A3A', ink: '#F2E9D8', cord: '#3A3A3A' }
    case AchievementType.SITES_BLOCKED_100:
      return { kanji: '九', plaque: '#1A1614', edge: '#D4AF37', ink: '#D4AF37', cord: '#D4AF37', glow: 'rgba(212,175,55,0.4)' }

    // ── 十段 — crimson master seal ──
    case AchievementType.WEEK_NO_BLOCK:
      return { kanji: '十', plaque: '#7A1818', edge: '#B82E2E', ink: '#F2E9D8', cord: '#B82E2E', glow: 'rgba(184,46,46,0.4)' }

    default:
      return { kanji: '士', plaque: '#2A2422', edge: '#5C4A38', ink: '#E5DCC8', cord: '#8A7E6F' }
  }
}

export const BeltIcon: React.FC<BeltIconProps> = ({ type, className = '', size = 56 }) => {
  const r = getRank(type)
  const uid = `seal-${type}`

  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Lacquer plaque gradient — top sheen */}
        <linearGradient id={`${uid}-plaque`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"  stopColor={r.plaque} stopOpacity="1" />
          <stop offset="40%" stopColor={r.plaque} stopOpacity="1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>

        {/* Inner bevel */}
        <linearGradient id={`${uid}-bevel`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.55" floodColor="#000" />
        </filter>

        {/* Optional gold/crimson glow */}
        {r.glow && (
          <radialGradient id={`${uid}-glow`} cx="50%" cy="55%" r="50%">
            <stop offset="0%"   stopColor={r.glow} />
            <stop offset="100%" stopColor={r.glow} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Glow halo */}
      {r.glow && <rect x="0" y="10" width="100" height="100" fill={`url(#${uid}-glow)`} />}

      {/* Suspension cord — knot at top, two strands down to plaque */}
      <path
        d="M 50 4 Q 38 12 36 22 M 50 4 Q 62 12 64 22"
        stroke={r.cord}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Knot bead */}
      <circle cx="50" cy="6" r="3" fill={r.cord} opacity="0.95" />
      <circle cx="50" cy="5" r="1" fill="#FFFFFF" opacity="0.5" />

      <g filter={`url(#${uid}-shadow)`}>
        {/* Plaque body — square seal */}
        <rect
          x="18" y="22" width="64" height="72"
          rx="2"
          fill={`url(#${uid}-plaque)`}
          stroke={r.edge}
          strokeWidth="1.8"
        />
        {/* Inner bevel highlight */}
        <rect
          x="21" y="25" width="58" height="66"
          rx="1"
          fill="none"
          stroke={`url(#${uid}-bevel)`}
        />
        {/* Inner thin frame — gold or matching edge */}
        <rect
          x="24" y="28" width="52" height="60"
          rx="1"
          fill="none"
          stroke={r.edge}
          strokeWidth="0.6"
          opacity="0.55"
        />

        {/* The kanji — large, centered */}
        <text
          x="50"
          y="71"
          textAnchor="middle"
          fontFamily="'Shippori Mincho','Noto Serif JP',serif"
          fontWeight="900"
          fontSize="44"
          fill={r.ink}
          style={{ paintOrder: 'stroke' as const }}
        >
          {r.kanji}
        </text>

        {/* Tiny corner mark — top-right gold pip = active rank flag */}
        <circle cx="76" cy="32" r="1.4" fill={r.edge} opacity="0.9" />
      </g>
    </svg>
  )
}
