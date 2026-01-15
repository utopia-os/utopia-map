/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter } from './TestEditor'

import type { Editor } from '@tiptap/core'

/**
 * Roundtrip tests verify that Markdown -> TipTap -> Markdown preserves
 * key content elements. Note: TipTap may normalize markdown (whitespace,
 * list markers, etc.) so we test for semantic preservation, not exact match.
 */
describe('Markdown Roundtrip Tests', () => {
  function testRoundtripContains(originalMarkdown: string, expectedPatterns: string[]) {
    let editorInstance: Editor | undefined

    mount(
      <TestEditorWithRouter
        content={originalMarkdown}
        onReady={(editor) => {
          editorInstance = editor
        }}
      />,
    )

    cy.get('[data-testid="test-editor"]')
      .should('exist')
      .should(() => expect(editorInstance).to.exist)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const markdown = editorInstance!.getMarkdown()
        for (const pattern of expectedPatterns) {
          expect(markdown).to.include(pattern)
        }
        return null
      })
  }

  describe('Custom Extensions Roundtrip', () => {
    // These are the critical tests - our custom extensions must serialize correctly

    it('hashtag: #tag is preserved', () => {
      testRoundtripContains('Hello #world', ['#world'])
    })

    it('hashtag: multiple hashtags preserved', () => {
      testRoundtripContains('#one #two #three', ['#one', '#two', '#three'])
    })

    it('item mention: preserved with correct format', () => {
      // Using hex UUID as required by the regex
      testRoundtripContains('Thanks [@Alice](/item/abc-123-def)', ['[@Alice](/item/abc-123-def)'])
    })

    it('item mention: with spaces in name', () => {
      testRoundtripContains('Contact [@Max Müller](/item/abc-123)', [
        '[@Max Müller](/item/abc-123)',
      ])
    })

    it('video embed: YouTube autolink preserved', () => {
      testRoundtripContains('<https://www.youtube.com/watch?v=dQw4w9WgXcQ>', [
        '<https://www.youtube.com/watch?v=dQw4w9WgXcQ>',
      ])
    })
  })

  describe('Standard Markdown Roundtrip', () => {
    it('plain text preserved', () => {
      testRoundtripContains('Hello, world!', ['Hello, world!'])
    })

    it('bold text preserved', () => {
      testRoundtripContains('This is **bold** text.', ['**bold**'])
    })

    it('italic text preserved', () => {
      testRoundtripContains('This is *italic* text.', ['*italic*'])
    })

    it('inline code preserved', () => {
      testRoundtripContains('Use `code` here.', ['`code`'])
    })

    it('links preserved', () => {
      testRoundtripContains('Visit [Example](https://example.com).', [
        '[Example](https://example.com)',
      ])
    })
  })

  describe('Complex Content Roundtrip', () => {
    it('mixed content with all custom extensions', () => {
      const content = 'Hello #world! Thanks [@Alice](/item/abc-123) for helping.'
      testRoundtripContains(content, ['#world', '[@Alice](/item/abc-123)', 'Hello', 'for helping'])
    })

    it('formatting with hashtags', () => {
      testRoundtripContains('**Bold** text with #hashtag and *italic*.', [
        '**Bold**',
        '#hashtag',
        '*italic*',
      ])
    })
  })
})
