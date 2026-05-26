import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const PORT = 5188
const DIST = path.join(root, 'dist')

const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0]
  if (url.endsWith('/')) url += 'index.html'
  const filePath = path.join(DIST, decodeURIComponent(url))
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return }
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

await new Promise(r => server.listen(PORT, r))
console.log(`serving ${DIST} on :${PORT}`)

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })

const chromeStub = () => {
  const noop = () => {}
  const asyncNoop = () => Promise.resolve()
  const fakeStorage = {
    get: (k, cb) => {
      const r = {}
      const forced = window.__forceTheme
      const keys = typeof k === 'string' ? [k] : Array.isArray(k) ? k : k ? Object.keys(k) : []
      if (forced && (keys.includes('theme_preference') || keys.length === 0)) {
        r.theme_preference = { themeId: forced, appliedAt: Date.now() }
      }
      if (cb) cb(r)
      return Promise.resolve(r)
    },
    set: (_v, cb) => { if (cb) cb(); return Promise.resolve() },
    remove: asyncNoop, clear: asyncNoop,
    onChanged: { addListener: noop, removeListener: noop },
  }
  window.chrome = {
    runtime: {
      id: 'devshim',
      sendMessage: (...args) => {
        const cb = args[args.length - 1]
        const msg = args.find(a => a && typeof a === 'object' && (a.type || a.action))
        const t = msg?.type || msg?.action || ''
        const sites = [
          { host: 'youtube.com', addedAt: Date.now() - 86400000, category: null, schedule: null },
          { host: 'twitter.com', addedAt: Date.now() - 172800000, category: 'social', schedule: null },
          { host: 'reddit.com', addedAt: Date.now() - 259200000, category: 'social', schedule: null },
          { host: 'tiktok.com', addedAt: Date.now() - 432000000, category: null, schedule: null },
          { host: 'instagram.com', addedAt: Date.now() - 518400000, category: 'social', schedule: null },
          { host: 'news.ycombinator.com', addedAt: Date.now() - 691200000, category: 'news', schedule: null },
        ]
        const stats = {
          totalBlocks: 247, totalSites: 6, currentStreak: 7, longestStreak: 14,
          todayBlocks: 12, weekBlocks: 84,
          bySite: {
            'youtube.com':  { count: 89, lastBlocked: Date.now() - 3600000, visitsByDate: {} },
            'twitter.com':  { count: 56, lastBlocked: Date.now() - 7200000, visitsByDate: {} },
            'reddit.com':   { count: 41, lastBlocked: Date.now() - 86400000, visitsByDate: {} },
            'tiktok.com':   { count: 32, lastBlocked: Date.now() - 172800000, visitsByDate: {} },
            'instagram.com':{ count: 22, lastBlocked: Date.now() - 259200000, visitsByDate: {} },
            'news.ycombinator.com': { count: 7, lastBlocked: Date.now() - 345600000, visitsByDate: {} },
          },
          byDate: (() => { const r = {}; for (let i = 0; i < 60; i++) { const d = new Date(Date.now() - i*86400000).toISOString().slice(0,10); r[d] = Math.floor(Math.random()*8) } return r })(),
          minutesByDate: {},
          firstBlockedAt: Date.now() - 60*86400000,
        }
        let response = { success: true, sites, stats,
          mode: 'normal', desktopAppConnected: false,
          enabled: false, startTime: undefined,
          achievements: { unlocked: [], progress: {} },
          rules: [],
          session: null,
        }
        if (typeof cb === 'function') cb(response)
        return Promise.resolve(response)
      },
      onMessage: { addListener: noop, removeListener: noop },
      onConnect: { addListener: noop },
      connect: () => ({ postMessage: noop, onMessage: { addListener: noop }, onDisconnect: { addListener: noop } }),
      getURL: p => p,
      openOptionsPage: noop,
      lastError: null,
    },
    storage: { sync: fakeStorage, local: fakeStorage, onChanged: { addListener: noop, removeListener: noop } },
    tabs: {
      query: () => Promise.resolve([{ url: 'https://www.youtube.com/watch?v=distraction', id: 1 }]),
      onUpdated: { addListener: noop },
    },
    alarms: { create: noop, clear: noop, getAll: () => Promise.resolve([]), onAlarm: { addListener: noop } },
    notifications: { create: noop },
    i18n: { getUILanguage: () => 'en' },
    declarativeNetRequest: { getDynamicRules: () => Promise.resolve([]), updateDynamicRules: asyncNoop },
  }
}

