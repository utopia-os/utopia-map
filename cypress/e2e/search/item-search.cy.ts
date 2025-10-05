/// <reference types="cypress" />

describe('Utopia Map Search', () => {
  describe('Item Search', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
      cy.window().then((win) => {
        win.sessionStorage.clear()
      })

      cy.visit('/')
      cy.waitForMapReady()
    })

    it('should find items by exact name match', () => {
      cy.searchFor('Tech Meetup Munich')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Tech Meetup Munich')
    })

    it('should find items by partial name match (case insensitive)', () => {
      cy.searchFor('café collaboration')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Café Collaboration London')
    })

    it('should find items by text content', () => {
      cy.searchFor('sustainability')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Alex Entrepreneur')
    })

    it('should navigate to item profile when clicking search result', () => {
      cy.searchFor('makerspace')
      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.get('[data-cy="search-item-result"]').contains('Makerspace Tokyo').click()
      })

      cy.url().should('match', /\/(item\/|[a-f0-9-]+)/)
      cy.get('[data-cy="profile-view"]').should('exist')
      cy.get('[data-cy="profile-title"]').should('contain', 'Makerspace Tokyo')
    })
  })
})
