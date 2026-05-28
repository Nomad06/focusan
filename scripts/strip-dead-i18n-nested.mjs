/**
 * Remove multi-line dead i18n entries (nested objects or multi-line strings)
 * whose top-level key is unused anywhere in src/.
 *
 * Strategy: walk the file char-by-char from the opening line of each dead
 * entry, tracking brace/bracket/backtick/quote state, and slice until the
 * structure closes plus the trailing comma+newline.
 *
 * Run after strip-dead-i18n.mjs has handled the single-line cases.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const transFile = resolve(root, 'src/shared/i18n/translations.ts')
const deadKeys = [
  'common',
  'popup',
  'focusSession',
  'options',
  'errors',
  'exercises',
  'security',
  'ranks',
  'bulkAddPlaceholder',
  'philosophyBody',
  'protectionDesc',
]

let src = readFileSync(transFile, 'utf8')

// Find the start of each dead entry, then walk forward until the value ends.
const removeOnce = (text, key) => {
  // Match `<indent><key>:` at the start of a line — colon must not be part of
  // a string. Keys are unique inside each locale block; we'll iterate.
  const rx = new RegExp(`^(\\s+)${key}:\\s*`, 'm')
  const m = rx.exec(text)
  if (!m) return null
  const lineStart = m.index
  let i = m.index + m[0].length

  // Track string/template state, brace depth, bracket depth.
  let depth = 0
  let inStr = null // "'", '"', or '`'
  let escape = false
  while (i < text.length) {
    const c = text[i]
    if (inStr) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === inStr) inStr = null
      // template literals can nest `${...}` — for our payloads, never includes
      // braces that affect depth tracking; skip support for simplicity.
      i++
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      inStr = c
      i++
      continue
    }
    if (c === '{' || c === '[') {
      depth++
      i++
      continue
    }
    if (c === '}' || c === ']') {
      depth--
      i++
      if (depth === 0 && /[{[]/.test(text.slice(m.index, lineStart === 0 ? 1 : m.index + m[0].length))) {
        // structure closed
        break
      }
      continue
    }
    if (depth === 0 && (c === ',' || c === '\n')) {
      // End of an entry whose value was a plain string or concatenation
      if (c === ',') i++ // consume trailing comma
      break
    }
    i++
  }
  // Consume trailing newline if present, so blank lines don't accumulate.
  if (text[i] === '\n') i++
  return text.slice(0, lineStart) + text.slice(i)
}

let total = 0
for (const k of deadKeys) {
  // Each dead key appears once per locale (ru + en). Run until none left.
  for (let pass = 0; pass < 4; pass++) {
    const next = removeOnce(src, k)
    if (!next || next === src) break
    src = next
    total++
  }
}

writeFileSync(transFile, src)
console.log(`Removed ${total} multi-line dead entries.`)
