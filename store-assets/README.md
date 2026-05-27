# Store assets

Chrome Web Store listing imagery, generated from the built extension.

## Regenerate

```bash
npm run screenshots
```

Runs `npm run build` then `scripts/screenshots.mjs`, which loads `dist/` as an
unpacked extension in Puppeteer's bundled Chrome for Testing (stable Chrome
137+ blocks `--load-extension`), seeds demo data into `chrome.storage`, and
writes PNGs to `store-assets/screenshots/`.

## Files (`screenshots/`)

| File | Size | Use |
|------|------|-----|
| `1-options.png` | 1280×800 | Screenshot — block list |
| `2-dashboard.png` | 1280×800 | Screenshot — statistics dashboard |
| `3-blocked.png` | 1280×800 | Screenshot — block page (zen theme) |
| `4-popup.png` | 1280×800 | Screenshot — popup timer (composited hero) |
| `promo-small-440x280.png` | 440×280 | Small promo tile (optional) |
| `promo-marquee-1400x560.png` | 1400×560 | Marquee promo (optional) |

Upload at least one screenshot (1280×800 or 640×400) plus the 128×128 icon
(already in the package). See `../STORE_SUBMISSION.md` for listing copy and the
full submission checklist.

Note: demo data (blocked sites, statistics) is synthetic, generated in the
script — not real user data.
