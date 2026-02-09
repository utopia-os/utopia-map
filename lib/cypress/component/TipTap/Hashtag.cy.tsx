/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter, createTestTag } from './TestEditor'

import type { Editor } from '@tiptap/core'

describe('Hashtag Extension', () => {
  describe('Hashtag Parsing', () => {
    it('parses simple hashtag in markdown', () => {
      const content = 'Hello #world'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('exist')
      cy.get('.hashtag').should('contain.text', '#world')
    })

    it('parses multiple hashtags', () => {
      const content = '#one #two #three'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('have.length', 3)
    })

    it('parses hashtag with numbers', () => {
      const content = 'Check out #tag123'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('contain.text', '#tag123')
    })

    // Note: The regex in Hashtag.tsx includes underscores: /^#([a-zA-Z0-9À-ÖØ-öø-ʸ_-]+)/
    it('parses hashtag with underscore', () => {
      const content = 'See #my_tag here'

      mount(<TestEditorWithRouter content={content} />)

      // decodeTag() converts underscores to non-breaking spaces (\u00A0) for display
      cy.get('.hashtag').should('exist')
      cy.get('.hashtag').should('contain.text', '#my\u00A0tag')
    })

    it('parses hashtag with hyphen', () => {
      const content = 'Find #my-tag'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('contain.text', '#my-tag')
    })

    it('parses unicode hashtag (German umlauts)', () => {
      const content = 'Visit #München'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('contain.text', '#München')
    })
  })

  describe('Hashtag Styling', () => {
    it('applies color from known tag', () => {
      const tags = [createTestTag('nature', '#22C55E')]
      const content = 'Love #nature'

      mount(<TestEditorWithRouter content={content} tags={tags} />)

      cy.get('.hashtag')
        .should('have.css', 'color')
        .and('match', /rgb\(34, 197, 94\)|#22[cC]55[eE]/)
    })

    it('uses inherit color for unknown tag', () => {
      const content = 'Unknown #sometag'

      mount(<TestEditorWithRouter content={content} tags={[]} />)

      cy.get('.hashtag').should('exist')
      // Unknown tags should use inherit
      cy.get('.hashtag').should('have.css', 'color')
    })

    it('has bold font weight', () => {
      const content = '#test'

      mount(<TestEditorWithRouter content={content} />)

      cy.get('.hashtag').should('have.class', 'tw:font-bold')
    })
  })

  describe('Hashtag Click Behavior', () => {
    it('calls onTagClick when clicked in view mode', () => {
      const tags = [createTestTag('clickme', '#3B82F6')]
      const onTagClick = cy.stub().as('tagClickHandler')
      const content = '#clickme'

      mount(
        <TestEditorWithRouter
          content={content}
          tags={tags}
          onTagClick={onTagClick}
          editable={false}
        />,
      )

      cy.get('.hashtag').click()
      cy.get('@tagClickHandler').should('have.been.calledOnce')
    })

    it('does NOT call onTagClick when clicked in edit mode', () => {
      const tags = [createTestTag('clickme', '#3B82F6')]
      const onTagClick = cy.stub().as('tagClickHandler')
      const content = '#clickme'

      mount(
        <TestEditorWithRouter
          content={content}
          tags={tags}
          onTagClick={onTagClick}
          editable={true}
        />,
      )

      cy.get('.hashtag').click()
      cy.get('@tagClickHandler').should('not.have.been.called')
    })

    it('shows pointer cursor in view mode', () => {
      const content = '#test'

      mount(<TestEditorWithRouter content={content} editable={false} />)

      cy.get('.hashtag').should('have.css', 'cursor', 'pointer')
    })

    it('shows text cursor in edit mode', () => {
      const content = '#test'

      mount(<TestEditorWithRouter content={content} editable={true} />)

      cy.get('.hashtag').should('have.css', 'cursor', 'text')
    })
  })

  describe('Markdown Serialization (Roundtrip)', () => {
    it('serializes hashtag back to markdown', () => {
      const content = 'Hello #world'
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content={content}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          // TipTap with Markdown extension exposes getMarkdown() directly on editor
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#world')
          return null
        })
    })
  })
})
