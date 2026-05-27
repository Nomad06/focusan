import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { t, getCurrentLanguage, translations } from '../i18n'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { KatanaIcon } from './Icons'
import { getFrictionBreaksToday, recordFrictionBreak } from '../domain/stats'

interface ChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  action: 'stop-session' | 'remove-site' | 'disable-extension'
  title?: string
}

type StepType = 'vow' | 'seal'

interface Step {
  type: StepType
  /** vow: the text that must be reproduced exactly */
  target?: string
  /** seal: seconds the seal must be held */
  holdSeconds?: number
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const makeVow = (): Step => {
  const vows = translations[getCurrentLanguage()].friction.vows as readonly string[]
  return { type: 'vow', target: pick([...vows]) }
}

const makeSeal = (level: number): Step => ({ type: 'seal', holdSeconds: 3 + level * 2 })

/** Compose the ritual: harder + multi-step as daily breaks accrue. */
const buildSteps = (level: number): Step[] => {
  if (level >= 2) return [makeSeal(level), makeVow()]
  if (level === 1) return [makeVow()]
  return [pick([makeVow, () => makeSeal(0)])()]
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  action,
  title,
}) => {
  const [level, setLevel] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0) // 0..1 for hold-seal

  const rafRef = useRef<number | null>(null)
  const holdStartRef = useRef<number>(0)

  useEscapeKey(isOpen, onClose)

  const stopHold = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Build the ritual whenever the modal opens, scaled by today's break count.
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setInput('')
    setError(false)
    setProgress(0)
    setStepIndex(0)
    getFrictionBreaksToday().then(breaks => {
      if (cancelled) return
      const lvl = Math.min(breaks, 3)
      setLevel(lvl)
      setSteps(buildSteps(lvl))
    })
    return () => {
      cancelled = true
      stopHold()
    }
  }, [isOpen, stopHold])

  const finalize = useCallback(() => {
    // Record the break so the next ritual today is harder, then proceed.
    recordFrictionBreak().finally(() => onSuccess())
  }, [onSuccess])

  const advance = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      finalize()
    } else {
      setStepIndex(i => i + 1)
      setInput('')
      setError(false)
      setProgress(0)
    }
  }, [stepIndex, steps.length, finalize])

  const step = steps[stepIndex]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!step) return
    const expected = step.target ?? ''
    // Lenient match: unify dash variants, smart quotes, case and whitespace
    // so users aren't punished for typing "-" instead of "—".
    const norm = (s: string) =>
      s
        .trim()
        .toLowerCase()
        .replace(/[‐-―]/g, '-') // ‐ ‑ ‒ – — ― → -
        .replace(/[“”«»„]/g, '"')
        .replace(/[’‘`]/g, "'")
        .replace(/\s*-\s*/g, '-') // ignore spacing around dashes
        .replace(/\s+/g, ' ')
    if (norm(input) === norm(expected)) {
      advance()
    } else {
      setError(true)
    }
  }

  // ── Hold-to-break-seal handlers ──
  const beginHold = () => {
    if (!step || step.type !== 'seal') return
    const durationMs = (step.holdSeconds ?? 3) * 1000
    holdStartRef.current = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - holdStartRef.current) / durationMs, 1)
      setProgress(p)
      if (p >= 1) {
        stopHold()
        advance()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }
  const endHold = () => {
    if (progress < 1) {
      stopHold()
      setProgress(0)
    }
  }

  const getTitle = () => {
    if (title) return title
    if (action === 'stop-session') return t('friction.titleStopSession')
    if (action === 'remove-site') return t('friction.titleRemoveSite')
    return t('friction.titleDisable')
  }
  const getDescription = () => {
    if (action === 'stop-session') return t('friction.descStopSession')
    if (action === 'remove-site') return t('friction.descRemoveSite')
    return t('friction.descDisable')
  }

  const isLastStep = stepIndex >= steps.length - 1
  const SEAL_KANJI = '封'

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="challenge-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="washi-card relative w-full max-w-md overflow-hidden shadow-[var(--shadow-float)] flex flex-col"
            style={{ borderRadius: 'var(--radius)', maxHeight: '92vh' }}
          >
            <div className="relative z-10 overflow-y-auto">
            {/* Header */}
            <div className="relative px-8 pt-6 pb-4 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <span className="hanko tilt" style={{ fontSize: 24, width: 52, height: 52 }}>
                  {SEAL_KANJI}
                </span>
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.35em] mb-1"
                style={{ color: 'var(--muted)' }}
              >
                {t('friction.levelLabel', { level: level + 1 })}
              </div>
              <h3
                id="challenge-modal-title"
                className="text-2xl font-serif tracking-tight mb-2"
                style={{ color: 'var(--text)' }}
              >
                {getTitle()}
              </h3>
              <p className="text-sm leading-relaxed font-light" style={{ color: 'var(--muted)' }}>
                {getDescription()}
              </p>
            </div>

            <div className="brush-divider thick mx-8" />

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm mb-5 text-center tracking-wide" style={{ color: 'var(--text)' }}>
                {t('friction.prompt')}
                {steps.length > 1 && (
                  <span className="block text-[11px] mt-1 tracking-[0.2em] uppercase" style={{ color: 'var(--muted)' }}>
                    {t('friction.stepOf', { current: stepIndex + 1, total: steps.length })}
                  </span>
                )}
              </p>

              {step?.type === 'seal' ? (
                <SealHold
                  kanji={SEAL_KANJI}
                  seconds={step.holdSeconds ?? 3}
                  progress={progress}
                  onStart={beginHold}
                  onEnd={endHold}
                />
              ) : step ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <p className="text-xs text-center tracking-wide" style={{ color: 'var(--muted)' }}>
                    {t('friction.typeVowExactly')}
                  </p>
                  <div
                    className="p-4 text-center select-none"
                    style={{
                      background: 'rgba(0,0,0,0.18)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <p className="font-serif italic text-[15px] leading-relaxed" style={{ color: 'var(--text)' }}>
                      “{step.target}”
                    </p>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={input}
                    onChange={e => {
                      setInput(e.target.value)
                      setError(false)
                    }}
                    onPaste={e => e.preventDefault()}
                    placeholder="…"
                    className="zen-input text-center"
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 14,
                      ...(error ? { borderColor: 'var(--danger)', color: 'var(--danger)' } : {}),
                    }}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-center font-medium tracking-wide"
                      style={{ color: 'var(--danger)' }}
                    >
                      {t('friction.incorrect')}
                    </motion.p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={onClose} className="btn secondary flex-1">
                      {t('friction.returnToWay')}
                    </button>
                    <button type="submit" disabled={!input} className="btn primary flex-1">
                      <KatanaIcon size={16} strokeWidth={1.6} />
                      <span>{isLastStep ? t('friction.breakSeal') : t('bushido.engage')}</span>
                    </button>
                  </div>
                </form>
              ) : null}

              {step?.type === 'seal' && (
                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={onClose} className="btn secondary flex-1">
                    {t('friction.returnToWay')}
                  </button>
                </div>
              )}
            </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── Hold-to-break-seal control: press-and-hold the hanko, ring fills, release resets ──
const SealHold: React.FC<{
  kanji: string
  seconds: number
  progress: number
  onStart: () => void
  onEnd: () => void
}> = ({ kanji, seconds, progress, onStart, onEnd }) => {
  const SIZE = 148
  const R = 60
  const C = 2 * Math.PI * R
  const holding = progress > 0 && progress < 1
  const pct = Math.round(progress * 100)
  // Ease the kanji from dim ink to full crimson as the seal is held.
  const ink = 0.35 + progress * 0.65

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <p className="text-xs text-center tracking-wide" style={{ color: 'var(--muted)' }}>
        {t('friction.holdToBreak', { seconds })}
      </p>
      <button
        type="button"
        onPointerDown={onStart}
        onPointerUp={onEnd}
        onPointerLeave={onEnd}
        className="relative flex items-center justify-center group"
        style={{ width: SIZE, height: SIZE, background: 'transparent', cursor: 'pointer', touchAction: 'none' }}
        aria-label="Hold to break the seal"
      >
        {/* Crimson glow that swells as you hold */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: 14,
            boxShadow: `0 0 ${16 + progress * 46}px ${progress * 10}px rgba(184,46,46,${0.12 + progress * 0.5})`,
            transition: progress === 0 ? 'box-shadow 0.25s ease-out' : 'none',
          }}
        />
        {/* Idle hint ring — gently pulses, fades once you start */}
        <div
          className="absolute rounded-full border pointer-events-none animate-ping"
          style={{
            inset: 18,
            borderColor: 'var(--accent)',
            opacity: progress === 0 ? 0.25 : 0,
            animationDuration: '2.4s',
          }}
        />
        <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--border)" strokeWidth={4} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{
              filter: progress > 0 ? 'drop-shadow(0 0 4px rgba(184,46,46,0.6))' : 'none',
              transition: progress === 0 ? 'stroke-dashoffset 0.25s ease-out' : 'none',
            }}
          />
        </svg>
        <span
          className="hanko group-active:scale-95"
          style={{
            fontSize: 38,
            width: 80,
            height: 80,
            filter: `grayscale(${1 - progress}) brightness(${0.85 + progress * 0.15})`,
            opacity: ink,
            transform: `scale(${1 + progress * 0.08})`,
            transition: progress === 0 ? 'all 0.25s ease-out' : 'none',
          }}
        >
          {kanji}
        </span>
      </button>
      <p
        className="text-[11px] tracking-[0.3em] uppercase tabular-nums h-4"
        style={{ color: holding ? 'var(--accent)' : 'var(--muted)' }}
      >
        {holding ? `${t('friction.holding')} ${pct}%` : ''}
      </p>
    </div>
  )
}
