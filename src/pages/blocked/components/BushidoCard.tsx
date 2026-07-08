/**
 * Bushidō Card — verdict panel.
 * Crimson hanko + massive kanji + ink-brush meaning + verdict message.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { BushidoPhrase, getPhraseMeaning, getPhraseMessage } from '../../../shared/bushido-phrases'
import type { Language } from '../../../shared/i18n/translations'

interface BushidoCardProps {
  phrase: BushidoPhrase
  language: Language
}

export const BushidoCard: React.FC<BushidoCardProps> = ({ phrase, language }) => {
  const meaning = getPhraseMeaning(phrase, language)
  const message = getPhraseMessage(phrase, language)

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.35, delayChildren: 0.4 } },
  }
  const item = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, ease: 'easeOut' as const } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-center relative z-10 max-w-3xl mx-auto"
    >
      {/* Crimson seal frame around kanji */}
      <motion.div variants={item} className="relative inline-block mb-8">
        {/* Outer red frame */}
        <div
          className="absolute -inset-8 border-2 pointer-events-none"
          style={{ borderColor: 'var(--akabeni)', opacity: 0.35, borderRadius: 2 }}
        />
        <div
          className="absolute -inset-4 border pointer-events-none"
          style={{ borderColor: 'var(--kinpaku)', opacity: 0.25, borderRadius: 2 }}
        />
        {/* Kanji */}
        <h1
          className="kanji-display relative px-12 py-6"
          style={{
            fontSize: 'clamp(6rem, 16vw, 12rem)',
            lineHeight: 0.95,
            letterSpacing: '0.04em',
          }}
          data-bushido
        >
          {phrase.kanji}
        </h1>
      </motion.div>

      {/* Romaji — Meaning */}
      <motion.div variants={item} className="mb-3">
        <span
          className="font-serif italic mr-3"
          style={{ fontSize: 28, color: 'var(--kinpaku)', letterSpacing: '0.06em' }}
        >
          {phrase.romanji}
        </span>
      </motion.div>

      <motion.h2
        variants={item}
        className="text-xs md:text-sm uppercase tracking-[0.5em] mb-10"
        style={{ color: 'var(--nezumi)', fontWeight: 500 }}
      >
        — {meaning} —
      </motion.h2>

      {/* Verdict message */}
      <motion.p
        variants={item}
        className="font-serif leading-relaxed whitespace-pre-line max-w-xl mx-auto"
        style={{
          fontSize: 'clamp(1.05rem, 1.6vw, 1.35rem)',
          color: 'var(--kinari)',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}
