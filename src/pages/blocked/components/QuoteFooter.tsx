/**
 * Bushidō Quote Footer — wisdom etched at the gate.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { BushidoQuote, getQuoteText } from '../../../shared/bushido-phrases'
import type { Language } from '../../../shared/i18n/translations'

interface QuoteFooterProps {
  quote: BushidoQuote
  language: Language
}

export const QuoteFooter: React.FC<QuoteFooterProps> = ({ quote, language }) => {
  const text = getQuoteText(quote, language)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.8, delay: 2.4, ease: 'easeOut' }}
      className="text-center px-4 max-w-2xl mx-auto"
    >
      {/* Decorative kanji bracket */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="brush-divider flex-1" />
        <span className="font-serif text-sm" style={{ color: 'var(--kinpaku)', opacity: 0.7 }}>
          言
        </span>
        <span className="brush-divider flex-1" />
      </div>

      <p
        className="font-serif italic leading-relaxed"
        style={{
          color: 'var(--kinari)',
          opacity: 0.7,
          fontSize: '0.95rem',
          letterSpacing: '0.02em',
        }}
        data-bushido
      >
        「 {text} 」
      </p>

      {quote.author && (
        <p
          className="mt-3 text-xs uppercase tracking-[0.35em]"
          style={{ color: 'var(--kinpaku)', opacity: 0.6 }}
        >
          — {quote.author}
        </p>
      )}
    </motion.div>
  )
}
