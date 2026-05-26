/**
 * DNR (declarativeNetRequest) Rule Manager
 * Handles building and updating Chrome's declarative blocking rules
 */

import browser from 'webextension-polyfill'
import { getSites, getTempWhitelist, cleanupExpiredWhitelist } from '../shared/storage/storage'
import { isScheduleActive } from '../shared/domain/schedule'
import { hostToRegex } from '../shared/utils/domain'
import { DNR_RULE_IDS } from '../shared/constants'
import { getCurrentSession, SessionState } from '../shared/domain/focus-sessions'

/**
 * Build DNR rules from blocked sites
 * Applies schedule and conditional rule filters
 *
 * @returns Array of DNR rules ready to be registered
 */
async function buildRules() {
  try {
    // Get all blocked sites
    const sites = await getSites()

    // Get temporary whitelist
    const tempWhitelist = await getTempWhitelist()
    const tempWhitelistedHosts = new Set(tempWhitelist.map(e => e.host))

    // Get focus session sites (if session is active)
    const focusSession = await getCurrentSession()
    const isFocusWorking = focusSession && focusSession.state === SessionState.WORKING
    const focusMode = isFocusWorking ? focusSession.mode || 'blocklist' : 'blocklist'
    const focusSessionSites = isFocusWorking ? focusSession.sitesToBlock : []

    console.log(
      '[DNR] Focus session active:',
      !!focusSession,
      'mode:',
      focusMode,
      'sites:',
      focusSessionSites.length
    )

    // Whitelist Mode Logic
    if (focusMode === 'whitelist') {
      const rules = []
      let ruleIdCounter = DNR_RULE_IDS.MIN

      // 1. Block EVERYTHING (Priority 1)
      rules.push({
        id: ruleIdCounter++,
        priority: 1,
        action: { type: 'block' as const },
        condition: { urlFilter: '*', resourceTypes: ['main_frame' as const] },
      })

      // 2. Allow Focus Session Sites (Priority 2)
      // In whitelist mode, sitesToBlock acts as the "Allowed" list
      for (const host of focusSessionSites) {
        rules.push({
          id: ruleIdCounter++,
          priority: 2,
          action: { type: 'allow' as const },
          condition: {
            regexFilter: hostToRegex(host),
            resourceTypes: ['main_frame' as const],
          },
        })
      }

      // 3. Allow Temporary Whitelist Sites (Priority 2)
      // Users might have used "I need 5 mins" feature
      for (const entry of tempWhitelist) {
        rules.push({
          id: ruleIdCounter++,
          priority: 2,
          action: { type: 'allow' as const },
          condition: {
            regexFilter: hostToRegex(entry.host),
            resourceTypes: ['main_frame' as const],
          },
        })
      }

      return rules
    }

    // Standard Blocklist Mode Logic
    // Filter sites based on schedule and conditional rules
    const activeSites = []

    for (const site of sites) {
      // Skip if temporarily whitelisted
      if (tempWhitelistedHosts.has(site.host)) {
        continue
      }

      // Check schedule
      if (site.schedule && !isScheduleActive(site.schedule)) {
        continue // Not active according to schedule
      }

      // Sites with conditional rules are handled by tab listeners, not DNR
      // DNR can't dynamically check visit counts or time conditions
      if (site.conditionalRules && site.conditionalRules.length > 0) {
        // Skip DNR for conditional sites - they'll be handled by handleTabUpdate
        continue
      }

      activeSites.push(site)
    }

    // Add focus session sites (convert to SiteObject-like format)
    for (const host of focusSessionSites) {
      // Skip if already in activeSites or in temp whitelist
      if (activeSites.some(s => s.host === host) || tempWhitelistedHosts.has(host)) {
        continue
      }

      // Add as temporary site for this session
      activeSites.push({
        host: host,
        addedAt: Date.now(),
        category: null,
        schedule: null,
        conditionalRules: [],
        patternType: 'domain',
      })
    }

    // Build DNR rules
    const rules = activeSites.map((site, index) => {
      const ruleId = DNR_RULE_IDS.MIN + index

      // Ensure we don't exceed max rule ID
      if (ruleId > DNR_RULE_IDS.MAX) {
        console.warn('[DNR] Exceeded max rule count, skipping site:', site.host)
        return null
      }

      const condition: any = {
        resourceTypes: ['main_frame' as const],
      }

      if (site.patternType === 'regex') {
        condition.regexFilter = site.host
      } else {
        condition.regexFilter = hostToRegex(site.host)
      }

      return {
        id: ruleId,
        priority: 1,
        action: {
          type: 'block' as const, // Changed from redirect to block
        },
        condition,
      }
    })

    // Filter out null entries
    return rules.filter((rule): rule is NonNullable<typeof rule> => rule !== null)
  } catch (err) {
    console.error('[DNR] Error building rules:', err)
    return []
  }
}

