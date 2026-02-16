import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { ShieldIcon, FlameIcon, AlertTriangleIcon } from '../shared/components/Icons'
import { t } from '../shared/i18n'
import { StrictModeWarningModal } from './StrictModeWarningModal'
import StrictLockModal from './StrictLockModal'
import { getStrictMode } from '../shared/storage/storage'

export const SettingsTab: React.FC = () => {
    const [loading, setLoading] = useState(true)



    const [strictModeEnabled, setStrictModeEnabled] = useState(false)
    const [strictModeStart, setStrictModeStart] = useState<number | undefined>(undefined)
    const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
    const [showStrictWarning, setShowStrictWarning] = useState(false)
    const [showStrictLock, setShowStrictLock] = useState(false)

    useEffect(() => {
        const loadStatus = async () => {
            setLoading(true)
            try {
                const [strict, challenge] = await Promise.all([
                    getStrictMode(),
                    messagingClient.getChallengeMode()
                ])


                setStrictModeEnabled(strict.enabled)
                setStrictModeStart(strict.startTime)

                setChallengeModeEnabled(challenge.enabled)

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
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <ShieldIcon size={32} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-sumi-black mb-2">
                            {t('settings.tabTitle') || 'Settings'}
                        </h3>
                        <p className="text-sumi-gray text-sm leading-relaxed mb-6 max-w-2xl">
                            Configure your protection level and security preferences.
                        </p>

                        <div className="space-y-8">

                            {/* Modes Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-border/40">
                                {/* Challenge Mode */}
                                <div className="p-5 rounded-xl border border-gold-accent/30 bg-gold-accent/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gold-accent/10 text-gold-accent rounded-lg">
                                                <FlameIcon size={20} />
                                            </div>
                                            <h4 className="font-bold text-sumi-black">Friction Mode</h4>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newState = !challengeModeEnabled
                                                setChallengeModeEnabled(newState)
                                                messagingClient.setChallengeMode(newState)
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold-accent focus:ring-offset-2 ${challengeModeEnabled ? 'bg-gold-accent' : 'bg-gray-300'}`}
                                        >
                                            <span className={`${challengeModeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-sumi-gray leading-snug">
                                        Adds annoying challenges (math, typing) before allowing you to stop sessions or edit settings. Good for "pre-commitment".
                                    </p>
                                </div>

                                {/* Strict Mode */}
                                <div className="p-5 rounded-xl border border-danger/30 bg-danger/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-danger/10 text-danger rounded-lg">
                                                <AlertTriangleIcon size={20} />
                                            </div>
                                            <h4 className="font-bold text-sumi-black">Strict Mode</h4>
                                        </div>
                                        <button
                                            onClick={handleStrictToggle}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 ${strictModeEnabled ? 'bg-danger' : 'bg-gray-300'}`}
                                        >
                                            <span className={`${strictModeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-sumi-gray leading-snug">
                                        Prevents disabling restrictions or removing sites. Once enabled, it is extremely difficult to turn off.
                                    </p>
                                </div>
                            </div>


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
        </motion.div >
    )
}
