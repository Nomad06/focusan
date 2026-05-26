#!/usr/bin/env node
/**
 * Smoke test: launch Chrome with dist/ loaded, screenshot each surface,
 * dump console errors. Headed (extensions can't run headless reliably).
 */
import puppeteer from 'puppeteer'
import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'screenshots')

async function main() {
  await fs.mkdir(OUT, { recursive: true })

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${DIST}`,
      `--load-extension=${DIST}`,
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
    ],
  })

  try {
    // Wait for service worker so we can grab extension ID
    const targets = await browser.waitForTarget(
      t => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://'),
      { timeout: 10000 }
    )
    const extId = new URL(targets.url()).hostname
    console.log(`[smoke] extension id: ${extId}`)

    const surfaces = [
      { name: 'popup', path: 'src/popup/index.html', viewport: { width: 360, height: 560 } },
      { name: 'options', path: 'src/options/index.html', viewport: { width: 1280, height: 900 } },
      { name: 'welcome', path: 'src/pages/welcome/index.html', viewport: { width: 1024, height: 800 } },
      { name: 'diagnostics', path: 'src/pages/diagnostics/index.html', viewport: { width: 1024, height: 900 } },
    ]

    const errors = {}

    for (const s of surfaces) {
      const url = `chrome-extension://${extId}/${s.path}`
      const page = await browser.newPage()
      const log = []
      page.on('console', m => {
        if (m.type() === 'error' || m.type() === 'warning') log.push(`[${m.type()}] ${m.text()}`)
      })
      page.on('pageerror', e => log.push(`[pageerror] ${e.message}`))

      await page.setViewport(s.viewport)
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 })
      } catch (e) {
        log.push(`[nav] ${e.message}`)
      }
      // settle animations
      await new Promise(r => setTimeout(r, 800))

      const file = path.join(OUT, `${s.name}.png`)
      await page.screenshot({ path: file, fullPage: s.name !== 'popup' })
      console.log(`[smoke] ${s.name}: ${file}`)
      errors[s.name] = log
      await page.close()
    }

    console.log('\n=== Console summary ===')
    let total = 0
    for (const [name, log] of Object.entries(errors)) {
      console.log(`\n[${name}] ${log.length} entries`)
      log.forEach(l => console.log(`  ${l}`))
      total += log.length
    }
    console.log(`\nTotal: ${total} console errors/warnings`)
  } finally {
    await browser.close()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
