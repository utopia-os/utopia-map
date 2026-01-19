/// <reference types="cypress" />
import { mount } from 'cypress/react'
import { createRef } from 'react'

import { SuggestionList, SuggestionListRef } from '#components/TipTap/extensions/suggestions/SuggestionList'

import { createTestItem, createTestTag } from './TestEditor'

describe('SuggestionList Component', () => {
  describe('Rendering', () => {
    it('renders hashtag items with # prefix', () => {
      const tags = [createTestTag('nature'), createTestTag('coding')]
      const command = cy.stub()

      mount(<SuggestionList items={tags} command={command} type='hashtag' />)

      cy.get('button').should('have.length', 2)
      cy.get('button').first().should('contain.text', '#nature')
      cy.get('button').last().should('contain.text', '#coding')
    })

    it('renders item mentions with @ prefix', () => {
      const items = [createTestItem('1', 'Alice'), createTestItem('2', 'Bob')]
      const command = cy.stub()

      mount(<SuggestionList items={items} command={command} type='item' />)

      cy.get('button').should('have.length', 2)
      cy.get('button').first().should('contain.text', '@Alice')
      cy.get('button').last().should('contain.text', '@Bob')
    })

    it('renders "new tag" option with Neu: prefix', () => {
      const items = [createTestTag('existing'), { isNew: true as const, name: 'newtag' }]
      const command = cy.stub()

      mount(<SuggestionList items={items} command={command} type='hashtag' />)

      cy.get('button').should('have.length', 2)
      cy.get('button').last().should('contain.text', 'Neu:')
      cy.get('button').last().should('contain.text', '#newtag')
    })

    it('renders empty state message when no items', () => {
      const command = cy.stub()

      mount(<SuggestionList items={[]} command={command} type='hashtag' />)

      cy.get('button').should('not.exist')
      cy.contains('Keine Ergebnisse').should('exist')
    })

    it('applies tag color to hashtag items', () => {
      const tags = [createTestTag('nature', '#22C55E')]
      const command = cy.stub()

      mount(<SuggestionList items={tags} command={command} type='hashtag' />)

      cy.get('button')
        .first()
        .should('have.css', 'color')
        .and('match', /rgb\(34, 197, 94\)|#22[cC]55[eE]/)
    })

    it('applies item color via getItemColor', () => {
      const items = [createTestItem('1', 'Alice')]
      const getItemColor = () => '#EF4444'
      const command = cy.stub()

      mount(<SuggestionList items={items} command={command} type='item' getItemColor={getItemColor} />)

      cy.get('button')
        .first()
        .should('have.css', 'color')
        .and('match', /rgb\(239, 68, 68\)|#[eE][fF]4444/)
    })

    it('highlights first item by default', () => {
      const tags = [createTestTag('first'), createTestTag('second')]
      const command = cy.stub()

      mount(<SuggestionList items={tags} command={command} type='hashtag' />)

      cy.get('button').first().should('have.class', 'tw:bg-base-200')
      cy.get('button').last().should('not.have.class', 'tw:bg-base-200')
    })
  })

  describe('Click Selection', () => {
    it('calls command with clicked item', () => {
      const tags = [createTestTag('nature'), createTestTag('coding')]
      const command = cy.stub().as('command')

      mount(<SuggestionList items={tags} command={command} type='hashtag' />)

      cy.get('button').last().click()
      cy.get('@command').should('have.been.calledOnceWith', tags[1])
    })

    it('calls command with new tag item', () => {
      const newItem = { isNew: true as const, name: 'newtag' }
      const items = [newItem]
      const command = cy.stub().as('command')

      mount(<SuggestionList items={items} command={command} type='hashtag' />)

      cy.get('button').click()
      cy.get('@command').should('have.been.calledOnceWith', newItem)
    })
  })

  describe('Keyboard Navigation', () => {
    it('navigates down with ArrowDown', () => {
      const tags = [createTestTag('first'), createTestTag('second'), createTestTag('third')]
      const ref = createRef<SuggestionListRef>()
      const command = cy.stub()

      mount(<SuggestionList ref={ref} items={tags} command={command} type='hashtag' />)

      cy.get('button').first().should('have.class', 'tw:bg-base-200')

      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
      cy.get('button').eq(1).should('have.class', 'tw:bg-base-200')

      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
      cy.get('button').eq(2).should('have.class', 'tw:bg-base-200')
    })

    it('navigates up with ArrowUp', () => {
      const tags = [createTestTag('first'), createTestTag('second')]
      const ref = createRef<SuggestionListRef>()
      const command = cy.stub()

      mount(<SuggestionList ref={ref} items={tags} command={command} type='hashtag' />)

      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' })))
      cy.get('button').last().should('have.class', 'tw:bg-base-200')
    })

    it('wraps around at end of list', () => {
      const tags = [createTestTag('first'), createTestTag('second')]
      const ref = createRef<SuggestionListRef>()
      const command = cy.stub()

      mount(<SuggestionList ref={ref} items={tags} command={command} type='hashtag' />)

      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
      cy.get('button').first().should('have.class', 'tw:bg-base-200')
    })

    it('selects item with Enter', () => {
      const tags = [createTestTag('first'), createTestTag('second')]
      const ref = createRef<SuggestionListRef>()
      const command = cy.stub().as('command')

      mount(<SuggestionList ref={ref} items={tags} command={command} type='hashtag' />)

      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
      cy.get('button').eq(1).should('have.class', 'tw:bg-base-200')
      cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'Enter' })))
      cy.get('@command').should('have.been.calledOnceWith', tags[1])
    })

    it('resets selection index when items change', () => {
      const tags1 = [createTestTag('aaa'), createTestTag('aab')]
      const tags2 = [createTestTag('bbb'), createTestTag('bbc'), createTestTag('bbd')]
      const ref = createRef<SuggestionListRef>()
      const command = cy.stub()

      mount(<SuggestionList ref={ref} items={tags1} command={command} type='hashtag' />).then(
        ({ rerender }) => {
          cy.then(() => ref.current?.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
          cy.get('button').eq(1).should('have.class', 'tw:bg-base-200')

          rerender(<SuggestionList ref={ref} items={tags2} command={command} type='hashtag' />)
          cy.get('button').first().should('have.class', 'tw:bg-base-200')
        },
      )
    })
  })
})

