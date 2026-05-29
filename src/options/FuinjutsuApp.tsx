/**
 * Fūinjutsu (封印) Options Page
 * Same data flow as App.tsx, makimono scroll UI.
 * Modals (ScheduleModal / ConditionalRulesModal / ChallengeModal / presets)
 * are reused as-is — modal takeover.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { messagingClient } from '../shared/messaging/client'
import { normalizeHost } from '../shared/utils/domain'
import { t, setLanguage, initI18n } from '../shared/i18n'
import { useLanguage } from '../shared/i18n/useLanguage'
import type { SiteObject } from '../shared/storage/schemas'
import { XIcon, CalendarIcon, ShuffleIcon, LayoutIcon } from '../shared/components/Icons'
import type { Stats } from '../shared/domain/stats'
import type { AchievementsData } from '../shared/domain/achievements'
import {
  ACHIEVEMENT_DEFINITIONS,
  getAchievementProgress,
  type AchievementProgress,
  type AchievementType,
} from '../shared/domain/achievements'
import { type Schedule } from '../shared/domain/schedule'
import { shouldShowChallengeForSchedule, shouldShowChallengeForRules } from '../shared/domain/strictness'
import { ChallengeModal } from '../shared/components/ChallengeModal'
import ScheduleModal from './ScheduleModal'
import ConditionalRulesModal from './ConditionalRulesModal'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import type { ConditionalRule } from '../shared/domain/conditional-rules'
import Heatmap from '../shared/components/Heatmap'
import { BLOCKING_PRESETS, type Preset } from '../shared/utils/presets'
import { useToast } from '../shared/components/Toast'
import { getCurrentTheme, setTheme as applyThemeId } from '../shared/themes'

type Tab = 'sites' | 'stats' | 'achievements' | 'settings'

const TAB_KANJI: Record<Tab, string> = {
  sites: '門',
  stats: '記',
  achievements: '段',
  settings: '律',
}

/* ───────── Reusable makimono page shell ───────── */
const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="makimono-surround" style={{ padding: '40px 16px 56px', minHeight: '100vh' }}>
    <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative' }}>
      {/* Top bamboo rod */}
      <div style={{ position: 'relative' }}>
        <div className="bamboo-rod" />
        <div className="tassel" style={{ top: 26, left: 32, height: 38 }} />
        <div className="tassel" style={{ top: 26, right: 32, height: 32 }} />
      </div>

      {/* Parchment page body */}
      <div className="makimono-scroll" style={{ padding: '40px 56px 52px' }}>
        {children}
      </div>

      {/* Bottom bamboo rod */}
      <div style={{ position: 'relative' }}>
        <div className="bamboo-rod" />
        <div className="tassel" style={{ bottom: -38, left: 32, height: 38 }} />
        <div className="tassel" style={{ bottom: -32, right: 32, height: 32 }} />
      </div>
    </div>
  </div>
)

/* ───────── Tab header ───────── */
const TabBar: React.FC<{ language: string; onLang: (l: string) => void }> = ({ language, onLang }) => (
  <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
    <div className="flex items-center gap-2">
      <span className="seal-stamp-cinnabar" style={{ fontSize: 18 }}>封</span>
      <div style={{ lineHeight: 1.1 }}>
        <div className="ink-heading" style={{ fontSize: 22, letterSpacing: '0.04em' }}>Focusan</div>
        <div className="sumi-faded" style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 4 }}>
          封印術 · Fūinjutsu · Sealing Scroll
        </div>
      </div>
    </div>
    <LanguageSwitcher currentLang={language} onLanguageChange={onLang} />
  </div>
)

