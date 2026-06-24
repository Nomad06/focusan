import { describe, it, expect } from 'vitest'
import { normalizeHost, extractRootDomain, subdomainRoot } from './domain'

describe('domain utils', () => {
  describe('normalizeHost', () => {
    it('should extract hostname from full URL', () => {
      const result = normalizeHost('https://www.example.com/path?query=value')
      expect(result).toBe('example.com')
    })

    it('should remove www prefix', () => {
      const result = normalizeHost('www.example.com')
      expect(result).toBe('example.com')
    })

    it('should handle URL without www', () => {
      const result = normalizeHost('https://example.com')
      expect(result).toBe('example.com')
    })

    it('should handle plain domain name', () => {
      const result = normalizeHost('example.com')
      expect(result).toBe('example.com')
    })

    it('should handle subdomain', () => {
      const result = normalizeHost('https://api.example.com')
      expect(result).toBe('api.example.com')
    })

    it('should preserve subdomain while removing www', () => {
      const result = normalizeHost('https://www.api.example.com')
      expect(result).toBe('api.example.com')
    })

    it('should convert to lowercase', () => {
      const result = normalizeHost('EXAMPLE.COM')
      expect(result).toBe('example.com')
    })

    it('should handle http protocol', () => {
      const result = normalizeHost('http://example.com')
      expect(result).toBe('example.com')
    })

    it('should handle URL with port', () => {
      const result = normalizeHost('https://example.com:8080')
      expect(result).toBe('example.com')
    })

    it('should handle URL with path and fragment', () => {
      const result = normalizeHost('https://www.example.com/path/to/page#section')
      expect(result).toBe('example.com')
    })

    it('should handle URL with username and password', () => {
      const result = normalizeHost('https://user:pass@example.com')
      expect(result).toBe('example.com')
    })

    it('should handle international domain names', () => {
      const result = normalizeHost('https://münchen.de')
      expect(result).toBe('xn--mnchen-3ya.de')
    })

    it('should handle URL with multiple query parameters', () => {
      const result = normalizeHost('https://example.com?foo=bar&baz=qux')
      expect(result).toBe('example.com')
    })

    it('should handle trailing slash', () => {
      const result = normalizeHost('https://example.com/')
      expect(result).toBe('example.com')
    })

    it('should handle multiple www prefixes (edge case)', () => {
      const result = normalizeHost('www.www.example.com')
      expect(result).toBe('www.example.com')
    })

    it('should return null for empty string', () => {
      const result = normalizeHost('')
      expect(result).toBeNull()
    })

    it('should return null for invalid domain', () => {
      // Invalid domains should return null
      const result = normalizeHost('not a url at all')
      expect(result).toBeNull()
    })

    it('should handle localhost', () => {
      const result = normalizeHost('http://localhost:3000')
      expect(result).toBe('localhost')
    })

    it('should handle IP addresses', () => {
      const result = normalizeHost('http://192.168.1.1')
      expect(result).toBe('192.168.1.1')
    })

    it('should handle deep subdomains', () => {
      const result = normalizeHost('https://api.v2.staging.example.com')
      expect(result).toBe('api.v2.staging.example.com')
    })

    it('should handle www in subdomain but not root', () => {
      const result = normalizeHost('https://www.api.example.com')
      expect(result).toBe('api.example.com')
    })
  })

  describe('extractRootDomain', () => {
    it('should strip a numeric rotating subdomain', () => {
      expect(extractRootDomain('014.filmhd1080.icu')).toBe('filmhd1080.icu')
    })

    it('should strip a normal subdomain', () => {
      expect(extractRootDomain('m.youtube.com')).toBe('youtube.com')
    })

    it('should collapse deep subdomains to the registrable domain', () => {
      expect(extractRootDomain('api.v2.staging.example.com')).toBe('example.com')
    })

    it('should keep three labels for multi-part TLDs', () => {
      expect(extractRootDomain('a.b.example.co.uk')).toBe('example.co.uk')
    })

    it('should return a root domain unchanged', () => {
      expect(extractRootDomain('example.com')).toBe('example.com')
    })

    it('should return a multi-part-TLD root domain unchanged', () => {
      expect(extractRootDomain('example.co.uk')).toBe('example.co.uk')
    })

    it('should return null for invalid input', () => {
      expect(extractRootDomain('not a domain')).toBeNull()
    })
  })

  describe('subdomainRoot', () => {
    it('should return the root for a rotating subdomain host', () => {
      expect(subdomainRoot('014.filmhd1080.icu')).toBe('filmhd1080.icu')
    })

    it('should return the root for a normal subdomain', () => {
      expect(subdomainRoot('m.youtube.com')).toBe('youtube.com')
    })

    it('should return null for a plain root domain', () => {
      expect(subdomainRoot('filmhd1080.icu')).toBeNull()
      expect(subdomainRoot('example.com')).toBeNull()
    })

    it('should return null for a multi-part-TLD root domain', () => {
      expect(subdomainRoot('example.co.uk')).toBeNull()
    })

    it('should return null for IP addresses', () => {
      expect(subdomainRoot('192.168.1.1')).toBeNull()
    })

    it('should return null for empty input', () => {
      expect(subdomainRoot('')).toBeNull()
    })
  })
})
