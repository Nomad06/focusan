/**
 * Fūinjutsu (封印) Popup
 * Makimono-scroll alt UI for the Focusan popup. Same data flow as App.tsx,
 * different shape: bamboo-rod + parchment panel, vertical brushwork,
 * cinnabar seal buttons, inked entry rows.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { normalizeHost } from '../shared/utils/domain'
import { t, initI18n } from '../shared/i18n'
import { SessionState, type FocusSession } from '../shared/domain/focus-sessions'
import { playSound, SoundType } from '../shared/sound'
import { ChallengeModal } from '../shared/components/ChallengeModal'
import { useToast } from '../shared/components/Toast'
import { useEscapeKey } from '../shared/hooks/useEscapeKey'

/* ───────── Helpers ───────── */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ───────── Reusable scroll shell ───────── */
const ScrollShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="makimono-surround" style={{ width: 340, minHeight: 520, padding: '14px 8px' }}>
    {/* Top bamboo rod with tassels */}
    <div style={{ position: 'relative' }}>
      <div className="bamboo-rod" />
      <div className="tassel" style={{ top: 26, left: '14%', height: 28 }} />
      <div className="tassel" style={{ top: 26, right: '14%', height: 22 }} />
    </div>

    {/* Parchment scroll body */}
    <div className="makimono-scroll" style={{ padding: '22px 22px 24px' }}>
      {children}
    </div>

    {/* Bottom bamboo rod with tassels */}
    <div style={{ position: 'relative' }}>
      <div className="bamboo-rod" />
      <div className="tassel" style={{ bottom: -22, left: '14%', height: 22 }} />
      <div className="tassel" style={{ bottom: -28, right: '14%', height: 28 }} />
    </div>
  </div>
)