const TabNav: React.FC<{ tab: Tab }> = ({ tab }) => {
  const labels: Record<Tab, string> = {
    sites: t('options.blocklist') || 'Sealed Targets',
    stats: t('options.dashboard') || 'Records',
    achievements: t('options.achievements') || 'Ranks',
    settings: t('settings.tabTitle') || 'Settings',
  }
  const order: Tab[] = ['sites', 'stats', 'achievements', 'settings']
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1.5px solid #1A1410', paddingBottom: 0 }}>
      {order.map(key => {
        const active = key === tab
        return (
          <button
            key={key}
            onClick={() => { window.location.hash = key }}
            className="brush-text"
            style={{
              background: active ? '#1A1410' : 'transparent',
              color: active ? '#E8DCB8' : '#1A1410',
              border: '1.5px solid #1A1410',
              borderBottom: active ? '1.5px solid #1A1410' : 'none',
              padding: '12px 22px 10px',
              cursor: 'pointer',
              fontSize: 13,
              letterSpacing: '0.1em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              top: active ? 0 : 1,
              marginBottom: -1,
              transition: '0.12s',
            }}
          >
            <span style={{
              fontFamily: 'Shippori Mincho, serif',
              fontSize: 20,
              fontWeight: 900,
              color: active ? '#D4A057' : '#C8252C',
              lineHeight: 1,
            }}>
              {TAB_KANJI[key]}
            </span>
            <span style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>
              {labels[key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ───────── Section header (kanji + brushed title) ───────── */
const SectionHeader: React.FC<{ kanji: string; title: string; sub?: string; index?: string }> = ({ kanji, title, sub, index }) => (
  <div style={{ marginBottom: 22 }}>
    <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
      <span
        style={{
          fontFamily: 'Shippori Mincho, serif',
          fontSize: 44,
          fontWeight: 900,
          color: '#C8252C',
          lineHeight: 1,
        }}
      >
        {kanji}
      </span>
      <div style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #2A1F14 0, #2A1F14 4px, transparent 4px, transparent 7px)', opacity: 0.5 }} />
      {index && (
        <span className="sumi-faded" style={{ fontSize: 10, letterSpacing: '0.45em', textTransform: 'uppercase' }}>
          {index}
        </span>
      )}
    </div>
    <h2 className="ink-heading" style={{ fontSize: 28, letterSpacing: '0.02em', marginBottom: 4 }}>{title}</h2>
    {sub && <p className="brush-text sumi-faded" style={{ fontSize: 13, fontStyle: 'italic' }}>{sub}</p>}
  </div>
)

/* ───────── Main App ───────── */
const FuinjutsuApp: React.FC = () => {
  const toast = useToast()
  const language = useLanguage()

  /* state — mirrored from legacy App.tsx */
  const [sites, setSites] = useState<SiteObject[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [achievements, setAchievements] = useState<AchievementsData | null>(null)
  const [achievementProgress, setAchievementProgress] = useState<Record<AchievementType, AchievementProgress> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [newSiteInput, setNewSiteInput] = useState<string>('')
  const [bulkSitesInput, setBulkSitesInput] = useState<string>('')
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [newSiteSchedule, setNewSiteSchedule] = useState<Schedule | null>(null)
  const [newSiteRules, setNewSiteRules] = useState<ConditionalRule[]>([])
  const [showNewScheduleModal, setShowNewScheduleModal] = useState<boolean>(false)
  const [showNewRulesModal, setShowNewRulesModal] = useState<boolean>(false)
  const [showPresetsModal, setShowPresetsModal] = useState<boolean>(false)
  const [challengeModeEnabled, setChallengeModeEnabled] = useState(false)
  const [schedulingHost, setSchedulingHost] = useState<{ host: string; schedule: Schedule | null } | null>(null)
  const [conditionalRulesHost, setConditionalRulesHost] = useState<{ host: string; rules: ConditionalRule[] } | null>(null)
  const [pendingAction, setPendingAction] = useState<{ type: 'delete' | 'save'; title?: string; description?: string; onConfirm: () => Promise<void> } | null>(null)
  const [currentThemeId, setCurrentThemeId] = useState<string>('focusan-fuinjutsu')

  const getTabFromHash = (): Tab => {
    const h = window.location.hash.slice(1)
    if (['sites', 'stats', 'achievements', 'settings'].includes(h)) return h as Tab
    return 'sites'
  }
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash)
  useEffect(() => {
    const fn = () => setActiveTab(getTabFromHash())
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  /* loaders */
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
      console.error('[Fūinjutsu Options] loadAll:', err)
    } finally {
      setLoading(false)
    }
  }
  const loadSites = async () => {
    try { setSites(await messagingClient.getSites()) } catch {}
  }
  const loadStats = async () => {
    try { setStats(await messagingClient.getStats()) } catch {}
  }
  const loadChallengeMode = async () => {
    const { enabled } = await messagingClient.getChallengeMode()
    setChallengeModeEnabled(enabled)
  }

  useEffect(() => {
    const init = async () => {
      await initI18n()
      await loadAllData()
      await loadChallengeMode()
      const theme = await getCurrentTheme()
      setCurrentThemeId(theme.metadata.id)
    }
    init()
  }, [])

  /* actions — mirrored from legacy */
  const checkChallenge = async (action: () => Promise<void>) => {
    if (challengeModeEnabled) {
      setPendingAction({
        type: 'delete',
        title: t('options.challengeModeTitle'),
        description: t('options.challengeModeDescription'),
        onConfirm: async () => { await action(); setPendingAction(null) },
      })
    } else { await action() }
  }

  const handleAddSite = async () => {
    const host = normalizeHost(newSiteInput)
    if (!host) { toast(t('errors.invalidDomain'), 'error'); return }
    if (sites.some(s => s.host === host)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
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
      console.error('[Fūinjutsu Options] add:', err)
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  const handleBulkAdd = async () => {
    const lines = bulkSitesInput.split('\n').filter(l => l.trim())
    const hosts = lines.map(normalizeHost).filter(Boolean) as string[]
    if (hosts.length === 0) { toast(t('errors.noValidDomains'), 'error'); return }
    try {
      for (const host of hosts) {
        if (!sites.some(s => s.host === host)) await messagingClient.addSite(host)
      }
      setBulkSitesInput('')
      await loadSites()
      toast(`${t('common.added')} ${hosts.length} ${t('options.sites')}`, 'success')
    } catch (err) {
      console.error('[Fūinjutsu Options] bulk:', err)
      toast(t('errors.failedToBulkAdd'), 'error')
    }
  }

  const handleAddPreset = async (preset: Preset) => {
    if (sites.find(s => s.host === preset.pattern)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
    try {
      await messagingClient.addSite(preset.pattern, { category: 'Smart Filter', patternType: 'regex' })
      await loadSites()
      setShowPresetsModal(false)
      toast(`${preset.name} ${t('common.added')}`, 'success')
    } catch (err) {
      toast(t('errors.failedToAdd'), 'error')
    }
  }

  const performRemoveSites = async (hosts: string[]) => {
    if (hosts.length === 0) return
    await checkChallenge(async () => {
      try {
        for (const h of hosts) await messagingClient.removeSite(h)
        await loadSites()
        setSelectedSites(prev => {
          const next = new Set(prev)
          hosts.forEach(h => next.delete(h))
          return next
        })
      } catch (err) {
        toast(t('errors.failedToRemove'), 'error')
      } finally { setPendingAction(null) }
    })
  }

  const handleRemoveSite = (host: string) => {
    setPendingAction({
      type: 'delete',
      description: t('options.deleteChallengeDescription', { host }),
      onConfirm: async () => { await performRemoveSites([host]) },
    })
  }

  const handleBulkDelete = () => {
    if (selectedSites.size === 0) return
    const hosts = Array.from(selectedSites)
    setPendingAction({
      type: 'delete',
      description: t('deleteChallenge.multipleDescription', { count: hosts.length }),
      onConfirm: async () => { await performRemoveSites(hosts) },
    })
  }

  const handleOpenSchedule = (host: string) => {
    const site = sites.find(s => s.host === host)
    setSchedulingHost({ host, schedule: (site?.schedule as Schedule) || null })
  }
  const handleSaveSchedule = async (schedule: Schedule | null) => {
    if (!schedulingHost) return
    const needs = shouldShowChallengeForSchedule(schedulingHost.schedule, schedule)
    const save = async () => {
      await checkChallenge(async () => {
        try {
          await messagingClient.updateSite(schedulingHost.host, { schedule })
          await loadSites()
          setSchedulingHost(null)
          setPendingAction(null)
        } catch { toast(t('errors.failedToSave') || 'Failed to save', 'error') }
      })
    }
    if (needs) {
      setPendingAction({ type: 'save', description: t('options.weakeningProtectionWarning'), onConfirm: save })
    } else { await save() }
  }
  const handleCancelSchedule = () => setSchedulingHost(null)

  const handleOpenConditionalRules = (host: string) => {
    const site = sites.find(s => s.host === host)
    setConditionalRulesHost({ host, rules: (site?.conditionalRules as ConditionalRule[]) || [] })
  }
  const handleSaveConditionalRules = async (rules: ConditionalRule[]) => {
    if (!conditionalRulesHost) return
    const needs = shouldShowChallengeForRules(conditionalRulesHost.rules, rules)
    const save = async () => {
      await checkChallenge(async () => {
        try {
          await messagingClient.updateSite(conditionalRulesHost.host, { conditionalRules: rules })
          await loadSites()
          setConditionalRulesHost(null)
          setPendingAction(null)
        } catch { toast(t('errors.failedToSave') || 'Failed to save', 'error') }
      })
    }
    if (needs) {
      setPendingAction({ type: 'save', description: t('options.weakeningProtectionWarning'), onConfirm: save })
    } else { await save() }
  }

  const handleExport = async () => {
    try {
      const data = await messagingClient.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `focusan-backup-${Date.now()}.json`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast(t('errors.failedToExport'), 'error') }
  }
  const handleImport = async (file: File) => {
    try { await messagingClient.importData(await file.text()); await loadAllData(); toast(t('options.importSuccess'), 'success') }
    catch { toast(t('errors.failedToImport'), 'error') }
  }

  const handleClearStats = async () => {
    if (!confirm(t('options.confirmClearStats'))) return
    await checkChallenge(async () => {
      try { await messagingClient.clearStats(); await loadStats(); toast(t('options.statsCleared'), 'success') }
      catch { toast(t('errors.failedToClearStats'), 'error') }
    })
  }

  const handleLanguageChange = async (lang: string) => {
    try { await setLanguage(lang as 'ru' | 'en') } catch {}
  }

  const handleToggleSite = (host: string) => {
    setSelectedSites(prev => {
      const next = new Set(prev)
      if (next.has(host)) next.delete(host); else next.add(host)
      return next
    })
  }
  const handleSelectAll = () => setSelectedSites(new Set(getFilteredSites().map(s => s.host)))
  const handleDeselectAll = () => setSelectedSites(new Set())

  const getFilteredSites = (): SiteObject[] =>
    categoryFilter === 'all' ? sites : sites.filter(s => s.category === categoryFilter)
  const getCategories = (): string[] => {
    const cs = new Set<string>()
    sites.forEach(s => { if (s.category) cs.add(s.category) })
    return Array.from(cs).sort()
  }
  const filteredSites = getFilteredSites()
  const categories = getCategories()

  const handleToggleChallengeMode = async () => {
    const next = !challengeModeEnabled
    setChallengeModeEnabled(next)
    await messagingClient.setChallengeMode(next)
  }

  const handlePickTheme = async (id: string) => {
    setCurrentThemeId(id)
    await applyThemeId(id)
    // reload to swap surface variants in main.tsx files
    window.location.reload()
  }

  /* ─── Loading ─── */
  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center" style={{ minHeight: 360 }}>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
            className="ink-heading" style={{ fontSize: 64, letterSpacing: '0.15em' }}>
            封
          </motion.div>
        </div>
      </PageShell>
    )
  }

  /* ─── Render ─── */
  return (
    <>
      <PageShell>
        <TabBar language={language} onLang={handleLanguageChange} />
        <TabNav tab={activeTab} />

        {/* ─── SITES TAB ─── */}
        {activeTab === 'sites' && (
          <div>
            <SectionHeader
              kanji={TAB_KANJI.sites}
              title={t('options.blocklist') || 'Sealed Targets'}
              sub={t('options.subtitleSites') || 'Bind distractions. Set conditions. Lock the path.'}
              index="01 / 04"
            />

            {/* Add seal panel */}
            <div style={{
              padding: '18px 20px',
              border: '1px dashed rgba(26, 20, 16, 0.4)',
              background: 'rgba(232, 220, 184, 0.45)',
              marginBottom: 18,
            }}>
              <div className="sumi-faded" style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 10 }}>
                結印 · Bind a new seal
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={newSiteInput}
                    onChange={e => setNewSiteInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSite() }}
                    placeholder={t('options.inputPlaceholder') || 'example.com'}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1.5px solid #1A1410',
                      outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 16,
                      color: '#1A1410',
                      padding: '8px 2px',
                    }}
                  />
                </div>
                <button onClick={handleAddSite} className="scroll-btn cinnabar" style={{ padding: '10px 22px', fontSize: 12 }}>
                  封 · {t('options.addButton') || 'Bind'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button
                  className="brush-text"
                  onClick={() => setShowNewScheduleModal(true)}
                  style={{
                    flex: 1,
                    background: newSiteSchedule ? 'rgba(200, 37, 44, 0.10)' : 'transparent',
                    border: newSiteSchedule ? '1.5px solid #C8252C' : '1px dashed rgba(26, 20, 16, 0.4)',
                    color: newSiteSchedule ? '#8B1418' : '#6B5232',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <CalendarIcon size={14} />
                  {t('options.scheduleButtonTitle') || t('options.setSchedule') || 'Schedule'}
                  {newSiteSchedule && <span className="seal-stamp-cinnabar" style={{ fontSize: 9, padding: '1px 4px', marginLeft: 4 }}>✓</span>}
                </button>
                <button
                  className="brush-text"
                  onClick={() => setShowNewRulesModal(true)}
                  style={{
                    flex: 1,
                    background: newSiteRules.length ? 'rgba(200, 37, 44, 0.10)' : 'transparent',
                    border: newSiteRules.length ? '1.5px solid #C8252C' : '1px dashed rgba(26, 20, 16, 0.4)',
                    color: newSiteRules.length ? '#8B1418' : '#6B5232',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <ShuffleIcon size={14} />
                  {t('options.conditionsButtonTitle') || t('options.setConditions') || 'Conditions'}
                  {newSiteRules.length > 0 && <span className="seal-stamp-cinnabar" style={{ fontSize: 9, padding: '1px 4px', marginLeft: 4 }}>{newSiteRules.length}</span>}
                </button>
                <button
                  className="brush-text"
                  onClick={() => setShowPresetsModal(true)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px dashed rgba(26, 20, 16, 0.4)',
                    color: '#6B5232',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <LayoutIcon size={14} />
                  {t('options.smartFilters') || 'Smart Filters'}
                </button>
              </div>
            </div>

            {/* Bulk-selection bar */}
            <AnimatePresence>
              {selectedSites.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 16px',
                    background: '#1A1410', color: '#E8DCB8',
                    marginBottom: 12,
                    position: 'sticky', top: 8, zIndex: 5,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="ink-heading" style={{ fontSize: 18, color: '#D4A057' }}>{selectedSites.size}</span>
                    <span className="brush-text" style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#E8DCB8' }}>
                      {t('options.selectedItems') || 'Selected'}
                    </span>
                    <button onClick={handleSelectAll} className="brush-text" style={{ background: 'transparent', border: '1px solid #D4A057', color: '#D4A057', padding: '3px 10px', cursor: 'pointer', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {t('options.selectAll') || 'All'}
                    </button>
                    <button onClick={handleDeselectAll} className="brush-text" style={{ background: 'transparent', border: '1px solid rgba(232,220,184,0.4)', color: '#E8DCB8', padding: '3px 10px', cursor: 'pointer', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {t('options.clearSelection') || 'Clear'}
                    </button>
                  </div>
                  <button onClick={handleBulkDelete} className="scroll-btn cinnabar" style={{ padding: '6px 16px', fontSize: 11 }}>
                    {t('options.deleteSelected') || 'Release Seals'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filters + export/import */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px',
              background: 'rgba(26, 20, 16, 0.06)',
              borderBottom: '1.5px solid rgba(26, 20, 16, 0.25)',
            }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
                  {t('options.allCategories') || 'All'}
                </FilterChip>
                {categories.map(c => (
                  <FilterChip key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>{c}</FilterChip>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleExport} className="brush-text" style={{ background: 'transparent', border: 'none', color: '#6B5232', cursor: 'pointer', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  {t('options.exportJson') || 'Export'}
                </button>
                <span style={{ color: '#6B5232' }}>·</span>
                <button onClick={() => {
                  const inp = document.createElement('input')
                  inp.type = 'file'; inp.accept = '.json'
                  inp.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImport(f) }
                  inp.click()
                }} className="brush-text" style={{ background: 'transparent', border: 'none', color: '#6B5232', cursor: 'pointer', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  {t('options.importJson') || 'Import'}
                </button>
              </div>
            </div>

            {/* Site list — inked entries */}
            <div style={{
              border: '1px solid rgba(26, 20, 16, 0.25)',
              borderTop: 'none',
              maxHeight: 560, overflowY: 'auto',
            }}>
              {filteredSites.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div className="ink-heading" style={{ fontSize: 56, color: 'rgba(26,20,16,0.15)', marginBottom: 12 }}>空</div>
                  <div className="brush-text sumi-faded" style={{ fontSize: 13, fontStyle: 'italic' }}>
                    {t('options.emptyList') || 'No seals bound yet'}
                  </div>
                </div>
              ) : (
                filteredSites.map((site, i) => {
                  const isSelected = selectedSites.has(site.host)
                  return (
                    <div
                      key={site.host}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderBottom: i === filteredSites.length - 1 ? 'none' : '1px dashed rgba(26, 20, 16, 0.18)',
                        background: isSelected ? 'rgba(200, 37, 44, 0.08)' : 'transparent',
                        transition: '0.12s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(232, 220, 184, 0.35)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                        <button
                          onClick={() => handleToggleSite(site.host)}
                          style={{
                            width: 22, height: 22,
                            border: '1.5px solid #1A1410',
                            background: isSelected ? '#C8252C' : 'transparent',
                            color: '#E8DCB8',
                            cursor: 'pointer',
                            fontFamily: 'Shippori Mincho, serif',
                            fontWeight: 900,
                            fontSize: 12,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: '0.12s',
                            boxShadow: isSelected ? 'inset 0 0 0 1px rgba(232,220,184,0.4), 0 1px 2px rgba(139,20,24,0.4)' : 'none',
                          }}
                          aria-label={`Toggle ${site.host}`}
                        >
                          {isSelected ? '封' : ''}
                        </button>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 14,
                            color: '#1A1410',
                            fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {site.host}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {site.category && (
                              <span className="brush-text" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', background: '#1A1410', color: '#E8DCB8', padding: '1px 6px' }}>
                                {site.category}
                              </span>
                            )}
                            {site.schedule && (
                              <span className="brush-text" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8B1418', border: '1px solid rgba(139,20,24,0.4)', padding: '0 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CalendarIcon size={9} /> {t('options.scheduleLabel') || 'Schedule'}
                              </span>
                            )}
                            {site.conditionalRules && site.conditionalRules.length > 0 && (
                              <span className="brush-text" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8B1418', border: '1px solid rgba(139,20,24,0.4)', padding: '0 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <ShuffleIcon size={9} /> {t('options.conditionsLabel') || 'Rules'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <IconBtn onClick={() => handleOpenSchedule(site.host)} title="Schedule"><CalendarIcon size={14} /></IconBtn>
                        <IconBtn onClick={() => handleOpenConditionalRules(site.host)} title="Conditions"><ShuffleIcon size={14} /></IconBtn>
                        <IconBtn onClick={() => handleRemoveSite(site.host)} title="Release" danger><XIcon size={14} /></IconBtn>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bulk add bottom */}
            <div style={{ marginTop: 24, padding: '16px 18px', border: '1px dashed rgba(26, 20, 16, 0.4)', background: 'rgba(232, 220, 184, 0.35)' }}>
              <div className="sumi-faded" style={{ fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>
                巻物転写 · {t('options.bulkAdd') || 'Bulk transfer'}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <textarea
                  value={bulkSitesInput}
                  onChange={e => setBulkSitesInput(e.target.value)}
                  placeholder={t('options.pasteDomains') || 'one host per line'}
                  rows={3}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 252, 240, 0.5)',
                    border: '1px solid rgba(26, 20, 16, 0.3)',
                    outline: 'none',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    color: '#1A1410',
                    padding: '8px 12px',
                    resize: 'vertical',
                    minHeight: 60,
                  }}
                />
                <button onClick={handleBulkAdd} className="scroll-btn" style={{ padding: '10px 18px', fontSize: 11 }}>
                  {t('options.addList') || 'Transfer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STATS TAB ─── */}
        {activeTab === 'stats' && stats && (
          <div>
            <SectionHeader
              kanji={TAB_KANJI.stats}
              title={t('options.dashboard') || 'Records'}
              sub={t('options.subtitleStats') || 'The chronicle of every seal that held'}
              index="02 / 04"
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
              <ScrollStat kanji="封" label={t('stats.totalBlocks') || 'Total seals held'} value={stats.totalBlocks} cinnabar />
              <ScrollStat kanji="連" label={t('stats.streakDays') || 'Streak (days)'} value={stats.streakDays} gold />
              <ScrollStat kanji="数" label={t('stats.totalSites') || 'Bound targets'} value={stats.totalSites} />
            </div>

            <div style={{ marginBottom: 32 }}>
              <h3 className="ink-heading" style={{ fontSize: 18, marginBottom: 12 }}>{t('stats.heatmap') || 'Heatmap'}</h3>
              <div style={{ padding: 20, border: '1px solid rgba(26, 20, 16, 0.25)', background: 'rgba(232, 220, 184, 0.35)', overflowX: 'auto' }}>
                <Heatmap data={stats.minutesByDate || {}} />
              </div>
            </div>

            <div>
              <h3 className="ink-heading" style={{ fontSize: 18, marginBottom: 12 }}>{t('options.mostBlocked') || 'Most-sealed'}</h3>
              <div style={{ border: '1px solid rgba(26, 20, 16, 0.25)' }}>
                {Object.entries(stats.bySite).length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <div className="brush-text sumi-faded" style={{ fontSize: 13, fontStyle: 'italic' }}>{t('options.noData') || 'No records yet'}</div>
                  </div>
                ) : (
                  Object.entries(stats.bySite)
                    .sort(([, a], [, b]) => b.blocks - a.blocks)
                    .slice(0, 10)
                    .map(([host, ss], i, arr) => (
                      <div key={host} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 18px',
                        borderBottom: i === arr.length - 1 ? 'none' : '1px dashed rgba(26, 20, 16, 0.18)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span className="ink-heading" style={{ fontSize: 18, color: '#C8252C', minWidth: 28, textAlign: 'center' }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#1A1410' }}>{host}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 120, height: 4, background: 'rgba(26, 20, 16, 0.15)' }}>
                            <div style={{ width: `${Math.min(100, (ss.blocks / (stats.totalBlocks || 1)) * 100)}%`, height: '100%', background: '#C8252C' }} />
                          </div>
                          <span className="ink-heading" style={{ fontSize: 16, color: '#8B1418', minWidth: 50, textAlign: 'right' }}>{ss.blocks}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <button onClick={handleClearStats} className="brush-text" style={{ background: 'transparent', border: 'none', color: '#8B1418', cursor: 'pointer', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'underline' }}>
                {t('options.clearStats') || 'Burn the chronicle'}
              </button>
            </div>
          </div>
        )}

        {/* ─── ACHIEVEMENTS TAB ─── */}
        {activeTab === 'achievements' && achievements && achievementProgress && (
          <div>
            <SectionHeader
              kanji={TAB_KANJI.achievements}
              title={t('options.achievements') || 'Ranks'}
              sub={t('options.subtitleAchievements') || 'Each rank earned with sealed temptation'}
              index="03 / 04"
            />

            <div style={{ padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(26, 20, 16, 0.25)', background: 'rgba(232, 220, 184, 0.35)', marginBottom: 24, position: 'relative' }}>
              <div className="ink-heading" style={{ fontSize: 72, lineHeight: 1, marginBottom: 6 }}>
                {achievements.unlocked.length}
                <span className="sumi-faded" style={{ fontSize: 28, fontWeight: 400 }}> / {Object.keys(ACHIEVEMENT_DEFINITIONS).length}</span>
              </div>
              <div className="brush-text" style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C8252C', marginBottom: 18 }}>
                {t('options.unlockedAchievements') || 'Ranks earned'}
              </div>
              <div style={{ maxWidth: 420, margin: '0 auto', height: 4, background: 'rgba(26, 20, 16, 0.15)' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((achievements.unlocked.length / Object.keys(ACHIEVEMENT_DEFINITIONS).length) * 100)}%`,
                  background: 'linear-gradient(90deg, #C8252C, #D4A057)',
                  transition: 'width 1s',
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
                const at = type as AchievementType
                const progress = achievementProgress[at]
                const isUnlocked = achievements.unlocked.includes(at)
                const pct = Math.round(progress?.progress || 0)
                return (
                  <div key={type} style={{
                    padding: '16px 18px',
                    border: isUnlocked ? '1.5px solid #C8252C' : '1px dashed rgba(26, 20, 16, 0.3)',
                    background: isUnlocked ? 'rgba(212, 160, 87, 0.10)' : 'rgba(232, 220, 184, 0.35)',
                    position: 'relative',
                  }}>
                    {isUnlocked && (
                      <span className="seal-stamp-cinnabar" style={{ position: 'absolute', top: -10, right: 12, fontSize: 12 }}>免</span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontFamily: 'Shippori Mincho, serif', fontWeight: 900, fontSize: 32, color: isUnlocked ? '#8B1418' : 'rgba(26,20,16,0.4)', lineHeight: 1 }}>
                        段
                      </span>
                      {!isUnlocked && (
                        <span className="brush-text" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#6B5232', fontFamily: 'JetBrains Mono, monospace' }}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    <h4 className="ink-heading" style={{ fontSize: 15, marginBottom: 4 }}>{def.name}</h4>
                    <p className="brush-text sumi-faded" style={{ fontSize: 12, marginBottom: 12, minHeight: 32 }}>
                      {def.description}
                    </p>
                    <div style={{ height: 3, background: 'rgba(26, 20, 16, 0.15)' }}>
                      <div style={{
                        height: '100%',
                        width: `${isUnlocked ? 100 : pct}%`,
                        background: isUnlocked ? 'linear-gradient(90deg, #C8252C, #D4A057)' : '#C8252C',
                        opacity: isUnlocked ? 1 : 0.6,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <div>
            <SectionHeader
              kanji={TAB_KANJI.settings}
              title={t('settings.tabTitle') || 'Settings'}
              sub="Sharpen the seal. Choose the scroll."
              index="04 / 04"
            />

            {/* Challenge mode */}
            <div style={{ padding: '20px 22px', border: '1px solid rgba(26, 20, 16, 0.25)', background: 'rgba(232, 220, 184, 0.45)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
                    <span className="seal-stamp-cinnabar" style={{ fontSize: 14 }}>禁</span>
                    <h4 className="ink-heading" style={{ fontSize: 16 }}>{t('friction.settingsTitle') || 'Friction mode'}</h4>
                  </div>
                  <p className="brush-text sumi-faded" style={{ fontSize: 13, paddingLeft: 38 }}>
                    {t('friction.settingsDescription') || 'Require a challenge to weaken any seal.'}
                  </p>
                </div>
                <button
                  onClick={handleToggleChallengeMode}
                  aria-pressed={challengeModeEnabled}
                  style={{
                    position: 'relative',
                    width: 56, height: 28,
                    background: challengeModeEnabled ? '#C8252C' : 'rgba(26, 20, 16, 0.25)',
                    border: '1.5px solid #1A1410',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: '0.18s',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 2, left: challengeModeEnabled ? 28 : 2,
                    width: 22, height: 22,
                    background: '#E8DCB8',
                    border: '1.5px solid #1A1410',
                    transition: '0.18s',
                  }} />
                </button>
              </div>
            </div>

            {/* Theme picker */}
            <div style={{ padding: '20px 22px', border: '1px solid rgba(26, 20, 16, 0.25)', background: 'rgba(232, 220, 184, 0.45)' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <span style={{ fontFamily: 'Shippori Mincho, serif', fontSize: 26, fontWeight: 900, color: '#8B1418' }}>色</span>
                <div>
                  <h4 className="ink-heading" style={{ fontSize: 16, marginBottom: 2 }}>{t('bushido.theWay') || 'Scroll Style'}</h4>
                  <p className="brush-text sumi-faded" style={{ fontSize: 12, fontStyle: 'italic' }}>
                    Three paths. The current scroll reloads on switch.
                  </p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { id: 'focusan',           kanji: '黒', label: 'Kuro',      bg: '#0B0A0A', fg: '#F2E9D8', accent: '#B82E2E' },
                  { id: 'focusan-shiro',     kanji: '白', label: 'Shiro',     bg: '#F4EDE0', fg: '#1A1410', accent: '#B82E2E' },
                  { id: 'focusan-fuinjutsu', kanji: '封', label: 'Fūinjutsu', bg: '#E8DCB8', fg: '#1A1410', accent: '#C8252C' },
                ].map(opt => {
                  const active = currentThemeId === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePickTheme(opt.id)}
                      style={{
                        background: opt.bg,
                        color: opt.fg,
                        border: active ? `2px solid ${opt.accent}` : '1.5px solid #1A1410',
                        padding: '16px 14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: active ? `0 0 0 1px ${opt.accent}, 0 4px 12px rgba(0,0,0,0.25)` : '0 2px 6px rgba(0,0,0,0.18)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontFamily: 'Shippori Mincho, serif', fontWeight: 900, fontSize: 36, color: opt.accent, lineHeight: 1 }}>{opt.kanji}</span>
                        {active && (
                          <span style={{ background: opt.accent, color: opt.bg, padding: '2px 6px', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Shippori Mincho, serif', fontWeight: 700 }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'Shippori Mincho, serif', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{opt.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </PageShell>

      {/* ─── Modals ─── */}
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

        {showPresetsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(15, 11, 5, 0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowPresetsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10"
              style={{
                width: '100%', maxWidth: 520,
                background: '#E8DCB8',
                border: '3px solid #1A1410',
                boxShadow: '8px 8px 0 rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ padding: '18px 20px', borderBottom: '1.5px solid #1A1410', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <span className="seal-stamp-cinnabar" style={{ fontSize: 14 }}>選</span>
                  <h3 className="ink-heading" style={{ fontSize: 18 }}>Smart Filters</h3>
                </div>
                <button onClick={() => setShowPresetsModal(false)} className="brush-text" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B5232', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ padding: 8, maxHeight: '60vh', overflowY: 'auto' }}>
                {BLOCKING_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleAddPreset(preset)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px dashed rgba(26, 20, 16, 0.2)',
                      cursor: 'pointer',
                      display: 'block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200, 37, 44, 0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className="ink-heading" style={{ fontSize: 14 }}>{preset.name}</span>
                      <span className="brush-text sumi-faded" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{preset.host}</span>
                    </div>
                    <p className="brush-text sumi-faded" style={{ fontSize: 12 }}>{preset.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {showNewScheduleModal && (
          <ScheduleModal
            host={newSiteInput || t('common.newSite') || 'New Site'}
            initialSchedule={newSiteSchedule}
            onSave={s => { setNewSiteSchedule(s); setShowNewScheduleModal(false) }}
            onCancel={() => setShowNewScheduleModal(false)}
          />
        )}
        {showNewRulesModal && (
          <ConditionalRulesModal
            host={newSiteInput || t('common.newSite') || 'New Site'}
            initialRules={newSiteRules}
            onSave={r => { setNewSiteRules(r); setShowNewRulesModal(false) }}
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
    </>
  )
}

/* ───────── Small helpers ───────── */
const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="brush-text"
    style={{
      padding: '4px 12px',
      fontSize: 11,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      background: active ? '#1A1410' : 'transparent',
      color: active ? '#E8DCB8' : '#6B5232',
      border: '1px solid #1A1410',
      cursor: 'pointer',
      transition: '0.12s',
    }}
  >
    {children}
  </button>
)

const IconBtn: React.FC<{ onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }> = ({ onClick, title, danger, children }) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={title}
    style={{
      width: 30, height: 30,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: danger ? '#8B1418' : '#6B5232',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: '0.12s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = danger ? 'rgba(200, 37, 44, 0.12)' : 'rgba(26, 20, 16, 0.08)'
      e.currentTarget.style.color = danger ? '#C8252C' : '#1A1410'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = danger ? '#8B1418' : '#6B5232'
    }}
  >
    {children}
  </button>
)

const ScrollStat: React.FC<{ kanji: string; label: string; value: number; cinnabar?: boolean; gold?: boolean }> = ({ kanji, label, value, cinnabar, gold }) => {
  const accent = cinnabar ? '#C8252C' : gold ? '#D4A057' : '#6B7548'
  return (
    <div style={{ padding: '20px 20px 18px', border: '1px solid rgba(26, 20, 16, 0.25)', background: 'rgba(232, 220, 184, 0.45)', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Shippori Mincho, serif', fontWeight: 900, fontSize: 40, color: accent, lineHeight: 1 }}>{kanji}</span>
        <span className="brush-text sumi-faded" style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 36,
        fontWeight: 300,
        color: '#1A1410',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  )
}

export default FuinjutsuApp
