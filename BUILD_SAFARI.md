# Building Focusan for Safari (macOS)

Focusan ships as a Chrome MV3 extension. The same codebase runs in Safari as a
**Safari Web Extension** wrapped in a small macOS app. This doc covers a local /
developer build — unsigned, no Apple Developer account, no App Store.

## Prerequisites

- macOS with **Safari 16.4+** (module service workers require it; macOS 26 / Safari 26 is fine).
- **Xcode** installed at `/Applications/Xcode.app` (the build scripts set
  `DEVELOPER_DIR` to it, so you don't need `xcode-select -s` or `sudo`).
- `npm install` already run.

## Build

```bash
npm run safari:convert   # vite build → dist/, then generate safari-xcode/ Xcode project
npm run safari:build     # compile the macOS app (ad-hoc signed, Debug)
```

- `safari:convert` runs `safari-web-extension-converter` on `dist/` and writes the
  Xcode project to `safari-xcode/` (gitignored — regenerable). It also normalizes
  the app bundle id to `com.focusan.mac` so the embedded extension
  (`com.focusan.mac.Extension`) is correctly prefixed.
- Converter prints two harmless warnings (`notifications`, `type`) — both features
  degrade gracefully in code; the build is unaffected.

The built app lands in Xcode DerivedData. Find it with:

```bash
ls -d ~/Library/Developer/Xcode/DerivedData/Focusan-*/Build/Products/Debug/Focusan.app
```

## Load in Safari

1. Launch the built `Focusan.app` once (double-click it, or open the
   `safari-xcode/Focusan` project in Xcode and Run). This registers the extension.
2. Safari → Settings → **Advanced** → enable **"Show features for web developers"**.
3. The **Develop** menu appears → enable **"Allow Unsigned Extensions"**.
   ⚠️ This resets every time Safari restarts — re-enable it after each launch.
4. Safari → Settings → **Extensions** → tick **Focusan** to enable it.
5. Click **Edit Websites** (or the per-site dropdown) and set access to
   **"Allow on Every Website"** — site blocking needs broad host access.

## Smoke test

- Add a site via the popup, navigate to it → should redirect to the blocked page.
- Open the options page from the popup.
- Start a focus session → timer/alarm behaves; allowed sites reachable during it.

## Notes / troubleshooting

- **Re-running `safari:convert` overwrites `safari-xcode/`** (`--force`). Custom
  Xcode changes there are lost — keep config changes in the npm scripts instead.
- Blocking relies on `chrome.declarativeNetRequest` dynamic rules. If a site isn't
  blocked, check the diagnostics page (rule list) and confirm site access is granted.
  The background script also has a `webNavigation` + `tabs.update` redirect fallback.
- For a signed / App Store build you'd need an Apple Developer team, a real bundle
  id, automatic signing, and notarization — out of scope for this local setup.
