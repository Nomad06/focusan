/**
 * Statistics tracking system for Brain Defender
 * Tracks block attempts, streaks, per-site stats, and daily statistics
 */

import { z } from 'zod'
import browser from 'webextension-polyfill'
import { STORAGE_KEYS } from '../constants'
import { localDateKey, localDateKeyDaysAgo } from '../utils/date'

// Zod schemas for runtime validation
export const SiteStatsSchema = z.object({
  visited: z.number().min(0),
  blocks: z.number().min(0),
  firstBlocked: z.number(),
  lastBlocked: z.number(),
  visitsToday: z.number().min(0),
  timeSpentToday: z.number().min(0), // minutes (for the day named by timeSpentDate)
  timeSpentDate: z.string().nullable().optional(), // YYYY-MM-DD the timeSpentToday counter belongs to
  lastVisitTime: z.number().nullable(),
  visitsByDate: z.record(z.string(), z.number()).default({}),
})

export const StatsSchema = z.object({
  totalBlocks: z.number().min(0).default(0),
  totalSites: z.number().min(0).default(0),
  streakDays: z.number().min(0).default(0),
  lastBlockDate: z.number().nullable(),
  bySite: z.record(z.string(), SiteStatsSchema).default({}),
  byDate: z.record(z.string(), z.number()).default({}), // Total blocks per day
  minutesByDate: z.record(z.string(), z.number()).default({}), // Total focus minutes per day
  frictionBreaksByDate: z.record(z.string(), z.number()).default({}), // Friction-mode breaks per day (escalation)
})

// Type exports
export type SiteStats = z.infer<typeof SiteStatsSchema>
export type Stats = z.infer<typeof StatsSchema>

/**
 * Initialize statistics storage with default values
 */
export async function initStats(): Promise<void> {
  try {
    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    if (!data[STORAGE_KEYS.BLOCK_STATS]) {
      await browser.storage.local.set({
        [STORAGE_KEYS.BLOCK_STATS]: {
          totalBlocks: 0,
          totalSites: 0,
          streakDays: 0,
          lastBlockDate: null,
          bySite: {},
          byDate: {},
          minutesByDate: {},
        },
      })
    }
  } catch (err) {
    console.error('[Stats] Error initializing stats:', err)
  }
}

/**
 * Record a block attempt for a specific host
 * Updates all statistics including per-site, daily, and streak tracking
 *
 * @param host - Normalized hostname that was blocked
 * @returns Updated stats object or null on error
 */
export async function recordBlock(host: string): Promise<Stats | null> {
  try {
    const now = Date.now()
    const today = localDateKey() // YYYY-MM-DD

    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    let stats = data[STORAGE_KEYS.BLOCK_STATS] as Stats | undefined

    if (!stats || typeof stats !== 'object') {
      await initStats()
      const freshData = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
      stats = freshData[STORAGE_KEYS.BLOCK_STATS] as Stats
    }

    // Initialize missing fields for backward compatibility
    if (!stats.byDate || typeof stats.byDate !== 'object') {
      stats.byDate = {}
    }

    if (!stats.minutesByDate || typeof stats.minutesByDate !== 'object') {
      stats.minutesByDate = {}
    }

    if (!stats.bySite || typeof stats.bySite !== 'object') {
      stats.bySite = {}
    }

    if (stats.totalBlocks === undefined || stats.totalBlocks === null) {
      stats.totalBlocks = 0
    }

    if (stats.totalSites === undefined || stats.totalSites === null) {
      stats.totalSites = Object.keys(stats.bySite).length
    }

    if (stats.streakDays === undefined || stats.streakDays === null) {
      stats.streakDays = 0
    }

    // Update overall statistics
    stats.totalBlocks = (stats.totalBlocks || 0) + 1
    stats.lastBlockDate = now

    // Update per-site statistics
    if (!stats.bySite[host]) {
      stats.bySite[host] = {
        blocks: 0,
        visited: 0,
        firstBlocked: now,
        lastBlocked: now,
        visitsToday: 0,
        timeSpentToday: 0,
        lastVisitTime: null,
        visitsByDate: {},
      }
      stats.totalSites = Object.keys(stats.bySite).length
    }

    stats.bySite[host].blocks += 1
    stats.bySite[host].lastBlocked = now

    // NOTE: visit counters (visitsByDate/visitsToday) are owned by
    // recordVisitAttempt only. Incrementing them here too double-counted every
    // conditional-rule visit (attempt + block), tripping VISITS_PER_DAY early.

    // Update daily statistics
    if (!stats.byDate[today]) {
      stats.byDate[today] = 0
    }
    stats.byDate[today] += 1

    // Streak tracking: counts consecutive days that contain at least one block.
    // We persist the date of the last counted day to detect first-block-of-day
    // safely (regardless of how many blocks already occurred today).
    type StatsWithStreak = Stats & { streakLastDay?: string | null }
    const streakStats = stats as StatsWithStreak
    if (streakStats.streakLastDay !== today) {
      const yesterdayStr = localDateKeyDaysAgo(1)

      if (streakStats.streakLastDay === yesterdayStr) {
        stats.streakDays = (stats.streakDays || 0) + 1
      } else {
        stats.streakDays = 1
      }
      streakStats.streakLastDay = today
    }

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })

    // Check achievements after updating statistics
    // Note: Achievements checking is done in the background service worker
    // to avoid circular dependencies

    return stats
  } catch (err) {
    console.error('[Stats] Error recording block:', err)
    return null
  }
}

