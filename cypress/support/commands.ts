/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Clear the search input
       * @example cy.clearSearch()
       */
      clearSearch(): Chainable<Element>
      
      /**
       * Search for a term and wait for search suggestions to appear
       * @param query - The search term to type
       * @example cy.searchFor('berlin')
       */
      searchFor(query: string): Chainable<Element>

      /**
       * Wait for the map and search components to be ready
       * @example cy.waitForMapReady()
       */
      waitForMapReady(): Chainable<Element>
    }
  }
}

Cypress.Commands.add('clearSearch', () => {
  cy.get('[data-cy="search-input"]').clear()
})

Cypress.Commands.add('searchFor', (query: string) => {
  cy.get('[data-cy="search-input"]').clear()
  cy.get('[data-cy="search-input"]').type(query)
  cy.get('[data-cy="search-suggestions"]', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('waitForMapReady', () => {
  cy.get('[data-cy="search-input"]', { timeout: 10000 }).should('be.visible')
  cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible')
  cy.get('.leaflet-marker-icon', { timeout: 15000 }).should('have.length.at.least', 1)
})

export {}
