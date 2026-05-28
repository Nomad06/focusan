/**
 * Popup React App for Focusan
 * High-end Japanese Zen Redesign
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { normalizeHost } from '../shared/utils/domain'
import { t, initI18n } from '../shared/i18n'
import { SessionState, type FocusSession } from '../shared/domain/focus-sessions'
import { ZenSettingsIcon, ZenCloseIcon } from '../shared/components/Icons'
import { playSound, SoundType } from '../shared/sound'
import { ChallengeModal } from '../shared/components/ChallengeModal'
import { useToast } from '../shared/components/Toast'
import { useEscapeKey } from '../shared/hooks/useEscapeKey'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const, // Fix explicit type
    },
  },
  exit: { opacity: 0 },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
  },
}

const breathingVariants = {
  inhale: { scale: 1.05, opacity: 0.9, transition: { duration: 4, ease: 'easeInOut' as const } },
  exhale: { scale: 1, opacity: 0.7, transition: { duration: 4, ease: 'easeInOut' as const } },
}

const App: React.FC = () => {
  const toast = useToast()
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [showPomodoroModal, setShowPomodoroModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [currentHost, setCurrentHost] = useState<string>('')
  const [currentHostBlocked, setCurrentHostBlocked] = useState<boolean>(false)
  const [breathState, setBreathState] = useState<'inhale' | 'exhale'>('inhale')
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false)
  const [challengeMode, setChallengeMode] = useState<boolean>(false)

  // Detect current host
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const tab = tabs[0]
      if (tab?.url) {
        const host = normalizeHost(tab.url)
        if (host) setCurrentHost(host)
      }
    })
  }, [])

  // Breathing cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathState(prev => (prev === 'inhale' ? 'exhale' : 'inhale'))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Load sites count
  const loadSitesCount = async () => {
    try {
      const sites = await messagingClient.getSites()
      if (currentHost) {
        setCurrentHostBlocked(sites.some(s => s.host === currentHost))
      }
    } catch (err) {
      console.error('[Popup] Error loading sites count:', err)
    }
  }

  useEffect(() => {
    if (!currentHost) return
    messagingClient
      .getSites()
      .then(sites => setCurrentHostBlocked(sites.some(s => s.host === currentHost)))
      .catch(() => {})
  }, [currentHost])

  // Load current focus session
  const loadFocusSession = async () => {
    try {
      const session = await messagingClient.getCurrentSession()
      if (session) {
        setCurrentSession(session)
        if (session.state === SessionState.WORKING || session.state === SessionState.BREAK) {
          const now = Date.now()
          const remaining = Math.max(0, Math.floor((session.endTime - now) / 1000))
          setRemainingTime(remaining)
        } else {
          setRemainingTime(0)
        }
      } else {
        setCurrentSession(null)
        setRemainingTime(0)
      }
    } catch (err) {
      console.error('[Popup] Error loading focus session:', err)
      setCurrentSession(null)
      setRemainingTime(0)
    }
  }

  // Initial load
  useEffect(() => {
    const init = async () => {
      await initI18n()
      await loadSitesCount()
      await loadFocusSession()

      try {
        const challenge = await messagingClient.getChallengeMode()
        setChallengeMode(challenge.enabled)
      } catch (err) {
        console.error('[Popup] Error loading status:', err)
      }

      setLoading(false)
    }
    init()
  }, [])

  // Timer for focus session
  useEffect(() => {
    if (
      !currentSession ||
      currentSession.state === SessionState.IDLE ||
      currentSession.state === SessionState.PAUSED
    ) {
      return
    }

    const interval = setInterval(() => {
      loadFocusSession()
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSession?.state, currentSession?.endTime])

  // Add current site to block list
  const handleAddCurrentSite = async () => {
    try {
      playSound(SoundType.BAMBOO_STRIKE)
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]

      if (!tab?.url) return
      const host = normalizeHost(tab.url)
      if (!host) return

      const success = await messagingClient.addSite(host)
      if (success) {
        setCurrentHostBlocked(true)
        await loadSitesCount()
        toast(`${host} ${t('common.added')}`, 'success')
      }
    } catch (err) {
      console.error('[Popup] Error adding current site:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  // Open options page
  const handleOpenOptions = () => {
    playSound(SoundType.KOTO_PLUCK)
    chrome.runtime.openOptionsPage()
  }

  // Start focus session
  const handleStartFocusSession = () => {
    playSound(SoundType.TEMPLE_BELL)
    setShowPomodoroModal(true)
  }

  // Pause focus session
  const handlePauseFocusSession = async () => {
    try {
      playSound(SoundType.SOFT_GONG)
      if (currentSession?.state === SessionState.PAUSED) {
        await messagingClient.resumeFocusSession()
      } else {
        await messagingClient.pauseFocusSession()
      }
      await loadFocusSession()
    } catch (err) {
      console.error('[Popup] Error pausing/resuming focus session:', err)
    }
  }

  const checkChallenge = (action: () => void) => {
    if (challengeMode) {
      setShowChallengeModal(true)
    } else {
      action()
    }
  }

  // Stop focus session
  const handleStopFocusSession = async () => {
    playSound(SoundType.SOFT_GONG)
    checkChallenge(performStopSession)
  }

  const performStopSession = async () => {
    try {
      await messagingClient.stopFocusSession()
      await loadFocusSession()
    } catch (err) {
      console.error('[Popup] Error stopping focus session:', err)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const isSessionActive = currentSession && currentSession.state !== SessionState.IDLE

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-washi transition-all duration-500">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-2xl font-serif text-sumi-black tracking-widest">Focusan</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-[340px] min-h-[520px] flex flex-col p-5 font-sans overflow-hidden relative" style={{ background: 'var(--bg1)' }}>
      {/* Asanoha pattern overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'var(--asanoha)' }} />
      {/* Crimson radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(184,46,46,0.14) 0%, transparent 60%)' }} />
      {/* Right kanji rail */}
      <div className="hidden md:flex absolute right-2 top-8 bottom-8 kanji-rail" style={{ fontSize: 11, letterSpacing: '0.4em', opacity: 0.25 }}>武士道</div>
      <AnimatePresence mode="wait">
        {showPomodoroModal ? (
          <PomodoroModal
            key="modal"
            onClose={() => setShowPomodoroModal(false)}
            onStart={async () => {
              await loadFocusSession()
              setShowPomodoroModal(false)
            }}
          />
        ) : showChallengeModal ? (
          <div className="absolute inset-0 z-50">
            <ChallengeModal
              isOpen={true}
              onClose={() => setShowChallengeModal(false)}
              onSuccess={() => {
                setShowChallengeModal(false)
                performStopSession()
              }}
              action="stop-session"
            />
          </div>
        ) : (
          <motion.div
            key="main"
            className="flex flex-col flex-1 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header — dojo banner */}
            <motion.header
              className="flex justify-between items-center mb-6 pb-4 border-b"
              style={{ borderColor: 'var(--border)' }}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <div className="hanko tilt seal-press" style={{ fontSize: 14, padding: '4px 8px' }}>士</div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg tracking-wide leading-none" style={{ color: 'var(--text)' }}>
                    Focusan
                  </span>
                  <span className="text-[10px] font-serif tracking-[0.45em] mt-1 uppercase" style={{ color: 'var(--kinpaku)' }}>
                    武士道 · The Way
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenOptions}
                aria-label={t('common.settings') || 'Settings'}
                className="transition-all p-2 rounded"
                style={{ color: 'var(--nezumi)' }}
              >
                <ZenSettingsIcon strokeWidth={1.5} />
              </motion.button>
            </motion.header>

            <main className="flex flex-col items-center gap-8 relative flex-1 justify-center">
              {/* Timer — Dojo gong with kanji core */}
              <motion.div
                className="relative w-[220px] h-[220px] flex items-center justify-center"
                variants={itemVariants}
              >
                {/* Lantern glow */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 70%)' }}
                  variants={breathingVariants}
                  animate={breathState}
                />

                {/* Faint background kanji 集 */}
                <div
                  className="absolute font-serif select-none pointer-events-none"
                  style={{
                    fontSize: 200,
                    fontWeight: 900,
                    color: 'var(--akabeni)',
                    opacity: 0.06,
                    lineHeight: 1,
                  }}
                >
                  集
                </div>

                {/* SVG Ring — gold gradient */}
                <svg width="220" height="220" className="-rotate-90 relative">
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--akabeni)" />
                      <stop offset="50%" stopColor="var(--kinpaku)" />
                      <stop offset="100%" stopColor="var(--enji)" />
                    </linearGradient>
                  </defs>

                  {/* Outer decorative ring */}
                  <circle cx="110" cy="110" r="105" stroke="var(--border)" strokeWidth="1" fill="transparent" strokeDasharray="2 4" />

                  {/* Track */}
                  <circle
                    cx="110"
                    cy="110"
                    r="95"
                    stroke="rgba(212,175,55,0.08)"
                    strokeWidth="2"
                    fill="transparent"
                  />

                  {/* Progress */}
                  <motion.circle
                    cx="110"
                    cy="110"
                    r="95"
                    stroke="url(#ringGradient)"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 95}
                    strokeLinecap="round"
                    animate={{
                      strokeDashoffset:
                        isSessionActive && currentSession
                          ? 2 * Math.PI * 95 * (1 - remainingTime / (currentSession.duration * 60))
                          : 2 * Math.PI * 95,
                    }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }}
                  />
                </svg>

                {/* Center */}
                <div className="absolute flex flex-col items-center text-center z-10">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    className="text-[9px] uppercase tracking-[0.45em] font-serif mb-1"
                    style={{ color: 'var(--kinpaku)' }}
                  >
                    {isSessionActive ? '集中' : '修行'}
                  </motion.div>

                  <motion.span
                    className="font-mono text-[2.75rem] font-light leading-none tracking-tight tabular-nums"
                    style={{ color: 'var(--text)', textShadow: '0 0 20px rgba(212,175,55,0.2)' }}
                  >
                    {isSessionActive ? formatTime(remainingTime) : '25:00'}
                  </motion.span>

                  <motion.div
                    className="mt-2 flex items-center gap-2"
                    animate={{ opacity: isSessionActive ? 1 : 0.5 }}
                  >
                    <span className="text-[9px] font-serif uppercase tracking-[0.35em]" style={{ color: 'var(--nezumi)' }}>
                      {isSessionActive
                        ? currentSession?.state === SessionState.PAUSED
                          ? t('focusSession.paused')
                          : t('focusSession.active')
                        : t('focusSession.ready')}
                    </span>
                    {isSessionActive && (
                      <motion.div
                        className="w-1 h-1 rounded-full"
                        style={{ background: 'var(--kinpaku)' }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>
              </motion.div>

              {/* Controls — engage */}
              <motion.div
                className="flex items-center gap-3 w-full justify-center px-4"
                variants={itemVariants}
              >
                {isSessionActive ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePauseFocusSession}
                      aria-label={
                        currentSession?.state === SessionState.PAUSED
                          ? t('focusSession.resume')
                          : t('focusSession.pause')
                      }
                      className="btn secondary flex-1"
                    >
                      {currentSession?.state === SessionState.PAUSED ? '▶ ' + t('focusSession.resume') : '❘❘ ' + t('focusSession.pause')}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStopFocusSession}
                      aria-label={t('focusSession.stop')}
                      className="btn danger px-5"
                    >
                      {t('focusSession.stop')}
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartFocusSession}
                    aria-label={t('focusSession.engage')}
                    className="btn primary w-full lg"
                    style={{ paddingTop: 14, paddingBottom: 14 }}
                  >
                    <span className="font-serif" style={{ fontSize: 16, marginRight: 6 }}>戦</span>
                    {t('focusSession.engage')}
                  </motion.button>
                )}
              </motion.div>
            </main>

            {/* Current Gate — verdict card */}
            {!isSessionActive && currentHost && (
              <motion.div
                className="mt-5 flex items-center gap-3 px-4 py-3 kintsugi-card"
                variants={itemVariants}
              >
                {currentHostBlocked ? (
                  <span className="hanko tilt" style={{ fontSize: 11, padding: '3px 6px' }}>封</span>
                ) : (
                  <span
                    className="font-serif lantern"
                    style={{ fontSize: 18, color: 'var(--kinpaku)', textShadow: 'var(--lantern-glow)' }}
                  >
                    門
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.35em] leading-none mb-1" style={{ color: 'var(--nezumi)' }}>
                    {currentHostBlocked ? t('bushido.gateSealed') : t('bushido.currentTab')}
                  </div>
                  <div className="font-mono text-xs truncate" style={{ color: currentHostBlocked ? 'var(--hi-iro)' : 'var(--text)' }}>
                    {currentHost}
                  </div>
                </div>
                {!currentHostBlocked && (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAddCurrentSite}
                    className="btn primary sm shrink-0 focus-ring"
                    title={`Seal ${currentHost}`}
                  >
                    {t('bushido.seal')}
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PomodoroModalProps {
  onClose: () => void
  onStart: () => void
}

const PomodoroModal: React.FC<PomodoroModalProps> = ({ onClose, onStart }) => {
  const [sites, setSites] = useState<Array<{ host: string; addedAt: number }>>([])
  const [selectedMainSites, setSelectedMainSites] = useState<Set<string>>(new Set())
  const [additionalSites, setAdditionalSites] = useState<string[]>([])
  const [newSiteInput, setNewSiteInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [duration, setDuration] = useState<number>(25)
  const [mode, setMode] = useState<'blocklist' | 'whitelist'>('blocklist')
  const toast = useToast()

  useEscapeKey(true, onClose)

  // Load sites
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await messagingClient.getSites()
        setSites(sites)
      } catch (err) {
        console.error('[PomodoroModal] Error loading sites:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSites()
  }, [])

  // Add additional site
  const handleAddAdditionalSite = () => {
    playSound(SoundType.KOTO_PLUCK)
    const host = normalizeHost(newSiteInput)
    if (!host) {
      toast(t('errors.invalidDomain'), 'error')
      return
    }

    if (additionalSites.includes(host)) {
      toast(t('errors.siteAlreadyAdded'), 'error')
      return
    }

    setAdditionalSites([...additionalSites, host])
    setNewSiteInput('')
  }

  // Remove additional site
  const handleRemoveAdditionalSite = (host: string) => {
    playSound(SoundType.BAMBOO_STRIKE)
    setAdditionalSites(additionalSites.filter(s => s !== host))
  }

  // Toggle main site selection
  const handleToggleMainSite = (host: string) => {
    playSound(SoundType.KOTO_PLUCK)
    const newSet = new Set(selectedMainSites)
    if (newSet.has(host)) {
      newSet.delete(host)
    } else {
      newSet.add(host)
    }
    setSelectedMainSites(newSet)
  }

  // Start session with selected sites
  const handleStartSession = async () => {
    try {
      playSound(SoundType.TEMPLE_BELL)
      const sitesToBlock = [...Array.from(selectedMainSites), ...additionalSites]
      await messagingClient.startFocusSession(duration, sitesToBlock, mode)
      onStart()
    } catch (err) {
      console.error('[PomodoroModal] Error starting session:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full gap-4 relative z-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-modal-title"
    >
      <div className="flex justify-between items-center">
        <h2 id="pomodoro-modal-title" className="font-serif font-medium text-xl text-sumi-black">
          {t('focusSession.selectSites')}
        </h2>
        <button
          aria-label={t('common.close') || 'Close'}
          className="text-sumi-gray hover:text-sumi-black p-2 transition-transform hover:rotate-90 rounded-full hover:bg-black/5"
          onClick={() => {
            playSound(SoundType.SOFT_GONG)
            onClose()
          }}
        >
          <ZenCloseIcon size={20} />
        </button>
      </div>

      <p className="text-sumi-gray text-xs font-serif italic opacity-80">
        {t('focusSession.selectSitesHint')}
      </p>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-sumi-gray animate-pulse font-serif">{t('common.loading')}...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* Mode Toggle */}
          <div className="washi-card p-3 border border-border flex items-center justify-between shadow-sm">
            <span className="font-serif text-sm font-medium text-sumi-black">{t('focusSession.mode')}</span>
            <div className="flex bg-black/5 p-1 rounded-lg">
              <button
                onClick={() => setMode('blocklist')}
                className={`px-3 py-1 text-xs rounded-md transition-all font-serif ${mode === 'blocklist'
                  ? 'bg-white text-accent shadow-sm font-bold'
                  : 'text-sumi-gray hover:text-sumi-black'
                  }`}
              >
                {t('focusSession.modeBlock')}
              </button>
              <button
                onClick={() => setMode('whitelist')}
                className={`px-3 py-1 text-xs rounded-md transition-all font-serif ${mode === 'whitelist'
                  ? 'bg-white text-accent shadow-sm font-bold'
                  : 'text-sumi-gray hover:text-sumi-black'
                  }`}
              >
                {t('focusSession.modeAllow')}
              </button>
            </div>
          </div>

          {/* Duration Input */}
          <div className="washi-card p-4 border border-border flex items-center gap-4 shadow-sm">
            <label className="font-medium text-sm flex-1 text-sumi-black font-serif">
              {t('focusSession.durationMin')}
            </label>
            <input
              type="number"
              className="w-20 text-center font-mono p-2 rounded border border-border bg-white focus:border-accent outline-none text-lg text-accent font-bold"
              value={duration}
              onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 25))}
              min="1"
              max="180"
            />
          </div>

          {/* Main sites list */}
          <fieldset className="flex flex-col gap-2 border-0 p-0 m-0">
            <legend className="font-semibold text-[10px] text-sumi-gray uppercase tracking-widest pl-1">
              {mode === 'whitelist' ? t('focusSession.allowedSites') : t('focusSession.mainSites')}
            </legend>
            <div className="washi-card border border-border p-2 max-h-48 overflow-y-auto">
              {sites.length === 0 ? (
                <div className="text-sumi-gray text-center p-4 text-xs italic">
                  {mode === 'whitelist'
                    ? t('focusSession.allowHint')
                    : t('focusSession.noSites')}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {sites.map(site => (
                    <label
                      key={site.host}
                      className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-black/5 transition-colors group"
                    >
                      <input
                        type="checkbox"
                        className="accent-accent w-4 h-4 cursor-pointer"
                        checked={selectedMainSites.has(site.host)}
                        onChange={() => handleToggleMainSite(site.host)}
                      />
                      <span className="font-mono flex-1 text-xs text-sumi-black group-hover:text-accent transition-colors">
                        {site.host}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          {/* Additional sites */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-[10px] text-sumi-gray uppercase tracking-widest pl-1">
              {mode === 'whitelist' ? t('focusSession.moreAllowedSites') : t('focusSession.additionalSites')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 text-xs p-2.5 rounded border border-border bg-white focus:border-accent outline-none font-mono"
                value={newSiteInput}
                onChange={e => setNewSiteInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddAdditionalSite()}
                placeholder={t('focusSession.allowedPlaceholder')}
              />
              <button className="btn secondary text-xs px-4" onClick={handleAddAdditionalSite}>
                {t('common.add')}
              </button>
            </div>

            {additionalSites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {additionalSites.map(host => (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={host}
                    className="flex items-center gap-2 px-3 py-1 bg-kinari-cream rounded-full text-xs border border-border text-sumi-black shadow-sm"
                  >
                    <span className="font-mono">{host}</span>
                    <button
                      onClick={() => handleRemoveAdditionalSite(host)}
                      className="text-sumi-gray hover:text-danger w-4 h-4 flex items-center justify-center rounded-full hover:bg-danger/10"
                    >
                      <ZenCloseIcon size={12} strokeWidth={2} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-border">
        <button
          className="btn secondary w-1/3"
          onClick={() => {
            playSound(SoundType.SOFT_GONG)
            onClose()
          }}
        >
          {t('common.cancel')}
        </button>
        <button className="btn primary flex-1 shadow-lantern" onClick={handleStartSession}>
          {t('focusSession.startSession')}
        </button>
      </div>
    </motion.div>
  )
}

export default App
