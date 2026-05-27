import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { ShieldIcon, SealIcon } from '../shared/components/Icons'
import { t } from '../shared/i18n'
import { getCurrentTheme, setTheme } from '../shared/themes'

export const SettingsTab: React.FC = () => {
  const [loading, setLoading] = useState(true)

  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [themeId, setThemeId] = useState<string>('focusan')

  useEffect(() => {
    const loadStatus = async () => {
      setLoading(true)
      try {
        const challenge = await messagingClient.getChallengeMode()
        setChallengeModeEnabled(challenge.enabled)

        const theme = await getCurrentTheme()
        setThemeId(theme.metadata.id)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStatus()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-sumi-gray">Loading settings...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="washi-card p-8 border border-border/60 shadow-[var(--shadow-lg)]">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-start gap-6 border-b border-border/40 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
              <ShieldIcon size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-serif text-sumi-black tracking-tight mb-2">
                {t('settings.tabTitle') || 'Settings'}
              </h3>
              <p className="text-sumi-gray text-base leading-relaxed max-w-2xl font-light">
                Configure your protection level and security preferences to maintain your focus.
              </p>
            </div>
          </div>

          {/* Modes Section */}
          <div className="grid grid-cols-1 gap-6">

            {/* Friction Mode — Seal of Discipline */}
            <div
              className="group p-6 transition-all duration-300"
              style={{
                borderRadius: 'var(--radius)',
                border: `1px solid ${challengeModeEnabled ? 'var(--accent)' : 'var(--border)'}`,
                background: challengeModeEnabled
                  ? 'linear-gradient(135deg, rgba(184,46,46,0.08), transparent)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className="p-2.5 group-hover:scale-110 transition-transform"
                    style={{
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(184,46,46,0.08)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent)',
                    }}
                  >
                    <SealIcon size={22} strokeWidth={1.5} kanji="封" />
                  </div>
                  <h4 className="font-serif text-lg tracking-wide" style={{ color: 'var(--text)' }}>
                    {t('friction.settingsTitle')}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    const newState = !challengeModeEnabled
                    setChallengeModeEnabled(newState)
                    messagingClient.setChallengeMode(newState)
                  }}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-inner"
                  style={{
                    background: challengeModeEnabled ? 'var(--accent)' : 'var(--border)',
                  }}
                  aria-pressed={challengeModeEnabled}
                >
                  <span
                    className={`${challengeModeEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full toggle-thumb transition-transform shadow`}
                  />
                </button>
              </div>
              <p className="text-sm leading-relaxed pl-14 font-light" style={{ color: 'var(--muted)' }}>
                {t('friction.settingsDescription')}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Theme picker — Kuro / Shiro ─── */}
      <div className="washi-card p-8 border border-border/60 shadow-[var(--shadow-lg)]">
        <div className="flex items-start gap-6 border-b border-border/40 pb-6 mb-6">
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 2, color: 'var(--kinpaku)' }}
          >
            <span className="font-serif" style={{ fontSize: 28, fontWeight: 900 }}>色</span>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-serif tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              {t('bushido.theWay') /* Theme */}
            </h3>
            <p className="text-sm font-serif italic" style={{ color: 'var(--muted)' }}>
              Kuro (lacquer) or Shiro (washi paper).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'focusan',       kanji: '黒', label: 'Kuro',  desc: 'Black lacquer · crimson seal',  bg: '#0B0A0A', fg: '#F2E9D8', accent: '#B82E2E' },
            { id: 'focusan-shiro', kanji: '白', label: 'Shiro', desc: 'Washi paper · sumi ink',        bg: '#F4EDE0', fg: '#1A1410', accent: '#B82E2E' },
          ].map(opt => {
            const active = themeId === opt.id
            return (
              <button
                key={opt.id}
                onClick={async () => { setThemeId(opt.id); await setTheme(opt.id) }}
                className="text-left p-5 transition-all"
                style={{
                  background: opt.bg,
                  color: opt.fg,
                  border: active ? `2px solid ${opt.accent}` : '2px solid transparent',
                  outline: '1px solid var(--border)',
                  borderRadius: 2,
                  boxShadow: active ? `0 0 0 1px ${opt.accent}, 0 8px 24px -8px rgba(0,0,0,0.4)` : 'var(--shadow-sm)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="font-serif leading-none"
                    style={{ fontSize: 48, fontWeight: 900, color: opt.accent }}
                  >
                    {opt.kanji}
                  </div>
                  {active && (
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] px-2 py-1"
                      style={{ background: opt.accent, color: opt.bg, borderRadius: 2 }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div className="font-serif text-lg mb-1">{opt.label}</div>
                <div className="text-xs opacity-70">{opt.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Permissions & privacy covenant ─── */}
      <div className="washi-card p-8 border border-border/60 shadow-[var(--shadow-lg)]">
        <div className="flex items-start gap-6 border-b border-border/40 pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent shadow-sm">
            <ShieldIcon size={32} strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-serif tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              {t('bushido.welcome.permissionsTitle')}
            </h3>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'var(--muted)' }}>
              {t('bushido.welcome.permissionsIntro')}
            </p>
          </div>
        </div>

        <ul className="space-y-3 text-sm">
          {[
            t('bushido.welcome.permCanBlock'),
            t('bushido.welcome.permCanTabs'),
            t('bushido.welcome.permCanSchedule'),
          ].map((line, i) => (
            <li key={`can-${i}`} className="flex items-start gap-3" style={{ color: 'var(--text)' }}>
              <span className="font-serif" style={{ color: 'var(--kinpaku)' }}>許</span>
              <span className="font-light">{line}</span>
            </li>
          ))}
          {[
            t('bushido.welcome.permCannotRead'),
            t('bushido.welcome.permCannotSend'),
          ].map((line, i) => (
            <li key={`cannot-${i}`} className="flex items-start gap-3" style={{ color: 'var(--muted)' }}>
              <span className="font-serif" style={{ color: 'var(--accent)' }}>禁</span>
              <span className="font-light">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
