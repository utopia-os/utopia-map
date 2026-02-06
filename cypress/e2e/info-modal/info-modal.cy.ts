/// <reference types="cypress" />

/**
 * Info Modal Route E2E Tests
 *
 * Validates the route-based info modal introduced by PR #657:
 * - Route /info renders the modal (E1)
 * - NavBar ? link navigates to /info (E2)
 * - Content "Close" button navigates back to / (E3)
 */

describe('Info Modal Route', () => {
  it('E1: visiting /info renders the info modal', () => {
    cy.visit('/info')

    cy.get('.tw\\:card', { timeout: 15000 }).should('be.visible')
    cy.get('.tw\\:backdrop-brightness-75').should('exist')
    cy.contains('Close').should('be.visible')
    cy.location('pathname').should('eq', '/info')
  })

  it('E2: NavBar ? icon navigates to /info', () => {
    cy.visit('/')
    cy.waitForMapReady()

    // Dismiss auto-opened modal if info_open is true in backend
    cy.get('body').then(($body) => {
      if ($body.find('.tw\\:backdrop-brightness-75').length > 0) {
        cy.get('.tw\\:card button').contains('✕').click()
        cy.location('pathname').should('eq', '/')
      }
    })

    cy.get('a[href="/info"]').should('be.visible').click()

    cy.location('pathname').should('eq', '/info')
    cy.get('.tw\\:card', { timeout: 10000 }).should('be.visible')
  })

  it('E3: content "Close" button closes modal and navigates to /', () => {
    cy.visit('/info')
    cy.get('.tw\\:card', { timeout: 15000 }).should('be.visible')

    cy.contains('label', 'Close').click()

    cy.location('pathname').should('eq', '/')
    cy.get('.tw\\:backdrop-brightness-75').should('not.exist')
  })
})