/**
 * Record a visit attempt (not necessarily blocked)
 * Used for conditional rules to count attempts before blocking
 *
 * @param host - Normalized hostname
 * @returns Updated stats or null on error
 */
export async function recordVisitAttempt(host: string): Promise<Stats | null> {
  try {
    const now = Date.now()
    const today = localDateKey()

    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    let stats: Stats = data[STORAGE_KEYS.BLOCK_STATS] as Stats
    if (!stats) {
      await initStats()
      const freshData = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
      stats = freshData[STORAGE_KEYS.BLOCK_STATS] as Stats
    }

    // Initialize site stats if needed
    if (!stats.bySite[host]) {
      stats.bySite[host] = {
        visited: 0,
        blocks: 0,
        firstBlocked: now,
        lastBlocked: now,
        visitsToday: 0,
        timeSpentToday: 0,
        lastVisitTime: null,
        visitsByDate: {},
      }
      stats.totalSites = Object.keys(stats.bySite).length
    }

    // Increment visit counter (not blocks)
    stats.bySite[host].visited += 1

    // Update visitsByDate for daily tracking
    const siteStats = stats.bySite[host]
    if (!siteStats.visitsByDate || typeof siteStats.visitsByDate !== 'object') {
      siteStats.visitsByDate = {}
    }
    if (!siteStats.visitsByDate[today]) {
      siteStats.visitsByDate[today] = 0
    }
    siteStats.visitsByDate[today] += 1
    siteStats.visitsToday = siteStats.visitsByDate[today]
    siteStats.lastVisitTime = now

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })
    return stats
  } catch (err) {
    console.error('[Stats] Error recording visit attempt:', err)
    return null
  }
}

/**
 * Add time spent on a site today
 *
 * @param host - Normalized hostname
 * @param minutes - Minutes to add
 * @returns Updated stats or null on error
 */
export async function addTimeSpent(host: string, minutes: number): Promise<Stats | null> {
  try {
    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    let stats: Stats = data[STORAGE_KEYS.BLOCK_STATS] as Stats

    if (!stats || !stats.bySite[host]) {
      return null // Site not tracked
    }

    const today = localDateKey()

    // Reset the daily counter when the tracked day rolls over. Without this the
    // counter carried across days forever, so a TIME_LIMIT rule that was hit once
    // kept the site blocked permanently.
    if (stats.bySite[host].timeSpentDate !== today) {
      stats.bySite[host].timeSpentToday = 0
      stats.bySite[host].timeSpentDate = today
    }

    // Add time to today's total
    stats.bySite[host].timeSpentToday += minutes

    // Add time to global daily total
    if (!stats.minutesByDate) stats.minutesByDate = {}
    if (!stats.minutesByDate[today]) stats.minutesByDate[today] = 0
    stats.minutesByDate[today] += minutes

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })
    return stats
  } catch (err) {
    console.error('[Stats] Error adding time spent:', err)
    return null
  }
}

