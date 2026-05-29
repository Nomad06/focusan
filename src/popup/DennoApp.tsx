/**
 * Dennō (電脳) Popup — Netrunner HUD
 * Same data flow as App.tsx + FuinjutsuApp.tsx, terminal-HUD shape.
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

/* helpers */
const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
const hashHex = (s: string, len = 6) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, len)
}
const clock = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

/* Block-char progress bar */
const ProgressBar: React.FC<{ pct: number; width?: number }> = ({ pct, width = 20 }) => {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)))
  const empty = width - filled
  return (
    <span className="hud-progress">
      <span style={{ color: '#E8B847' }}>{'█'.repeat(filled)}</span>
      <span style={{ color: '#4A3818' }}>{'░'.repeat(empty)}</span>
      <span style={{ color: '#FFD577', marginLeft: 6, fontSize: 11 }}>{String(Math.floor(pct)).padStart(3, ' ')}%</span>
    </span>
  )
}

const DennoApp: React.FC = () => {
  const toast = useToast()
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [showPomodoroModal, setShowPomodoroModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [currentHost, setCurrentHost] = useState<string>('')
  const [currentHostBlocked, setCurrentHostBlocked] = useState<boolean>(false)
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false)
  const [challengeMode, setChallengeMode] = useState<boolean>(false)
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      const tab = tabs[0]
      if (tab?.url) {
        const host = normalizeHost(tab.url)
        if (host) setCurrentHost(host)
      }
    })
  }, [])

  const loadFocusSession = async () => {
    try {
      const session = await messagingClient.getCurrentSession()
      if (session) {
        setCurrentSession(session)
        if (session.state === SessionState.WORKING || session.state === SessionState.BREAK) {
          setRemainingTime(Math.max(0, Math.floor((session.endTime - Date.now()) / 1000)))
        } else { setRemainingTime(0) }
      } else { setCurrentSession(null); setRemainingTime(0) }
    } catch (err) {
      console.error('[Dennō Popup] loadFocusSession:', err)
      setCurrentSession(null); setRemainingTime(0)
    }
  }

  useEffect(() => {
    const init = async () => {
      await initI18n()
      await loadFocusSession()
      try {
        const sites = await messagingClient.getSites()
        if (currentHost) setCurrentHostBlocked(sites.some(s => s.host === currentHost))
      } catch {}
      try {
        const c = await messagingClient.getChallengeMode()
        setChallengeMode(c.enabled)
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!currentHost) return
    messagingClient.getSites()
      .then(sites => setCurrentHostBlocked(sites.some(s => s.host === currentHost)))
      .catch(() => {})
  }, [currentHost])

  useEffect(() => {
    if (!currentSession || currentSession.state === SessionState.IDLE || currentSession.state === SessionState.PAUSED) return
    const id = setInterval(loadFocusSession, 1000)
    return () => clearInterval(id)
  }, [currentSession?.state, currentSession?.endTime])

  const isSessionActive = currentSession && currentSession.state !== SessionState.IDLE
  const totalSec = currentSession ? currentSession.duration * 60 : 0
  const pct = isSessionActive && totalSec > 0
    ? Math.min(100, ((totalSec - remainingTime) / totalSec) * 100)
    : 0

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
      console.error('[Dennō Popup] addCurrent:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }
  const handleOpenOptions = () => { playSound(SoundType.KOTO_PLUCK); chrome.runtime.openOptionsPage() }
  const handleStart = () => { playSound(SoundType.TEMPLE_BELL); setShowPomodoroModal(true) }
  const handlePause = async () => {
    try {
      playSound(SoundType.SOFT_GONG)
      if (currentSession?.state === SessionState.PAUSED) await messagingClient.resumeFocusSession()
      else await messagingClient.pauseFocusSession()
      await loadFocusSession()
    } catch (err) { console.error('[Dennō Popup] pause:', err) }
  }
  const performStop = async () => {
    try { await messagingClient.stopFocusSession(); await loadFocusSession() }
    catch (err) { console.error('[Dennō Popup] stop:', err) }
  }
  const handleStop = async () => {
    playSound(SoundType.SOFT_GONG)
    if (challengeMode) setShowChallengeModal(true); else performStop()
  }

  /* loading */
  if (loading) {
    return (
      <div style={{ width: 360, minHeight: 520, background: '#050608', color: '#E8B847', fontFamily: "'JetBrains Mono', monospace", padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} className="hud-display" style={{ fontSize: 14, letterSpacing: '0.3em', color: '#FFD577' }}>
          LOADING<span className="cursor-blink"></span>
        </motion.div>
      </div>
    )
  }

  /* pomodoro modal */
  if (showPomodoroModal) {
    return (
      <DennoShell now={now}>
        <DennoPomodoroModal
          onClose={() => setShowPomodoroModal(false)}
          onStart={async () => { await loadFocusSession(); setShowPomodoroModal(false) }}
        />
      </DennoShell>
    )
  }

  if (showChallengeModal) {
    return (
      <DennoShell now={now}>
        <ChallengeModal
          isOpen={true}
          onClose={() => setShowChallengeModal(false)}
          onSuccess={() => { setShowChallengeModal(false); performStop() }}
          action="stop-session"
        />
      </DennoShell>
    )
  }

  const hostHex = currentHost ? hashHex(currentHost, 6) : '------'

  return (
    <DennoShell now={now} onSettings={handleOpenOptions}>
      {/* Section: focus reactor */}
      <div className="hud-panel hud-panel-hi" style={{ marginBottom: 14 }}>
        <div className="hud-panel-head">
          <span>FOCUS_REACTOR.run</span>
          {isSessionActive ? (
            currentSession?.state === SessionState.PAUSED
              ? <span className="hud-status standby">STANDBY</span>
              : <span className="hud-status armed">ACTIVE</span>
          ) : (
            <span className="hud-status online">READY</span>
          )}
        </div>

        {/* huge mono timer */}
        <div style={{ textAlign: 'center', marginBottom: 14, position: 'relative' }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 64,
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: '#FFD577',
            lineHeight: 1,
            textShadow: '0 0 16px rgba(255, 213, 119, 0.5), 0 0 32px rgba(232, 184, 71, 0.25)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {isSessionActive ? formatTime(remainingTime) : '25:00'}
          </div>
          <div className="hud-label" style={{ marginTop: 6 }}>
            {isSessionActive ? `${currentSession?.duration}m // session` : 'session // default 25m'}
          </div>
        </div>

        {/* block-char progress bar */}
        <div style={{ marginBottom: 14, textAlign: 'center' }}>
          <ProgressBar pct={isSessionActive ? pct : 0} width={20} />
        </div>

        {/* Actions */}
        {isSessionActive ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePause} className="hud-btn indigo" style={{ flex: 1, padding: '10px 12px', fontSize: 11 }}>
              {currentSession?.state === SessionState.PAUSED ? `RESUME` : `PAUSE`}
            </button>
            <button onClick={handleStop} className="hud-btn signal" style={{ flex: 1, padding: '10px 12px', fontSize: 11 }}>
              ABORT
            </button>
          </div>
        ) : (
          <button onClick={handleStart} className="hud-btn primary" style={{ width: '100%', padding: '13px 16px', fontSize: 13 }}>
            ENGAGE
          </button>
        )}
      </div>

      {/* Section: current node */}
      {currentHost && !isSessionActive && (
        <div className="hud-panel">
          <div className="hud-panel-head">
            <span>NODE_SCAN</span>
            {currentHostBlocked
              ? <span className="hud-status sealed">SEALED</span>
              : <span className="hud-status online">OPEN</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="hud-label" style={{ marginBottom: 4 }}>target.host</div>
              <div className="hud-mono" style={{ fontSize: 13, color: currentHostBlocked ? '#FF3B5C' : '#FFD577', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentHost}
              </div>
              <div className="hud-hex" style={{ marginTop: 4 }}>0x{hostHex}</div>
            </div>
            {!currentHostBlocked && (
              <button onClick={handleAddCurrentSite} className="hud-btn primary" style={{ padding: '7px 12px', fontSize: 10 }}>
                BIND
              </button>
            )}
          </div>
        </div>
      )}
    </DennoShell>
  )
}

/* ───────── Shell with top/bottom HUD bars ───────── */
const DennoShell: React.FC<{ now: number; onSettings?: () => void; children: React.ReactNode }> = ({ now, onSettings, children }) => (
  <div
    style={{
      width: 360, minHeight: 520,
      background: '#050608',
      color: '#E8B847',
      fontFamily: "'JetBrains Mono', monospace",
      padding: 0,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Top bar */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 14px',
      borderBottom: '1px solid rgba(232, 184, 71, 0.2)',
      background: 'rgba(10, 13, 18, 0.6)',
      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 16, height: 16,
          background: 'rgba(232, 184, 71, 0.12)',
          border: '1px solid #E8B847',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Noto Sans JP, sans-serif',
          fontWeight: 900,
          fontSize: 10,
          color: '#FFD577',
          boxShadow: '0 0 6px rgba(232,184,71,0.4)',
        }}>封</span>
        <span className="hud-display" style={{ color: '#FFD577', fontSize: 11, letterSpacing: '0.25em' }}>FOCUSAN</span>
        <span style={{ color: '#5A6171' }}>v2.4</span>
      </div>
      <button
        onClick={onSettings}
        aria-label="Settings"
        style={{
          background: 'transparent',
          border: '1px solid rgba(232, 184, 71, 0.4)',
          color: '#E8B847',
          padding: '2px 8px',
          fontFamily: 'inherit',
          fontSize: 10,
          letterSpacing: '0.2em',
          cursor: onSettings ? 'pointer' : 'default',
          opacity: onSettings ? 1 : 0.5,
        }}
      >
        ◆ CONF
      </button>
    </div>

    {/* Content */}
    <div style={{ padding: 14, position: 'relative', minHeight: 440 }}>
      {children}
    </div>

    {/* Bottom ticker */}
    <div style={{
      borderTop: '1px solid rgba(232, 184, 71, 0.18)',
      padding: '6px 14px',
      background: 'rgba(10, 13, 18, 0.6)',
      display: 'flex', justifyContent: 'space-between',
      fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase',
      color: '#5A6171',
    }}>
      <span>&gt;&gt; netrunner.online</span>
      <span className="hud-mono" style={{ color: '#6B7EF5' }}>{clock(new Date(now))}</span>
    </div>
  </div>
)

/* ───────── Pomodoro modal ───────── */
interface PomodoroProps { onClose: () => void; onStart: () => void }

const DennoPomodoroModal: React.FC<PomodoroProps> = ({ onClose, onStart }) => {
  const toast = useToast()
  const [sites, setSites] = useState<Array<{ host: string; addedAt: number }>>([])
  const [selectedMain, setSelectedMain] = useState<Set<string>>(new Set())
  const [additional, setAdditional] = useState<string[]>([])
  const [newSite, setNewSite] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [duration, setDuration] = useState<number>(25)
  const [mode, setMode] = useState<'blocklist' | 'whitelist'>('blocklist')

  useEscapeKey(true, onClose)

  useEffect(() => {
    messagingClient.getSites()
      .then(setSites)
      .catch(err => console.error('[Dennō Modal] sites:', err))
      .finally(() => setLoading(false))
  }, [])

  const addAdditional = () => {
    playSound(SoundType.KOTO_PLUCK)
    const host = normalizeHost(newSite)
    if (!host) { toast(t('errors.invalidDomain'), 'error'); return }
    if (additional.includes(host)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
    setAdditional([...additional, host]); setNewSite('')
  }
  const removeAdditional = (h: string) => { playSound(SoundType.BAMBOO_STRIKE); setAdditional(additional.filter(s => s !== h)) }
  const toggleMain = (h: string) => {
    playSound(SoundType.KOTO_PLUCK)
    const next = new Set(selectedMain); if (next.has(h)) next.delete(h); else next.add(h)
    setSelectedMain(next)
  }
  const start = async () => {
    try {
      playSound(SoundType.TEMPLE_BELL)
      const targets = [...Array.from(selectedMain), ...additional]
      await messagingClient.startFocusSession(duration, targets, mode)
      onStart()
    } catch (err) { console.error('[Dennō Modal] start:', err) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div className="hud-panel hud-panel-hi" style={{ marginBottom: 0 }}>
        <div className="hud-panel-head">
          <span>SESSION_INIT.cfg</span>
          <button onClick={() => { playSound(SoundType.SOFT_GONG); onClose() }} className="hud-btn" style={{ padding: '2px 8px', fontSize: 9 }}>X</button>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <span className="hud-display cursor-blink" style={{ fontSize: 12, color: '#FFD577' }}>LOADING_TARGETS</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Mode */}
            <div>
              <div className="hud-label" style={{ marginBottom: 6 }}>mode</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setMode('blocklist')} className="hud-btn" style={{ flex: 1, padding: '6px 8px', fontSize: 10, background: mode === 'blocklist' ? 'rgba(232,184,71,0.16)' : 'transparent', borderColor: mode === 'blocklist' ? '#E8B847' : 'rgba(232,184,71,0.25)', color: mode === 'blocklist' ? '#FFD577' : '#8A6B2C' }}>
                  DENY
                </button>
                <button onClick={() => setMode('whitelist')} className="hud-btn" style={{ flex: 1, padding: '6px 8px', fontSize: 10, background: mode === 'whitelist' ? 'rgba(232,184,71,0.16)' : 'transparent', borderColor: mode === 'whitelist' ? '#E8B847' : 'rgba(232,184,71,0.25)', color: mode === 'whitelist' ? '#FFD577' : '#8A6B2C' }}>
                  ALLOW
                </button>
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="hud-label" style={{ marginBottom: 6 }}>duration_min</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: '1px solid rgba(232, 184, 71, 0.25)', background: 'rgba(0,0,0,0.4)' }}>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 25))}
                  min={1} max={180}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: '#FFD577',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 20, padding: 0,
                  }}
                />
                <span className="hud-label">min</span>
              </div>
            </div>

            {/* Targets list */}
            <div>
              <div className="hud-label" style={{ marginBottom: 6 }}>
                {mode === 'whitelist' ? 'allowlist // saved' : 'denylist // saved'}
              </div>
              <div style={{
                border: '1px solid rgba(232, 184, 71, 0.22)',
                maxHeight: 140, overflowY: 'auto',
                background: 'rgba(0,0,0,0.3)',
                padding: '4px 0',
              }}>
                {sites.length === 0 ? (
                  <div style={{ padding: 14, textAlign: 'center', color: '#5A6171', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    -- no targets stored --
                  </div>
                ) : sites.map(s => {
                  const selected = selectedMain.has(s.host)
                  return (
                    <label key={s.host} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer' }}>
                      <span
                        onClick={e => { e.preventDefault(); toggleMain(s.host) }}
                        style={{
                          width: 14, height: 14,
                          border: '1px solid #E8B847',
                          background: selected ? '#E8B847' : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          color: '#050608',
                          fontFamily: 'monospace',
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: selected ? '0 0 6px rgba(232,184,71,0.6)' : 'none',
                        }}
                      >
                        {selected ? '✓' : ''}
                      </span>
                      <span className="hud-mono" style={{ fontSize: 11, color: selected ? '#FFD577' : '#E8B847', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.host}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Add target */}
            <div>
              <div className="hud-label" style={{ marginBottom: 6 }}>+ add_target</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={newSite}
                  onChange={e => setNewSite(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addAdditional() }}
                  placeholder=">> hostname.tld"
                  style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}
                />
                <button onClick={addAdditional} className="hud-btn" style={{ padding: '6px 12px', fontSize: 10 }}>ADD</button>
              </div>
              {additional.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {additional.map(h => (
                    <motion.span
                      key={h}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 4px 2px 8px',
                        background: 'rgba(232, 184, 71, 0.08)',
                        border: '1px solid rgba(232, 184, 71, 0.4)',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: '#FFD577',
                      }}
                    >
                      {h}
                      <button
                        onClick={() => removeAdditional(h)}
                        style={{ background: 'transparent', border: 'none', color: '#FF3B5C', cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1, marginLeft: 4 }}
                      >×</button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* footer actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={() => { playSound(SoundType.SOFT_GONG); onClose() }} className="hud-btn" style={{ width: '35%', padding: '9px 8px', fontSize: 10 }}>
            CANCEL
          </button>
          <button onClick={start} className="hud-btn primary" style={{ flex: 1, padding: '9px 8px', fontSize: 11 }}>
            INIT_SESSION
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default DennoApp
