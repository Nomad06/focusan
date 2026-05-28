/**
 * Generate Chrome Web Store promo tiles from store-assets/screenshots/
 * focusan_marquee_banner.jpg.
 *
 *   Marquee     1400×560  (ratio 2.5 : 1, cover crop)
 *   Small Promo  440×280  (ratio 1.57 : 1, cover crop)
 *
 * Source art is 1168×784 (≈1.49 : 1) and has the typographic message on the
 * LEFT half ("Focusan. Discipline. Clarity."), samurai + red sun on the right.
 * Both tile aspects are wider than the source, so cover-fit trims the top and
 * bottom (sky/ground) but keeps the full horizontal composition.
 *
 * Run:  node scripts/promo-from-art.mjs
 */
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync, mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const src = resolve(root, 'store-assets/screenshots/focusan_marquee_banner.jpg')
const outDir = resolve(root, 'store-assets/store-ready')
mkdirSync(outDir, { recursive: true })

const dataUrl = `data:image/jpeg;base64,${readFileSync(src).toString('base64')}`

const renderHtml = (w, h) => `data:text/html;charset=utf-8,${encodeURIComponent(`
  <html><head><meta charset="utf-8"></head>
  <body style="margin:0;width:${w}px;height:${h}px;background:#0a0d12">
    <div style="width:${w}px;height:${h}px;
      background-image:url('${dataUrl}');
      background-size:cover;
      background-position:center center;
      background-repeat:no-repeat"></div>
  </body></html>`)}`

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: { width: 1400, height: 560 },
})

try {
  const tile = async (w, h, name) => {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
    await page.goto(renderHtml(w, h), { waitUntil: 'networkidle2' })
    await page.screenshot({ path: resolve(outDir, name) })
    console.log('saved', name)
    await page.close()
  }

  await tile(1400, 560, 'promo-marquee-1400x560.png')
  await tile(440, 280, 'promo-small-440x280.png')
} finally {
  await browser.close()
}