/* ───────── Inked checkbox — used in site list ───────── */
const InkCheckbox: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer" style={{ padding: '6px 2px' }}>
    <span
      onClick={(e) => { e.preventDefault(); onChange() }}
      style={{
        width: 16,
        height: 16,
        borderRadius: 2,
        border: '1.5px solid #1A1410',
        background: checked ? '#C8252C' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#E8DCB8',
        fontFamily: 'Shippori Mincho, serif',
        fontWeight: 900,
        fontSize: 10,
        boxShadow: checked ? 'inset 0 0 0 1px rgba(232,220,184,0.4), 0 1px 2px rgba(139,20,24,0.4)' : 'none',
        transition: '0.12s',
      }}
    >
      {checked ? '封' : ''}
    </span>
    <span className="brush-text" style={{ fontSize: 12, color: '#1A1410', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </label>
)

/* ───────── Main App ───────── */
const FuinjutsuApp: React.FC = () => {
  const toast = useToast()
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [showPomodoroModal, setShowPomodoroModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [currentHost, setCurrentHost] = useState<string>('')
  const [currentHostBlocked, setCurrentHostBlocked] = useState<boolean>(false)
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false)
  const [challengeMode, setChallengeMode] = useState<boolean>(false)

  /* Detect host */
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const tab = tabs[0]
      if (tab?.url) {
        const host = normalizeHost(tab.url)
        if (host) setCurrentHost(host)
      }
    })
  }, [])

  /* Load focus session */
  const loadFocusSession = async () => {
    try {
      const session = await messagingClient.getCurrentSession()
      if (session) {
        setCurrentSession(session)
        if (session.state === SessionState.WORKING || session.state === SessionState.BREAK) {
          const remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000))
          setRemainingTime(remaining)
        } else {
          setRemainingTime(0)
        }
      } else {
        setCurrentSession(null)
        setRemainingTime(0)
      }
    } catch (err) {
      console.error('[Fūinjutsu Popup] loadFocusSession:', err)
      setCurrentSession(null)
      setRemainingTime(0)
    }
  }

  /* Initial load */
  useEffect(() => {
    const init = async () => {
      await initI18n()
      await loadFocusSession()
      try {
        const sites = await messagingClient.getSites()
        if (currentHost) setCurrentHostBlocked(sites.some(s => s.host === currentHost))
      } catch { /* ignore */ }
      try {
        const challenge = await messagingClient.getChallengeMode()
        setChallengeMode(challenge.enabled)
      } catch { /* ignore */ }
      setLoading(false)
    }
    init()
  }, [])

  /* Resync block status when host arrives late */
  useEffect(() => {
    if (!currentHost) return
    messagingClient.getSites()
      .then(sites => setCurrentHostBlocked(sites.some(s => s.host === currentHost)))
      .catch(() => {})
  }, [currentHost])

  /* Session timer */
  useEffect(() => {
    if (!currentSession || currentSession.state === SessionState.IDLE || currentSession.state === SessionState.PAUSED) return
    const interval = setInterval(loadFocusSession, 1000)
    return () => clearInterval(interval)
  }, [currentSession?.state, currentSession?.endTime])

  const isSessionActive = currentSession && currentSession.state !== SessionState.IDLE

  /* Actions */
  const handleAddCurrentSite = async () => {
    try {
      playSound(SoundType.BAMBOO_STRIKE)
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (!tab?.url) return
      const host = normalizeHost(tab.url)
      if (!host) return
      const ok = await messagingClient.addSite(host)
      if (ok) {
        setCurrentHostBlocked(true)
        toast(`${host} ${t('common.added')}`, 'success')
      }
    } catch (err) {
      console.error('[Fūinjutsu Popup] addCurrentSite:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  const handleOpenOptions = () => {
    playSound(SoundType.KOTO_PLUCK)
    chrome.runtime.openOptionsPage()
  }

  const handleStartFocusSession = () => {
    playSound(SoundType.TEMPLE_BELL)
    setShowPomodoroModal(true)
  }

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
      console.error('[Fūinjutsu Popup] pause/resume:', err)
    }
  }

  const performStopSession = async () => {
    try {
      await messagingClient.stopFocusSession()
      await loadFocusSession()
    } catch (err) {
      console.error('[Fūinjutsu Popup] stop:', err)
    }
  }

  const handleStopFocusSession = async () => {
    playSound(SoundType.SOFT_GONG)
    if (challengeMode) setShowChallengeModal(true)
    else performStopSession()
  }

  /* ─── Loading splash ─── */
  if (loading) {
    return (
      <ScrollShell>
        <div className="flex items-center justify-center" style={{ minHeight: 360 }}>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="ink-heading"
            style={{ fontSize: 36, letterSpacing: '0.15em' }}
          >
            封
          </motion.div>
        </div>
      </ScrollShell>
    )
  }

  /* ─── Pomodoro modal ─── */
  if (showPomodoroModal) {
    return (
      <ScrollShell>
        <FuinjutsuPomodoroModal
          onClose={() => setShowPomodoroModal(false)}
          onStart={async () => { await loadFocusSession(); setShowPomodoroModal(false) }}
        />
      </ScrollShell>
    )
  }

  /* ─── Challenge modal (kept stock — gated by challengeMode) ─── */
  if (showChallengeModal) {
    return (
      <ScrollShell>
        <ChallengeModal
          isOpen={true}
          onClose={() => setShowChallengeModal(false)}
          onSuccess={() => { setShowChallengeModal(false); performStopSession() }}
          action="stop-session"
        />
      </ScrollShell>
    )
  }

  /* ─── Main view ─── */
  return (
    <ScrollShell>
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
        <div className="flex items-center gap-2">
          <span className="seal-stamp-cinnabar" style={{ fontSize: 14 }}>封</span>
          <div style={{ lineHeight: 1.1 }}>
            <div className="ink-heading" style={{ fontSize: 15, letterSpacing: '0.04em' }}>Focusan</div>
            <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 2 }}>
              封印術 · Fūinjutsu
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ rotate: 30 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleOpenOptions}
          aria-label={t('common.settings') || 'Settings'}
          className="brush-text"
          style={{
            width: 32, height: 32,
            border: '1.5px solid #1A1410',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 18,
            color: '#1A1410',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 0,
          }}
          title={t('common.settings') || 'Settings'}
        >
          設
        </motion.button>
      </div>

      <div className="cord-divider" style={{ margin: '0 0 18px' }} />

      {/* Hero block — vertical brush kanji + timer */}
      <div className="flex flex-col items-center" style={{ marginBottom: 20 }}>
        {/* Big brushed kanji — state-dependent */}
        <motion.div
          key={isSessionActive ? 'active' : 'idle'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'relative',
            width: 130, height: 130,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          {/* Faded paper kanji behind — anchors the brushwork */}
          <div
            className="ink-heading"
            style={{
              position: 'absolute',
              fontSize: 130,
              lineHeight: 1,
              color: 'rgba(200, 37, 44, 0.10)',
              fontFamily: 'Shippori Mincho, serif',
              fontWeight: 900,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            集
          </div>

          {/* Foreground brushed kanji — sumi ink */}
          <div
            className="brush-text"
            style={{
              fontSize: 84,
              fontFamily: 'Shippori Mincho, serif',
              fontWeight: 900,
              color: '#1A1410',
              textShadow: '0 1px 0 rgba(232, 220, 184, 0.5)',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            {isSessionActive
              ? (currentSession?.state === SessionState.PAUSED ? '休' : '集')
              : '結'}
          </div>

          {/* Sealing-circle progress arc, only during active session */}
          {isSessionActive && currentSession && (
            <svg width="130" height="130" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(26,20,16,0.15)" strokeWidth="2" strokeDasharray="3 5" />
              <motion.circle
                cx="65" cy="65" r="58" fill="none"
                stroke="#C8252C"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 58}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 58 * (1 - remainingTime / (currentSession.duration * 60)),
                }}
                transition={{ duration: 1, ease: 'linear' }}
                style={{ filter: 'drop-shadow(0 0 4px rgba(200,37,44,0.5))' }}
              />
            </svg>
          )}
        </motion.div>

        {/* State label */}
        <div className="sumi-faded" style={{ fontSize: 9, letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: 6 }}>
          {isSessionActive
            ? (currentSession?.state === SessionState.PAUSED ? t('focusSession.paused') : t('focusSession.active'))
            : t('focusSession.ready')}
        </div>

        {/* Timer digits */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 38,
            fontWeight: 300,
            color: '#1A1410',
            letterSpacing: '0.02em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {isSessionActive ? formatTime(remainingTime) : '25:00'}
        </div>
      </div>

      {/* Action row */}
      <div style={{ marginBottom: 16 }}>
        {isSessionActive ? (
          <div className="flex gap-2">
            <button onClick={handlePauseFocusSession} className="scroll-btn" style={{ flex: 1, padding: '10px 8px', fontSize: 12 }}>
              {currentSession?.state === SessionState.PAUSED
                ? `▶ ${t('focusSession.resume')}`
                : `❘❘ ${t('focusSession.pause')}`}
            </button>
            <button onClick={handleStopFocusSession} className="scroll-btn cinnabar" style={{ padding: '10px 16px', fontSize: 12 }}>
              {t('focusSession.stop')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartFocusSession}
            className="scroll-btn cinnabar"
            style={{ width: '100%', padding: '14px 16px', fontSize: 13, letterSpacing: '0.15em' }}
          >
            結印 · {t('focusSession.engage')}
          </button>
        )}
      </div>

      {/* Current tab — inked entry row */}
      {!isSessionActive && currentHost && (
        <>
          <div className="cord-divider" style={{ margin: '6px 0 12px' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              border: '1px dashed rgba(26, 20, 16, 0.35)',
              background: 'rgba(232, 220, 184, 0.4)',
              position: 'relative',
            }}
          >
            {currentHostBlocked ? (
              <span className="seal-stamp-cinnabar" style={{ fontSize: 11 }}>封</span>
            ) : (
              <span className="brush-text" style={{ fontSize: 18, color: '#1A1410' }}>門</span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 2 }}>
                {currentHostBlocked ? (t('bushido.gateSealed') || 'Sealed') : (t('bushido.currentTab') || 'Current')}
              </div>
              <div
                className="brush-text"
                style={{
                  fontSize: 12,
                  color: currentHostBlocked ? '#8B1418' : '#1A1410',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentHost}
              </div>
            </div>
            {!currentHostBlocked && (
              <button onClick={handleAddCurrentSite} className="scroll-btn cinnabar" style={{ padding: '6px 12px', fontSize: 11 }}>
                {t('bushido.seal') || 'Seal'}
              </button>
            )}
          </div>
        </>
      )}
    </ScrollShell>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  Fūinjutsu Pomodoro Modal — site-list + duration + mode picker     */
/* ────────────────────────────────────────────────────────────────── */
interface PomodoroProps {
  onClose: () => void
  onStart: () => void
}

const FuinjutsuPomodoroModal: React.FC<PomodoroProps> = ({ onClose, onStart }) => {
  const toast = useToast()
  const [sites, setSites] = useState<Array<{ host: string; addedAt: number }>>([])
  const [selectedMainSites, setSelectedMainSites] = useState<Set<string>>(new Set())
  const [additionalSites, setAdditionalSites] = useState<string[]>([])
  const [newSiteInput, setNewSiteInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [duration, setDuration] = useState<number>(25)
  const [mode, setMode] = useState<'blocklist' | 'whitelist'>('blocklist')

  useEscapeKey(true, onClose)

  useEffect(() => {
    messagingClient.getSites()
      .then(setSites)
      .catch(err => console.error('[Fūinjutsu Modal] load sites:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleAddAdditionalSite = () => {
    playSound(SoundType.KOTO_PLUCK)
    const host = normalizeHost(newSiteInput)
    if (!host) { toast(t('errors.invalidDomain'), 'error'); return }
    if (additionalSites.includes(host)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
    setAdditionalSites([...additionalSites, host])
    setNewSiteInput('')
  }

  const handleRemoveAdditionalSite = (host: string) => {
    playSound(SoundType.BAMBOO_STRIKE)
    setAdditionalSites(additionalSites.filter(s => s !== host))
  }

  const handleToggleMainSite = (host: string) => {
    playSound(SoundType.KOTO_PLUCK)
    const next = new Set(selectedMainSites)
    if (next.has(host)) next.delete(host); else next.add(host)
    setSelectedMainSites(next)
  }

  const handleStartSession = async () => {
    try {
      playSound(SoundType.TEMPLE_BELL)
      const sitesToBlock = [...Array.from(selectedMainSites), ...additionalSites]
      await messagingClient.startFocusSession(duration, sitesToBlock, mode)
      onStart()
    } catch (err) {
      console.error('[Fūinjutsu Modal] start:', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', minHeight: 460 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-2">
          <span className="seal-stamp-cinnabar" style={{ fontSize: 12 }}>結</span>
          <div className="ink-heading" style={{ fontSize: 14 }}>
            {t('focusSession.selectSites') || 'Form the Seal'}
          </div>
        </div>
        <button
          onClick={() => { playSound(SoundType.SOFT_GONG); onClose() }}
          aria-label={t('common.close') || 'Close'}
          className="brush-text"
          style={{
            width: 26, height: 26,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 16,
            color: '#6B5232',
          }}
        >
          ✕
        </button>
      </div>

      <div className="cord-divider" style={{ margin: '0 0 14px' }} />

      {loading ? (
        <div className="flex items-center justify-center" style={{ flex: 1, minHeight: 280 }}>
          <div className="brush-text sumi-faded">{t('common.loading') || 'Loading'}…</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto', paddingRight: 2 }}>

          {/* Mode toggle — block vs allow */}
          <div>
            <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('focusSession.mode') || 'Mode'}
            </div>
            <div style={{ display: 'flex', border: '1.5px solid #1A1410', borderRadius: 0 }}>
              <button
                onClick={() => setMode('blocklist')}
                className="brush-text"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: mode === 'blocklist' ? '#1A1410' : 'transparent',
                  color: mode === 'blocklist' ? '#E8DCB8' : '#1A1410',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                封 · {t('focusSession.modeBlock') || 'Seal'}
              </button>
              <button
                onClick={() => setMode('whitelist')}
                className="brush-text"
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  background: mode === 'whitelist' ? '#1A1410' : 'transparent',
                  color: mode === 'whitelist' ? '#E8DCB8' : '#1A1410',
                  border: 'none',
                  borderLeft: '1.5px solid #1A1410',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}
              >
                許 · {t('focusSession.modeAllow') || 'Allow'}
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 6 }}>
              {t('focusSession.durationMin') || 'Duration (min)'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, borderBottom: '1.5px solid #1A1410', paddingBottom: 4 }}>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 25))}
                min={1}
                max={180}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 24,
                  fontWeight: 300,
                  color: '#1A1410',
                  padding: 0,
                }}
              />
              <span className="brush-text" style={{ fontSize: 16, color: '#6B5232' }}>分</span>
            </div>
          </div>

          {/* Main sites — inked entries with seal checkbox */}
          <div>
            <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 6 }}>
              {mode === 'whitelist'
                ? (t('focusSession.allowedSites') || 'Allowed')
                : (t('focusSession.mainSites') || 'Targets')}
            </div>
            <div
              style={{
                border: '1px dashed rgba(26, 20, 16, 0.35)',
                background: 'rgba(232, 220, 184, 0.35)',
                padding: '6px 10px',
                maxHeight: 140,
                overflowY: 'auto',
              }}
            >
              {sites.length === 0 ? (
                <div className="brush-text sumi-faded" style={{ fontSize: 11, textAlign: 'center', padding: '14px 0', fontStyle: 'italic' }}>
                  {mode === 'whitelist' ? (t('focusSession.allowHint') || 'Pick what stays open') : (t('focusSession.noSites') || 'No bound seals yet')}
                </div>
              ) : (
                sites.map(site => (
                  <InkCheckbox
                    key={site.host}
                    checked={selectedMainSites.has(site.host)}
                    onChange={() => handleToggleMainSite(site.host)}
                    label={site.host}
                  />
                ))
              )}
            </div>
          </div>

          {/* Additional sites — brush input */}
          <div>
            <div className="sumi-faded" style={{ fontSize: 8, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 6 }}>
              {mode === 'whitelist'
                ? (t('focusSession.moreAllowedSites') || 'More allowed')
                : (t('focusSession.additionalSites') || 'Additional seals')}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                value={newSiteInput}
                onChange={e => setNewSiteInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddAdditionalSite() }}
                placeholder={t('focusSession.allowedPlaceholder') || 'example.com'}
                className="brush-text"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1.5px solid #1A1410',
                  outline: 'none',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  color: '#1A1410',
                  padding: '6px 2px',
                }}
              />
              <button
                onClick={handleAddAdditionalSite}
                className="scroll-btn"
                style={{ padding: '6px 14px', fontSize: 11 }}
              >
                {t('common.add') || 'Bind'}
              </button>
            </div>

            {additionalSites.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {additionalSites.map(host => (
                  <motion.span
                    key={host}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 8px 3px 10px',
                      background: '#1A1410',
                      color: '#E8DCB8',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      borderRadius: 0,
                    }}
                  >
                    {host}
                    <button
                      onClick={() => handleRemoveAdditionalSite(host)}
                      aria-label="Remove"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#D4A057',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="cord-divider" style={{ margin: '14px 0 12px' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { playSound(SoundType.SOFT_GONG); onClose() }}
          className="scroll-btn"
          style={{ width: '38%', padding: '10px 8px', fontSize: 11 }}
        >
          {t('common.cancel') || 'Cancel'}
        </button>
        <button
          onClick={handleStartSession}
          className="scroll-btn cinnabar"
          style={{ flex: 1, padding: '10px 8px', fontSize: 12, letterSpacing: '0.12em' }}
        >
          結 · {t('focusSession.startSession') || 'Begin'}
        </button>
      </div>
    </motion.div>
  )
}

export default FuinjutsuApp
