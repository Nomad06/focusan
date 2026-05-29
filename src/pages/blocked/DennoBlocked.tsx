/**
 * Dennō (電脳) Blocked Page
 * Netrunner HUD: targeting reticle around hostname, hex address stamps,
 * indigo perspective grid floor, scanlines, ASCII status block.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { t, initI18n } from '../../shared/i18n'
import { messagingClient } from '../../shared/messaging/client'

/* Cheap deterministic hex from a string */
const hashHex = (s: string, len = 8): string => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, len)
}

const formatClock = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

/* Animated "uptime" since mount */
const useUptime = () => {
  const [now, setNow] = useState<number>(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

const DennoBlocked: React.FC = () => {
  const [hostname, setHostname] = useState<string>('')
  const [mounted] = useState<number>(Date.now())
  const now = useUptime()

  useEffect(() => {
    initI18n()
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url') || window.location.href
    let host = ''
    try { host = new URL(url).hostname.replace(/^www\./, '') } catch { host = url }
    setHostname(host)
    if (host) {
      messagingClient.recordBlock(host).catch(err => {
        console.error('[Blocked/Dennō] recordBlock:', err)
      })
    }
  }, [])

  const handleCloseTab = () => window.close()
  const handleGoBack = () => window.history.back()

  const sessionId = hashHex(`${hostname}:${mounted}`, 8)
  const sealHash = hashHex(`seal:${hostname}`, 16)
  const elapsedSec = Math.floor((now - mounted) / 1000)
  const elapsed = `${String(Math.floor(elapsedSec / 3600)).padStart(2, '0')}:${String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0')}:${String(elapsedSec % 60).padStart(2, '0')}`
  const clock = formatClock(new Date(now))

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#050608',
        color: '#E8B847',
        fontFamily: "'JetBrains Mono', monospace",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Perspective indigo grid floor — bottom half */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: '50%',
          width: '300vw', height: '50vh',
          transform: 'translateX(-50%) perspective(380px) rotateX(56deg)',
          transformOrigin: 'center top',
          background: `
            linear-gradient(rgba(74, 91, 217, 0.32) 1px, transparent 1px) 0 0 / 60px 60px,
            linear-gradient(90deg, rgba(74, 91, 217, 0.32) 1px, transparent 1px) 0 0 / 60px 60px
          `,
          maskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 30%, black 100%)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Sun-line — indigo neon horizon glow */}
      <div
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: '50vh',
          height: 2,
          background: 'linear-gradient(90deg, transparent 5%, #6B7EF5 30%, #FFD577 50%, #6B7EF5 70%, transparent 95%)',
          boxShadow: '0 0 30px #6B7EF5, 0 0 60px rgba(107, 126, 245, 0.4)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── TOP STATUS STRIP ── */}
      <div
        style={{
          position: 'relative', zIndex: 3,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(232, 184, 71, 0.22)',
          background: 'rgba(10, 13, 18, 0.6)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span className="hud-display" style={{ fontSize: 14, color: '#FFD577', letterSpacing: '0.25em' }}>
            FOCUSAN.SYS <span style={{ color: '#5A6171' }}>v2.4</span>
          </span>
          <span className="hud-status armed">ARMED</span>
          <span style={{ color: '#5A6171' }}>│</span>
          <span style={{ color: '#8A6B2C' }}>node</span>
          <span className="hud-hex">0x{sessionId}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ color: '#5A6171' }}>uptime</span>
          <span className="hud-mono" style={{ color: '#E8B847' }}>{elapsed}</span>
          <span style={{ color: '#5A6171' }}>│</span>
          <span style={{ color: '#5A6171' }}>jst</span>
          <span className="hud-mono" style={{ color: '#6B7EF5' }}>{clock}</span>
        </div>
      </div>

      {/* ── MAIN HUD CONTENT ── */}
      <main
        style={{
          position: 'relative', zIndex: 3,
          minHeight: 'calc(100vh - 56px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}
        >
          <span style={{ width: 56, height: 1, background: '#8A6B2C' }} />
          <span className="hud-label" style={{ color: '#FF3B5C' }}>VERDICT // INTRUSION BLOCKED</span>
          <span style={{ width: 56, height: 1, background: '#8A6B2C' }} />
        </motion.div>

        {/* RETICLE around hostname */}
        <motion.div
          className="hud-reticle"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ marginBottom: 32 }}
        >
          {/* Crosshair lines */}
          <span style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 1, background: 'rgba(232, 184, 71, 0.18)', pointerEvents: 'none' }} />
          <span style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: 'rgba(232, 184, 71, 0.18)', pointerEvents: 'none' }} />
          {/* Outer tick marks (4) */}
          {[0, 90, 180, 270].map(deg => (
            <span
              key={deg}
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: 18, height: 1,
                background: '#E8B847',
                transformOrigin: '0 0',
                transform: `rotate(${deg}deg) translate(132px, 0)`,
                boxShadow: '0 0 4px rgba(232, 184, 71, 0.6)',
              }}
            />
          ))}
          {/* Kanji 封 watermark — large faded */}
          <span
            style={{
              position: 'absolute',
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: 200,
              fontWeight: 900,
              color: 'rgba(255, 59, 92, 0.06)',
              lineHeight: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            封
          </span>

          {/* Center HUD readout */}
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div className="hud-label" style={{ marginBottom: 10, color: '#8A6B2C' }}>TARGET // HOST</div>
            <div
              className="hud-mono"
              style={{
                fontSize: 22,
                color: '#FFD577',
                textShadow: '0 0 14px rgba(255, 213, 119, 0.5)',
                letterSpacing: '0.02em',
                fontWeight: 500,
                wordBreak: 'break-all',
                maxWidth: 240,
                margin: '0 auto',
              }}
            >
              {hostname || '—'}
            </div>
            <div className="hud-hex" style={{ marginTop: 12, color: '#6B7EF5' }}>
              0x{sealHash}
            </div>
          </div>
        </motion.div>

        {/* ASCII status block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="hud-panel hud-panel-hi"
          style={{ width: '100%', maxWidth: 460, marginBottom: 24 }}
        >
          <div className="hud-panel-head">
            <span>SEAL_LOG.txt</span>
            <span className="hud-status sealed">SEALED</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <div className="hud-row"><span className="label">connection</span><span className="value" style={{ color: '#FF3B5C' }}>SEVERED</span></div>
            <div className="hud-row"><span className="label">seal_type</span><span className="value">DECLARATIVE_NET</span></div>
            <div className="hud-row"><span className="label">enforcer</span><span className="value">focusan.bg</span></div>
            <div className="hud-row"><span className="label">sealed_at</span><span className="value hud-mono">{clock}</span></div>
            <div className="hud-row"><span className="label">duration</span><span className="value hud-mono">{elapsed}</span></div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: 'flex', gap: 12 }}
        >
          <button onClick={handleCloseTab} className="hud-btn primary" style={{ minWidth: 200 }}>
            {t('bushido.bowOut') || 'CLOSE NODE'}
          </button>
          <button onClick={handleGoBack} className="hud-btn indigo" style={{ minWidth: 200 }}>
            {t('bushido.returnToWork') || 'RETURN'}
          </button>
        </motion.div>

        {/* Footer ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          style={{
            position: 'absolute',
            bottom: 24, left: 24, right: 24,
            display: 'flex', justifyContent: 'space-between',
            fontSize: 10, letterSpacing: '0.3em',
            color: '#5A6171',
            textTransform: 'uppercase',
          }}
        >
          <span>&gt;&gt; focus_layer.active &nbsp;|&nbsp; mode=netrunner &nbsp;|&nbsp; rev=2.4.0</span>
          <span className="cursor-blink">awaiting_input</span>
        </motion.div>
      </main>
    </div>
  )
}

export default DennoBlocked
