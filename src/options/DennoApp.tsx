/**
 * Dennō (電脳) Options — Netrunner HUD
 * Same data flow as App.tsx, terminal-grid layout.
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
import { getCurrentTheme, setTheme as setThemeId } from '../shared/themes'

type Tab = 'sites' | 'stats' | 'achievements' | 'settings'

const TAB_CMD: Record<Tab, string> = {
  sites: 'ls --targets',
  stats: 'stat -r',
  achievements: 'rank --all',
  settings: 'conf',
}

const hashHex = (s: string, len = 6) => {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(0, len)
}

const clock = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

const DennoOptions: React.FC = () => {
  const toast = useToast()
  const language = useLanguage()

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
  const [currentThemeId, setCurrentThemeIdState] = useState<string>('focusan-denno')
  const [now, setNow] = useState<number>(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

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

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [s, st, ac] = await Promise.all([
        messagingClient.getSites(),
        messagingClient.getStats(),
        messagingClient.getAchievements(),
      ])
      setSites(s); setStats(st); setAchievements(ac as AchievementsData)
      if (st) setAchievementProgress(await getAchievementProgress(st, s))
    } catch (err) { console.error('[Dennō Options] loadAll:', err) }
    finally { setLoading(false) }
  }
  const loadSites = async () => { try { setSites(await messagingClient.getSites()) } catch {} }
  const loadStats = async () => { try { setStats(await messagingClient.getStats()) } catch {} }
  const loadChallengeMode = async () => { const { enabled } = await messagingClient.getChallengeMode(); setChallengeModeEnabled(enabled) }

  useEffect(() => {
    const init = async () => {
      await initI18n(); await loadAllData(); await loadChallengeMode()
      const theme = await getCurrentTheme()
      setCurrentThemeIdState(theme.metadata.id)
    }
    init()
  }, [])

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

  /* mirrored handlers */
  const handleAddSite = async () => {
    const host = normalizeHost(newSiteInput)
    if (!host) { toast(t('errors.invalidDomain'), 'error'); return }
    if (sites.some(s => s.host === host)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
    try {
      await messagingClient.addSite(host, {
        schedule: newSiteSchedule,
        conditionalRules: newSiteRules.length > 0 ? newSiteRules : undefined,
      })
      setNewSiteInput(''); setNewSiteSchedule(null); setNewSiteRules([])
      await loadSites()
      toast(`${host} ${t('common.added')}`, 'success')
    } catch (err) { toast(t('errors.failedToAdd'), 'error') }
  }
  const handleBulkAdd = async () => {
    const lines = bulkSitesInput.split('\n').filter(l => l.trim())
    const hosts = lines.map(normalizeHost).filter(Boolean) as string[]
    if (hosts.length === 0) { toast(t('errors.noValidDomains'), 'error'); return }
    try {
      for (const h of hosts) if (!sites.some(s => s.host === h)) await messagingClient.addSite(h)
      setBulkSitesInput(''); await loadSites()
      toast(`${t('common.added')} ${hosts.length} ${t('options.sites')}`, 'success')
    } catch { toast(t('errors.failedToBulkAdd'), 'error') }
  }
  const handleAddPreset = async (preset: Preset) => {
    if (sites.find(s => s.host === preset.pattern)) { toast(t('errors.siteAlreadyAdded'), 'error'); return }
    try {
      await messagingClient.addSite(preset.pattern, { category: 'Smart Filter', patternType: 'regex' })
      await loadSites(); setShowPresetsModal(false)
      toast(`${preset.name} ${t('common.added')}`, 'success')
    } catch { toast(t('errors.failedToAdd'), 'error') }
  }
  const performRemoveSites = async (hosts: string[]) => {
    if (hosts.length === 0) return
    await checkChallenge(async () => {
      try {
        for (const h of hosts) await messagingClient.removeSite(h)
        await loadSites()
        setSelectedSites(prev => { const n = new Set(prev); hosts.forEach(h => n.delete(h)); return n })
      } catch { toast(t('errors.failedToRemove'), 'error') }
      finally { setPendingAction(null) }
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
          await loadSites(); setSchedulingHost(null); setPendingAction(null)
        } catch { toast(t('errors.failedToSave') || 'Failed to save', 'error') }
      })
    }
    if (needs) {
      setPendingAction({ type: 'save', description: t('options.weakeningProtectionWarning'), onConfirm: save })
    } else { await save() }
  }
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
          await loadSites(); setConditionalRulesHost(null); setPendingAction(null)
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
      const a = document.createElement('a'); a.href = url; a.download = `focusan-backup-${Date.now()}.json`; a.click()
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
    setSelectedSites(prev => { const n = new Set(prev); if (n.has(host)) n.delete(host); else n.add(host); return n })
  }
  const handleSelectAll = () => setSelectedSites(new Set(getFilteredSites().map(s => s.host)))
  const handleDeselectAll = () => setSelectedSites(new Set())
  const getFilteredSites = (): SiteObject[] =>
    categoryFilter === 'all' ? sites : sites.filter(s => s.category === categoryFilter)
  const getCategories = (): string[] => {
    const cs = new Set<string>(); sites.forEach(s => { if (s.category) cs.add(s.category) }); return Array.from(cs).sort()
  }
  const filteredSites = getFilteredSites()
  const categories = getCategories()

  const handleToggleChallengeMode = async () => {
    const next = !challengeModeEnabled
    setChallengeModeEnabled(next)
    await messagingClient.setChallengeMode(next)
  }
  const handlePickTheme = async (id: string) => {
    setCurrentThemeIdState(id)
    await setThemeId(id)
    window.location.reload()
  }

  /* ─── loading ─── */
  if (loading) {
    return (
      <Shell now={now}>
        <div style={{ padding: 60, textAlign: 'center' }}>
          <span className="hud-display cursor-blink" style={{ fontSize: 16, color: '#FFD577', letterSpacing: '0.3em' }}>BOOTING_FOCUSAN</span>
        </div>
      </Shell>
    )
  }

  return (
    <>
      <Shell
        now={now}
        language={language}
        onLang={handleLanguageChange}
        tab={activeTab}
      >
        {/* ─── SITES TAB ─── */}
        {activeTab === 'sites' && (
          <div>
            <SectionHeading kanji="門" cmd="ls --targets" title="TARGET_REGISTRY" index="01/04" />

            {/* Add target */}
            <div className="hud-panel hud-panel-hi" style={{ marginBottom: 16 }}>
              <div className="hud-panel-head">
                <span>+ bind_target.cmd</span>
                <span className="hud-status armed">INPUT</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={newSiteInput}
                  onChange={e => setNewSiteInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSite() }}
                  placeholder=">> hostname.tld"
                  style={{ flex: 1, fontSize: 13, padding: '10px 12px' }}
                />
                <button onClick={handleAddSite} className="hud-btn primary" style={{ padding: '10px 18px', fontSize: 12 }}>
                  BIND
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowNewScheduleModal(true)} className="hud-btn" style={{ flex: 1, padding: '7px 10px', fontSize: 10, borderStyle: newSiteSchedule ? 'solid' : 'dashed', color: newSiteSchedule ? '#FFD577' : '#8A6B2C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CalendarIcon size={11} /> SCHEDULE
                  {newSiteSchedule && <span className="hud-hex">[SET]</span>}
                </button>
                <button onClick={() => setShowNewRulesModal(true)} className="hud-btn" style={{ flex: 1, padding: '7px 10px', fontSize: 10, borderStyle: newSiteRules.length ? 'solid' : 'dashed', color: newSiteRules.length ? '#FFD577' : '#8A6B2C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <ShuffleIcon size={11} /> RULES
                  {newSiteRules.length > 0 && <span className="hud-hex">[{newSiteRules.length}]</span>}
                </button>
                <button onClick={() => setShowPresetsModal(true)} className="hud-btn indigo" style={{ flex: 1, padding: '7px 10px', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <LayoutIcon size={11} /> PRESETS
                </button>
              </div>
            </div>

            {/* Bulk-select bar */}
            <AnimatePresence>
              {selectedSites.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 14px',
                    background: 'rgba(232, 184, 71, 0.10)',
                    border: '1px solid #E8B847',
                    marginBottom: 12,
                    position: 'sticky', top: 8, zIndex: 5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="hud-display" style={{ fontSize: 18, color: '#FFD577' }}>{selectedSites.size}</span>
                    <span className="hud-label">selected</span>
                    <button onClick={handleSelectAll} className="hud-btn" style={{ padding: '3px 10px', fontSize: 9 }}>ALL</button>
                    <button onClick={handleDeselectAll} className="hud-btn" style={{ padding: '3px 10px', fontSize: 9 }}>NONE</button>
                  </div>
                  <button onClick={handleBulkDelete} className="hud-btn signal" style={{ padding: '6px 14px', fontSize: 10 }}>
                    PURGE_SELECTED
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter + io */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(15, 20, 27, 0.6)',
              border: '1px solid rgba(232, 184, 71, 0.18)',
              borderBottom: 'none',
            }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <FilterPill active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>all</FilterPill>
                {categories.map(c => (
                  <FilterPill key={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)}>{c}</FilterPill>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={handleExport} className="hud-btn indigo" style={{ padding: '4px 10px', fontSize: 9 }}>EXPORT</button>
                <button
                  onClick={() => {
                    const inp = document.createElement('input')
                    inp.type = 'file'; inp.accept = '.json'
                    inp.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleImport(f) }
                    inp.click()
                  }}
                  className="hud-btn indigo" style={{ padding: '4px 10px', fontSize: 9 }}
                >IMPORT</button>
              </div>
            </div>

            {/* Site table */}
            <div style={{
              border: '1px solid rgba(232, 184, 71, 0.18)',
              borderTop: 'none',
              background: 'rgba(10, 13, 18, 0.55)',
              maxHeight: 560, overflowY: 'auto',
            }}>
              {/* table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '32px 80px 1fr 200px 110px',
                gap: 8, padding: '8px 12px',
                borderBottom: '1px solid rgba(232, 184, 71, 0.2)',
                background: 'rgba(0,0,0,0.4)',
                fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6B2C',
              }}>
                <span></span><span>id</span><span>host</span><span>tags</span><span style={{ textAlign: 'right' }}>actions</span>
              </div>

              {filteredSites.length === 0 ? (
                <div style={{ padding: 50, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#5A6171', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                    -- no targets registered --
                  </div>
                </div>
              ) : filteredSites.map((site) => {
                const selected = selectedSites.has(site.host)
                const id = hashHex(site.host, 6)
                return (
                  <div key={site.host} style={{
                    display: 'grid', gridTemplateColumns: '32px 80px 1fr 200px 110px',
                    gap: 8, padding: '10px 12px',
                    borderBottom: '1px dashed rgba(232, 184, 71, 0.12)',
                    background: selected ? 'rgba(232, 184, 71, 0.08)' : 'transparent',
                    alignItems: 'center',
                    transition: '0.1s',
                  }}>
                    <button
                      onClick={() => handleToggleSite(site.host)}
                      style={{
                        width: 16, height: 16,
                        border: '1px solid #E8B847',
                        background: selected ? '#E8B847' : 'transparent',
                        cursor: 'pointer',
                        color: '#050608',
                        fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: selected ? '0 0 6px rgba(232,184,71,0.6)' : 'none',
                      }}
                    >
                      {selected ? '✓' : ''}
                    </button>
                    <span className="hud-hex">0x{id}</span>
                    <span className="hud-mono" style={{ fontSize: 12, color: '#FFD577', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {site.host}
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {site.category && <Tag>{site.category}</Tag>}
                      {site.schedule && <Tag><CalendarIcon size={9} /> SCHED</Tag>}
                      {site.conditionalRules && site.conditionalRules.length > 0 && <Tag><ShuffleIcon size={9} /> RULES</Tag>}
                    </div>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <IconBtn onClick={() => handleOpenSchedule(site.host)} title="Schedule"><CalendarIcon size={13} /></IconBtn>
                      <IconBtn onClick={() => handleOpenConditionalRules(site.host)} title="Rules"><ShuffleIcon size={13} /></IconBtn>
                      <IconBtn onClick={() => handleRemoveSite(site.host)} title="Purge" danger><XIcon size={13} /></IconBtn>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bulk transfer */}
            <div className="hud-panel" style={{ marginTop: 22 }}>
              <div className="hud-panel-head">
                <span>bulk_transfer.in</span>
                <span className="hud-label">stdin</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <textarea
                  value={bulkSitesInput}
                  onChange={e => setBulkSitesInput(e.target.value)}
                  placeholder="one_host_per_line"
                  rows={3}
                  style={{ flex: 1, fontSize: 12, padding: '8px 10px', minHeight: 70 }}
                />
                <button onClick={handleBulkAdd} className="hud-btn" style={{ padding: '8px 14px', fontSize: 10 }}>TRANSFER</button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STATS TAB ─── */}
        {activeTab === 'stats' && stats && (
          <div>
            <SectionHeading kanji="記" cmd="stat -r" title="CHRONICLE.log" index="02/04" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 26 }}>
              <StatPanel kanji="封" label="TOTAL_BLOCKS" value={stats.totalBlocks} accent="#FFD577" />
              <StatPanel kanji="連" label="STREAK_DAYS" value={stats.streakDays} accent="#6B7EF5" />
              <StatPanel kanji="数" label="REGISTERED" value={stats.totalSites} accent="#5FE89B" />
            </div>

            <div className="hud-panel" style={{ marginBottom: 26 }}>
              <div className="hud-panel-head">
                <span>heatmap_minutes.viz</span>
                <span className="hud-label">7d × 53w</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <Heatmap data={stats.minutesByDate || {}} />
              </div>
            </div>

            <div className="hud-panel">
              <div className="hud-panel-head">
                <span>top_targets // grep -n head -10</span>
                <span className="hud-label">freq desc</span>
              </div>
              {Object.entries(stats.bySite).length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: '#5A6171', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                  -- no records --
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '40px 80px 1fr 160px 60px',
                    gap: 8, padding: '6px 0', marginBottom: 4,
                    fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#8A6B2C',
                    borderBottom: '1px solid rgba(232, 184, 71, 0.15)',
                  }}>
                    <span>rk</span><span>id</span><span>host</span><span>load</span><span style={{ textAlign: 'right' }}>n</span>
                  </div>
                  {Object.entries(stats.bySite)
                    .sort(([, a], [, b]) => b.blocks - a.blocks)
                    .slice(0, 10)
                    .map(([host, ss], i) => {
                      const pct = Math.min(100, (ss.blocks / (stats.totalBlocks || 1)) * 100)
                      const w = 20
                      const f = Math.round((pct / 100) * w)
                      return (
                        <div key={host} style={{
                          display: 'grid', gridTemplateColumns: '40px 80px 1fr 160px 60px',
                          gap: 8, padding: '7px 0', alignItems: 'center',
                          borderBottom: '1px dashed rgba(232, 184, 71, 0.08)',
                          fontSize: 12,
                        }}>
                          <span className="hud-display" style={{ color: i < 3 ? '#FFD577' : '#8A6B2C' }}>{String(i + 1).padStart(2, '0')}</span>
                          <span className="hud-hex">0x{hashHex(host, 6)}</span>
                          <span className="hud-mono" style={{ color: '#FFD577', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{host}</span>
                          <span className="hud-mono" style={{ fontSize: 11, color: '#E8B847', letterSpacing: '-0.04em' }}>
                            <span style={{ color: '#E8B847' }}>{'█'.repeat(f)}</span><span style={{ color: '#4A3818' }}>{'░'.repeat(w - f)}</span>
                          </span>
                          <span className="hud-mono" style={{ color: '#FFD577', textAlign: 'right' }}>{ss.blocks}</span>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button onClick={handleClearStats} className="hud-btn signal" style={{ padding: '8px 16px', fontSize: 10 }}>
                PURGE_CHRONICLE
              </button>
            </div>
          </div>
        )}

        {/* ─── ACHIEVEMENTS TAB ─── */}
        {activeTab === 'achievements' && achievements && achievementProgress && (
          <div>
            <SectionHeading kanji="段" cmd="rank --all" title="RANK_TABLE" index="03/04" />

            <div className="hud-panel hud-panel-hi" style={{ marginBottom: 22, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
                <span className="hud-display" style={{ fontSize: 72, color: '#FFD577', lineHeight: 1, textShadow: '0 0 18px rgba(255,213,119,0.5)' }}>
                  {achievements.unlocked.length}
                </span>
                <span className="hud-display" style={{ fontSize: 24, color: '#5A6171' }}>
                  / {Object.keys(ACHIEVEMENT_DEFINITIONS).length}
                </span>
              </div>
              <div className="hud-label" style={{ marginBottom: 14 }}>RANKS_ACHIEVED</div>
              <div style={{ maxWidth: 420, margin: '0 auto', height: 6, background: '#4A3818', border: '1px solid rgba(232,184,71,0.3)' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((achievements.unlocked.length / Object.keys(ACHIEVEMENT_DEFINITIONS).length) * 100)}%`,
                  background: 'linear-gradient(90deg, #E8B847, #FFD577)',
                  boxShadow: '0 0 12px rgba(232,184,71,0.5)',
                  transition: 'width 1s',
                }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
                const at = type as AchievementType
                const progress = achievementProgress[at]
                const unlocked = achievements.unlocked.includes(at)
                const pct = Math.round(progress?.progress || 0)
                return (
                  <div key={type} className="hud-panel" style={{
                    borderColor: unlocked ? '#E8B847' : 'rgba(232, 184, 71, 0.15)',
                    boxShadow: unlocked ? 'var(--amber-glow)' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <span style={{
                        fontFamily: 'Noto Sans JP, sans-serif', fontWeight: 900, fontSize: 32,
                        color: unlocked ? '#FFD577' : 'rgba(232, 184, 71, 0.25)',
                        lineHeight: 1,
                        textShadow: unlocked ? '0 0 8px rgba(255,213,119,0.4)' : 'none',
                      }}>
                        段
                      </span>
                      {unlocked
                        ? <span className="hud-status armed">UNLOCKED</span>
                        : <span className="hud-mono" style={{ fontSize: 11, color: '#8A6B2C' }}>{String(pct).padStart(3, ' ')}%</span>}
                    </div>
                    <div className="hud-display" style={{ fontSize: 14, color: '#FFD577', marginBottom: 4 }}>{def.name}</div>
                    <p style={{ fontSize: 11, color: '#8A6B2C', marginBottom: 12, lineHeight: 1.5, minHeight: 32 }}>
                      {def.description}
                    </p>
                    <div style={{ height: 3, background: '#4A3818' }}>
                      <div style={{
                        height: '100%',
                        width: `${unlocked ? 100 : pct}%`,
                        background: unlocked ? 'linear-gradient(90deg, #E8B847, #FFD577)' : '#E8B847',
                        opacity: unlocked ? 1 : 0.7,
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
            <SectionHeading kanji="律" cmd="conf" title="SYSTEM_CONFIG" index="04/04" />

            {/* Friction mode */}
            <div className="hud-panel" style={{ marginBottom: 18 }}>
              <div className="hud-panel-head">
                <span>friction_mode.bool</span>
                <span className={`hud-status ${challengeModeEnabled ? 'armed' : 'standby'}`}>
                  {challengeModeEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18 }}>
                <div style={{ flex: 1 }}>
                  <div className="hud-display" style={{ fontSize: 14, marginBottom: 4 }}>
                    {t('friction.settingsTitle') || 'Friction Mode'}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A6B2C', lineHeight: 1.55 }}>
                    {t('friction.settingsDescription') || 'Challenge required to weaken any seal.'}
                  </div>
                </div>
                <button
                  onClick={handleToggleChallengeMode}
                  aria-pressed={challengeModeEnabled}
                  style={{
                    position: 'relative',
                    width: 60, height: 28,
                    background: challengeModeEnabled ? '#E8B847' : '#0A0D12',
                    border: '1px solid #E8B847',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: challengeModeEnabled ? 'var(--amber-glow)' : 'none',
                    transition: '0.18s',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 2, left: challengeModeEnabled ? 32 : 2,
                    width: 24, height: 22,
                    background: challengeModeEnabled ? '#050608' : '#E8B847',
                    transition: '0.18s',
                  }} />
                </button>
              </div>
            </div>

            {/* Theme picker */}
            <div className="hud-panel">
              <div className="hud-panel-head">
                <span>theme.profile</span>
                <span className="hud-label">3 available</span>
              </div>
              <div style={{ fontSize: 11, color: '#8A6B2C', marginBottom: 12 }}>
                Switching reloads the page so surface JSX swaps for the active profile.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { id: 'focusan',           kanji: '黒', label: 'KURO',      bg: '#0B0A0A', fg: '#F2E9D8', accent: '#B82E2E' },
                  { id: 'focusan-shiro',     kanji: '白', label: 'SHIRO',     bg: '#F4EDE0', fg: '#1A1410', accent: '#B82E2E' },
                  { id: 'focusan-fuinjutsu', kanji: '封', label: 'FŪINJUTSU', bg: '#E8DCB8', fg: '#1A1410', accent: '#C8252C' },
                  { id: 'focusan-denno',     kanji: '電', label: 'DENNŌ',     bg: '#050608', fg: '#E8B847', accent: '#E8B847' },
                ].map(opt => {
                  const active = currentThemeId === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePickTheme(opt.id)}
                      style={{
                        background: opt.bg, color: opt.fg,
                        border: active ? `2px solid ${opt.accent}` : '1px solid rgba(232, 184, 71, 0.3)',
                        padding: '14px 12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: active ? `0 0 0 1px ${opt.accent}, 0 0 18px rgba(232,184,71,0.3)` : 'none',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{
                          fontFamily: 'Noto Sans JP, sans-serif',
                          fontWeight: 900, fontSize: 30,
                          color: opt.accent, lineHeight: 1,
                        }}>
                          {opt.kanji}
                        </span>
                        {active && <span style={{ fontSize: 9, color: opt.accent, letterSpacing: '0.25em' }}>[ON]</span>}
                      </div>
                      <div style={{ fontSize: 11, letterSpacing: '0.15em' }}>{opt.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </Shell>

      {/* Modals (reused) */}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowPresetsModal(false)}
            />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="relative z-10 hud-panel hud-panel-hi"
              style={{ width: '100%', maxWidth: 520, background: '#0F141B', padding: 0 }}
            >
              <div className="hud-panel-head" style={{ padding: '14px 18px', margin: 0 }}>
                <span>preset_filters.list</span>
                <button onClick={() => setShowPresetsModal(false)} className="hud-btn" style={{ padding: '3px 9px', fontSize: 9 }}>X</button>
              </div>
              <div style={{ padding: 0, maxHeight: '60vh', overflowY: 'auto' }}>
                {BLOCKING_PRESETS.map(preset => (
                  <button key={preset.id} onClick={() => handleAddPreset(preset)} style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 18px',
                    background: 'transparent', border: 'none',
                    borderBottom: '1px dashed rgba(232, 184, 71, 0.1)',
                    cursor: 'pointer',
                    color: '#E8B847',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232, 184, 71, 0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span className="hud-display" style={{ fontSize: 13, color: '#FFD577' }}>{preset.name}</span>
                      <span className="hud-hex">{preset.host}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#8A6B2C' }}>{preset.description}</div>
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
            onCancel={() => setSchedulingHost(null)}
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

/* ───────── Page shell with HUD chrome ───────── */
const Shell: React.FC<{ now: number; language?: string; onLang?: (l: string) => void; tab?: Tab; children: React.ReactNode }> = ({ now, language, onLang, tab, children }) => {
  const cmd = tab ? TAB_CMD[tab] : 'sys_init'
  return (
    <div style={{
      minHeight: '100vh', background: '#050608',
      color: '#E8B847', fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* TOP STATUS STRIP */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 24px',
        borderBottom: '1px solid rgba(232, 184, 71, 0.22)',
        background: 'rgba(10, 13, 18, 0.7)',
        fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 22, height: 22,
            background: 'rgba(232, 184, 71, 0.12)',
            border: '1px solid #E8B847',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Noto Sans JP, sans-serif', fontWeight: 900, fontSize: 13,
            color: '#FFD577',
            boxShadow: '0 0 8px rgba(232,184,71,0.4)',
          }}>封</span>
          <span className="hud-display" style={{ fontSize: 14, color: '#FFD577', letterSpacing: '0.25em' }}>
            FOCUSAN.SYS <span style={{ color: '#5A6171' }}>v2.4</span>
          </span>
          <span className="hud-status online">ONLINE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {onLang && language && <LanguageSwitcher currentLang={language} onLanguageChange={onLang} />}
          <span style={{ color: '#5A6171' }}>│</span>
          <span style={{ color: '#5A6171' }}>jst</span>
          <span className="hud-mono" style={{ color: '#6B7EF5' }}>{clock(new Date(now))}</span>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* SIDEBAR — terminal cmd list */}
        <aside style={{
          width: 240, minHeight: 'calc(100vh - 44px)',
          background: 'rgba(15, 20, 27, 0.6)',
          borderRight: '1px solid rgba(232, 184, 71, 0.2)',
          padding: '24px 12px',
        }}>
          <div className="hud-label" style={{ padding: '0 12px', marginBottom: 12 }}>
            &gt; navigation
          </div>
          {(['sites', 'stats', 'achievements', 'settings'] as Tab[]).map(k => {
            const active = tab === k
            const cmdText = TAB_CMD[k]
            return (
              <button
                key={k}
                onClick={() => { window.location.hash = k }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left',
                  padding: '10px 12px',
                  background: active ? 'rgba(232, 184, 71, 0.10)' : 'transparent',
                  border: 'none',
                  borderLeft: active ? '2px solid #E8B847' : '2px solid transparent',
                  color: active ? '#FFD577' : '#8A6B2C',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: '0.1s',
                  boxShadow: active ? 'inset 0 0 18px rgba(232, 184, 71, 0.06)' : 'none',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#E8B847' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#8A6B2C' }}
              >
                <span style={{ color: active ? '#E8B847' : '#5A6171' }}>$</span>
                <span>{cmdText}</span>
                {active && <span style={{ marginLeft: 'auto', color: '#6B7EF5', fontSize: 10 }}>◆</span>}
              </button>
            )
          })}

          <div style={{ marginTop: 32, padding: '0 12px' }}>
            <div className="hud-label" style={{ marginBottom: 8 }}>&gt; system</div>
            <div className="hud-row"><span className="label">runtime</span><span className="value hud-hex">0xFC0000</span></div>
            <div className="hud-row"><span className="label">layer</span><span className="value">netrunner</span></div>
            <div className="hud-row"><span className="label">rev</span><span className="value">2.4.0</span></div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '24px 32px 48px', maxWidth: 1080 }}>
          <div className="hud-label" style={{ marginBottom: 8 }}>
            &gt; <span style={{ color: '#E8B847' }}>{cmd}</span><span className="cursor-blink"></span>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

/* ───────── helpers ───────── */
const SectionHeading: React.FC<{ kanji: string; cmd: string; title: string; index: string }> = ({ kanji, cmd, title, index }) => (
  <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
    <span style={{
      fontFamily: 'Noto Sans JP, sans-serif',
      fontWeight: 900, fontSize: 56,
      color: '#FFD577', lineHeight: 1,
      textShadow: '0 0 16px rgba(255,213,119,0.45)',
    }}>{kanji}</span>
    <div style={{ flex: 1 }}>
      <div className="hud-label" style={{ marginBottom: 4 }}>$ {cmd}</div>
      <h2 className="hud-display" style={{ fontSize: 32, color: '#FFD577', letterSpacing: '0.06em' }}>{title}</h2>
    </div>
    <span style={{ fontSize: 11, color: '#5A6171', letterSpacing: '0.3em' }}>SEC {index}</span>
  </div>
)

const FilterPill: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: '3px 10px',
    fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
    background: active ? 'rgba(232, 184, 71, 0.15)' : 'transparent',
    border: '1px solid ' + (active ? '#E8B847' : 'rgba(232, 184, 71, 0.25)'),
    color: active ? '#FFD577' : '#8A6B2C',
    fontFamily: "'JetBrains Mono', monospace",
    cursor: 'pointer',
  }}>{children}</button>
)

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '1px 5px',
    fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase',
    color: '#6B7EF5',
    border: '1px solid rgba(74, 91, 217, 0.4)',
    fontFamily: "'JetBrains Mono', monospace",
  }}>{children}</span>
)

const IconBtn: React.FC<{ onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }> = ({ onClick, title, danger, children }) => (
  <button onClick={onClick} title={title} aria-label={title} style={{
    width: 26, height: 26,
    background: 'transparent',
    border: '1px solid ' + (danger ? 'rgba(255, 59, 92, 0.35)' : 'rgba(232, 184, 71, 0.25)'),
    color: danger ? '#FF3B5C' : '#8A6B2C',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: '0.1s',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = danger ? 'rgba(255, 59, 92, 0.10)' : 'rgba(232, 184, 71, 0.08)'
    e.currentTarget.style.color = danger ? '#FF3B5C' : '#FFD577'
    e.currentTarget.style.borderColor = danger ? '#FF3B5C' : '#E8B847'
    e.currentTarget.style.boxShadow = danger ? '0 0 8px rgba(255, 59, 92, 0.35)' : '0 0 8px rgba(232, 184, 71, 0.3)'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = danger ? '#FF3B5C' : '#8A6B2C'
    e.currentTarget.style.borderColor = danger ? 'rgba(255, 59, 92, 0.35)' : 'rgba(232, 184, 71, 0.25)'
    e.currentTarget.style.boxShadow = 'none'
  }}
  >{children}</button>
)

const StatPanel: React.FC<{ kanji: string; label: string; value: number; accent: string }> = ({ kanji, label, value, accent }) => (
  <div className="hud-panel" style={{ padding: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{
        fontFamily: 'Noto Sans JP, sans-serif', fontWeight: 900, fontSize: 38,
        color: accent, lineHeight: 1,
        textShadow: `0 0 10px ${accent}77`,
      }}>{kanji}</span>
      <span className="hud-label" style={{ color: '#8A6B2C', textAlign: 'right' }}>{label}</span>
    </div>
    <div className="hud-mono" style={{
      fontSize: 40, color: accent, lineHeight: 1, fontWeight: 300,
      textShadow: `0 0 14px ${accent}55`,
    }}>
      {value}
    </div>
  </div>
)

export default DennoOptions
