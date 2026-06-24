import React from 'react'
import {
  Settings,
  Shield,
  Scroll,
  X,
  Calendar,
  Shuffle,
  Leaf,
  Layout,
  Flame,
  Timer,
  Hash,
  Play,
  Pause,
  Trash2,
  ArrowRight,
  Check,
  ChevronDown,
  Lock,
  Unlock,
  Key,
  Mail,
  AlertTriangle,
  Download,
  RefreshCw,
  Globe,
  type LucideProps,
} from 'lucide-react'

// Re-export Lucide icons for consistency
export const SettingsIcon = Settings
export const ShieldIcon = Shield
export const ScrollIcon = Scroll
export const XIcon = X
export const CalendarIcon = Calendar
export const ShuffleIcon = Shuffle
export const LeafIcon = Leaf
export const LayoutIcon = Layout
export const FlameIcon = Flame
export const TimerIcon = Timer
export const HashIcon = Hash
export const PlayIcon = Play
export const PauseIcon = Pause
export const TrashIcon = Trash2
export const ChevronDownIcon = ChevronDown
export const ArrowRightIcon = ArrowRight
export const CheckIcon = Check
export const LockIcon = Lock
export const UnlockIcon = Unlock
export const KeyIcon = Key
export const MailIcon = Mail
export const AlertTriangleIcon = AlertTriangle
export const DownloadIcon = Download
export const RefreshcwIcon = RefreshCw
export const GlobeIcon = Globe

// Standardized Custom Icons that match Lucide style
// Default stroke width: 1.5px (Lucide default is 2px, but we can override or match)
// Lucide 'thin' is often desired for the Bushidō look. Let's stick to Lucide default props spread first,
// but default strokeWidth to 1.5 if not specified, to match the Bushidō aesthetic.

export const SamuraiShieldIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5 4h14v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V4z" />
    <path d="M5 9h14" />
    <path d="M5 14h14" />
    <path d="M9 4v16" />
    <path d="M15 4v16" />
    <rect x="10" y="10" width="4" height="4" rx="1" />
  </svg>
)

export const KatanakakeIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Base */}
    <path d="M3 20h18" />

    {/* Stands */}
    <path d="M7 20v-8" />
    <path d="M17 20v-8" />

    {/* Hooks */}
    <path d="M7 12a2 2 0 0 1 2-2" />
    <path d="M17 12a2 2 0 0 0-2-2" />

    {/* Katana (Curved) */}
    <path d="M3 12c4.5 3 12.5 3 18 -1" />

    {/* Tsuba (Guard) */}
    <path d="M6.5 13.5l1 -2" />
  </svg>
)

export const MizuhikiIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
    <path d="M12 6V12L16 16" />
    <path d="M12 12L8 16" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const KabutoIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2L4.5 10H19.5L12 2Z" />
    <path d="M4.5 10V18C4.5 20.2091 6.29086 22 8.5 22H15.5C17.7091 22 19.5 20.2091 19.5 18V10" />
    <path d="M2 13H22" />
    <path d="M12 14V18" />
    <circle cx="12" cy="6" r="1.5" fill="currentColor" />
  </svg>
)

// Premium Japanese Custom Icons

export const BushidoSettingsIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    <circle cx="12" cy="12" r="8" strokeDasharray="1 3" />
  </svg>
)

export const BushidoCloseIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 6L6 18" strokeWidth={Number(strokeWidth) + 0.5} opacity="0.8" />
    <path d="M6 6l12 12" strokeWidth={strokeWidth} opacity="0.6" />
  </svg>
)

export const BushidoTimerIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
    <path d="M12 2v2" />
  </svg>
)

export const EnsoCircleIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12c0 2.5-1 4.5-2.5 5.5" />
  </svg>
)

// ─── BUSHIDŌ ICONS ───────────────────────────────────────

/** Kamon (家紋) — family crest. Mitsudomoe (three commas) over disc. */
export const KamonIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.2,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="16" cy="16" r="14" />
    <path d="M16 6 C12 8, 11 12, 14 14 C16 15, 17 13, 16 11 Z" fill="currentColor" stroke="none" />
    <path d="M22.9 19.8 C20.1 17 16.5 17.9 16.3 21.2 C16.2 23.1 18.2 23.7 19.1 22 Z" fill="currentColor" stroke="none" />
    <path d="M9.1 19.8 C11.9 17, 15.5 17.9, 15.7 21.2 C15.8 23.1, 13.8 23.7, 12.9 22 Z" fill="currentColor" stroke="none" transform="scale(-1 1) translate(-32 0)" />
    <circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none" />
  </svg>
)

/** Torii gate (鳥居) — shrine entry */
export const ToriiIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.6,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 7 Q16 4 29 7 L27 9.5 Q16 7.5 5 9.5 Z" fill="currentColor" stroke="none" />
    <path d="M5 11 H27" />
    <path d="M8 11 V28" />
    <path d="M24 11 V28" />
    <path d="M6 15 H26" />
  </svg>
)

/** Katana (刀) — single curved blade */
export const KatanaIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M28 4 Q14 8 6 22" />
    <path d="M6 22 L4 28 L9 26 Z" fill="currentColor" stroke="none" />
    <path d="M28 4 L29.5 5.5" />
    <circle cx="9" cy="26" r="0.8" fill="currentColor" stroke="none" />
  </svg>
)

/** Seal stamp (hanko) — crimson square with kanji */
export const SealIcon: React.FC<LucideProps & { kanji?: string }> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  kanji = '士',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    className={className}
    {...props}
  >
    <rect x="3" y="3" width="26" height="26" rx="1" fill="currentColor" stroke="none" />
    <text
      x="16"
      y="22.5"
      textAnchor="middle"
      fontSize="18"
      fontFamily="'Shippori Mincho','Noto Serif JP',serif"
      fontWeight="900"
      fill="#F2E9D8"
      stroke="none"
    >
      {kanji}
    </text>
  </svg>
)

/** Mountain (山) — three peaks, dojo backdrop */
export const MountainIcon: React.FC<LucideProps> = ({
  size = 24,
  strokeWidth = 1.5,
  className,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 26 L10 12 L14 18 L18 10 L24 22 L30 26 Z" />
    <path d="M9 14 L11 12 L13 14" />
  </svg>
)