let rebuildLock = Promise.resolve() as Promise<any>

// Debounce coalesces rapid successive rebuilds (e.g. bulk add/remove,
// alarms firing during user activity) into a single underlying rebuild.
const REBUILD_DEBOUNCE_MS = 150
let pendingRebuild: Promise<boolean> | null = null
let pendingTimer: ReturnType<typeof setTimeout> | null = null
let pendingResolve: ((v: boolean) => void) | null = null

/**
 * Rebuild all DNR rules
 * Removes all existing rules and registers new ones
 * Serialized to prevent race conditions
 *
 * @returns true if successful
 */
export async function rebuildRules(): Promise<boolean> {
  if (pendingRebuild) return pendingRebuild

  pendingRebuild = new Promise<boolean>(resolve => {
    pendingResolve = resolve
  })

  if (pendingTimer) clearTimeout(pendingTimer)
  pendingTimer = setTimeout(() => {
    const resolve = pendingResolve!
    pendingResolve = null
    pendingRebuild = null
    pendingTimer = null
    runRebuild().then(resolve, () => resolve(false))
  }, REBUILD_DEBOUNCE_MS)

  return pendingRebuild
}

async function runRebuild(): Promise<boolean> {
  const currentLock = rebuildLock

  // Chain this request to the end of the current lock
  const nextRebuild = async () => {
    try {
      console.log('[DNR] Rebuilding rules...')

      // Clean up expired temporary whitelist entries first
      await cleanupExpiredWhitelist()

      // Get all existing rules
      const existingRules = await browser.declarativeNetRequest.getDynamicRules()
      const existingRuleIds = existingRules.map(rule => rule.id)

      // Build new rules
      const newRules = await buildRules()

      // Update rules
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: newRules,
      })

      // Update badge with count
      const activeCount = newRules.length
      await browser.action.setBadgeText({
        text: activeCount > 0 ? String(activeCount) : '',
      })
      await browser.action.setBadgeBackgroundColor({
        color: '#4CAF50',
      })

      console.log(`[DNR] Rules rebuilt: ${activeCount} active sites`)
      return true
    } catch (err) {
      console.error('[DNR] Error rebuilding rules:', err)
      return false
    }
  }

  // Update the lock
  rebuildLock = currentLock.then(nextRebuild)

  return rebuildLock
}

/**
 * Get count of active DNR rules
 *
 * @returns Number of active blocking rules
 */
export async function getActiveRulesCount(): Promise<number> {
  try {
    const rules = await browser.declarativeNetRequest.getDynamicRules()
    return rules.length
  } catch (err) {
    console.error('[DNR] Error getting rules count:', err)
    return 0
  }
}

/**
 * Clear all DNR rules
 *
 * @returns true if successful
 */
export async function clearAllRules(): Promise<boolean> {
  try {
    const existingRules = await browser.declarativeNetRequest.getDynamicRules()
    const existingRuleIds = existingRules.map(rule => rule.id)

    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: [],
    })

    await browser.action.setBadgeText({ text: '' })
    console.log('[DNR] All rules cleared')
    return true
  } catch (err) {
    console.error('[DNR] Error clearing rules:', err)
    return false
  }
}
