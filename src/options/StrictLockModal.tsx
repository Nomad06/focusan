import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { TransactionChecker, TRON_BURN_ADDRESS } from '../shared/services/TransactionChecker'

interface StrictLockModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    requiredAmount?: number // in USDT, default 5
    startTime?: number
}

const StrictLockModal: React.FC<StrictLockModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    requiredAmount = 5,
    startTime
}) => {
    const [txId, setTxId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleVerify = async () => {
        if (!txId.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            // 1. Verify Transaction
            const result = await TransactionChecker.verifyPayment(txId.trim(), requiredAmount)

            if (result.success) {
                onSuccess()
                onClose()
            } else {
                setError(result.message || 'Verification Failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md washi-card border border-border shadow-zen-lg transform-gpu"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border bg-danger/5">
                        <h2 className="text-xl font-serif font-bold text-danger flex items-center gap-2">
                            Crypto Lock
                        </h2>
                        <p className="text-muted text-sm mt-1">
                            Strict Mode is active. You must pay a penalty to proceed.
                            {startTime && <span className="block mt-1 text-xs opacity-75 font-mono">Active since {new Date(startTime).toLocaleString()}</span>}
                        </p>

                        <div className="mt-4 p-3 bg-paper-texture border-l-2 border-accent/50 italic text-muted text-center font-serif opacity-80">
                            "Better waste money<br />
                            Than to waste your precious time<br />
                            Time is life itself"
                        </div>
                    </div>

                    <div className="p-6 space-y-6">

                        {startTime && (Date.now() - startTime < 10 * 60 * 1000) ? (
                            <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg text-center">
                                <p className="text-accent text-sm mb-3">
                                    You are within the 10-minute grace period.
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { messagingClient } = await import('../shared/messaging/client')
                                            await messagingClient.setStrictMode(false)
                                            onClose()
                                            window.location.reload()
                                        } catch (e) {
                                            console.error("Failed to disable strict mode", e)
                                        }
                                    }}
                                    className="btn primary bg-accent text-white w-full"
                                >
                                    It was accidental (Disable Strict Mode)
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Instruction */}
                                <div className="bg-bg-2 p-4 rounded-lg border border-border">
                                    <p className="text-sm text-muted mb-2">
                                        Send <strong className="text-text">{requiredAmount} USDT (TRC20)</strong> to the Burn Address below to unlock this action.
                                    </p>

                                    <div className="bg-bg-1 p-3 rounded font-mono text-xs text-center break-all text-accent select-all cursor-pointer hover:bg-black/5 transition-colors border border-border"
                                        onClick={() => navigator.clipboard.writeText(TRON_BURN_ADDRESS)}>
                                        {TRON_BURN_ADDRESS}
                                    </div>
                                    <div className="text-center text-[10px] text-muted mt-1">
                                        (Click to copy)
                                    </div>
                                </div>

                                {/* Input */}
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                        Transaction ID (Hash)
                                    </label>
                                    <input
                                        type="text"
                                        value={txId}
                                        onChange={(e) => setTxId(e.target.value)}
                                        placeholder="Paste TxID here..."
                                        className="w-full px-4 py-3 bg-bg-1 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-text placeholder-muted/50 font-mono text-sm transition-all shadow-sm"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm flex items-center gap-2">
                                        ⚠️ {error}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="btn secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        disabled={isLoading || !txId}
                                        className={`flex-1 btn ${isLoading || !txId ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'danger text-white'}`}
                                    >
                                        {isLoading ? 'Verifying...' : 'Unlock'}
                                    </button>
                                </div>

                                <p className="text-xs text-center text-muted/60">
                                    Funds sent to the burn address are permanently destroyed.
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export default StrictLockModal
