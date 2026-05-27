/**
 * Options Page React App for Focusan
 * High-end Japanese Zen Redesign
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { normalizeHost } from '../shared/utils/domain'
import { t, setLanguage, initI18n } from '../shared/i18n'
import { useLanguage } from '../shared/i18n/useLanguage'
import type { SiteObject } from '../shared/storage/schemas'
import {
  ScrollIcon,
  CalendarIcon,
  ShuffleIcon,
  XIcon,
  LeafIcon,
  LayoutIcon,
  FlameIcon,
  ShieldIcon,
} from '../shared/components/Icons'
import type { Stats } from '../shared/domain/stats'
import type { AchievementsData } from '../shared/domain/achievements'
import {
  ACHIEVEMENT_DEFINITIONS,
  getAchievementProgress,
  type AchievementProgress,
  type AchievementType,
} from '../shared/domain/achievements'
import { type Schedule } from '../shared/domain/schedule'
import {
  shouldShowChallengeForSchedule,
  shouldShowChallengeForRules,
} from '../shared/domain/strictness'
import { ChallengeModal } from '../shared/components/ChallengeModal'
import ScheduleModal from './ScheduleModal'
import ConditionalRulesModal from './ConditionalRulesModal'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import type { ConditionalRule } from '../shared/domain/conditional-rules'
import Heatmap from '../shared/components/Heatmap'
import { SettingsTab } from './SettingsTab'
import { BLOCKING_PRESETS, type Preset } from '../shared/utils/presets'
import { BeltIcon } from '../shared/components/BeltIcons'
import { useToast } from '../shared/components/Toast'
import { EmptyState } from '../shared/components/EmptyState'
import { StatCard } from '../shared/components/StatCard'

type Tab = 'sites' | 'stats' | 'achievements' | 'settings'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
}

const App: React.FC = () => {
  const toast = useToast()
  // New site configuration state
  const [newSiteSchedule, setNewSiteSchedule] = useState<Schedule | null>(null)
  const [newSiteRules, setNewSiteRules] = useState<ConditionalRule[]>([])
  const [showNewScheduleModal, setShowNewScheduleModal] = useState<boolean>(false)
  const [showNewRulesModal, setShowNewRulesModal] = useState<boolean>(false)
  // Security State
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)

  const [sites, setSites] = useState<SiteObject[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [achievements, setAchievements] = useState<AchievementsData | null>(null)
  const [achievementProgress, setAchievementProgress] = useState<Record<
    AchievementType,
    AchievementProgress
  > | null>(null)
  const getTabFromHash = (): Tab => {
    const hash = window.location.hash.slice(1)
    if (['sites', 'stats', 'achievements', 'settings'].includes(hash)) {
      return hash as Tab
    }
    return 'sites'
  }

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getTabFromHash())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  const [loading, setLoading] = useState<boolean>(true)
  const [newSiteInput, setNewSiteInput] = useState<string>('')
  const [bulkSitesInput, setBulkSitesInput] = useState<string>('')
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const [schedulingHost, setSchedulingHost] = useState<{
    host: string
    schedule: Schedule | null
  } | null>(null)
  const [conditionalRulesHost, setConditionalRulesHost] = useState<{
    host: string
    rules: ConditionalRule[]
  } | null>(null)

  // Pending action for security challenge
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'save'
    title?: string
    description?: string
    onConfirm: () => Promise<void>
  } | null>(null)

  // Reactive language hook
  const language = useLanguage()

  // Load data and language
  useEffect(() => {
    const init = async () => {
      await initI18n()
      loadAllData()

      const { enabled } = await messagingClient.getChallengeMode()
      setChallengeModeEnabled(enabled)
    }
    init()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [sitesData, statsData, achievementsData] = await Promise.all([
        messagingClient.getSites(),
        messagingClient.getStats(),
        messagingClient.getAchievements(),
      ])
      setSites(sitesData)
      setStats(statsData)
      setAchievements(achievementsData as AchievementsData)

      if (statsData) {
        const progress = await getAchievementProgress(statsData, sitesData)
        setAchievementProgress(progress)
      }
    } catch (err) {
      console.error('[Options] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadChallengeMode = async () => {
    const { enabled } = await messagingClient.getChallengeMode()
    setChallengeModeEnabled(enabled)
  }

  const loadSettings = async () => {
    // Placeholder for any other settings to load
  }

  useEffect(() => {
    loadSettings()
    loadChallengeMode()
  }, [])

  // Call separate effect or integrate, but ensure safe state update

  const loadSites = async () => {
    try {
      const sitesData = await messagingClient.getSites()
      setSites(sitesData)
    } catch (err) {
      console.error('[Options] Error loading sites:', err)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await messagingClient.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('[Options] Error loading stats:', err)
    }
  }

  const handleAddSite = async () => {
    const host = normalizeHost(newSiteInput)
    if (!host) {
      toast(t('errors.invalidDomain'), 'error')
      return
    }

    if (sites.some(s => s.host === host)) {
      toast(t('errors.siteAlreadyAdded'), 'error')
      return
    }

    try {
      await messagingClient.addSite(host, {
        schedule: newSiteSchedule,
        conditionalRules: newSiteRules.length > 0 ? newSiteRules : undefined,
      })
      setNewSiteInput('')
      setNewSiteSchedule(null)
      setNewSiteRules([])
      await loadSites()
      toast(`${host} ${t('common.added')}`, 'success')
    } catch (err) {
      console.error('[Options] Error adding site:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  const handleBulkAdd = async () => {
    const lines = bulkSitesInput.split('\n').filter(l => l.trim())
    const hosts = lines.map(l => normalizeHost(l)).filter(Boolean) as string[]

    if (hosts.length === 0) {
      toast(t('errors.noValidDomains'), 'error')
      return
    }

    try {
      for (const host of hosts) {
        if (!sites.some(s => s.host === host)) {
          await messagingClient.addSite(host)
        }
      }
      setBulkSitesInput('')
      await loadSites()
      toast(`${t('common.added')} ${hosts.length} ${t('options.sites')}`, 'success')
    } catch (err) {
      console.error('[Options] Error bulk adding sites:', err)
      toast(t('errors.failedToBulkAdd'), 'error')
    }
  }

  const handleAddPreset = async (preset: Preset) => {
    // Check if duplicate based on ID or Pattern
    const existing = sites.find(s => s.host === preset.pattern)
    if (existing) {
      toast(t('errors.siteAlreadyAdded'), 'error')
      return
    }

    try {
      await messagingClient.addSite(preset.pattern, {
        category: 'Smart Filter',
        patternType: 'regex',
      })
      await loadSites()
      setShowPresetsModal(false)
      toast(`${preset.name} ${t('common.added')}`, 'success')
    } catch (err) {
      console.error('[Options] Error adding preset:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  const [showPresetsModal, setShowPresetsModal] = useState<boolean>(false)

  const handleRemoveSite = (host: string) => {
    setPendingAction({
      type: 'delete',
      description: t('options.deleteChallengeDescription', { host }),
      onConfirm: async () => {
        await performRemoveSites([host])
      },
    })
  }

  const checkChallenge = async (action: () => Promise<void>) => {
    if (challengeModeEnabled) {
      // Use ChallengeModal for friction
      setPendingAction({
        type: 'delete',
        title: t('options.challengeModeTitle'),
        description: t('options.challengeModeDescription'),
        onConfirm: async () => {
          await action()
          setPendingAction(null)
        },
      })
    } else {
      await action()
    }
  }

  const performRemoveSites = async (hostsToDelete: string[]) => {
    if (hostsToDelete.length === 0) return

    await checkChallenge(async () => {
      try {
        for (const host of hostsToDelete) {
          await messagingClient.removeSite(host)
        }
        await loadSites()
        setSelectedSites(prev => {
          const newSet = new Set(prev)
          hostsToDelete.forEach(h => newSet.delete(h))
          return newSet
        })
      } catch (err) {
        console.error('[Options] Error removing sites:', err)
        toast(t('errors.failedToRemove'), 'error')
      } finally {
        setPendingAction(null)
      }
    })
  }

  const handleOpenSchedule = (host: string) => {
    const site = sites.find(s => s.host === host)
    setSchedulingHost({
      host,
      schedule: (site?.schedule as Schedule) || null,
    })
  }

  const handleSaveSchedule = async (schedule: Schedule | null) => {
    if (!schedulingHost) return

    const oldSchedule = schedulingHost.schedule
    const requiresChallenge = shouldShowChallengeForSchedule(oldSchedule, schedule)

    const saveSchedule = async () => {
      await checkChallenge(async () => {
        try {
          await messagingClient.updateSite(schedulingHost.host, { schedule })
          await loadSites()
          setSchedulingHost(null)
          setPendingAction(null)
        } catch (err) {
          console.error('[Options] Error saving schedule:', err)
          toast(t('errors.failedToSave') || 'Failed to save schedule', 'error')
        }
      })
    }

    if (requiresChallenge) {
      // Making protection weaker - show challenge with warning
      setPendingAction({
        type: 'save',
        description: t('options.weakeningProtectionWarning'),
        onConfirm: saveSchedule,
      })
    } else {
      // Making protection stronger or keeping same - save directly
      await saveSchedule()
    }
  }

  const handleCancelSchedule = () => {
    setSchedulingHost(null)
  }

  const handleOpenConditionalRules = (host: string) => {
    const site = sites.find(s => s.host === host)
    setConditionalRulesHost({
      host,
      rules: (site?.conditionalRules as ConditionalRule[]) || [],
    })
  }

  const handleSaveConditionalRules = async (rules: ConditionalRule[]) => {
    if (!conditionalRulesHost) return

    const oldRules = conditionalRulesHost.rules
    const requiresChallenge = shouldShowChallengeForRules(oldRules, rules)

    const saveRules = async () => {
      await checkChallenge(async () => {
        try {
          await messagingClient.updateSite(conditionalRulesHost.host, { conditionalRules: rules })
          await loadSites()
          setConditionalRulesHost(null)
          setPendingAction(null)
        } catch (err) {
          console.error('[Options] Error saving conditional rules:', err)
          toast(t('errors.failedToSave') || 'Failed to save rules', 'error')
        }
      })
    }

    if (requiresChallenge) {
      // Making protection weaker - show challenge with warning
      setPendingAction({
        type: 'save',
        description: t('options.weakeningProtectionWarning'),
        onConfirm: saveRules,
      })
    } else {
      // Making protection stronger or keeping same - save directly
      await saveRules()
    }
  }

  const handleToggleSite = (host: string) => {
    setSelectedSites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(host)) {
        newSet.delete(host)
      } else {
        newSet.add(host)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const filteredSites = getFilteredSites()
    setSelectedSites(new Set(filteredSites.map(s => s.host)))
  }

  const handleDeselectAll = () => {
    setSelectedSites(new Set())
  }

  const handleBulkDelete = () => {
    if (selectedSites.size === 0) return
    // setDeletingHosts is not used anymore directly, use pendingAction
    const hosts = Array.from(selectedSites)
    setPendingAction({
      type: 'delete',
      description: t('deleteChallenge.multipleDescription', { count: hosts.length }),
      onConfirm: async () => {
        await performRemoveSites(hosts)
      },
    })
  }

  const handleExport = async () => {
    try {
      const data = await messagingClient.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brain-defender-backup-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[Options] Error exporting data:', err)
      toast(t('errors.failedToExport'), 'error')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      await messagingClient.importData(text)
      await loadAllData()
      toast(t('options.importSuccess'), 'success')
    } catch (err) {
      console.error('[Options] Error importing data:', err)
      toast(t('errors.failedToImport'), 'error')
    }
  }

  const handleClearStats = async () => {
    if (!confirm(t('options.confirmClearStats'))) {
      return
    }

    await checkChallenge(async () => {
      try {
        await messagingClient.clearStats()
        await loadStats()
        toast(t('options.statsCleared'), 'success')
      } catch (err) {
        console.error('[Options] Error clearing stats:', err)
        toast(t('errors.failedToClearStats'), 'error')
      }
    })
  }

  const handleLanguageChange = async (lang: string) => {
    try {
      await setLanguage(lang as 'ru' | 'en')
    } catch (err) {
      console.error('[Options] Error changing language:', err)
    }
  }

  const getFilteredSites = (): SiteObject[] => {
    if (categoryFilter === 'all') {
      return sites
    }
    return sites.filter(s => s.category === categoryFilter)
  }

  const getCategories = (): string[] => {
    const cats = new Set<string>()
    sites.forEach(s => {
      if (s.category) cats.add(s.category)
    })
    return Array.from(cats).sort()
  }

  const filteredSites = getFilteredSites()
  const categories = getCategories()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg1)' }}>
        <div className="text-center">
          <div className="hanko tilt seal-press mb-4 mx-auto" style={{ fontSize: 24, padding: '8px 14px', display: 'inline-flex' }}>士</div>
          <div className="text-xl font-serif mb-2 gold-leaf">{t('options.title')}</div>
          <div className="font-serif italic" style={{ color: 'var(--nezumi)' }}>{t('common.loading')}...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ background: 'var(--bg1)', color: 'var(--text)' }}>
      {/* ─── Dojo Sidebar ─── */}
      <aside
        className="w-[280px] flex flex-col fixed h-full z-20 border-r"
        style={{
          background: 'linear-gradient(180deg, var(--bg2) 0%, var(--bg1) 100%)',
          borderColor: 'var(--border)',
          boxShadow: '4px 0 24px -8px rgba(0,0,0,0.6)',
        }}
      >
        {/* Decorative top crimson stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, var(--akabeni) 40%, var(--kinpaku) 70%, transparent)' }} />

        {/* Vertical kanji on right edge of sidebar */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 kanji-rail" style={{ fontSize: 11, letterSpacing: '0.7em', opacity: 0.2 }}>
          道 場
        </div>

        {/* Brand */}
        <div className="p-8 pb-6 flex flex-col items-center border-b" style={{ borderColor: 'var(--border)' }}>
          <motion.div
            initial={{ scale: 1.4, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="hanko tilt mb-4"
            style={{ fontSize: 32, padding: '12px 18px' }}
          >
            士
          </motion.div>
          <h1 className="font-serif text-2xl tracking-tight mb-1" style={{ color: 'var(--text)' }}>Focusan</h1>
          <span className="text-[10px] font-serif tracking-[0.45em] uppercase" style={{ color: 'var(--kinpaku)' }}>
            武 士 道
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {['sites', 'stats', 'achievements', 'settings'].map(tab => {
            const kanji: Record<string, string> = {
              sites: '門',
              stats: '記',
              achievements: '段',
              settings: '律',
            }
            const labels = {
              sites: t('options.blocklist'),
              stats: t('options.dashboard'),
              achievements: t('options.achievements'),
              settings: t('settings.tabTitle') || 'Settings',
            }
            const isActive = activeTab === tab

            return (
              <div key={tab} className="relative group">
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0"
                    style={{ background: 'rgba(184,46,46,0.12)', border: '1px solid rgba(184,46,46,0.4)', borderRadius: 2 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <button
                  onClick={() => (window.location.hash = tab)}
                  className="relative w-full flex items-center gap-4 px-4 py-3.5 transition-all duration-300"
                  style={{
                    color: isActive ? 'var(--text)' : 'var(--nezumi)',
                    borderRadius: 2,
                  }}
                >
                  <span
                    className="font-serif text-2xl leading-none"
                    style={{ color: isActive ? 'var(--akabeni)' : 'var(--sabi)', minWidth: 28, textAlign: 'center' }}
                  >
                    {kanji[tab]}
                  </span>
                  <span className="text-sm tracking-[0.15em] uppercase" style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>
                    {labels[tab as keyof typeof labels]}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3"
                      style={{ width: 2, height: 24, background: 'var(--kinpaku)', boxShadow: 'var(--gold-glow)' }}
                    />
                  )}
                </button>
              </div>
            )
          })}
        </nav>

        <div className="p-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="brush-divider mb-3" />
          <p
            className="font-serif text-xs italic text-center"
            style={{ color: 'var(--nezumi)', opacity: 0.7 }}
          >
            「 一期一会 」
          </p>
          <p className="text-center text-[9px] uppercase tracking-[0.4em] mt-1" style={{ color: 'var(--kinpaku)', opacity: 0.5 }}>
            ichigo-ichie
          </p>
        </div>
      </aside>

      {/* Main Content — Dojo hall */}
      <main className="flex-1 ml-[280px] p-8 lg:p-12 max-w-7xl mx-auto relative">
        {/* Subtle asanoha pattern on main */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'var(--asanoha)' }} />

        {/* Top Bar — Chapter heading */}
        <div className="relative flex justify-between items-end mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="font-serif text-4xl leading-none"
                style={{ color: 'var(--akabeni)' }}
              >
                {activeTab === 'sites' && '門'}
                {activeTab === 'stats' && '記'}
                {activeTab === 'achievements' && '段'}
                {activeTab === 'settings' && '律'}
              </span>
              <span className="brush-divider w-12" />
              <span className="text-[10px] uppercase tracking-[0.45em]" style={{ color: 'var(--kinpaku)' }}>
                {String(['sites','stats','achievements','settings'].indexOf(activeTab) + 1).padStart(2, '0')} / 04
              </span>
            </div>
            <h2 className="font-serif text-3xl tracking-tight" style={{ color: 'var(--text)' }}>
              {activeTab === 'sites' && t('options.blocklist')}
              {activeTab === 'stats' && t('options.dashboard')}
              {activeTab === 'achievements' && t('options.achievements')}
            </h2>
            <p className="font-serif italic text-sm tracking-wide mt-1" style={{ color: 'var(--nezumi)' }}>
              {activeTab === 'sites' && t('options.subtitleSites')}
              {activeTab === 'stats' && t('options.subtitleStats')}
              {activeTab === 'achievements' && t('options.subtitleAchievements')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLang={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>

        <AnimatePresence>
          {pendingAction && (
            <div className="fixed inset-0 z-50">
              <ChallengeModal
                isOpen={true}
                onClose={() => setPendingAction(null)}
                onSuccess={pendingAction.onConfirm}
                action={pendingAction.type === 'delete' ? 'remove-site' : 'disable-extension'}
                title={pendingAction.title}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPresetsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowPresetsModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10"
              >
                <div className="p-6 border-b border-border/10 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-xl font-serif text-sumi-black">Smart Filters</h3>
                  <button
                    onClick={() => setShowPresetsModal(false)}
                    className="text-sumi-gray hover:text-sumi-black"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {BLOCKING_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleAddPreset(preset)}
                      className="w-full text-left p-4 hover:bg-gray-50 rounded-xl transition-colors group border-b border-border/10 last:border-0"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sumi-black group-hover:text-accent transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {preset.host}
                        </span>
                      </div>
                      <p className="text-sm text-sumi-gray/80">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <SettingsTab />
            </motion.div>
          )}
          {/* Sites Tab */}
          {activeTab === 'sites' && (
            <motion.div
              key="sites"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              <div className="washi-card p-6 border border-border/60 shadow-[var(--shadow-lg)]">
                <div className="flex gap-4 mb-6">
                  <input
                    className="flex-1 px-5 py-3 rounded-lg border border-border bg-white/50 focus:bg-white focus:border-accent outline-none transition-all shadow-inner font-mono text-sm placeholder:font-sans"
                    value={newSiteInput}
                    onChange={e => setNewSiteInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddSite()}
                    placeholder={t('options.inputPlaceholder')}
                  />
                  <button
                    className="btn primary px-8 shadow-md hover:shadow-lg transition-shadow"
                    onClick={handleAddSite}
                  >
                    {t('options.addButton')}
                  </button>
                </div>

                <div className="flex gap-4 border-t border-border/30 pt-6">
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all text-sm font-medium ${newSiteSchedule
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-dashed border-border text-sumi-gray hover:border-sumi-gray hover:bg-black/5'
                      }`}
                    onClick={() => setShowNewScheduleModal(true)}
                  >
                    <CalendarIcon className="w-4 h-4 opacity-70" />
                    {t('options.scheduleButtonTitle') || t('options.setSchedule')}
                    {newSiteSchedule && (
                      <span className="ml-1 text-xs bg-accent text-white px-1.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all text-sm font-medium ${newSiteRules.length > 0
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-dashed border-border text-sumi-gray hover:border-sumi-gray hover:bg-black/5'
                      }`}
                    onClick={() => setShowNewRulesModal(true)}
                  >
                    <ShuffleIcon className="w-4 h-4 opacity-70" />
                    {t('options.conditionsButtonTitle') || t('options.setConditions')}
                    {newSiteRules.length > 0 && (
                      <span className="ml-1 text-xs bg-accent text-white px-1.5 rounded-full">
                        {newSiteRules.length}
                      </span>
                    )}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border text-sumi-gray hover:border-accent hover:text-accent hover:bg-accent/5 transition-all text-sm font-medium"
                    onClick={() => setShowPresetsModal(true)}
                  >
                    <LayoutIcon className="w-4 h-4 opacity-70" />
                    {t('options.smartFilters') || 'Smart Filters'}
                  </button>
                </div>
              </div>

              {/* Selection Actions */}
              <AnimatePresence>
                {selectedSites.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-between items-center p-4 rounded-xl bg-accent text-white shadow-lg sticky top-4 z-30"
                  >
                    <div className="flex items-center gap-4 px-2">
                      <span className="font-semibold text-lg">{selectedSites.size}</span>
                      <span className="text-white/80 text-sm border-l border-white/20 pl-4">
                        {t('options.selectedItems')}
                      </span>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={handleSelectAll}
                          className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                        >
                          {t('options.selectAll')}
                        </button>
                        <button
                          onClick={handleDeselectAll}
                          className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                        >
                          {t('options.clearSelection')}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={handleBulkDelete}
                      className="px-6 py-2 bg-white text-accent rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      {t('options.deleteSelected')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sites List Container */}
              <div className="washi-card rounded-xl border border-border/60 shadow-[var(--shadow-lg)] overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-border/50" style={{ background: 'var(--bg2)' }}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${categoryFilter === 'all' ? 'bg-accent text-white border border-accent' : 'bg-transparent border border-border text-sumi-gray hover:border-accent hover:text-accent'}`}
                    >
                      {t('options.allCategories')}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${categoryFilter === cat ? 'bg-accent text-white border border-accent' : 'bg-transparent border border-border text-sumi-gray hover:border-accent hover:text-accent'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      className="text-xs text-sumi-gray hover:text-accent font-medium px-3 py-1.5 hover:bg-accent/5 rounded transition-colors"
                    >
                      {t('options.exportJson')}
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.json'
                        input.onchange = e => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) handleImport(file)
                        }
                        input.click()
                      }}
                      className="text-xs text-sumi-gray hover:text-accent font-medium px-3 py-1.5 hover:bg-accent/5 rounded transition-colors"
                    >
                      {t('options.importJson')}
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredSites.length === 0 ? (
                    <EmptyState
                      icon={<LeafIcon size={56} />}
                      title={t('options.emptyList')}
                      description={t('options.inputPlaceholder')}
                    />
                  ) : (
                    filteredSites.map(site => (
                      <div
                        key={site.host}
                        className={`flex justify-between items-center p-5 hover:bg-white/60 transition-colors group ${selectedSites.has(site.host) ? 'bg-accent/5' : ''}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={selectedSites.has(site.host)}
                              onChange={() => handleToggleSite(site.host)}
                              className="w-5 h-5 appearance-none rounded border border-border checked:bg-accent checked:border-accent transition-all cursor-pointer z-10"
                            />
                            {selectedSites.has(site.host) && (
                              <div className="absolute pointer-events-none z-10 flex items-center justify-center">
                                <XIcon size={12} className="text-white rotate-45" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="font-medium text-base text-sumi-black font-mono tracking-tight group-hover:text-accent transition-colors">
                              {site.host}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {site.category && (
                                <span className="text-[9px] uppercase tracking-widest text-white bg-sumi-gray/40 px-2 py-0.5 rounded-sm font-bold">
                                  {site.category}
                                </span>
                              )}
                              {site.schedule && (
                                <span className="text-[9px] uppercase tracking-widest text-accent border border-accent/20 px-2 py-0.5 rounded-sm font-bold flex items-center gap-1">
                                  <CalendarIcon size={10} /> {t('options.scheduleLabel')}
                                </span>
                              )}
                              {site.conditionalRules && site.conditionalRules.length > 0 && (
                                <span className="text-[9px] uppercase tracking-widest text-accent border border-accent/20 px-2 py-0.5 rounded-sm font-bold flex items-center gap-1">
                                  <ShuffleIcon size={10} /> {t('options.conditionsLabel')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenSchedule(site.host)}
                            title={t('options.scheduleButtonTitle') || 'Schedule'}
                            aria-label={`Schedule for ${site.host}`}
                            className="focus-ring w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/10 hover:text-accent text-sumi-gray transition-colors"
                          >
                            <CalendarIcon size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenConditionalRules(site.host)}
                            title={t('options.conditionsButtonTitle') || 'Rules'}
                            aria-label={`Conditional rules for ${site.host}`}
                            className="focus-ring w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/10 hover:text-accent text-sumi-gray transition-colors"
                          >
                            <ShuffleIcon size={16} />
                          </button>
                          <div className="w-px h-4 bg-border mx-1"></div>
                          <button
                            onClick={() => handleRemoveSite(site.host)}
                            title={t('common.delete') || 'Delete'}
                            aria-label={`Remove ${site.host}`}
                            className="focus-ring w-8 h-8 flex items-center justify-center rounded-full hover:bg-danger hover:text-white text-danger/70 hover:text-white transition-colors"
                          >
                            <XIcon size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bulk Add Section (Bottom) */}
                <div className="bg-gray-50/50 p-6 border-t border-border/50">
                  <div className="text-xs font-bold uppercase tracking-widest text-sumi-gray mb-3">
                    {t('options.bulkAdd')}
                  </div>
                  <div className="flex gap-3">
                    <textarea
                      className="flex-1 min-h-[40px] max-h-[100px] p-3 rounded-lg border border-border bg-white text-sm font-mono focus:border-accent outline-none transition-all resize-y"
                      value={bulkSitesInput}
                      onChange={e => setBulkSitesInput(e.target.value)}
                      placeholder={t('options.pasteDomains')}
                    />
                    <button
                      onClick={handleBulkAdd}
                      className="btn secondary h-auto px-6 whitespace-nowrap text-xs font-bold uppercase tracking-widest"
                    >
                      {t('options.addList')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div
              key="stats"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<ShieldIcon size={20} strokeWidth={1.5} />}
                    label={t('stats.totalBlocks')}
                    value={stats.totalBlocks}
                    accent="accent"
                    hint={stats.totalBlocks > 0 ? '心を守る' : undefined}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<FlameIcon size={20} strokeWidth={1.5} />}
                    label={t('stats.streakDays')}
                    value={stats.streakDays}
                    accent="gold"
                    hint={stats.streakDays >= 7 ? '七日' : stats.streakDays > 0 ? '継続' : undefined}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<LayoutIcon size={20} strokeWidth={1.5} />}
                    label={t('stats.totalSites')}
                    value={stats.totalSites}
                    accent="success"
                  />
                </motion.div>
              </div>

              {/* Heatmap */}
              <div>
                <h3 className="text-lg font-serif font-bold text-sumi-black mb-4">
                  {t('stats.heatmap')}
                </h3>
                <div className="washi-card p-6 border border-border/60 overflow-x-auto">
                  <Heatmap data={stats.minutesByDate || {}} />
                </div>
              </div>

              {/* Add charts here in future updates */}

              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-lg font-serif font-bold text-sumi-black">
                    {t('options.mostBlocked')}
                  </h3>
                </div>
                <div className="washi-card border border-border/60 overflow-hidden">
                  {Object.entries(stats.bySite)
                    .sort(([, a], [, b]) => b.blocks - a.blocks)
                    .slice(0, 10)
                    .map(([host, siteStats], index) => (
                      <div
                        key={host}
                        className="flex justify-between items-center p-5 border-b border-border/40 last:border-none hover:bg-white/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-sumi-gray w-6 text-center">
                            {index + 1}
                          </span>
                          <div className="font-medium text-sumi-black font-mono text-base">
                            {host}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent"
                              style={{
                                width: `${Math.min(100, (siteStats.blocks / (stats.totalBlocks || 1)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-accent font-bold text-sm w-12 text-right">
                            {siteStats.blocks}
                          </span>
                        </div>
                      </div>
                    ))}
                  {Object.keys(stats.bySite).length === 0 && (
                    <EmptyState
                      compact
                      icon={<ScrollIcon size={40} />}
                      title={t('options.noData')}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={handleClearStats}
                  className="text-xs text-danger hover:text-red-700 hover:underline underline-offset-4 transition-all opacity-60 hover:opacity-100"
                >
                  {t('options.clearStats')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && achievements && achievementProgress && (
            <div key="achievements" className="space-y-8">
              <div className="washi-card p-10 border border-border/60 text-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-6xl font-serif text-sumi-black mb-2">
                    {achievements.unlocked.length}{' '}
                    <span className="text-2xl text-sumi-gray font-sans opacity-50">
                      / {Object.keys(ACHIEVEMENT_DEFINITIONS).length}
                    </span>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-[0.2em] text-accent mb-8">
                    {t('options.unlockedAchievements')}
                  </div>

                  <div className="w-full max-w-md h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-gold transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.round((achievements.unlocked.length / Object.keys(ACHIEVEMENT_DEFINITIONS).length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
                  const achievementType = type as AchievementType
                  const progress = achievementProgress[achievementType]
                  const isUnlocked = achievements.unlocked.includes(achievementType)

                  const pct = Math.round(progress?.progress || 0)
                  return (
                    <motion.div
                      key={type}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                      className={`washi-card p-6 border transition-all duration-300 relative group overflow-hidden h-full flex flex-col ${
                        isUnlocked
                          ? 'border-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.15)] bg-gradient-to-br from-white to-gold/5'
                          : 'border-border/60 hover:border-accent/40 bg-gradient-to-br from-white to-bg2/40'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <BeltIcon
                          type={achievementType}
                          size={48}
                          className={`drop-shadow-sm transition-transform group-hover:scale-110 duration-300 ${
                            isUnlocked ? '' : 'opacity-50 group-hover:opacity-90'
                          }`}
                        />
                        {isUnlocked ? (
                          <span className="text-gold text-[10px] font-bold border border-gold rounded-full px-2.5 py-0.5 tracking-widest uppercase">
                            ✓ {t('achievements.unlocked')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold tracking-widest uppercase text-sumi-gray/70 font-mono">
                            {pct}%
                          </span>
                        )}
                      </div>

                      <h4
                        className={`font-serif font-bold text-lg mb-1 transition-colors ${
                          isUnlocked
                            ? 'text-sumi-black group-hover:text-gold'
                            : 'text-sumi-black/70 group-hover:text-accent'
                        }`}
                      >
                        {def.name}
                      </h4>
                      <p className="text-sm text-sumi-gray leading-relaxed mb-4 flex-1">
                        {def.description}
                      </p>

                      <div className="mt-auto pt-3 border-t border-dashed border-border/50">
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${isUnlocked ? 'bg-gradient-to-r from-gold to-accent' : 'bg-accent/60'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${isUnlocked ? 100 : pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showNewScheduleModal && (
          <ScheduleModal
            host={newSiteInput || t('common.newSite') || 'New Site'}
            initialSchedule={newSiteSchedule}
            onSave={schedule => {
              setNewSiteSchedule(schedule)
              setShowNewScheduleModal(false)
            }}
            onCancel={() => setShowNewScheduleModal(false)}
          />
        )}

        {showNewRulesModal && (
          <ConditionalRulesModal
            host={newSiteInput || t('common.newSite') || 'New Site'}
            initialRules={newSiteRules}
            onSave={rules => {
              setNewSiteRules(rules)
              setShowNewRulesModal(false)
            }}
            onClose={() => setShowNewRulesModal(false)}
          />
        )}

        {schedulingHost && (
          <ScheduleModal
            key="edit-schedule-modal"
            host={schedulingHost.host}
            initialSchedule={schedulingHost.schedule}
            onSave={handleSaveSchedule}
            onCancel={handleCancelSchedule}
          />
        )}

        {conditionalRulesHost && (
          <ConditionalRulesModal
            key="edit-rules-modal"
            host={conditionalRulesHost.host}
            initialRules={conditionalRulesHost.rules}
            onSave={handleSaveConditionalRules}
            onClose={() => setConditionalRulesHost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
