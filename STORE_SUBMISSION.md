# Chrome Web Store Submission Package — Focusan

Everything the reviewer/dashboard requires. Copy each section into the
matching field of the Chrome Web Store Developer Dashboard.

---

## 1. Single Purpose

> Focusan helps users stay focused by blocking distracting websites. All
> features — scheduling, daily visit/time limits, Pomodoro focus sessions, and
> usage statistics — exist solely to support that single purpose of website
> blocking for focus.

Keep this exact framing. Do not describe the gamification/achievements as a
separate purpose; they reinforce the blocking habit.

---

## 2. Permission Justifications

Paste each into the corresponding "justification" box.

| Permission | Justification |
|------------|---------------|
| `declarativeNetRequest` | Core blocking mechanism. Builds network-level rules that block the user's chosen distracting sites without reading page content. |
| `storage` | Stores the user's blocked-site list, schedules, rules, and local statistics. No data leaves the device beyond Chrome's own optional account sync. |
| `tabs` | Reads the active tab's URL to show block/unblock status in the popup and to redirect an already-open tab to the block page when a schedule or limit becomes active. |
| `webNavigation` | Detects navigations (including SPA history changes, e.g. YouTube) so conditionally-limited and newly-scheduled sites are blocked even when a DNR rule isn't yet in effect. |
| `notifications` | Notifies the user when a focus session starts/ends and on install. No marketing. |
| `alarms` | Drives time-based features: focus-session timers, schedule re-evaluation, time-limit tracking, and expiry of temporary allowances. |
| Host `http://*/*`, `https://*/*` | The user may block **any** website, so the extension needs to match and redirect requests on all sites. It does **not** collect, read, or transmit page content; URLs are only compared to the user's local block list. |

**Broad-host note for reviewer:** Focusan never sends browsing data anywhere.
Host access is used exclusively to compare the current site against the user's
locally-stored block list and to redirect blocked navigations to the in-extension
block page. See `PRIVACY.md`.

---

## 3. Data Privacy Disclosures (dashboard form answers)

- **Does this item collect or use personal/sensitive user data?** → Yes, only
  *Website content / Web history* in the sense that URLs are evaluated locally.
- **Is any data transmitted off the device?** → **No.** All processing is local;
  optional Chrome account sync is used only for the user's own settings.
- **Sold to third parties?** → No.
- **Used for purposes unrelated to single purpose?** → No.
- **Used for creditworthiness / lending?** → No.
- **Remote code?** → No. All code is bundled in the package (Manifest V3, no
  `eval`, no externally-hosted scripts).
- **Privacy policy URL:** host `PRIVACY.md` at a public URL (e.g. GitHub Pages /
  repo raw link) and paste it here. Required because of broad host access.

Check the certification boxes: complies with Developer Program Policies; data
handling matches disclosures.

---

## 4. Store Listing Copy

**Name:** Focusan — 集中

**Short description (≤132 chars):**
> Bushidō for your browser. Cut distractions with calm focus and samurai resolve
> — schedules, daily limits, Pomodoro sessions.

**Detailed description:**
> Focusan — 集中 — turns distraction-blocking into a quiet discipline inspired
> by Bushidō. Composed on the surface, resolute underneath.
>
> • Cut any site cleanly — blocked at the network layer, not just hidden.
> • Schedule your hours — work hours, weekdays, weekends, custom day/time rules,
>   overnight ranges.
> • Daily limits — cap visits or minutes per site; Focusan steps in only at the
>   line.
> • Pomodoro focus sessions — blocklist or whitelist mode, calm timer, clear
>   bell.
> • Temporary allowances — a short, deliberate exception when you actually need
>   one.
> • Local statistics, streaks, achievements — quiet motivation, no leaderboards,
>   no comparisons.
>
> Privacy first. Nothing leaves your browser. English and Russian.

---

## 5. Pre-Submission Asset Checklist (dashboard-side, prepare manually)

- [ ] Icon 128×128 — present in package (`icons/icon128.png`).
- [ ] At least 1 screenshot, 1280×800 or 640×400 (popup, options, block page).
- [ ] Small promo tile 440×280 (optional but recommended).
- [ ] Marquee 1400×560 (optional).
- [ ] Public privacy-policy URL (required — broad host permission).
- [ ] Support email / website set on the publisher account.
- [ ] Category: Productivity.
- [ ] Verified publisher / contact email confirmed.

---

## 6. Known limitations to be aware of (not blockers)

- UI localized in English + Russian only; store listing defaults to English
  (`default_locale: en`) and works globally. Adding more UI locales requires
  translating `src/shared/i18n/translations.ts` (~800 lines) — see README.
- `chrome.storage.sync` ~100 KB quota: very large block lists may hit it; the
  extension keeps working, sync just stops. Documented in `PRIVACY.md`.
- Schedule transitions are re-evaluated on a periodic alarm (≈5 min) and on
  navigation, so a boundary may take up to a few minutes to take effect on an
  already-open tab.
