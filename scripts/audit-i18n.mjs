/**
 * Audit i18n keys: list every translation key with zero consumers in src/.
 * Heuristic — grep for `<key>` as a property access or string lookup.
 * Skips translations.ts itself.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const transFile = resolve(root, 'src/shared/i18n/translations.ts')
const src = readFileSync(transFile, 'utf8')

// Extract all key identifiers at any nesting level inside the `ru:` block (one
// locale is enough — keys are mirrored across locales by definition).
const startRu = src.indexOf('ru: {')
const endRu = src.indexOf('en: {', startRu)
const ru = src.slice(startRu, endRu)

const keySet = new Set()
const rx = /^\s+([a-zA-Z_][a-zA-Z0-9_]*):/gm
let m
while ((m = rx.exec(ru))) keySet.add(m[1])

// Ignore root locale names and obvious noise.
for (const w of ['ru', 'en']) keySet.delete(w)

const allKeys = [...keySet].sort()
const dead = []

// Match `.k` (property access), `['k']`, or `["k"]` — covers all real consumer
// patterns. Arguments go straight to grep, no shell, so the key string is safe
// even if a future addition contains regex metacharacters.
const grepArgs = (key) => [
  '-rE',
  `(\\.|\\[['\"])${key}\\b`,
  'src',
  '--include=*.ts',
  '--include=*.tsx',
  '-l',
]

for (const k of allKeys) {
  let stdout = ''
  try {
    stdout = execFileSync('grep', grepArgs(k), { encoding: 'utf8' })
  } catch (err) {
    // grep exits 1 when no match — that's our "dead" signal, not an error.
    if (err.status !== 1) throw err
  }
  const hits = stdout
    .split('\n')
    .filter((f) => f && !f.endsWith('i18n/translations.ts'))
  if (hits.length === 0) dead.push(k)
}

console.log(`Total keys: ${allKeys.length}`)
console.log(`Unused candidates: ${dead.length}`)
console.log(dead.join('\n'))
