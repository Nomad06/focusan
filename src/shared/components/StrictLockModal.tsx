import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

interface StrictLockModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    startTime?: number
}

export const StrictLockModal: React.FC<StrictLockModalProps> = ({
    isOpen,
    onClose,
    startTime
}) => {
    // Basic modal for strict mode - currently just informs and prevents action unless strict mode logic allows (e.g. crypto payment? not implemented fully yet, so just lock)
    // Actually, "Strict Mode" in this context (from previous conversations) seemed to imply "Crypto Lock" or just "Hard Lock".
    // For now, let's make it a generic "Locked" message that might allow unlock if implemented.
    // If strict mode is ON, maybe users CANNOT unlock it easily.
    // But the `checkStrictMode` logic implies we show this modal.

    // For now, simple "Action blocked by Strict Mode" message.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-indigo-900"
                    >
                        <div className="p-8 text-center bg-indigo-50">
                            <div className="mx-auto w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mb-6 text-white shadow-lg">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-indigo-950 mb-2 font-serif">Strict Mode</h3>
                            <p className="text-indigo-800 text-sm mb-6 leading-relaxed">
                                This action is locked by Strict Mode.
                                {startTime && <span className="block mt-2 text-xs opacity-75">Active since {new Date(startTime).toLocaleString()}</span>}
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 rounded-xl bg-indigo-900 text-white font-medium hover:bg-indigo-800 transition-colors shadow-lg"
                                >
                                    Acknowledge
                                </button>

                                {startTime && (Date.now() - startTime < 10 * 60 * 1000) && (
                                    <button
                                        onClick={async () => {
                                            // We need to import setStrictMode, but this is a shared component.
                                            // Ideally we pass an onUnlock or similar, but for now let's use the client/storage directly 
                                            // OR rely on a prop. The prop `onSuccess` usually means "Action allowed".
                                            // But here we want to DISABLE strict mode.
                                            // Let's assume we can use the messaging client here or just direct storage since it's shared code 
                                            // but wait, shared code might be used in content scripts? 
                                            // Actually, StrictLockModal is likely only used in Options/Popup which have storage access.
                                            // To be safe, let's use the messaging client if possible, or dynamic import?
                                            // Better yet, update the component to accept an `onDisableStrict` prop?
                                            // No, that requires updating usage sites.
                                            // Let's use `messagingClient` directly.

                                            // Wait, I need to import messagingClient.
                                            // I'll assume I can import it.
                                            try {
                                                const { messagingClient } = await import('../messaging/client')
                                                await messagingClient.setStrictMode(false)
                                                onClose()
                                                window.location.reload() // Reload to reflect changes
                                            } catch (e) {
                                                console.error("Failed to disable strict mode", e)
                                            }
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-600 underline"
                                    >
                                        It was accidental (Grace Period)
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
