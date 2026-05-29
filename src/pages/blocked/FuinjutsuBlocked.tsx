/**
 * Fūinjutsu (封印) Blocked Page
 * Distinct from BushidōBlockedPage: this is a sealing scroll, not a torii gate.
 * Slammed cinnabar seal kanji, vertical brush message, sumi-inked target.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { t, initI18n } from '../../shared/i18n'
import { messagingClient } from '../../shared/messaging/client'

const FuinjutsuBlocked: React.FC = () => {
  const [hostname, setHostname] = useState<string>('')

  useEffect(() => {
    initI18n()
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url') || window.location.href
    let host = ''
    try { host = new URL(url).hostname.replace(/^www\./, '') } catch { host = url }
    setHostname(host)
    if (host) {
      messagingClient.recordBlock(host).catch(err => {
        console.error('[Blocked/Fūinjutsu] Failed to record block:', err)
      })
    }
  }, [])

  const handleCloseTab = () => window.close()
  const handleGoBack = () => window.history.back()

  return (
    <div className="makimono-surround min-h-screen flex items-center justify-center" style={{ padding: '6vh 4vw' }}>
      {/* Distant burnt-paper haze behind scroll */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(200, 37, 44, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* ─── The scroll ─── */}
      <div className="relative w-full" style={{ maxWidth: 720 }}>
        {/* Top bamboo rod with tassels */}
        <div className="bamboo-rod" />
        <motion.div
          className="tassel"
          style={{ top: 26, left: '14%', height: 36 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
        <motion.div
          className="tassel"
          style={{ top: 26, right: '14%', height: 30 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        />

        {/* Parchment body */}
        <div className="makimono-scroll" style={{ padding: '72px 56px 72px 56px', minHeight: 560 }}>
          {/* Header brand */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="seal-stamp-cinnabar" style={{ fontSize: 18 }}>封</div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] sumi-faded">
                  封印術 · Fūinjutsu
                </div>
                <div className="ink-heading text-base">Sealing Scroll</div>
              </div>
            </div>
            {hostname && (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.4em] sumi-faded">Target</div>
                <div className="brush-text text-sm" style={{ position: 'relative' }}>
                  <span style={{ textDecoration: 'line-through wavy', textDecorationColor: '#C8252C' }}>
                    {hostname}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Main composition — vertical kanji left, slammed seal right */}
          <div className="grid" style={{ gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 24, minHeight: 280 }}>
            {/* Left: vertical message in brushwork */}
            <motion.div
              className="flex justify-end pr-2"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="vert-kanji" style={{ fontSize: 32, lineHeight: 1.4 }}>
                此<br/>道<br/>封<br/>印
              </div>
            </motion.div>

            {/* Center: massive slammed seal */}
            <div className="flex flex-col items-center justify-center" style={{ minWidth: 220 }}>
              <motion.div
                className="seal-stamp-cinnabar seal-slam"
                style={{
                  fontSize: 140,
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                  lineHeight: 1,
                }}
              >
                封
              </motion.div>
              <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <div className="text-[10px] uppercase tracking-[0.5em] sumi-faded mb-1">Verdict</div>
                <div className="ink-heading text-xl">SEALED</div>
              </motion.div>
            </div>

            {/* Right: secondary vertical kanji */}
            <motion.div
              className="flex justify-start pl-2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="vert-kanji" style={{ fontSize: 26, color: 'var(--c-sumi-faded)', lineHeight: 1.4 }}>
                心<br/>を<br/>研<br/>ぐ
              </div>
            </motion.div>
          </div>

          {/* Cord-knot divider */}
          <div className="cord-divider mt-12 mb-8">
            <div className="brush-text text-xs uppercase tracking-[0.4em]">三 息 · Three Breaths</div>
          </div>

          {/* Breathing dots */}
          <div className="flex items-center justify-center gap-5 mb-12">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
                className="block w-2.5 h-2.5 rounded-full"
                style={{ background: 'var(--c-cinnabar)' }}
              />
            ))}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button onClick={handleCloseTab} className="scroll-btn cinnabar" style={{ minWidth: 220 }}>
              {t('bushido.bowOut') || 'CLOSE THIS PATH'}
            </button>
            <button onClick={handleGoBack} className="scroll-btn" style={{ minWidth: 220 }}>
              {t('bushido.returnToWork') || 'RETURN TO TRAINING'}
            </button>
          </motion.div>
        </div>

        {/* Bottom bamboo rod with tassels */}
        <div className="bamboo-rod" />
        <motion.div
          className="tassel"
          style={{ bottom: -36, left: '14%', height: 36 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        />
        <motion.div
          className="tassel"
          style={{ bottom: -30, right: '14%', height: 30 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        />
      </div>
    </div>
  )
}

export default FuinjutsuBlocked
