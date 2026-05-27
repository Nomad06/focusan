/**
 * Generate Chrome Web Store assets from the built extension (dist/).
 *
 * Loads dist/ as an unpacked extension in real Chrome, seeds demo data into
 * chrome.storage, then screenshots the popup, options, and block page at
 * 1280x800, plus two promo tiles.
 *
 * Run:  npm run build && node scripts/screenshots.mjs
 */
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distPath = resolve(root, 'dist')
const outDir = resolve(root, 'store-assets', 'screenshots')
mkdirSync(outDir, { recursive: true })

// Use Puppeteer's bundled Chrome for Testing. Stable Chrome 137+ disabled the
// --load-extension command-line switch, so the system browser can't load an
// unpacked extension; Chrome for Testing still allows it.
const localDateKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ---- demo data ---------------------------------------------------------
const now = Date.now()
const sites = [
  { host: 'youtube.com', category: 'entertainment', conditionalRules: [{ type: 'timeLimit', enabled: true, maxTimeMinutes: 30 }] },
  { host: 'twitter.com', category: 'social', conditionalRules: [{ type: 'visitsPerDay', enabled: true, maxVisits: 5 }] },
  { host: 'instagram.com', category: 'social', conditionalRules: [] },
  { host: 'reddit.com', category: 'social', schedule: { mode: 'workHours', workHours: { start: '09:00', end: '18:00' } }, conditionalRules: [] },
  { host: 'tiktok.com', category: 'entertainment', conditionalRules: [] },
  { host: 'facebook.com', category: 'social', conditionalRules: [] },
  { host: 'news.ycombinator.com', category: 'news', conditionalRules: [] },
].map((s, i) => ({
  host: s.host,
  addedAt: now - i * 86400000,
  category: s.category ?? null,
  schedule: s.schedule ?? null,
  conditionalRules: s.conditionalRules ?? [],
  patternType: 'domain',
}))

const byDate = {}
const minutesByDate = {}
for (let i = 59; i >= 0; i--) {
  const key = localDateKey(new Date(now - i * 86400000))
  byDate[key] = Math.floor(2 + Math.abs(Math.sin(i) * 11))
  minutesByDate[key] = Math.floor(15 + Math.abs(Math.cos(i) * 60))
}
const today = localDateKey(new Date())
const bySite = {}
sites.forEach((s, i) => {
  bySite[s.host] = {
    visited: 40 - i * 3,
    blocks: 60 - i * 6,
    firstBlocked: now - 60 * 86400000,
    lastBlocked: now - i * 3600000,
    visitsToday: (i % 4) + 1,
    timeSpentToday: i === 0 ? 22 : 0,
    timeSpentDate: today,
    lastVisitTime: now - i * 3600000,
    visitsByDate: { [today]: (i % 4) + 1 },
  }
})
const blockStats = {
  totalBlocks: Object.values(byDate).reduce((a, b) => a + b, 0),
  totalSites: sites.length,
  streakDays: 12,
  lastBlockDate: now,
  bySite,
  byDate,
  minutesByDate,
  frictionBreaksByDate: {},
  streakLastDay: today,
}

// ---- run ---------------------------------------------------------------
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: { width: 1280, height: 800 },
  args: [
    `--disable-extensions-except=${distPath}`,
    `--load-extension=${distPath}`,
    '--no-first-run',
    '--no-default-browser-check',
  ],
})

