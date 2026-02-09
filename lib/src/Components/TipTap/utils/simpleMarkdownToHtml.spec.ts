import { describe, it, expect } from 'vitest'

import { simpleMarkdownToHtml } from './simpleMarkdownToHtml'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

// Test fixtures
const mockTags: Tag[] = [
  { id: '1', name: 'nature', color: '#22c55e' },
  { id: '2', name: 'tech', color: '#3b82f6' },
]

const mockItems: Item[] = [
  { id: 'abc-123', name: 'Alice', color: '#ef4444' } as Item,
  { id: 'def-456', name: 'Bob', color: '#8b5cf6' } as Item,
]

const mockGetItemColor = (item: Item | undefined, fallback = '#3b82f6') => item?.color ?? fallback

// ============================================================================
// Basic Markdown Formatting
// ============================================================================
describe('simpleMarkdownToHtml', () => {
  describe('Basic Formatting', () => {
    it('converts bold with double asterisks', () => {
      const result = simpleMarkdownToHtml('**bold**', [])
      expect(result).toContain('<strong>bold</strong>')
    })

    it('converts bold with double underscores', () => {
      const result = simpleMarkdownToHtml('__bold__', [])
      expect(result).toContain('<strong>bold</strong>')
    })

    it('converts italic with single asterisk', () => {
      const result = simpleMarkdownToHtml('*italic*', [])
      expect(result).toContain('<em>italic</em>')
    })

    it('converts italic with single underscore', () => {
      const result = simpleMarkdownToHtml('_italic_', [])
      expect(result).toContain('<em>italic</em>')
    })

    it('converts inline code', () => {
      const result = simpleMarkdownToHtml('use `code` here', [])
      expect(result).toContain('<code>code</code>')
    })

    it('converts headers H1-H6', () => {
      expect(simpleMarkdownToHtml('# Title', [])).toContain('<h1>Title</h1>')
      expect(simpleMarkdownToHtml('## Subtitle', [])).toContain('<h2>Subtitle</h2>')
      expect(simpleMarkdownToHtml('### Section', [])).toContain('<h3>Section</h3>')
      expect(simpleMarkdownToHtml('###### Deep', [])).toContain('<h6>Deep</h6>')
    })

    it('does not convert blockquotes (> is HTML-escaped before regex)', () => {
      // Note: The current implementation HTML-escapes > before the blockquote regex runs
      // This documents actual behavior - blockquotes are not supported in simpleMarkdownToHtml
      const result = simpleMarkdownToHtml('> quoted text', [])
      expect(result).toContain('&gt;')
    })
  })

  describe('Links', () => {
    it('converts external links with target blank', () => {
      const result = simpleMarkdownToHtml('[Example](https://example.com)', [])
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })

    it('converts internal links without target blank', () => {
      const result = simpleMarkdownToHtml('[Profile](/profile)', [])
      expect(result).toContain('href="/profile"')
      expect(result).not.toContain('target="_blank"')
    })
  })

  describe('Line Breaks and Paragraphs', () => {
    it('converts double newline to paragraph break', () => {
      const result = simpleMarkdownToHtml('Para1\n\nPara2', [])
      expect(result).toContain('</p><p>')
    })

    it('converts single newline to br', () => {
      const result = simpleMarkdownToHtml('Line1\nLine2', [])
      expect(result).toContain('<br>')
    })

    it('wraps content in paragraph tags', () => {
      const result = simpleMarkdownToHtml('Hello world', [])
      expect(result).toMatch(/^<p>.*<\/p>$/)
    })
  })

  describe('Video Embeds', () => {
    it('converts YouTube video-embed to iframe', () => {
      const input = '<video-embed provider="youtube" video-id="abc123"></video-embed>'
      const result = simpleMarkdownToHtml(input, [])
      expect(result).toContain('iframe')
      expect(result).toContain('youtube-nocookie.com/embed/abc123')
    })

    it('converts Rumble video-embed to iframe', () => {
      const input = '<video-embed provider="rumble" video-id="xyz789"></video-embed>'
      const result = simpleMarkdownToHtml(input, [])
      expect(result).toContain('iframe')
      expect(result).toContain('rumble.com/embed/xyz789')
    })
  })

  describe('Hashtags', () => {
    it('renders hashtag with known tag color', () => {
      const input = '<span data-hashtag data-label="nature">#nature</span>'
      const result = simpleMarkdownToHtml(input, mockTags)
      expect(result).toContain('style="color: #22c55e')
      expect(result).toContain('class="hashtag"')
    })

    it('renders hashtag with inherit color for unknown tag', () => {
      const input = '<span data-hashtag data-label="unknown">#unknown</span>'
      const result = simpleMarkdownToHtml(input, [])
      expect(result).toContain('style="color: inherit')
    })
  })

  describe('Item Mentions', () => {
    it('renders mention as link with item color', () => {
      const input = '<span data-item-mention data-label="Alice" data-id="abc-123">@Alice</span>'
      const result = simpleMarkdownToHtml(input, [], {
        items: mockItems,
        getItemColor: mockGetItemColor,
      })
      expect(result).toContain('href="/item/abc-123"')
      expect(result).toContain('class="item-mention"')
      expect(result).toContain('style="color: #ef4444')
    })

    it('renders mention with fallback color for unknown item', () => {
      const input = '<span data-item-mention data-label="Unknown" data-id="xxx">@Unknown</span>'
      const result = simpleMarkdownToHtml(input, [], { items: [], getItemColor: mockGetItemColor })
      // Fallback uses CSS variable with hex fallback
      expect(result).toContain('style="color: var(--color-primary, #3b82f6)')
    })
  })

  describe('Edge Cases', () => {
    it('returns empty string for empty input', () => {
      expect(simpleMarkdownToHtml('', [])).toBe('')
    })

    it('returns empty string for null input', () => {
      // @ts-expect-error testing null input
      expect(simpleMarkdownToHtml(null, [])).toBe('')
    })

    it('handles consecutive newlines without excessive empty elements', () => {
      const result = simpleMarkdownToHtml('\n\n\n\n', [])
      expect(result).not.toContain('<p></p>')
    })
  })
})
