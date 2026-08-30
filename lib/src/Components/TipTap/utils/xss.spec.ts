/**
 * XSS Security Test Suite
 *
 * Tests for Cross-Site Scripting (XSS) prevention in simpleMarkdownToHtml.
 * These tests verify that malicious input is properly escaped or sanitized.
 */
import { describe, it, expect } from 'vitest'

import { simpleMarkdownToHtml } from './simpleMarkdownToHtml'

// ============================================================================
// XSS Attack Vectors
// ============================================================================
const XSS_VECTORS = {
  // Basic script injection
  scriptTag: '<script>alert(1)</script>',
  scriptTagUppercase: '<SCRIPT>alert(1)</SCRIPT>',
  scriptTagMixed: '<ScRiPt>alert(1)</ScRiPt>',

  // Event handlers
  imgOnerror: '<img src=x onerror=alert(1)>',
  svgOnload: '<svg onload=alert(1)>',
  bodyOnload: '<body onload=alert(1)>',
  divOnmouseover: '<div onmouseover=alert(1)>hover</div>',

  // JavaScript URLs
  jsHref: '<a href="javascript:alert(1)">click</a>',
  jsHrefEncoded: '<a href="javascript&#58;alert(1)">click</a>',

  // Data URLs
  dataUrl: '<a href="data:text/html,<script>alert(1)</script>">click</a>',

  // Style injection
  styleExpression: '<div style="background:url(javascript:alert(1))">',

  // Object/embed tags
  objectTag: '<object data="javascript:alert(1)">',
  embedTag: '<embed src="javascript:alert(1)">',
}

describe('XSS Prevention - simpleMarkdownToHtml', () => {
  describe('Script Tag Injection', () => {
    it('escapes basic script tags', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.scriptTag, [])
      expect(result).not.toContain('<script')
      expect(result).toContain('&lt;script')
    })

    it('escapes uppercase script tags', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.scriptTagUppercase, [])
      expect(result).not.toContain('<SCRIPT')
      expect(result).toContain('&lt;SCRIPT')
    })

    it('escapes mixed-case script tags', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.scriptTagMixed, [])
      expect(result).not.toContain('<ScRiPt')
    })
  })

  describe('Event Handler Injection', () => {
    // Note: Event handlers in raw HTML are escaped as text (angle brackets escaped)
    // The handler text remains but is not executable because the tag is escaped
    it('escapes img tag making onerror non-executable', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.imgOnerror, [])
      // Tag is escaped, so it renders as text, not as HTML
      expect(result).toContain('&lt;img')
    })

    it('escapes svg tag making onload non-executable', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.svgOnload, [])
      expect(result).toContain('&lt;svg')
    })

    it('escapes body tag making onload non-executable', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.bodyOnload, [])
      expect(result).toContain('&lt;body')
    })

    it('escapes div tag making onmouseover non-executable', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.divOnmouseover, [])
      expect(result).toContain('&lt;div')
    })
  })

  describe('JavaScript URL Injection', () => {
    it('escapes javascript: URLs in raw HTML', () => {
      const result = simpleMarkdownToHtml(XSS_VECTORS.jsHref, [])
      // The raw HTML should be escaped, not rendered
      expect(result).toContain('&lt;a')
    })

    it('sanitizes javascript: URLs in markdown links', () => {
      const result = simpleMarkdownToHtml('[click](javascript:alert(1))', [])
      // javascript: URL should be replaced with '#'
      expect(result).toContain('href="#"')
      expect(result).not.toContain('javascript:')
    })

    it('sanitizes data: URLs in markdown links', () => {
      const result = simpleMarkdownToHtml('[click](data:text/html,<script>alert(1)</script>)', [])
      expect(result).toContain('href="#"')
      expect(result).not.toContain('data:')
    })

    it('allows safe http: and https: URLs', () => {
      const httpResult = simpleMarkdownToHtml('[safe](http://example.com)', [])
      const httpsResult = simpleMarkdownToHtml('[safe](https://example.com)', [])
      expect(httpResult).toContain('href="http://example.com"')
      expect(httpsResult).toContain('href="https://example.com"')
    })

    it('allows relative URLs', () => {
      const result = simpleMarkdownToHtml('[profile](/user/123)', [])
      expect(result).toContain('href="/user/123"')
    })
  })

  describe('Tag Restoration Security', () => {
    // The tag restoration mechanism now uses strict patterns that only match
    // exactly formatted tags, preventing injection of malicious attributes.

    it('blocks span tags with malicious onclick', () => {
      const malicious = '<span data-hashtag onclick=alert(1)>#tag</span>'
      const result = simpleMarkdownToHtml(malicious, [])
      // Malformed tag should remain escaped
      expect(result).not.toContain('<span data-hashtag onclick')
      expect(result).toContain('&lt;span')
    })

    it('blocks video-embed with malicious onload', () => {
      const malicious = '<video-embed onload=alert(1)></video-embed>'
      const result = simpleMarkdownToHtml(malicious, [])
      // Malformed tag should remain escaped
      expect(result).not.toContain('<video-embed onload')
    })

    it('only restores properly formatted hashtag spans', () => {
      // Properly formatted hashtag span
      const valid = '<span data-hashtag data-label="nature">#nature</span>'
      const result = simpleMarkdownToHtml(valid, [])
      expect(result).toContain('class="hashtag"')
    })

    it('only restores properly formatted video-embed tags', () => {
      // Properly formatted video embed
      const valid = '<video-embed provider="youtube" video-id="abc123"></video-embed>'
      const result = simpleMarkdownToHtml(valid, [])
      expect(result).toContain('iframe')
      expect(result).toContain('youtube-nocookie.com/embed/abc123')
    })
  })

  describe('Attribute Injection Prevention', () => {
    it('blocks extra attributes in hashtag spans (tag remains escaped)', () => {
      // Attempt to inject onclick via extra attribute
      const malicious = '<span data-hashtag data-label="x" onclick="alert(1)">#x</span>'
      const result = simpleMarkdownToHtml(malicious, [])
      // The tag should remain fully escaped, not restored as HTML
      // The key security property is that the opening tag stays escaped (&lt;span)
      expect(result).toContain('&lt;span')
      // It should NOT contain an unescaped <span with onclick
      expect(result).not.toMatch(/<span[^>]*onclick/i)
    })

    it('blocks javascript: in hashtag labels', () => {
      const malicious = '<span data-hashtag data-label="javascript:alert(1)">#tag</span>'
      const result = simpleMarkdownToHtml(malicious, [])
      // Tag should remain escaped due to dangerous content in label
      expect(result).toContain('&lt;span')
    })
  })

  describe('HTML Entity Handling', () => {
    it('preserves already-escaped content', () => {
      const result = simpleMarkdownToHtml('&amp; &lt; &gt;', [])
      // Double-escaping - &amp; becomes &amp;amp;
      expect(result).toContain('&amp;amp;')
    })

    it('escapes angle brackets', () => {
      const result = simpleMarkdownToHtml('1 < 2 > 0', [])
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })
  })

  describe('Edge Cases', () => {
    it('handles nested script attempts', () => {
      const result = simpleMarkdownToHtml('<<script>script>alert(1)<</script>/script>', [])
      expect(result).not.toContain('<script')
    })

    it('handles null bytes', () => {
      const result = simpleMarkdownToHtml('<scr\0ipt>alert(1)</script>', [])
      expect(result).not.toContain('<scr')
    })
  })
})