const shots = [
  { name: 'blocked',  page: 'src/pages/blocked/index.html?url=' + encodeURIComponent('https://www.youtube.com/watch?v=distraction'), w: 1440, h: 900 },
  { name: 'welcome',  page: 'src/pages/welcome/index.html', w: 1440, h: 900 },
  { name: 'popup',    page: 'src/popup/index.html', w: 380, h: 600 },
  { name: 'options-sites',        page: 'src/options/index.html#sites', w: 1440, h: 900 },
  { name: 'options-stats',        page: 'src/options/index.html#stats', w: 1440, h: 900 },
  { name: 'options-achievements', page: 'src/options/index.html#achievements', w: 1440, h: 900 },
  { name: 'options-settings',     page: 'src/options/index.html#settings', w: 1440, h: 900 },
  { name: 'options-lang-closed',  page: 'src/options/index.html#sites', w: 1440, h: 900, clip: { x: 1100, y: 0, width: 340, height: 320 } },
  { name: 'options-lang-open',    page: 'src/options/index.html#sites', w: 1440, h: 900, clip: { x: 1100, y: 0, width: 340, height: 320 }, action: async (page) => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const langBtn = btns.find(b => b.textContent?.includes('English') || b.textContent?.includes('Russian'))
      langBtn?.click()
    })
    await new Promise(r => setTimeout(r, 500))
  }},
  { name: 'options-schedule-modal', page: 'src/options/index.html#sites', w: 1440, h: 900, action: async (page) => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const sched = btns.find(b => b.textContent?.toLowerCase().includes('schedule'))
      sched?.click()
    })
    await new Promise(r => setTimeout(r, 600))
  }},
  { name: 'options-rules-modal', page: 'src/options/index.html#sites', w: 1440, h: 900, action: async (page) => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const r = btns.find(b => b.textContent?.toLowerCase().includes('condition'))
      r?.click()
    })
    await new Promise(r => setTimeout(r, 600))
  }},

  // ── Shiro (white) variant ──
  { name: 'shiro-settings',     page: 'src/options/index.html#settings', w: 1440, h: 900, theme: 'focusan-shiro' },
  { name: 'shiro-sites',        page: 'src/options/index.html#sites',    w: 1440, h: 900, theme: 'focusan-shiro' },
  { name: 'shiro-achievements', page: 'src/options/index.html#achievements', w: 1440, h: 900, theme: 'focusan-shiro' },
  { name: 'shiro-blocked',      page: 'src/pages/blocked/index.html?url=' + encodeURIComponent('https://www.youtube.com'), w: 1440, h: 900, theme: 'focusan-shiro' },
  { name: 'shiro-popup',        page: 'src/popup/index.html', w: 380, h: 600, theme: 'focusan-shiro' },
  { name: 'shiro-welcome',      page: 'src/pages/welcome/index.html', w: 1440, h: 900, theme: 'focusan-shiro' },
  { name: 'welcome-setup',      page: 'src/pages/welcome/index.html', w: 1440, h: 900, action: async (page) => {
    // Click "Begin" then "I understand" to reach setup step
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'))
        // pick the most prominent primary-style button (last large one)
        const primary = btns.find(b => b.className.includes('primary') && b.className.includes('lg'))
        primary?.click()
      })
      await new Promise(r => setTimeout(r, 700))
    }
    // type something
    await page.evaluate(() => {
      const inp = document.querySelector('input[type="text"]')
      if (inp) { inp.focus(); inp.value = 'youtube.com'; inp.dispatchEvent(new Event('input', { bubbles: true })) }
    })
    await new Promise(r => setTimeout(r, 300))
  }},
]

for (const s of shots) {
  const page = await browser.newPage()
  page.on('console', m => { if (m.type() === 'error') console.log(`[${s.name}] err`, m.text()) })
  page.on('pageerror', e => console.log(`[${s.name}] pageerror`, e.message))
  await page.evaluateOnNewDocument(chromeStub)
  if (s.theme) {
    await page.evaluateOnNewDocument((themeId) => {
      // Pre-seed storage so initializeTheme picks up the variant
      const orig = window.chrome
      // Override sync.get to return our themeId for the theme_preference key
      Object.defineProperty(window, '__forceTheme', { value: themeId, writable: true })
    }, s.theme)
  }
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 2 })
  try {
    await page.goto(`http://localhost:${PORT}/${s.page}`, { waitUntil: 'networkidle0', timeout: 15000 })
  } catch (e) {
    console.log(`[${s.name}] goto timeout, continuing`)
  }
  await new Promise(r => setTimeout(r, 2500))
  if (s.action) { try { await s.action(page) } catch (e) { console.log(`[${s.name}] action failed: ${e.message}`) } }
  const out = path.join(root, 'screenshots', `${s.name}-bushido.png`)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  await page.screenshot({ path: out, fullPage: false, clip: s.clip })
  console.log(`→ ${out}`)
  await page.close()
}

await browser.close()
server.close()