try {
  // Find the extension's service worker to learn its ID.
  const swTarget = await browser.waitForTarget(
    (t) => t.type() === 'service_worker' && t.url().startsWith('chrome-extension://'),
    { timeout: 15000 }
  )
  const extId = new URL(swTarget.url()).host
  const base = `chrome-extension://${extId}`
  console.log('Extension id:', extId)

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

  // Seed storage from within the extension origin.
  await page.goto(`${base}/src/options/index.html`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    async (data) => {
      await chrome.storage.sync.set({
        blockedSites: data.sites,
        i18n_language: 'en',
        hasSeenOnboarding: true,
        challengeMode: false,
      })
      await chrome.storage.local.set({ blockStats: data.blockStats })
    },
    { sites, blockStats }
  )

  // Run entrance animations/transitions to completion instantly (fill-mode
  // keeps the END state) so screenshots show the final frame. NOTE: do not use
  // `animation:none` — that strips the keyframes and can freeze an element at
  // its opacity:0 start state.
  const revealCss = `*,*::before,*::after{
    animation-duration:.001s!important;animation-delay:0s!important;
    animation-fill-mode:both!important;
    transition-duration:.001s!important;transition-delay:0s!important}`

  const shoot = async (name) => {
    await page.addStyleTag({ content: revealCss })
    await new Promise((r) => setTimeout(r, 1800))
    await page.screenshot({ path: resolve(outDir, `${name}.png`) })
    console.log('saved', name)
  }

  // Options — Block list (reload to pick up seeded data)
  await page.goto(`${base}/src/options/index.html`, { waitUntil: 'networkidle2' })
  await shoot('1-options')

  // Options — Dashboard / statistics (populated heatmap & charts).
  // Tabs are hash-routed. A hash-only navigation doesn't remount the app, and
  // the stats panel only renders once the async `stats` state has loaded from
  // the service worker — so force a fresh load at #stats and wait for the
  // stats content to actually appear before shooting.
  await page.goto(`${base}/src/options/index.html#stats`, { waitUntil: 'networkidle2' })
  await page.reload({ waitUntil: 'networkidle2' })
  await page
    .waitForFunction(
      () => /focus activity|most blocked|активность|статист/i.test(
        document.querySelector('main')?.innerText || ''
      ),
      { timeout: 8000 }
    )
    .catch(() => console.warn('stats content not detected, shooting anyway'))
  await shoot('2-dashboard')

  // Block page
  await page.goto(
    `${base}/src/pages/blocked/index.html?url=${encodeURIComponent('https://youtube.com/feed')}`,
    { waitUntil: 'networkidle2' }
  )
  await shoot('3-blocked')

  // Popup — its body is a fixed ~350px panel that renders top-left in a tab.
  // Screenshot just the #root element (at 2x for crispness), then composite it
  // centered on a themed 1280x800 canvas for a product-style hero shot.
  const popPage = await browser.newPage()
  await popPage.setViewport({ width: 420, height: 620, deviceScaleFactor: 2 })
  await popPage.goto(`${base}/src/popup/index.html`, { waitUntil: 'networkidle2' })
  await popPage.addStyleTag({ content: revealCss })
  await new Promise((r) => setTimeout(r, 1500))
  const rootEl = await popPage.$('#root')
  const popB64 = await rootEl.screenshot({ encoding: 'base64' })
  await popPage.close()

  const composite = `data:text/html,${encodeURIComponent(`
    <html><body style="margin:0;width:1280px;height:800px;
      display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 50% 28%,#1b2330,#0a0d12)">
      <img src="data:image/png;base64,${popB64}"
        style="height:660px;border-radius:16px;
        box-shadow:0 40px 100px rgba(0,0,0,.7)"/>
    </body></html>`)}`
  await page.goto(composite, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: resolve(outDir, '4-popup.png') })
  console.log('saved 4-popup')

  // ---- promo tiles ----
  const promoHtml = (w, h, big) => `data:text/html;charset=utf-8,${encodeURIComponent(`
    <html><head><meta charset="utf-8"></head><body style="margin:0;width:${w}px;height:${h}px;
      font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#eef2f7;
      background:radial-gradient(circle at 30% 20%,#1e2a3a,#0a0d12);
      display:flex;flex-direction:column;justify-content:center;
      padding:0 ${big ? 80 : 28}px;box-sizing:border-box">
      <div style="font-size:${big ? 72 : 30}px;font-weight:800;letter-spacing:1px">
        Focusan <span style="color:#7fb3ff">集中</span></div>
      <div style="font-size:${big ? 30 : 15}px;margin-top:${big ? 18 : 8}px;color:#9fb0c4;max-width:${big ? 820 : 360}px">
        Block distractions with Japanese-zen focus — schedules, daily limits &amp; Pomodoro.</div>
    </body></html>`)}`

  const promo = await browser.newPage()
  await promo.setViewport({ width: 440, height: 280, deviceScaleFactor: 1 })
  await promo.goto(promoHtml(440, 280, false), { waitUntil: 'networkidle2' })
  await promo.screenshot({ path: resolve(outDir, 'promo-small-440x280.png') })
  console.log('saved promo-small')

  await promo.setViewport({ width: 1400, height: 560, deviceScaleFactor: 1 })
  await promo.goto(promoHtml(1400, 560, true), { waitUntil: 'networkidle2' })
  await promo.screenshot({ path: resolve(outDir, 'promo-marquee-1400x560.png') })
  console.log('saved promo-marquee')
} finally {
  await browser.close()
}
console.log('Done →', outDir)
