import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const svgPath = path.join(root, 'public', 'logo.svg')
const svg = fs.readFileSync(svgPath, 'utf8')

const sizes = [16, 32, 48, 128, 256, 512]

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })

for (const size of sizes) {
  const page = await browser.newPage()
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 })
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svg}</body></html>`
  await page.setContent(html, { waitUntil: 'load' })
  await new Promise(r => setTimeout(r, 100))
  const out = path.join(root, 'icons', `icon${size}.png`)
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } })
  console.log(`→ ${out}`)
  
  // Also write to public/icons
  const publicOut = path.join(root, 'public', 'icons', `icon${size}.png`)
  fs.mkdirSync(path.dirname(publicOut), { recursive: true })
  fs.copyFileSync(out, publicOut)
  console.log(`→ ${publicOut}`)
  
  await page.close()
}

await browser.close()
