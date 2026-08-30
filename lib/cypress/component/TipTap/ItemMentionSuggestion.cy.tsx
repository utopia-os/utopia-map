/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter, createTestItem } from './TestEditor'

import type { Editor } from '@tiptap/core'

describe('Item Mention Suggestion System', () => {
  const testItems = [
    createTestItem('id-1', 'Alice', '#22C55E'),
    createTestItem('id-2', 'Bob', '#3B82F6'),
    createTestItem('id-3', 'Charlie', '#EF4444'),
    createTestItem('id-4', 'Diana', '#F59E0B'),
    createTestItem('id-5', 'Eve', '#8B5CF6'),
  ]

  describe('Suggestion Popup Trigger', () => {
    it('shows suggestion popup when typing @', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content').should('be.visible')
      cy.get('.tippy-content button').should('have.length.at.least', 1)
    })

    it('shows all items when @ is typed without query', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button').should('have.length', 5)
    })
  })

  describe('Filtering', () => {
    it('filters items based on typed query', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@ali')
      cy.get('.tippy-content button').should('have.length', 1)
      cy.get('.tippy-content button').should('contain.text', '@Alice')
    })

    it('filters are case-insensitive', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@ALICE')
      cy.get('.tippy-content button').should('contain.text', '@Alice')
    })

    it('matches items containing query (not just starts with)', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@li')
      cy.get('.tippy-content button').should('contain.text', '@Alice')
      cy.get('.tippy-content button').should('contain.text', '@Charlie')
    })

    it('shows empty state when no items match', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@xyz123')
      cy.get('.tippy-content').should('contain.text', 'Keine Ergebnisse')
    })
  })

  describe('Keyboard Selection', () => {
    it('selects first item with Enter', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('@ali{enter}')
      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('[@Alice]')
          expect(markdown).to.include('/item/id-1')
        })
    })

    it('navigates with ArrowDown and selects with Enter', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button').first().should('have.class', 'tw:bg-base-200')

      cy.get('.ProseMirror').type('{downarrow}')
      cy.get('.tippy-content button').eq(1).should('have.class', 'tw:bg-base-200')

      cy.get('.ProseMirror').type('{enter}')
      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('[@Bob]')
        })
    })

    it('closes popup with Escape', () => {
      mount(
        <TestEditorWithRouter content='' items={testItems} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content').should('exist')

      cy.get('.ProseMirror').type('{esc}')
      cy.get('.tippy-box').should('not.exist')
    })
  })

  describe('Click Selection', () => {
    it('inserts mention when clicking suggestion', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button').contains('@Charlie').click()
      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('[@Charlie]')
          expect(markdown).to.include('/item/id-3')
        })
    })
  })

  describe('Suggestion Styling', () => {
    it('applies item colors in suggestion list via getItemColor', () => {
      const getItemColor = (item: any) => item?.color ?? '#000000'

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          getItemColor={getItemColor}
        />,
      )

      cy.get('.ProseMirror').type('@ali')
      cy.get('.tippy-content button')
        .first()
        .should('have.css', 'color')
        .and('match', /rgb\(34, 197, 94\)|#22[cC]55[eE]/)
    })

    it('uses getItemColor function when provided', () => {
      const getItemColor = () => '#FF00FF'

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          getItemColor={getItemColor}
        />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button')
        .first()
        .should('have.css', 'color')
        .and('match', /rgb\(255, 0, 255\)|#[fF]{2}00[fF]{2}/)
    })
  })

  describe('Markdown Serialization', () => {
    it('serializes item mention to correct markdown format', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('@dia{enter}')
      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.match(/\[@Diana\]\(\/item\/id-4\)/)
        })
    })

    it('inserts space after mention for continued typing', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          items={testItems}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('@eve{enter}is here')
      cy.get('.item-mention')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('@Eve')
          expect(markdown).to.include('is here')
        })
    })
  })

  describe('Edge Cases', () => {
    it('handles items without names', () => {
      const itemsWithEmpty = [...testItems, { id: 'no-name', name: '' } as any]

      mount(
        <TestEditorWithRouter
          content=''
          items={itemsWithEmpty}
          editable={true}
          enableSuggestions={true}
        />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button').should('have.length', 5)
    })

    it('limits suggestions to 8 items', () => {
      const manyItems = Array.from({ length: 15 }, (_, i) =>
        createTestItem(`id-${i}`, `Person ${i}`),
      )

      mount(
        <TestEditorWithRouter
          content=''
          items={manyItems}
          editable={true}
          enableSuggestions={true}
        />,
      )

      cy.get('.ProseMirror').type('@')
      cy.get('.tippy-content button').should('have.length', 8)
    })
  })
})

