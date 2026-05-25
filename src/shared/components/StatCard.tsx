import React from 'react'
import { motion } from 'framer-motion'

interface Props {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  hint?: string
  accent?: 'accent' | 'gold' | 'success' | 'danger'
}

const accentClass = {
  accent: 'text-accent',
  gold: 'text-gold',
  success: 'text-green-700',
  danger: 'text-danger',
}

export const StatCard: React.FC<Props> = ({ icon, label, value, hint, accent = 'accent' }) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    className="washi-card p-6 border border-border/60 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
    <div className="relative flex items-start gap-4">
      <div
        className={`shrink-0 w-10 h-10 rounded-xl bg-white/80 border border-border/40 flex items-center justify-center ${accentClass[accent]} shadow-sm`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sumi-gray mb-1">
          {label}
        </div>
        <div className="font-mono text-3xl font-light text-sumi-black leading-none tracking-tight tabular-nums">
          {value}
        </div>
        {hint && <div className="text-xs text-sumi-gray/70 mt-2 font-serif italic">{hint}</div>}
      </div>
    </div>
  </motion.div>
)
