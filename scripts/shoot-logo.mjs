import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const svg = path.join(root, 'public', 'logo.svg')

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 })
await page.goto('file://' + svg, { waitUntil: 'load' })
await new Promise(r => setTimeout(r, 300))
const out = path.join(root, 'screenshots', 'logo-bushido.png')
fs.mkdirSync(path.dirname(out), { recursive: true })
await page.screenshot({ path: out, omitBackground: false })
console.log('→', out)
await browser.close()
