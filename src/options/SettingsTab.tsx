import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { ShieldIcon, FlameIcon, AlertTriangleIcon, DownloadIcon } from '../shared/components/Icons'
import { t } from '../shared/i18n'
import { StrictModeWarningModal } from './StrictModeWarningModal'
import StrictLockModal from './StrictLockModal'
import { getStrictMode } from '../shared/storage/storage'

export const SettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(true)

  const [strictModeEnabled, setStrictModeEnabled] = useState(false)
  const [strictModeStart, setStrictModeStart] = useState<number | undefined>(undefined)
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [requireDesktopAppEnabled, setRequireDesktopAppEnabled] = useState(false)
  const [showStrictWarning, setShowStrictWarning] = useState(false)
  const [showStrictLock, setShowStrictLock] = useState(false)

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true)
      try {
        const [strict, challenge, requireDesktop] = await Promise.all([
          getStrictMode(),
          messagingClient.getChallengeMode(),
          messagingClient.getRequireDesktopApp(),
        ])

        setStrictModeEnabled(strict.enabled)
        setStrictModeStart(strict.startTime)

        setChallengeModeEnabled(challenge.enabled)
        setRequireDesktopAppEnabled(requireDesktop.enabled)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  const handleStrictToggle = () => {
    if (strictModeEnabled) {
      // Attempting to disable strict mode
      // Show lock modal which handles the grace period logic aka "It was accidental"
      setShowStrictLock(true)
    } else {
      // Open Warning Modal
      setShowStrictWarning(true)
    }
  }

  const handleEnableStrict = async () => {
    await messagingClient.setStrictMode(true)
    setStrictModeEnabled(true)
    setStrictModeStart(Date.now()) // Optimistic update
    setShowStrictWarning(false)
  }

  if (loading) {
    return <div className="p-8 text-center text-sumi-gray">Loading settings...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="washi-card p-8 border border-border/60 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-start gap-6 border-b border-border/40 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
              <ShieldIcon size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-serif text-sumi-black tracking-tight mb-2">
                {t('settings.tabTitle') || 'Settings'}
              </h3>
              <p className="text-sumi-gray text-base leading-relaxed max-w-2xl font-light">
                Configure your protection level and security preferences to maintain your focus.
              </p>
            </div>
          </div>

          {/* Modes Section */}
          <div className="grid grid-cols-1 gap-6">

            {/* Desktop App */}
            <div className="group p-6 rounded-xl border border-border/50 bg-white/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-black/5 text-sumi-black rounded-xl group-hover:scale-110 transition-transform">
                    <DownloadIcon size={22} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-lg text-sumi-black tracking-wide">Desktop App Required</h4>
                </div>
                <button
                  onClick={() => {
                    const newState = !requireDesktopAppEnabled
                    setRequireDesktopAppEnabled(newState)
                    messagingClient.setRequireDesktopApp(newState)
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 shadow-inner ${requireDesktopAppEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                >
                  <span
                    className={`${requireDesktopAppEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full toggle-thumb transition-transform shadow`}
                  />
                </button>
              </div>
              <p className="text-sm text-sumi-gray leading-relaxed pl-14 font-light">
                Require the Focusan Desktop App to be running to enforce protection. Turn this off if you only want the browser extension.
              </p>
            </div>

            {/* Challenge Mode */}
            <div className="group p-6 rounded-xl border border-gold-accent/20 bg-gradient-to-br from-gold-accent/5 to-transparent shadow-sm hover:shadow-md hover:border-gold-accent/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gold-accent/10 text-gold-accent rounded-xl group-hover:scale-110 transition-transform">
                    <FlameIcon size={22} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-lg text-sumi-black tracking-wide">Friction Mode</h4>
                </div>
                <button
                  onClick={() => {
                    const newState = !challengeModeEnabled
                    setChallengeModeEnabled(newState)
                    messagingClient.setChallengeMode(newState)
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-accent focus:ring-offset-2 shadow-inner ${challengeModeEnabled ? 'bg-gold-accent' : 'bg-gray-200'}`}
                >
                  <span
                    className={`${challengeModeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full toggle-thumb transition-transform shadow`}
                  />
                </button>
              </div>
              <p className="text-sm text-sumi-gray leading-relaxed pl-14 font-light">
                Adds annoying challenges (math, typing) before allowing you to stop sessions or
                edit settings. Good for "pre-commitment".
              </p>
            </div>

            {/* Strict Mode */}
            <div className="group p-6 rounded-xl border border-danger/20 bg-gradient-to-br from-danger/5 to-transparent shadow-sm hover:shadow-md hover:border-danger/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-danger/10 text-danger rounded-xl group-hover:scale-110 transition-transform">
                    <AlertTriangleIcon size={22} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-serif text-lg text-sumi-black tracking-wide">Strict Mode</h4>
                </div>
                <button
                  onClick={handleStrictToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 shadow-inner ${strictModeEnabled ? 'bg-danger' : 'bg-gray-200'}`}
                >
                  <span
                    className={`${strictModeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full toggle-thumb transition-transform shadow`}
                  />
                </button>
              </div>
              <p className="text-sm text-sumi-gray leading-relaxed pl-14 font-light">
                Prevents disabling restrictions or removing sites. Once enabled, it is extremely
                difficult to turn off.
              </p>
            </div>

          </div>
        </div>
      </div>

      <StrictModeWarningModal
        isOpen={showStrictWarning}
        onClose={() => setShowStrictWarning(false)}
        onConfirm={handleEnableStrict}
      />

      <StrictLockModal
        isOpen={showStrictLock}
        onClose={() => setShowStrictLock(false)}
        onSuccess={() => {
          // This is usually for "proceed with action",
          // but for disabling strict mode, the "It was accidental" button controls it directly.
          // If they somehow "succeed" via logic (payment?), we could disable it here.
          // For now, the Accidental button does the work.
          setShowStrictLock(false)
        }}
        startTime={strictModeStart}
      />
    </motion.div>
  )
}
