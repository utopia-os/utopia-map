/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter, createTestItem } from './TestEditor'

import type { Editor } from '@tiptap/core'

describe('ItemMention Extension', () => {
  describe('Item Mention Parsing', () => {
    // Note: Item IDs are UUIDs (hex format: [a-fA-F0-9-])
    // Example real UUID: "144e379c-b719-4334-9f0e-de277d3b6d0f"

    it('parses standard item mention with UUID', () => {
      // Using realistic UUID format
      const content = 'Thanks [@Alice](/item/144e379c-b719-4334-9f0e-de277d3b6d0f)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('exist')
      cy.get('.item-mention').should('contain.text', '@Alice')
    })

    it('parses item mention with layer path (legacy format)', () => {
      // The regex: /^\[@([^\]]+?)\]\(\/item\/(?:[^/]+\/)?([a-fA-F0-9-]+)\)/
      // Captures layer name as optional non-capturing group, then hex UUID
      const content = 'See [@Bob](/item/people/efe00aaa-8b14-47b5-a032-3e0560980c1e)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('exist')
      cy.get('.item-mention').should('contain.text', '@Bob')
    })

    it('parses multiple item mentions', () => {
      const content = '[@Alice](/item/aaa-111) and [@Bob](/item/bbb-222)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('have.length', 2)
    })

    it('parses item mention with spaces in label', () => {
      const content = 'Contact [@Max Müller](/item/abc-123-def)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('contain.text', '@Max Müller')
    })

    it('parses item mention with uppercase UUID', () => {
      // UUIDs are case-insensitive, regex uses [a-fA-F0-9-]
      const content = '[@Name](/item/ABC-DEF-123)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('exist')
    })
  })

  describe('Item Mention Styling', () => {
    it('applies color from known item', () => {
      const items = [createTestItem('abc-123', 'Alice', '#EF4444')]
      const content = '[@Alice](/item/abc-123)'

      mount(<TestEditorWithRouter content={content} items={items} />)

      cy.get('.item-mention')
        .should('have.css', 'color')
        .and('match', /rgb\(239, 68, 68\)|#[eE][fF]4444/)
    })

    it('uses getItemColor function when provided', () => {
      const items = [createTestItem('abc-123', 'Alice')]
      const getItemColor = () => '#8B5CF6' // Purple
      const content = '[@Alice](/item/abc-123)'

      mount(<TestEditorWithRouter content={content} items={items} getItemColor={getItemColor} />)

      cy.get('.item-mention')
        .should('have.css', 'color')
        .and('match', /rgb\(139, 92, 246\)|#8[bB]5[cC][fF]6/)
    })

    it('uses fallback color for unknown item', () => {
      // UUID must be hex characters only: [a-fA-F0-9-]
      const content = '[@Unknown](/item/aaa-bbb-ccc-111)'

      mount(<TestEditorWithRouter content={content} items={[]} />)

      // Should still render, using fallback color
      cy.get('.item-mention').should('exist')
    })

    it('has bold font weight', () => {
      const content = '[@Test](/item/123)'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.item-mention').should('have.class', 'tw:font-bold')
    })
  })

  describe('Item Mention Click Behavior', () => {
    it('shows pointer cursor in view mode', () => {
      const content = '[@Alice](/item/123)'

      mount(<TestEditorWithRouter content={content} editable={false} />)

      cy.get('.item-mention').should('have.css', 'cursor', 'pointer')
    })

    it('shows text cursor in edit mode', () => {
      const content = '[@Alice](/item/123)'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('.item-mention').should('have.css', 'cursor', 'text')
    })

    // Note: Navigation behavior uses react-router's useNavigate
    // Full navigation testing would require more complex setup
  })

  describe('Markdown Serialization (Roundtrip)', () => {
    it('serializes item mention back to markdown', () => {
      const content = '[@Alice](/item/abc-123)'
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content={content}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('[@Alice](/item/abc-123)')
          return null
        })
    })
  })

  describe('Edge Cases', () => {
    it('does not parse regular links without @', () => {
      const content = '[Alice](/item/123)'

      mount(<TestEditorWithRouter content={content} />)

      // Should be a regular link, not an item mention
      cy.get('.item-mention').should('not.exist')
      cy.get('a').should('contain.text', 'Alice')
    })

    it('does not parse @ links to non-item paths', () => {
      const content = '[@Alice](/profile/123)'

      mount(<TestEditorWithRouter content={content} />)

      // Should be a regular link, not an item mention
      cy.get('.item-mention').should('not.exist')
    })
  })
})
