/// <reference types="cypress" />

describe('Utopia Map Authentication Set New Password', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    cy.intercept('GET', '**/items/maps*', (req) => {
      req.continue((res) => {
        if (Array.isArray(res.body?.data) && res.body.data[0]) {
          res.body.data[0].info_open = true
        }
      })
    }).as('getMap')
  })

  it('should keep the set new password dialog visible when startup info is enabled', () => {
    cy.visit('/set-new-password?token=test-reset-token')
    cy.wait('@getMap')

    cy.get('h2').should('contain.text', 'Set new Password')
    cy.get('input[type="password"]')
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Password')
    cy.get('button:contains("Set")').should('be.visible').and('not.be.disabled')

    cy.get('dialog#my_modal_3').should('not.have.attr', 'open')
  })

  it('should not open the startup info modal when returning to root after the initial reset route', () => {
    cy.visit('/set-new-password?token=test-reset-token')
    cy.wait('@getMap')

    cy.contains('h2', 'Set new Password')
      .parent()
      .within(() => {
        cy.contains('button', '✕').click()
      })

    cy.location('pathname').should('eq', '/')
    cy.get('dialog#my_modal_3').should('not.have.attr', 'open')
  })

  it('should still open the startup info modal on the root route', () => {
    cy.visit('/')
    cy.wait('@getMap')

    cy.get('dialog#my_modal_3').should('have.attr', 'open')
  })
})
