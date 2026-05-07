/// <reference types="cypress" />

describe('Utopia Map Set New Password', () => {
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

    cy.visit('/set-new-password?token=test-reset-token')
    cy.wait('@getMap')
  })

  it('should keep the set new password dialog visible when startup info is enabled', () => {
    cy.get('h2').should('contain.text', 'Set new Password')
    cy.get('input[type="password"]')
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Password')

    cy.get('dialog#my_modal_3').should('not.have.attr', 'open')
  })
})
