import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { t, initI18n } from '../../shared/i18n'
import { useLanguage } from '../../shared/i18n/useLanguage'
import { messagingClient } from '../../shared/messaging/client'
import { BushidoCard } from './components/BushidoCard'
import { QuoteFooter } from './components/QuoteFooter'
import { ToriiIcon, MountainIcon } from '../../shared/components/Icons'
import { getRandomBushidoPhrase, getRandomBushidoQuote } from '../../shared/bushido-phrases'

const BlockedPage: React.FC = () => {
  const currentLanguage = useLanguage()
  const [phrase] = useState(() => getRandomBushidoPhrase())
  const [quote] = useState(() => getRandomBushidoQuote())
  const [hostname, setHostname] = useState<string>('')

  useEffect(() => {
    initI18n()
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url') || window.location.href
    let host = ''
    try {
      host = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      host = url
    }
    setHostname(host)
    if (host) {
      messagingClient.recordBlock(host).catch(err => {
        console.error('[Blocked] Failed to record block:', err)
      })
    }
  }, [])

  const handleCloseTab = () => window.close()
  const handleGoBack = () => window.history.back()

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: 'var(--bg1)' }}>
      {/* Asanoha pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'var(--asanoha)' }}
      />

      {/* Crimson radial glow from top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184,46,46,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Torii silhouette — massive, faded, behind everything */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 0.06, y: 0 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <ToriiIcon size={900} style={{ color: 'var(--akabeni)' }} />
      </motion.div>

      {/* Mountain silhouette — bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-25" style={{ color: 'var(--kokutan)' }}>
        <MountainIcon size={1400} className="w-full h-auto" />
      </div>

      {/* Vertical kanji rails — left & right */}
      <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 kanji-rail" style={{ height: '60vh' }}>
        武 士 道
      </div>
      <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 kanji-rail" style={{ height: '60vh' }}>
        集 中 力
      </div>

      {/* ──── HEADER ──── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 px-8 pt-10 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="hanko tilt" style={{ fontSize: 14 }}>封</div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--nezumi)' }}>
              {t('bushido.verdict')}
            </div>
            <div className="text-sm font-serif gold-leaf">
              {t('bushido.verdictBlocked')}
            </div>
          </div>
        </div>

        {hostname && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--nezumi)' }}>
              {t('bushido.currentTab')}
            </div>
            <div className="font-mono text-sm" style={{ color: 'var(--hi-iro)' }}>
              {hostname}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ──── MAIN ──── */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16 min-h-[70vh]">

        {/* Brush divider above */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
          className="brush-divider thick w-64 mb-16 origin-center"
        />

        {/* Kanji card — main statement */}
        <BushidoCard phrase={phrase} language={currentLanguage} />

        {/* Three-breaths line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1.2 }}
          className="mt-10 mb-4 flex items-center gap-4"
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
                ease: 'easeInOut',
              }}
              className="block w-2 h-2 rounded-full"
              style={{ background: 'var(--kinpaku)' }}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="text-[10px] uppercase tracking-[0.5em] mb-12"
          style={{ color: 'var(--nezumi)' }}
        >
          {t('bushido.breathThree')}
        </motion.div>

        {/* Brush divider below */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 1.2, ease: 'easeOut' }}
          className="brush-divider w-48 mb-12 origin-center opacity-60"
        />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <button onClick={handleCloseTab} className="btn primary lg" style={{ minWidth: 220 }}>
            <span className="font-serif" style={{ fontSize: 16, marginRight: 8 }}>刀</span>
            {t('bushido.bowOut')}
          </button>
          <button onClick={handleGoBack} className="btn secondary lg" style={{ minWidth: 220 }}>
            {t('bushido.returnToWork')}
          </button>
        </motion.div>

      </main>

      {/* ──── FOOTER ──── */}
      <footer className="relative z-10 px-8 pb-10 pt-8">
        <QuoteFooter quote={quote} language={currentLanguage} />
      </footer>
    </div>
  )
}

export default BlockedPage
