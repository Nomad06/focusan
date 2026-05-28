---
title: Focusan — Privacy Policy
layout: default
---

# Focusan Privacy Policy

**Last Updated:** 2026-05-28
**Version:** 2.0.0

## Overview

Focusan is a Chrome extension that blocks distracting websites to help you focus. It operates entirely within your browser. It does not collect, transmit, or share any personal data with external servers or third parties.

## What Focusan Stores (Locally Only)

**User configuration** (in `chrome.storage.sync`, ≤100 KB quota; synced across Chrome only if you are signed in to Chrome):

- Blocked website list (domain names you choose)
- Site categories, blocking schedules, conditional rules
- Focus-session preferences and language preference

**Usage statistics and session state** (in `chrome.storage.local`, this device only):

- Local counts of blocked attempts and visit-time totals per site
- Focus-session history (duration, completion)
- Achievement progress
- Temporary allowances and current focus-session timer

## What Focusan Does NOT Do

- ❌ Does not send any data to external servers
- ❌ Does not use analytics, telemetry, or crash reporting
- ❌ Does not communicate with any third-party services
- ❌ Does not collect personally identifiable information
- ❌ Does not monitor browsing beyond comparing the current URL against your local block list
- ❌ Does not share data with advertisers or data brokers
- ❌ Does not use cookies, web beacons, or remote code

All processing is local. There is no backend.

## Permissions and Why They Exist

| Permission | Why it is needed | Data access |
|------------|-----------------|-------------|
| `storage` | Save your blocked-site list and settings | Local storage only |
| `tabs` | Read the active tab URL to show block status in the popup and redirect open tabs when a rule activates | Current tab URL only |
| `declarativeNetRequest` | Network-level blocking of sites you chose | URL patterns you configure |
| `notifications` | Notify you when a focus session starts or ends | No data access |
| `webNavigation` | Detect SPA navigations (e.g. YouTube) so conditionally-limited sites block correctly | Navigation events only |
| `alarms` | Drive focus-session timers, schedule re-evaluation, expiry of temporary allowances | No data access |
| `http://*/*`, `https://*/*` | The user may block any website, so the extension must be able to match and redirect requests on all sites. URLs are only compared to the local block list; page content is never read or transmitted. | Read-only host match |

## Your Data Control

- **Export:** Options → Export Data → JSON download of all settings
- **Import:** Options → Import Data → load a previously-exported JSON file
- **Delete specific items:** remove sites, clear statistics, cancel temporary allowances from the Options page
- **Delete everything:** uninstall the extension; Chrome removes all extension storage

## Data Retention

- Configuration data: retained until you delete it or uninstall the extension
- Statistics: retained locally until you clear them via Options
- Temporary allowances: expire automatically at the time you set
- Active focus sessions: expire automatically; history kept until cleared

## Children's Privacy

Focusan does not knowingly collect any information from anyone, including children. All data remains local to the user's device.

## Open-Source Transparency

The full source code is public. Verify the privacy claims by reviewing the repository — in particular:

- Storage operations: `src/shared/storage/storage.ts`
- Background service worker: `src/background/index.ts`

Repository: <https://github.com/Nomad06/brain-defender>

## Security Practices

- All user input validated with Zod schemas
- TypeScript end-to-end
- No `eval()` or dynamic code execution
- No externally-hosted scripts (Manifest V3 compliant)

## Your Rights (GDPR / CCPA)

Because all data is local and under your direct control, you can exercise the standard data-protection rights from inside the extension:

- ✅ **Access** — Export Data
- ✅ **Rectification** — edit any setting at any time
- ✅ **Erasure** — delete items or uninstall
- ✅ **Portability** — JSON export
- ✅ **Object to processing** — disable features you do not want, or uninstall

## Changes to This Policy

Material changes will be reflected by bumping the **Last Updated** date and the extension version. The current version of this policy is always at this URL.

## Contact

Questions or concerns: open an issue at <https://github.com/Nomad06/brain-defender/issues>.

## Compliance

Designed to comply with the Chrome Web Store Developer Program Policies, GDPR, and CCPA.

---

By installing and using Focusan you consent to the data practices described above. Uninstall to withdraw consent and remove all data.
