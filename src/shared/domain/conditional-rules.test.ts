import { describe, it, expect } from 'vitest'
import { shouldBlockByConditionalRules, ConditionType } from './conditional-rules'
import type { SiteStats } from './stats'

const today = new Date().toISOString().split('T')[0]
const yesterday = (() => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]
})()

function makeStats(partial: Partial<SiteStats>): SiteStats {
  return {
    visited: 0,
    blocks: 0,
    firstBlocked: 0,
    lastBlocked: 0,
    visitsToday: 0,
    timeSpentToday: 0,
    lastVisitTime: null,
    visitsByDate: {},
    ...partial,
  } as SiteStats
}

describe('shouldBlockByConditionalRules', () => {
  it('blocks always when no conditional rules', () => {
    expect(shouldBlockByConditionalRules({ host: 'x.com' }, null)).toBe(true)
  })

  it('VISITS_PER_DAY allows exactly maxVisits, blocks the next visit', () => {
    const site = {
      host: 'x.com',
      conditionalRules: [{ type: ConditionType.VISITS_PER_DAY, enabled: true, maxVisits: 3 }],
    }
    // 3 visits still allowed; the 4th (counter = 4) is blocked.
    expect(shouldBlockByConditionalRules(site, makeStats({ visitsByDate: { [today]: 3 } }))).toBe(false)
    expect(shouldBlockByConditionalRules(site, makeStats({ visitsByDate: { [today]: 4 } }))).toBe(true)
  })

  it('TIME_LIMIT blocks when minutes for today reach the limit', () => {
    const site = {
      host: 'x.com',
      conditionalRules: [{ type: ConditionType.TIME_LIMIT, enabled: true, maxTimeMinutes: 30 }],
    }
    expect(
      shouldBlockByConditionalRules(site, makeStats({ timeSpentToday: 30, timeSpentDate: today }))
    ).toBe(true)
    expect(
      shouldBlockByConditionalRules(site, makeStats({ timeSpentToday: 29, timeSpentDate: today }))
    ).toBe(false)
  })

  it('TIME_LIMIT ignores a stale counter from a previous day (regression)', () => {
    const site = {
      host: 'x.com',
      conditionalRules: [{ type: ConditionType.TIME_LIMIT, enabled: true, maxTimeMinutes: 30 }],
    }
    // Yesterday the limit was hit; today it must NOT block.
    expect(
      shouldBlockByConditionalRules(site, makeStats({ timeSpentToday: 99, timeSpentDate: yesterday }))
    ).toBe(false)
  })

  it('disabled rules never block', () => {
    const site = {
      host: 'x.com',
      conditionalRules: [{ type: ConditionType.TIME_LIMIT, enabled: false, maxTimeMinutes: 1 }],
    }
    expect(
      shouldBlockByConditionalRules(site, makeStats({ timeSpentToday: 999, timeSpentDate: today }))
    ).toBe(false)
  })
})
