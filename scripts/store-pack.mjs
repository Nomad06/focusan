/**
 * Chrome Web Store packaging.
 *
 * 1. Fits every curated screenshot in store-assets/screenshots/ onto a
 *    1280x800 canvas (Store's required size). Landscape shots are scaled to
 *    width; the portrait popup shots are centred as a product hero. Background
 *    is theme-matched: "-white" files get a light canvas, everything else dark.
 *    Output -> store-assets/store-ready/<name>-1280x800.png
 * 2. Regenerates the promo tiles (440x280 small, 1400x560 marquee).
 * 3. Zips dist/ into focusan-<version>.zip for upload (dist must be built).
 *
 * Run:  npm run build && node scripts/store-pack.mjs
 */
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename, extname } from 'node:path'
import { readdirSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const srcDir = resolve(root, 'store-assets', 'screenshots')
const outDir = resolve(root, 'store-assets', 'store-ready')
rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version

// Backgrounds tuned to the app's themes.
const DARK = 'radial-gradient(circle at 50% 22%,#1b2330,#0a0d12)'
const LIGHT = 'radial-gradient(circle at 50% 22%,#f4f6fa,#dde3ec)'

// Promo source artwork (square) — drawn small inside the screenshot canvas? No:
// screenshots stand alone. Skip extra logo to keep them clean.

const isPopup = (name) => name.includes('popup')
const isLight = (name) => name.includes('white')

const fileToDataUrl = (path) => {
  const b64 = readFileSync(path).toString('base64')
  const ext = extname(path).slice(1).toLowerCase()
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${b64}`
}

const browser = await puppeteer.launch({
  headless: 'new',
  defaultViewport: { width: 1280, height: 800 },
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

  const files = readdirSync(srcDir).filter((f) =>
    /\.(png|jpe?g)$/i.test(f) && !f.includes('promo')
  )

  for (const file of files) {
    const name = basename(file, extname(file))
    const dataUrl = fileToDataUrl(resolve(srcDir, file))
    const bg = isLight(name) ? LIGHT : DARK
    const shadow = isLight(name)
      ? '0 24px 70px rgba(40,60,90,.28)'
      : '0 40px 100px rgba(0,0,0,.7)'

    // Landscape app shots: fill ~92% of width. Portrait popups: hero-centred,
    // fill ~84% of height with a rounded card + shadow.
    const imgCss = isPopup(name)
      ? `height:672px;border-radius:18px;box-shadow:${shadow}`
      : `width:1180px;border-radius:12px;box-shadow:${shadow}`

    const html = `data:text/html;charset=utf-8,${encodeURIComponent(`
      <html><head><meta charset="utf-8"></head>
      <body style="margin:0;width:1280px;height:800px;background:${bg};
        display:flex;align-items:center;justify-content:center">
        <img src="${dataUrl}" style="${imgCss};object-fit:contain"/>
      </body></html>`)}`

    await page.goto(html, { waitUntil: 'networkidle2' })
    await new Promise((r) => setTimeout(r, 150))
    await page.screenshot({ path: resolve(outDir, `${name}-1280x800.png`) })
    console.log('screenshot ->', `${name}-1280x800.png`)
  }

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
  console.log('promo -> promo-small-440x280.png')

  await promo.setViewport({ width: 1400, height: 560, deviceScaleFactor: 1 })
  await promo.goto(promoHtml(1400, 560, true), { waitUntil: 'networkidle2' })
  await promo.screenshot({ path: resolve(outDir, 'promo-marquee-1400x560.png') })
  console.log('promo -> promo-marquee-1400x560.png')
} finally {
  await browser.close()
}

// ---- zip dist/ for upload ----
const distPath = resolve(root, 'dist')
if (!existsSync(resolve(distPath, 'manifest.json'))) {
  console.error('\n! dist/manifest.json missing — run `npm run build` first.')
  process.exit(1)
}
const zipPath = resolve(root, `focusan-${version}.zip`)
rmSync(zipPath, { force: true })
// Zip from inside dist/ so paths are relative to the extension root.
execFileSync('zip', ['-r', '-X', zipPath, '.', '-x', '.vite/*', '*.DS_Store'], {
  cwd: distPath,
  stdio: 'inherit',
})
console.log('\nupload zip ->', zipPath)
console.log('store-ready assets ->', outDir)
