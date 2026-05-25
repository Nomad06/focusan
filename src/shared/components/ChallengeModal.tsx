import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Unlock } from 'lucide-react'
import { t } from '../i18n'

interface ChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  action: 'stop-session' | 'remove-site' | 'disable-extension'
  title?: string
}

const SHAME_PHRASES = [
  'I am choosing short-term pleasure over my long-term goals.',
  'I am breaking the promise I made to myself.',
  'Distraction is the enemy of my potential.',
  'I surrender my focus to the algorithm.',
]

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  action,
  title,
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
      setTimeout(() => {
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
            a: (a + b) * c,
          })
        }
      }, 0)
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
      case 'stop-session':
        return 'Stop Focus Session?'
      case 'remove-site':
        return 'Remove Blocked Site?'
      case 'disable-extension':
        return 'Disable Protection?'
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'stop-session':
        return 'You are in the middle of a focus session. Stopping now breaks your momentum.'
      case 'remove-site':
        return 'Removing this site opens the door to distraction.'
      case 'disable-extension':
        return 'Disabling protection leaves you vulnerable to digital noise.'
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
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-[var(--shadow-float)] overflow-hidden border border-danger/30"
          >
            <div className="bg-washi p-8 text-center border-b border-border/50 relative overflow-hidden">
              {/* Subtle accent gradient behind icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-danger/5 rounded-full blur-2xl pointer-events-none" />

              <div className="mx-auto w-14 h-14 bg-white shadow-sm border border-danger/20 rounded-2xl flex items-center justify-center mb-5 relative z-10">
                <AlertTriangle className="text-danger w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-sumi-black mb-2 tracking-tight relative z-10">{getTitle()}</h3>
              <p className="text-sumi-gray text-sm leading-relaxed font-light relative z-10">{getDescription()}</p>
            </div>

            <div className="p-8">
              <p className="text-sm font-medium text-sumi-black mb-5 text-center tracking-wide">
                To proceed, complete this challenge:
              </p>

              {challengeType === 'text' ? (
                <div className="space-y-5">
                  <div className="bg-black/5 p-4 rounded-xl border border-border/50 text-center select-none shadow-inner">
                    <p className="font-serif italic text-sumi-black text-[15px] leading-relaxed">
                      "{targetPhrase}"
                    </p>
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={e => {
                      setInput(e.target.value)
                      setError(false)
                    }}
                    placeholder="Type the phrase exactly..."
                    className={`w-full p-4 border rounded-xl outline-none transition-all shadow-inner font-mono text-sm ${error
                      ? 'border-danger/50 focus:border-danger bg-danger/5 text-danger placeholder:text-danger/50'
                      : 'border-border/80 focus:border-accent bg-white'
                      }`}
                    onPaste={e => e.preventDefault()}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-black/5 p-5 rounded-xl border border-border/50 text-center shadow-inner">
                    <p className="font-mono text-2xl font-medium tracking-wider text-sumi-black">{mathProblem.q}</p>
                  </div>
                  <input
                    type="number"
                    value={input}
                    onChange={e => {
                      setInput(e.target.value)
                      setError(false)
                    }}
                    placeholder="Enter the result..."
                    className={`w-full p-4 border rounded-xl outline-none transition-all shadow-inner font-mono text-lg text-center ${error
                      ? 'border-danger/50 focus:border-danger bg-danger/5 text-danger placeholder:text-danger/50'
                      : 'border-border/80 focus:border-accent bg-white'
                      }`}
                  />
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-danger text-sm mt-3 text-center font-medium tracking-wide"
                >
                  Incorrect. Try again.
                </motion.p>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl border border-border/80 text-sumi-gray font-medium hover:bg-black/5 hover:text-sumi-black transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!input}
                  className={`flex-1 py-3.5 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all ${!input
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-danger hover:bg-[#a52622] shadow-md hover:shadow-lg'
                    }`}
                >
                  <Unlock size={18} strokeWidth={1.5} />
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
