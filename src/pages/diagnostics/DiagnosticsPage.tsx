/**
 * Diagnostics Page for Focusan
 * Debug and troubleshooting tools
 */

import React, { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'
import { messagingClient } from '../../shared/messaging/client'
import { t } from '../../shared/i18n'
import type { SiteObject } from '../../shared/storage/schemas'
import type { Stats } from '../../shared/domain/stats'
import { useToast } from '../../shared/components/Toast'

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        const ok = await copyToClipboard(text)
        if (ok) {
          setCopied(true)
          toast('Copied to clipboard', 'success')
          setTimeout(() => setCopied(false), 1500)
        } else {
          toast('Copy failed', 'error')
        }
      }}
      className="focus-ring text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-white border border-border text-sumi-gray hover:text-accent hover:border-accent transition-colors"
    >
      {copied ? '✓ Copied' : label || 'Copy'}
    </button>
  )
}

const DiagnosticsPage: React.FC = () => {
  const toast = useToast()
  const [sites, setSites] = useState<SiteObject[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [dnrRules, setDnrRules] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    loadDiagnostics()
  }, [])

  const loadDiagnostics = async () => {
    setLoading(true)
    try {
      const [sitesData, statsData] = await Promise.all([
        messagingClient.getSites(),
        messagingClient.getStats(),
      ])
      setSites(sitesData)
      setStats(statsData)
      try {
        const rules = await browser.declarativeNetRequest.getDynamicRules()
        setDnrRules(rules)
      } catch (err) {
        console.error('[Diagnostics] Error loading DNR rules:', err)
      }
    } catch (err) {
      console.error('[Diagnostics] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRebuildRules = async () => {
    try {
      const success = await messagingClient.rebuildRules()
      toast(success ? 'Rules rebuilt' : 'Failed to rebuild rules', success ? 'success' : 'error')
      if (success) await loadDiagnostics()
    } catch (err) {
      console.error('[Diagnostics] Error rebuilding rules:', err)
      toast('Failed to rebuild rules', 'error')
    }
  }

  const handleExportData = async () => {
    try {
      const data = await messagingClient.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `focusan-diagnostics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Export started', 'success')
    } catch (err) {
      console.error('[Diagnostics] Error exporting data:', err)
      toast('Failed to export data', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-washi p-8 font-sans">
        <div className="max-w-4xl mx-auto washi-card p-10 border border-border/60 shadow-[var(--shadow-lg)] flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-3xl font-serif text-sumi-black tracking-tight mb-4">Diagnostics</h1>
          <div className="text-sumi-gray tracking-widest uppercase text-sm animate-pulse">
            {t('common.loading')}
          </div>
        </div>
      </div>
    )
  }

  const sysInfoRows: Array<[string, React.ReactNode]> = [
    ['Version', '1.0.0'],
    ['Total Sites', sites.length],
    ['Total Blocks', stats?.totalBlocks || 0],
    ['Streak Days', stats?.streakDays || 0],
    ['Active DNR Rules', dnrRules.length],
  ]

  return (
    <div className="min-h-screen bg-washi p-6 md:p-10 font-sans text-sumi-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay" />
      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="flex items-end justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-sumi-gray mb-1">
              Focusan / Diagnostics
            </div>
            <h1 className="text-3xl font-serif text-sumi-black tracking-tight">
              System & Troubleshooting
            </h1>
          </div>
          <button
            onClick={loadDiagnostics}
            className="focus-ring btn ghost sm"
            title="Reload data"
          >
            ↻ Refresh
          </button>
        </header>

        {/* System Info */}
        <section className="washi-card p-6 border border-border/50 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-sumi-gray mb-5">
            System Information
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {sysInfoRows.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-4 py-2 border-b border-border/20 last:border-0"
              >
                <dt className="text-sm text-sumi-gray">{k}</dt>
                <dd className="text-sm font-mono font-medium text-sumi-black">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Actions */}
        <section className="washi-card p-6 border border-border/50 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-sumi-gray mb-5">
            Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn secondary focus-ring" onClick={handleRebuildRules}>
              ↻ Rebuild DNR Rules
            </button>
            <button className="btn secondary focus-ring" onClick={handleExportData}>
              ⤓ Export All Data
            </button>
            <button
              className="btn ghost focus-ring"
              onClick={() => window.location.reload()}
            >
              ⟳ Reload Page
            </button>
          </div>
        </section>

        {/* Advanced (collapsible) */}
        <details className="washi-card border border-border/50 shadow-sm group">
          <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-black/[0.02] transition-colors rounded-t-lg">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-sumi-gray">
              Advanced
            </h2>
            <span className="text-sumi-gray group-open:rotate-180 transition-transform duration-300">
              ▾
            </span>
          </summary>
          <div className="px-6 pb-6 space-y-6">
            {/* Blocked Sites */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-sumi-gray">
                  Blocked Sites ({sites.length})
                </h3>
                <CopyButton text={JSON.stringify(sites, null, 2)} label="Copy JSON" />
              </div>
              {sites.length === 0 ? (
                <div className="text-center p-6 text-sumi-gray/70 italic text-sm bg-white/40 rounded-lg border border-border/30">
                  No sites blocked
                </div>
              ) : (
                <div className="max-h-[260px] overflow-y-auto custom-scrollbar bg-white/50 rounded-lg border border-border/30 divide-y divide-border/20">
                  {sites.map(site => (
                    <div key={site.host} className="py-2.5 px-4 font-mono text-sm">
                      <div className="text-sumi-black">{site.host}</div>
                      {site.category && (
                        <div className="text-[11px] text-sumi-gray mt-0.5">
                          {site.category}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DNR Rules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-sumi-gray">
                  Active DNR Rules ({dnrRules.length})
                </h3>
                <CopyButton text={JSON.stringify(dnrRules, null, 2)} label="Copy JSON" />
              </div>
              {dnrRules.length === 0 ? (
                <div className="text-center p-6 text-sumi-gray/70 italic text-sm bg-white/40 rounded-lg border border-border/30">
                  No DNR rules active
                </div>
              ) : (
                <div className="max-h-[280px] overflow-y-auto custom-scrollbar bg-white/50 rounded-lg border border-border/30 divide-y divide-border/20">
                  {dnrRules.map(rule => (
                    <div
                      key={rule.id}
                      className="py-3 px-4 font-mono text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 leading-relaxed"
                    >
                      <span className="text-sumi-gray">id</span>
                      <span className="font-medium">{rule.id}</span>
                      <span className="text-sumi-gray">priority</span>
                      <span>{rule.priority}</span>
                      <span className="text-sumi-gray">action</span>
                      <span className="text-seiheki-blue">{rule.action.type}</span>
                      <span className="text-sumi-gray">filter</span>
                      <span className="text-accent bg-accent/5 px-1 rounded break-all">
                        {rule.condition.regexFilter}
                      </span>
                      {rule.condition.resourceTypes && (
                        <>
                          <span className="text-sumi-gray">types</span>
                          <span>{rule.condition.resourceTypes.join(', ')}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Raw Data */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-sumi-gray">
                  Raw JSON
                </h3>
                <div className="flex gap-2">
                  <CopyButton text={JSON.stringify({ sites, stats }, null, 2)} label="Copy All" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-sumi-gray mb-1.5">
                    sites
                  </div>
                  <pre className="text-[12px] overflow-x-auto bg-sumi-black/95 text-emerald-300/95 rounded-lg p-4 max-h-[280px] overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                    {JSON.stringify(sites, null, 2)}
                  </pre>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-sumi-gray mb-1.5">
                    stats
                  </div>
                  <pre className="text-[12px] overflow-x-auto bg-sumi-black/95 text-emerald-300/95 rounded-lg p-4 max-h-[280px] overflow-y-auto custom-scrollbar font-mono leading-relaxed">
                    {JSON.stringify(stats, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </details>

        <div className="text-center py-4 opacity-40 text-[10px] font-mono tracking-[0.2em] uppercase">
          Focusan System Diagnostics
        </div>
      </div>
    </div>
  )
}

export default DiagnosticsPage
