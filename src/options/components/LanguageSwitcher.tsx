import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LanguageSwitcherProps {
  currentLang: string
  onLanguageChange: (lang: string) => void
}

const languages = [
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
]

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <div className="relative font-sans z-50" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border transition-colors"
        style={{
          width: 160,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          gap: 8,
          borderRadius: 2,
          background: 'transparent',
          borderColor: 'var(--border)',
          color: isOpen ? 'var(--kinpaku)' : 'var(--nezumi)',
          boxShadow: isOpen ? '0 0 0 1px var(--akabeni)' : 'none',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: 16, opacity: 0.85, width: 20, textAlign: 'center', flexShrink: 0 }}>{current.flag}</span>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.02em', flex: 1, textAlign: 'left' }}>
          {current.label}
        </span>
        <span
          style={{
            fontSize: 9,
            opacity: 0.6,
            width: 10,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              width: 220,
              background: 'var(--kokutan)',
              border: '1px solid var(--border)',
              borderRadius: 2,
              boxShadow: 'var(--shadow-lg), 0 0 0 1px rgba(184,46,46,0.25)',
              zIndex: 999,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="p-1">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm transition-all flex items-center justify-between group"
                  style={{
                    borderRadius: 2,
                    background: currentLang === lang.code ? 'rgba(184,46,46,0.15)' : 'transparent',
                    color: currentLang === lang.code ? 'var(--kinpaku)' : 'var(--nezumi)',
                    fontWeight: currentLang === lang.code ? 600 : 400,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg transition-all ${currentLang === lang.code ? 'filter-none' : 'filter grayscale opacity-70 group-hover:filter-none group-hover:opacity-100'}`}
                    >
                      {lang.flag}
                    </span>
                    <div className="flex flex-col leading-none gap-0.5">
                      <span className="font-medium">{lang.label}</span>
                      <span className="text-[10px] opacity-60 font-serif tracking-in-expand">
                        {lang.native}
                      </span>
                    </div>
                  </div>
                  {currentLang === lang.code && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-accent text-xs"
                    >
                      ●
                    </motion.span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
