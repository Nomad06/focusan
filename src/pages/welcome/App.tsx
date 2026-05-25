/**
 * Welcome — Initiation Ceremony
 * Four chapters of the dojo:
 *   入門 Nyūmon (entering)  →  七徳 Shichi-toku (seven virtues)
 *   →  誓 Chikai (oath)      →  始 Hajime (begin)
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messagingClient } from '../../shared/messaging/client'
import { normalizeHost } from '../../shared/utils/domain'
import { t, initI18n } from '../../shared/i18n'
import { ArrowRightIcon, ToriiIcon, MountainIcon } from '../../shared/components/Icons'

enum Step {
  INTRO = 0,
  PHILOSOPHY = 1,
  SETUP = 2,
  FINISH = 3,
}

const CHAPTERS: { kanji: string; romaji: string; meaning: string; meaningRu: string }[] = [
  { kanji: '入門', romaji: 'Nyūmon',  meaning: 'Entering',       meaningRu: 'Вступление' },
  { kanji: '七徳', romaji: 'Shichi-toku', meaning: 'Seven Virtues', meaningRu: 'Семь добродетелей' },
  { kanji: '誓',   romaji: 'Chikai',  meaning: 'The Oath',        meaningRu: 'Клятва' },
  { kanji: '始',   romaji: 'Hajime',  meaning: 'Begin',           meaningRu: 'Начало' },
]

const SEVEN_VIRTUES = [
  { k: '義', r: 'Gi',    en: 'Rectitude', ru: 'Праведность' },
  { k: '勇', r: 'Yū',    en: 'Courage',   ru: 'Мужество' },
  { k: '仁', r: 'Jin',   en: 'Benevolence', ru: 'Милосердие' },
  { k: '礼', r: 'Rei',   en: 'Respect',   ru: 'Уважение' },
  { k: '誠', r: 'Makoto', en: 'Sincerity', ru: 'Искренность' },
  { k: '名誉', r: 'Meiyo', en: 'Honor',   ru: 'Честь' },
  { k: '忠義', r: 'Chūgi', en: 'Loyalty', ru: 'Верность' },
]

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)' }),
  center: { zIndex: 1, x: 0, opacity: 1, filter: 'blur(0px)' },
  exit:  (d: number) => ({ zIndex: 0, x: d < 0 ? 40 : -40, opacity: 0, filter: 'blur(8px)' }),
}
const transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.INTRO)
  const [direction, setDirection] = useState(0)
  const [siteInput, setSiteInput] = useState('')
  const [siteError, setSiteError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { initI18n() }, [])

  const paginate = (dir: number) => { setDirection(dir); setStep(step + dir) }

  const goToFinish = () => {
    if (!siteInput.trim()) { setSiteError(t('welcome.validationHint')); return }
    const host = normalizeHost(siteInput)
    if (!host) { setSiteError(t('errors.invalidDomain')); return }
    setSiteError('')
    paginate(1)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      if (siteInput) {
        const host = normalizeHost(siteInput)
        if (host) await messagingClient.addSite(host)
      }
      await messagingClient.setOnboardingSeen(true)
      window.close()
    } catch (err) {
      console.error('Onboarding error:', err)
      setLoading(false)
    }
  }

  const chapter = CHAPTERS[step]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg1)' }}>
      {/* Asanoha background */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'var(--asanoha)' }} />

      {/* Crimson radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(184,46,46,0.15) 0%, transparent 60%)' }}
      />

      {/* Mountain at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-20" style={{ color: 'var(--kokutan)' }}>
        <MountainIcon size={1600} className="w-full h-auto" />
      </div>

      {/* Vertical chapter rail */}
      <div className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <div className="kanji-rail" style={{ fontSize: 14, letterSpacing: '0.8em' }}>
          {CHAPTERS.map(c => c.kanji.charAt(0)).join('')}
        </div>
      </div>

      {/* Chapter mark — top right */}
      <div className="absolute top-8 right-10 z-10 text-right">
        <div className="text-[10px] uppercase tracking-[0.45em]" style={{ color: 'var(--nezumi)' }}>
          {String(step + 1).padStart(2, '0')} / 04
        </div>
        <div className="font-serif text-2xl gold-leaf mt-1">{chapter.kanji}</div>
        <div className="text-[10px] tracking-[0.3em] italic" style={{ color: 'var(--kinpaku)', opacity: 0.7 }}>
          {chapter.romaji}
        </div>
      </div>

      {/* Brand top-left */}
      <div className="absolute top-8 left-10 z-10 flex items-center gap-3">
        <div className="hanko tilt seal-press" style={{ fontSize: 12, padding: '4px 6px' }}>士</div>
        <div className="font-serif text-base" style={{ color: 'var(--text)' }}>Focusan</div>
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-16">

        {/* Progress — chapter dots */}
        <div className="flex gap-4 mb-14" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{
                width: step === i ? 32 : 8,
                opacity: step >= i ? 1 : 0.3,
              }}
              transition={{ duration: 0.4 }}
              className="h-[2px]"
              style={{ background: step >= i ? 'var(--kinpaku)' : 'var(--nezumi)' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>

          {/* ─── INTRO ─── */}
          {step === Step.INTRO && (
            <motion.div
              key="intro"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center text-center max-w-2xl"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="mb-10 relative"
              >
                <div
                  className="absolute inset-0 blur-3xl rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(184,46,46,0.35), transparent 70%)' }}
                />
                <ToriiIcon size={130} style={{ color: 'var(--akabeni)' }} className="relative z-10 lantern" strokeWidth={1.4} />
              </motion.div>

              <div className="mb-2 text-[10px] uppercase tracking-[0.6em]" style={{ color: 'var(--kinpaku)' }}>
                武 士 道
              </div>
              <h1 className="font-serif text-6xl mb-3 tracking-tight" style={{ color: 'var(--text)' }}>
                Focusan
              </h1>
              <p
                className="font-serif italic mb-10 max-w-lg leading-relaxed"
                style={{ fontSize: 18, color: 'var(--nezumi)' }}
              >
                {t('bushido.welcome.intro')}
              </p>

              <div className="brush-divider w-32 mb-10 opacity-70" />

              <button onClick={() => paginate(1)} className="btn primary lg group" style={{ paddingLeft: 40, paddingRight: 40 }}>
                <span className="font-serif" style={{ fontSize: 14, marginRight: 8 }}>始</span>
                {t('welcome.begin') || 'Begin'}
                <ArrowRightIcon className="group-hover:translate-x-1 transition-transform ml-2" strokeWidth={1.5} />
              </button>
            </motion.div>
          )}

          {/* ─── PHILOSOPHY — Seven Virtues ─── */}
          {step === Step.PHILOSOPHY && (
            <motion.div
              key="philosophy"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center text-center max-w-3xl"
            >
              <div className="mb-3 text-[10px] uppercase tracking-[0.5em]" style={{ color: 'var(--kinpaku)' }}>
                {t('bushido.virtues')}
              </div>
              <h2 className="font-serif text-4xl mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                七 つ の 徳
              </h2>
              <p
                className="font-serif italic mb-10 max-w-xl leading-relaxed"
                style={{ fontSize: 15, color: 'var(--nezumi)' }}
              >
                {t('bushido.welcome.philosophy')}
              </p>

              {/* Virtues grid */}
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-10">
                {SEVEN_VIRTUES.map((v, i) => (
                  <motion.div
                    key={v.r}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                    className="kintsugi-card p-3 flex flex-col items-center"
                    style={{ minWidth: 80 }}
                  >
                    <div className="font-serif text-3xl gold-leaf leading-none mb-2">{v.k}</div>
                    <div className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--kinpaku)' }}>
                      {v.r}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--nezumi)' }}>
                      {v.en}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="brush-divider w-32 mb-8 opacity-50" />

              <div className="flex gap-3 items-center">
                <button onClick={() => paginate(-1)} className="btn ghost">
                  ← {t('welcome.back') || 'Back'}
                </button>
                <button onClick={() => paginate(1)} className="btn primary lg">
                  {t('welcome.gotIt') || 'I understand'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── SETUP — Name first gate ─── */}
          {step === Step.SETUP && (
            <motion.div
              key="setup"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center text-center max-w-lg w-full"
            >
              <div className="mb-3 text-[10px] uppercase tracking-[0.5em]" style={{ color: 'var(--kinpaku)' }}>
                {t('bushido.oath')}
              </div>
              <h2 className="font-serif text-4xl mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                第 一 の 門
              </h2>
              <p
                className="font-serif italic mb-10 leading-relaxed max-w-md"
                style={{ fontSize: 15, color: 'var(--nezumi)' }}
              >
                {t('bushido.welcome.setup')}
              </p>

              <div className="w-full max-w-md mb-2 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 font-serif text-sm" style={{ color: 'var(--akabeni)' }}>
                  封
                </div>
                <input
                  type="text"
                  value={siteInput}
                  onChange={e => { setSiteInput(e.target.value); if (siteError) setSiteError('') }}
                  onKeyDown={e => e.key === 'Enter' && goToFinish()}
                  placeholder="youtube.com"
                  className="zen-input text-lg font-mono text-center"
                  style={{ paddingLeft: 36, ...(siteError ? { borderColor: 'var(--hi-iro)' } : {}) }}
                  aria-invalid={!!siteError}
                  autoFocus
                />
                <div className="h-5 mt-2 text-xs" style={{ color: 'var(--hi-iro)' }} role="alert">
                  {siteError}
                </div>
              </div>

              <div className="flex gap-3 mt-6 items-center">
                <button onClick={() => paginate(-1)} className="btn ghost">
                  ← {t('welcome.back') || 'Back'}
                </button>
                <button onClick={goToFinish} className="btn primary lg">
                  {t('welcome.continue') || 'Continue'} →
                </button>
              </div>

              <button
                onClick={() => paginate(1)}
                className="mt-10 text-[10px] uppercase tracking-[0.4em] transition-colors"
                style={{ color: 'var(--nezumi)' }}
              >
                {t('welcome.skip') || 'Skip — set later'}
              </button>
            </motion.div>
          )}

          {/* ─── FINISH — Oath sealed ─── */}
          {step === Step.FINISH && (
            <motion.div
              key="finish"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
              className="flex flex-col items-center text-center max-w-xl"
            >
              <motion.div
                initial={{ scale: 1.6, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
                className="mb-8 relative"
              >
                <div
                  className="absolute inset-0 blur-3xl rounded"
                  style={{ background: 'radial-gradient(circle, rgba(184,46,46,0.5), transparent 70%)' }}
                />
                <div
                  className="hanko relative z-10"
                  style={{
                    fontSize: 48,
                    padding: '20px 28px',
                    boxShadow: '0 0 0 2px var(--akabeni), 0 0 40px -4px rgba(184,46,46,0.6)',
                  }}
                >
                  封
                </div>
              </motion.div>

              <div className="mb-3 text-[10px] uppercase tracking-[0.5em]" style={{ color: 'var(--kinpaku)' }}>
                {t('bushido.theWay')}
              </div>
              <h2 className="font-serif text-4xl mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                準 備 完 了
              </h2>
              <p
                className="font-serif italic mb-12 leading-relaxed max-w-md"
                style={{ fontSize: 15, color: 'var(--nezumi)' }}
              >
                {t('bushido.welcome.finish')}
              </p>

              <button
                onClick={handleFinish}
                disabled={loading}
                className="btn primary lg group"
                style={{ paddingLeft: 50, paddingRight: 50 }}
              >
                <span className="font-serif" style={{ fontSize: 16, marginRight: 8 }}>道</span>
                {loading ? '...' : t('bushido.enterDojo')}
                {!loading && <ArrowRightIcon className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
