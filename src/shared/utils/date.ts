/**
 * Date helpers for daily statistics buckets.
 *
 * All per-day keys (visits, blocks, minutes, streaks, time limits) use the
 * user's LOCAL calendar day, not UTC. Using UTC made daily limits and streaks
 * reset at UTC midnight, which is confusing for anyone outside that timezone
 * (e.g. a US user's "today" would roll over mid-afternoon).
 */

/**
 * Format a date as a local-time YYYY-MM-DD key.
 * @param date - Date to format (defaults to now)
 */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Local-time YYYY-MM-DD key for `days` days before `date`.
 * @param days - Number of days to subtract
 * @param date - Reference date (defaults to now)
 */
export function localDateKeyDaysAgo(days: number, date: Date = new Date()): string {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return localDateKey(d)
}
