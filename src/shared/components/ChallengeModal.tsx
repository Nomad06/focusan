import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Unlock } from 'lucide-react'

interface ChallengeModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    action: 'stop-session' | 'remove-site' | 'disable-extension'
    title?: string
}

const SHAME_PHRASES = [
    "I am choosing short-term pleasure over my long-term goals.",
    "I am breaking the promise I made to myself.",
    "Distraction is the enemy of my potential.",
    "I surrender my focus to the algorithm."
]

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    action,
    title
}) => {
    const [challengeType, setChallengeType] = useState<'text' | 'math' | 'pin'>('text')
    const [targetPhrase, setTargetPhrase] = useState('')
    const [input, setInput] = useState('')
    const [error, setError] = useState(false)
    const [mathProblem, setMathProblem] = useState({ q: '', a: 0 })

    useEffect(() => {
        if (isOpen) {
            setInput('')
            setError(false)

            // If action implies a higher security level (not implemented via props yet, but flexible), 
            // for now we stick to random text/math unless explicitly told otherwise.
            // Ideally validation happens BEFORE opening this modal if it's a security lock.
            // BUT: If the parent component (App.tsx) wants to force a PIN challenge, it should perhaps pass a prop.
            // For now, let's assume this modal is ONLY for "Friction" (Challenge Mode).
            // Meaning, strict PIN locking should probably be a separate modal OR this modal needs a `mode` prop.

            // Reverting to original logic for random friction:
            const type = Math.random() > 0.5 ? 'text' : 'math'
            setChallengeType(type)

            if (type === 'text') {
                const phrase = SHAME_PHRASES[Math.floor(Math.random() * SHAME_PHRASES.length)]
                setTargetPhrase(phrase)
            } else {
                const a = Math.floor(Math.random() * 20) + 10
                const b = Math.floor(Math.random() * 20) + 10
                const c = Math.floor(Math.random() * 10) + 1
                setMathProblem({
                    q: `(${a} + ${b}) * ${c} = ?`,
                    a: (a + b) * c
                })
            }
        }
    }, [isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (challengeType === 'text') {
            if (input === targetPhrase) {
                onSuccess()
            } else {
                setError(true)
            }
        } else if (challengeType === 'math') {
            if (parseInt(input) === mathProblem.a) {
                onSuccess()
            } else {
                setError(true)
            }
        }
    }

    const getTitle = () => {
        if (title) return title
        switch (action) {
            case 'stop-session': return 'Stop Focus Session?'
            case 'remove-site': return 'Remove Blocked Site?'
            case 'disable-extension': return 'Disable Protection?'
        }
    }

    const getDescription = () => {
        switch (action) {
            case 'stop-session': return 'You are in the middle of a focus session. Stopping now breaks your momentum.'
            case 'remove-site': return 'Removing this site opens the door to distraction.'
            case 'disable-extension': return 'Disabling protection leaves you vulnerable to digital noise.'
        }
    }

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
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100"
                    >
                        <div className="bg-red-50 p-6 text-center border-b border-red-100">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-600 w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-red-900 mb-1">{getTitle()}</h3>
                            <p className="text-red-700 text-sm">{getDescription()}</p>
                        </div>

                        <div className="p-6">
                            <p className="text-sm font-medium text-gray-700 mb-4 text-center">
                                To proceed, complete this challenge:
                            </p>

                            {challengeType === 'text' ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center select-none">
                                        <p className="font-serif italic text-gray-800 text-sm md:text-base">"{targetPhrase}"</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value)
                                            setError(false)
                                        }}
                                        placeholder="Type the phrase exactly..."
                                        className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-gray-200'
                                            }`}
                                        onPaste={(e) => e.preventDefault()}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                        <p className="font-mono text-xl font-bold text-gray-800">{mathProblem.q}</p>
                                    </div>
                                    <input
                                        type="number"
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value)
                                            setError(false)
                                        }}
                                        placeholder="Enter the result..."
                                        className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-gray-200 focus:ring-gray-200'
                                            }`}
                                    />
                                </div>
                            )}

                            {error && (
                                <p className="text-red-600 text-xs mt-2 text-center font-medium">
                                    Incorrect. Try again.
                                </p>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!input}
                                    className={`flex-1 py-2.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${!input
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    <Unlock size={16} />
                                    <span>Unlock</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
