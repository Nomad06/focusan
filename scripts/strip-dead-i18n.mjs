/**
 * Remove single-line dead i18n keys (those with zero consumers in src/) from
 * src/shared/i18n/translations.ts in both ru: and en: blocks.
 *
 * Multi-line entries (object values, arrays, template-literal blocks) are
 * skipped — those need manual review.
 *
 * Run:  node scripts/strip-dead-i18n.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const transFile = resolve(root, 'src/shared/i18n/translations.ts')

// --- collect dead-key candidates (re-run inline audit) ---
const src = readFileSync(transFile, 'utf8')
const ruStart = src.indexOf('ru: {')
const enStart = src.indexOf('en: {', ruStart)
const ru = src.slice(ruStart, enStart)
const keys = new Set()
for (const m of ru.matchAll(/^\s+([a-zA-Z_][a-zA-Z0-9_]*):/gm)) keys.add(m[1])
keys.delete('ru')
keys.delete('en')

const grepArgs = (k) => [
  '-rE',
  `(\\.|\\[['\"])${k}\\b`,
  'src',
  '--include=*.ts',
  '--include=*.tsx',
  '-l',
]
const dead = new Set()
for (const k of keys) {
  let stdout = ''
  try {
    stdout = execFileSync('grep', grepArgs(k), { encoding: 'utf8' })
  } catch (err) {
    if (err.status !== 1) throw err
  }
  const hits = stdout
    .split('\n')
    .filter((f) => f && !f.endsWith('i18n/translations.ts'))
  if (hits.length === 0) dead.add(k)
}

// --- strip single-line entries with dead keys ---
// A "single-line" entry is one whose value fits on the same line and ends with
// `,` or with a closing `}` (last key in object). Conservative: only handle
// values that contain no opening `{` `[` or backtick on the same line.
const lines = src.split('\n')
const removed = []
const kept = []
const out = lines.filter((line) => {
  const m = /^(\s+)([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/.exec(line)
  if (!m) return true
  const [, , key, rest] = m
  if (!dead.has(key)) return true
  // Reject if multi-line (no terminating comma/closing brace on the line, or
  // value opens a nested structure).
  const opensNested = /[{[`]\s*$/.test(rest)
  const closesOnLine = /[,}]\s*$/.test(rest)
  if (opensNested || !closesOnLine) {
    kept.push(key)
    return true
  }
  removed.push(key)
  return false
})

writeFileSync(transFile, out.join('\n'))
console.log(`Removed (single-line):   ${removed.length}`)
console.log(`Kept for manual review:  ${kept.length}`)
if (kept.length) console.log('Manual review needed for:\n  ' + [...new Set(kept)].sort().join('\n  '))
