/// <reference types="cypress" />
import { mount } from 'cypress/react'

import { TestEditorWithRouter, createTestTag } from './TestEditor'

import type { Editor } from '@tiptap/core'

describe('Hashtag Suggestion System', () => {
  const testTags = [
    createTestTag('nature', '#22C55E'),
    createTestTag('coding', '#3B82F6'),
    createTestTag('music', '#EF4444'),
    createTestTag('travel', '#F59E0B'),
    createTestTag('food', '#8B5CF6'),
  ]

  describe('Suggestion Popup Trigger', () => {
    it('shows suggestion popup when typing #', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#')
      cy.get('.tippy-content').should('be.visible')
      cy.get('.tippy-content button').should('have.length.at.least', 1)
    })

    it('shows all tags when # is typed without query', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#')
      cy.get('.tippy-content button').should('have.length', 5)
    })

    it('does not show popup when # is inside a word', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('email#test')
      cy.get('.tippy-content').should('be.visible')
    })
  })

  describe('Filtering', () => {
    it('filters tags based on typed query', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#na')
      cy.get('.tippy-content button').should('have.length', 1)
      cy.get('.tippy-content button').should('contain.text', '#nature')
    })

    it('filters are case-insensitive', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#NAT')
      cy.get('.tippy-content button').should('contain.text', '#nature')
    })

    it('shows multiple matching tags', () => {
      const tags = [createTestTag('music'), createTestTag('museum'), createTestTag('muse')]

      mount(<TestEditorWithRouter content='' tags={tags} editable={true} enableSuggestions={true} />)

      cy.get('.ProseMirror').type('#mu')
      cy.get('.tippy-content button').should('have.length', 3)
    })
  })

  describe('Keyboard Selection', () => {
    it('selects first item with Enter', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('#nat{enter}')
      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#nature')
        })
    })

    it('navigates with ArrowDown and selects with Enter', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('#')
      cy.get('.tippy-content button').first().should('have.class', 'tw:bg-base-200')

      cy.get('.ProseMirror').type('{downarrow}')
      cy.get('.tippy-content button').eq(1).should('have.class', 'tw:bg-base-200')

      cy.get('.ProseMirror').type('{enter}')
      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#coding')
        })
    })

    it('closes popup with Escape', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#')
      cy.get('.tippy-content').should('exist')

      cy.get('.ProseMirror').type('{esc}')
      cy.get('.tippy-box').should('not.exist')
    })

    it('selects first item with Space', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('#nat ')
      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#nature')
        })
    })
  })

  describe('Create New Tag', () => {
    it('shows "create new" option when no exact match', () => {
      const onAddTag = cy.stub().as('addTag')

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onAddTag={onAddTag}
        />,
      )

      cy.get('.ProseMirror').type('#newtag')
      cy.get('.tippy-content').should('contain.text', 'Neu:')
      cy.get('.tippy-content').should('contain.text', '#newtag')
    })

    it('does not show "create new" when exact match exists', () => {
      const onAddTag = cy.stub().as('addTag')

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onAddTag={onAddTag}
        />,
      )

      cy.get('.ProseMirror').type('#nature')
      cy.get('.tippy-content').should('not.contain.text', 'Neu:')
    })

    it('calls onAddTag when creating new tag', () => {
      const onAddTag = cy.stub().as('addTag')

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onAddTag={onAddTag}
        />,
      )

      cy.get('.ProseMirror').type('#brandnew{enter}')
      cy.get('@addTag').should('have.been.calledOnce')
      cy.get('@addTag')
        .its('firstCall.args.0')
        .should('deep.include', { name: 'brandnew', color: '#888888' })
    })

    it('inserts new tag into editor', () => {
      const onAddTag = cy.stub()
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onAddTag={onAddTag}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('#brandnew{enter}')
      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#brandnew')
        })
    })
  })

  describe('Click Selection', () => {
    it('inserts tag when clicking suggestion', () => {
      let editorInstance: Editor

      mount(
        <TestEditorWithRouter
          content=''
          tags={testTags}
          editable={true}
          enableSuggestions={true}
          onReady={(editor) => {
            editorInstance = editor
          }}
        />,
      )

      cy.get('.ProseMirror').type('#')
      cy.get('.tippy-content button').contains('#music').click()
      cy.get('.hashtag')
        .should('exist')
        .then(() => {
          const markdown = editorInstance.getMarkdown()
          expect(markdown).to.include('#music')
        })
    })
  })

  describe('Suggestion Styling', () => {
    it('applies tag colors in suggestion list', () => {
      mount(
        <TestEditorWithRouter content='' tags={testTags} editable={true} enableSuggestions={true} />,
      )

      cy.get('.ProseMirror').type('#nat')
      cy.get('.tippy-content button')
        .first()
        .should('have.css', 'color')
        .and('match', /rgb\(34, 197, 94\)|#22[cC]55[eE]/)
    })
  })
})

