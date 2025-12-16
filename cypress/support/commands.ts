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

      /**
       * Click on a map marker
       * @example cy.clickMarker() // clicks first marker
       */
      clickMarker(): Chainable<Element>

      /**
       * Wait for a popup to appear on the map
       * @example cy.waitForPopup()
       */
      waitForPopup(): Chainable<Element>

      /**
       * Close the currently open popup
       * @example cy.closePopup()
       */
      closePopup(): Chainable<Element>

      /**
       * Toggle a layer's visibility in the layer control
       * @param layerName - Name of the layer to toggle
       * @example cy.toggleLayer('places')
       */
      toggleLayer(layerName: string): Chainable<Element>

      /**
       * Open the layer control panel
       * @example cy.openLayerControl()
       */
      openLayerControl(): Chainable<Element>

      /**
       * Close the layer control panel
       * @example cy.closeLayerControl()
       */
      closeLayerControl(): Chainable<Element>
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
  cy.wait('@getLayers', { timeout: 15000 }).then((interception) => {
    const layerCount = interception.response?.body?.data?.length || 3
    for (let i = 0; i < layerCount; i++) {
      cy.wait('@getLayerItems', { timeout: 15000 })
    }
  })
  cy.get('.leaflet-marker-icon', { timeout: 15000 }).should('have.length.at.least', 1)
})

Cypress.Commands.add('clickMarker', () => {
  // For now, always use force click since markers might be clustered or outside viewport
  cy.get('.leaflet-marker-icon').first().click({ force: true })
})

Cypress.Commands.add('waitForPopup', () => {
  cy.get('[data-cy="item-popup"]', { timeout: 10000 }).should('be.visible')
})

Cypress.Commands.add('closePopup', () => {
  cy.get('.leaflet-popup-close-button').click()
})

Cypress.Commands.add('toggleLayer', (layerName: string) => {
  cy.get(`[data-cy="layer-checkbox-${layerName}"]`).click()
})

Cypress.Commands.add('openLayerControl', () => {
  cy.get('[data-cy="layer-control-button"]').click()
  cy.get('[data-cy="layer-control-panel"]', { timeout: 5000 }).should('be.visible')
})

Cypress.Commands.add('closeLayerControl', () => {
  cy.get('[data-cy="layer-control-close"]').click()
})

export {}
