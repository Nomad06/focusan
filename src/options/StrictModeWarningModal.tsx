import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckSquare } from 'lucide-react'

interface StrictModeWarningModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export const StrictModeWarningModal: React.FC<StrictModeWarningModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    const [agreed, setAgreed] = useState(false)

    if (!isOpen) return null

    return (
        <AnimatePresence>
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
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-200"
                >
                    <div className="bg-red-50 p-6 flex items-center gap-4 border-b border-red-100">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-red-900">Enable Strict Mode?</h3>
                            <p className="text-red-700 text-sm">This is a serious commitment.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-3 text-sumi-black/80 text-sm leading-relaxed">
                            <p className="font-bold">By enabling Strict Mode, you acknowledge:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>You will <strong>NOT</strong> be able to disable this mode easily.</li>
                                <li>You cannot remove blocked sites while this mode is active.</li>
                                <li>You cannot weaken schedules or delete rules.</li>
                                <li>Disabling this mode may require a mandatory waiting period or verification payment (experimental).</li>
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-red-600 border-red-600' : 'border-gray-300 bg-white'}`}>
                                    {agreed && <CheckSquare size={14} className="text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-gray-700 select-none">
                                    I understand the consequences and agree to proceed.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={!agreed}
                                className={`flex-1 py-3 rounded-xl text-white font-bold transition-all shadow-lg ${!agreed
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                    }`}
                            >
                                Yes, Enable Strict Mode
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