/**
 * Add global focus minutes for today (from Focus Session)
 *
 * @param minutes - Minutes to add
 * @returns Updated stats or null on error
 */
export async function addFocusMinutes(minutes: number): Promise<Stats | null> {
  try {
    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    let stats: Stats = data[STORAGE_KEYS.BLOCK_STATS] as Stats

    if (!stats) {
      await initStats()
      const freshData = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
      stats = freshData[STORAGE_KEYS.BLOCK_STATS] as Stats
    }

    const today = localDateKey()
    if (!stats.minutesByDate) stats.minutesByDate = {}
    if (!stats.minutesByDate[today]) stats.minutesByDate[today] = 0
    stats.minutesByDate[today] += minutes

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })
    return stats
  } catch (err) {
    console.error('[Stats] Error adding focus minutes:', err)
    return null
  }
}

/**
 * Get current statistics
 * @returns Stats object or null on error
 */
export async function getStats(): Promise<Stats | null> {
  try {
    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    if (!data[STORAGE_KEYS.BLOCK_STATS]) {
      await initStats()
      const freshData = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
      return freshData[STORAGE_KEYS.BLOCK_STATS] as Stats
    }
    return data[STORAGE_KEYS.BLOCK_STATS] as Stats
  } catch (err) {
    console.error('[Stats] Error getting stats:', err)
    return null
  }
}

/**
 * Get statistics for a specific site
 * @param host - Normalized hostname
 * @returns SiteStats or null if not found
 */
export async function getSiteStats(host: string): Promise<SiteStats | null> {
  try {
    const stats = await getStats()
    if (!stats || !stats.bySite || !stats.bySite[host]) {
      return null
    }
    return stats.bySite[host]
  } catch (err) {
    console.error('[Stats] Error getting site stats:', err)
    return null
  }
}

/**
 * Clear all statistics
 * @returns true if successful
 */
export async function clearStats(): Promise<boolean> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.BLOCK_STATS]: {
        totalBlocks: 0,
        totalSites: 0,
        streakDays: 0,
        lastBlockDate: null,
        bySite: {},
        byDate: {},
      },
    })
    return true
  } catch (err) {
    console.error('[Stats] Error clearing stats:', err)
    return false
  }
}

/**
 * Export statistics in specified format
 * @param format - Export format ('json' or 'csv')
 * @returns Formatted string or null on error
 */
export async function exportStats(format: 'json' | 'csv' = 'json'): Promise<string | null> {
  try {
    const stats = await getStats()
    if (!stats) return null

    if (format === 'json') {
      return JSON.stringify(stats, null, 2)
    } else if (format === 'csv') {
      // CSV format for per-site statistics
      const lines = ['Host,Blocks,First Blocked,Last Blocked']
      for (const [host, siteStats] of Object.entries(stats.bySite)) {
        const firstDate = new Date(siteStats.firstBlocked).toISOString()
        const lastDate = new Date(siteStats.lastBlocked).toISOString()
        lines.push(`${host},${siteStats.blocks},${firstDate},${lastDate}`)
      }
      return lines.join('\n')
    }
    return null
  } catch (err) {
    console.error('[Stats] Error exporting stats:', err)
    return null
  }
}

/**
 * Get statistics for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Object with date as key and block count as value
 */
export async function getStatsForDateRange(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  try {
    const stats = await getStats()
    if (!stats || !stats.byDate) {
      return {}
    }

    const result: Record<string, number> = {}
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (const [date, count] of Object.entries(stats.byDate)) {
      const dateObj = new Date(date)
      if (dateObj >= start && dateObj <= end) {
        result[date] = count
      }
    }

    return result
  } catch (err) {
    console.error('[Stats] Error getting date range stats:', err)
    return {}
  }
}

/**
 * Get top blocked sites
 * @param limit - Number of top sites to return
 * @returns Array of [host, stats] tuples sorted by block count
 */
export async function getTopBlockedSites(limit = 10): Promise<Array<[string, SiteStats]>> {
  try {
    const stats = await getStats()
    if (!stats || !stats.bySite) {
      return []
    }

    return Object.entries(stats.bySite)
      .sort((a, b) => b[1].blocks - a[1].blocks)
      .slice(0, limit)
  } catch (err) {
    console.error('[Stats] Error getting top sites:', err)
    return []
  }
}

