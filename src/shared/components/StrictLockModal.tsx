import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock } from 'lucide-react'

interface StrictLockModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  startTime?: number
}

export const StrictLockModal: React.FC<StrictLockModalProps> = ({ isOpen, onClose, startTime }) => {
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-washi rounded-2xl shadow-[var(--shadow-float)] overflow-hidden border border-border/80"
          >
            <div className="p-10 text-center relative overflow-hidden">
              {/* Decorative ink wash background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sumi-black/5 rounded-full blur-3xl pointer-events-none" />

              <div className="mx-auto w-16 h-16 bg-sumi-black rounded-2xl flex items-center justify-center mb-6 text-gold relative z-10 shadow-md border border-border/40">
                <Lock size={30} strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-serif text-sumi-black tracking-tight mb-3 relative z-10">Strict Mode</h3>
              <p className="text-sumi-gray text-[15px] mb-8 leading-relaxed font-light relative z-10">
                This action is locked by Strict Mode. Allow your focus to remain unbroken.
                {startTime && (
                  <span className="block mt-3 text-xs opacity-75 font-mono tracking-wider">
                    ACTIVE SINCE {new Date(startTime).toLocaleTimeString()}
                  </span>
                )}
              </p>

              <div className="space-y-4 relative z-10">
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-xl bg-sumi-black text-white font-serif tracking-wide hover:bg-black transition-all shadow-md hover:shadow-lg border border-transparent"
                >
                  Acknowledge
                </button>

                {startTime && Date.now() - startTime < 10 * 60 * 1000 && (
                  <button
                    onClick={async () => {
                      try {
                        const { messagingClient } = await import('../messaging/client')
                        await messagingClient.setStrictMode(false)
                        onClose()
                        window.location.reload() // Reload to reflect changes
                      } catch (e) {
                        console.error('Failed to disable strict mode', e)
                      }
                    }}
                    className="text-xs text-sumi-gray hover:text-sumi-black transition-colors font-medium border-b border-dashed border-sumi-gray/30 hover:border-sumi-black pb-0.5 inline-block"
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
