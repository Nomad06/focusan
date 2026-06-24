/**
 * Domain and URL utilities for Focusan
 * Handles domain normalization, URL validation, and regex pattern generation
 */

/**
 * Normalizes a domain from a string (URL or domain)
 * Handles IDN domains, IP addresses, ports, and special characters
 *
 * @param input - URL or domain to normalize
 * @returns Normalized domain or null on error
 *
 * @example
 * normalizeHost('https://www.youtube.com/watch?v=123') // => 'youtube.com'
 * normalizeHost('facebook.com') // => 'facebook.com'
 * normalizeHost('192.168.1.1') // => '192.168.1.1'
 */
export function normalizeHost(input: string | null | undefined): string | null {
  try {
    const trimmed = String(input || '').trim()
    if (!trimmed) return null

    // Ignore internal browser pages and schemas
    if (/^(chrome|chrome-extension|about|file|edge|brave|opera|moz-extension):/i.test(trimmed)) {
      return null
    }

    // If user entered without protocol, add https://
    const withProto = /^[a-zA-Z]+:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`

    let u: URL
    try {
      u = new URL(withProto)
      // Only allow http/https protocols for blocking
      if (!['http:', 'https:'].includes(u.protocol)) {
        return null
      }
    } catch {
      // If unable to parse as URL, try as domain directly

      // Check if it's an IPv4 address
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
        return trimmed.toLowerCase()
      }

      // Check IPv6 (simplified check)
      if (/^\[?[0-9a-fA-F:]+]?$/.test(trimmed)) {
        // IPv6 address (may be in square brackets)
        // eslint-disable-next-line no-useless-escape
        return trimmed.toLowerCase().replace(/[\[\]]/g, '')
      }

      // If it's not a URL and not an IP, try as domain
      const domainOnly = trimmed
        .toLowerCase()
        .replace(/^www\./, '')
        .replace(/\.+$/, '')

      // Domain validation: check for invalid characters
      // Allowed: letters, numbers, dots, hyphens (but not at start/end)
      if (
        !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(
          domainOnly
        )
      ) {
        return null
      }

      // Check for spaces and other invalid characters
      if (domainOnly.includes(' ') || domainOnly.length > 253) {
        return null
      }

      return domainOnly
    }

    let host = (u.hostname || '').toLowerCase()

    // IDN domain handling (punycode already decoded by browser in hostname)
    // If hostname contains punycode (xn--), leave as is
    // Browser will handle IDN when parsing URL

    // Remove www. prefix and any trailing dot
    host = host.replace(/^www\./, '').replace(/\.+$/, '')

    // Check for empty host
    if (!host) return null

    // Check for spaces and other invalid characters in domain
    if (host.includes(' ') || host.length > 253) {
      return null
    }

    // Domain format validation (basic check)
    // Allowed: letters, numbers, dots, hyphens
    // But should not start/end with hyphen or dot
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(host)) {
      return null
    }

    return host
  } catch (err) {
    console.error('[Utils] Error normalizing host:', input, err)
    return null
  }
}

/**
 * Escapes special characters for use in regex
 * @param s - String to escape
 * @returns Escaped string
 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Converts a domain into a regex pattern for blocking the domain and all subdomains
 *
 * @param host - Domain to block
 * @returns Regex pattern for declarativeNetRequest
 *
 * @example
 * hostToRegex('youtube.com')
 * // => '^(https?:\/\/(?:[^\/]*\.)?youtube\.com(?:\/.*)?)$'
 * // This will match:
 * //   - https://youtube.com
 * //   - https://www.youtube.com
 * //   - https://m.youtube.com/watch?v=123
 */
export function hostToRegex(host: string): string {
  const h = escapeRegex(host)
  // group1 = full URL
  // Pattern: (https?://) + (optional subdomain with dot) + domain + (optional path)
  // Example for youtube.com: ^(https?:\/\/(?:[^\/]*\.)?youtube\.com(?:\/.*)?)$
  // Important: use [^\/]* instead of .* to not capture other domains through slash
  const regex = `^(https?:\\/\\/(?:[^\\/]*\\.)?${h}(?:\\/.*)?)$`
  return regex
}

/**
 * Checks if a URL is blocked
 * @param urlStr - URL to check
 * @param blockedHosts - Array of blocked domains
 * @returns true if URL is blocked
 */
export function isBlockedUrl(
  urlStr: string,
  blockedHosts: Array<string | { host: string }>
): boolean {
  try {
    const u = new URL(urlStr)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    const host = (u.hostname || '').toLowerCase().replace(/^www\./, '')

    return blockedHosts.some(b => {
      const blockedHost = typeof b === 'string' ? b : b.host || ''
      const normalizedBlocked = String(blockedHost)
        .toLowerCase()
        .replace(/^www\./, '')

      // Exact match or subdomain
      return host === normalizedBlocked || host.endsWith('.' + normalizedBlocked)
    })
  } catch {
    return false
  }
}

/**
 * Validates if a string is a valid domain format
 * @param domain - Domain to validate
 * @returns true if valid domain
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false

  const normalized = normalizeHost(domain)
  return normalized !== null
}

/**
 * Common two-level public suffixes (eTLDs) where the registrable domain needs
 * three labels, e.g. `example.co.uk`. Not the full Public Suffix List — just the
 * widely-used multi-part TLDs, kept small to avoid a heavy dependency.
 */
const MULTI_PART_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'gov.uk',
  'ac.uk',
  'me.uk',
  'co.jp',
  'or.jp',
  'ne.jp',
  'com.au',
  'net.au',
  'org.au',
  'com.br',
  'com.mx',
  'com.ar',
  'com.tr',
  'com.sg',
  'com.cn',
  'com.hk',
  'com.tw',
  'co.in',
  'co.kr',
  'co.za',
  'co.nz',
  'co.il',
])

/**
 * Extracts the registrable (root) domain from a hostname, accounting for common
 * multi-part public suffixes.
 *
 * @param hostname - Full hostname (e.g., 'www.subdomain.example.com')
 * @returns Registrable domain (e.g., 'example.com'), or null if input is invalid
 *
 * @example
 * extractRootDomain('014.filmhd1080.icu')   // => 'filmhd1080.icu'
 * extractRootDomain('m.youtube.com')        // => 'youtube.com'
 * extractRootDomain('a.b.example.co.uk')    // => 'example.co.uk'
 */
export function extractRootDomain(hostname: string): string | null {
  const normalized = normalizeHost(hostname)
  if (!normalized) return null

  const parts = normalized.split('.')
  if (parts.length < 3) return normalized

  // If the last two labels form a known multi-part suffix, keep three labels.
  const lastTwo = parts.slice(-2).join('.')
  if (MULTI_PART_SUFFIXES.has(lastTwo)) {
    return parts.slice(-3).join('.')
  }

  // Default: registrable domain is the last two labels (domain.tld).
  return parts.slice(-2).join('.')
}

/**
 * Returns the registrable root domain for a host ONLY if the host carries a
 * strippable subdomain (i.e. blocking the root would broaden coverage). Used to
 * catch sites that rotate their subdomain (e.g. `014.filmhd1080.icu` →
 * `015.filmhd1080.icu`) while the registrable domain stays the same.
 *
 * @param host - Normalized host (e.g., '014.filmhd1080.icu')
 * @returns Root domain if it differs from `host`, otherwise null.
 *
 * @example
 * subdomainRoot('014.filmhd1080.icu') // => 'filmhd1080.icu'
 * subdomainRoot('youtube.com')        // => null (already a root domain)
 * subdomainRoot('example.co.uk')      // => null (already a root domain)
 */
export function subdomainRoot(host: string): string | null {
  if (!host) return null
  // Skip IP addresses — they have no registrable-domain concept.
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(':')) return null

  const root = extractRootDomain(host)
  if (!root || root === host) return null
  return root
}