/**
 * Calculate total blocks for today
 * @returns Number of blocks today
 */
export async function getBlocksToday(): Promise<number> {
  try {
    const stats = await getStats()
    if (!stats || !stats.byDate) {
      return 0
    }

    const today = localDateKey()
    return stats.byDate[today] || 0
  } catch (err) {
    console.error('[Stats] Error getting blocks today:', err)
    return 0
  }
}

/**
 * Record a friction-mode "break" — a successfully passed challenge that let the
 * user bypass protection (stop a session, remove a site, disable protection).
 * Counted per day so difficulty escalates within a day but resets each dawn.
 * @returns Number of breaks recorded today (including this one) or null on error
 */
export async function recordFrictionBreak(): Promise<number | null> {
  try {
    const today = localDateKey()

    const data = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
    let stats = data[STORAGE_KEYS.BLOCK_STATS] as Stats | undefined

    if (!stats || typeof stats !== 'object') {
      await initStats()
      const freshData = await browser.storage.local.get(STORAGE_KEYS.BLOCK_STATS)
      stats = freshData[STORAGE_KEYS.BLOCK_STATS] as Stats
    }

    if (!stats.frictionBreaksByDate || typeof stats.frictionBreaksByDate !== 'object') {
      stats.frictionBreaksByDate = {}
    }
    stats.frictionBreaksByDate[today] = (stats.frictionBreaksByDate[today] || 0) + 1

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })
    return stats.frictionBreaksByDate[today]
  } catch (err) {
    console.error('[Stats] Error recording friction break:', err)
    return null
  }
}

/**
 * Get the number of friction-mode breaks recorded today (escalation level source)
 * @returns Number of breaks today (0 if none/error)
 */
export async function getFrictionBreaksToday(): Promise<number> {
  try {
    const stats = await getStats()
    if (!stats || !stats.frictionBreaksByDate) return 0
    const today = localDateKey()
    return stats.frictionBreaksByDate[today] || 0
  } catch (err) {
    console.error('[Stats] Error getting friction breaks today:', err)
    return 0
  }
}

/**
 * Clean up old statistics data (older than specified days)
 * @param daysToKeep - Number of days of history to keep
 * @returns true if successful
 */
export async function cleanupOldStats(daysToKeep = 90): Promise<boolean> {
  try {
    const stats = await getStats()
    if (!stats) return false

    const cutoffStr = localDateKeyDaysAgo(daysToKeep)

    // Clean up byDate
    const newByDate: Record<string, number> = {}
    for (const [date, count] of Object.entries(stats.byDate)) {
      if (date >= cutoffStr) {
        newByDate[date] = count
      }
    }
    stats.byDate = newByDate

    // Clean up minutesByDate
    if (stats.minutesByDate) {
      const newMinutesByDate: Record<string, number> = {}
      for (const [date, count] of Object.entries(stats.minutesByDate)) {
        if (date >= cutoffStr) {
          newMinutesByDate[date] = count
        }
      }
      stats.minutesByDate = newMinutesByDate
    }

    // Clean up frictionBreaksByDate
    if (stats.frictionBreaksByDate) {
      const newFrictionByDate: Record<string, number> = {}
      for (const [date, count] of Object.entries(stats.frictionBreaksByDate)) {
        if (date >= cutoffStr) {
          newFrictionByDate[date] = count
        }
      }
      stats.frictionBreaksByDate = newFrictionByDate
    }

    // Clean up visitsByDate in each site
    for (const siteStats of Object.values(stats.bySite)) {
      const newVisitsByDate: Record<string, number> = {}
      for (const [date, count] of Object.entries(siteStats.visitsByDate)) {
        if (date >= cutoffStr) {
          newVisitsByDate[date] = count
        }
      }
      siteStats.visitsByDate = newVisitsByDate
    }

    await browser.storage.local.set({ [STORAGE_KEYS.BLOCK_STATS]: stats })
    return true
  } catch (err) {
    console.error('[Stats] Error cleaning up old stats:', err)
    return false
  }
}
