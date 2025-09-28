/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err, _runnable) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught exception:', err.message)
  return false
})

describe('Utopia Map Login Form Elements', () => {
  // TODO: set this data different
  const _testData = {
    validUser: {
      email: Cypress.env('validEmail'),
      password: Cypress.env('validPassword')
    },
    invalidUser: {
      email: Cypress.env('invalidEmail'),
      password: Cypress.env('invalidPassword')
    }
  }

  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    cy.visit('/login')
  })

  it('should be displayed correctly', () => {
    cy.get('h2').should('contain.text', 'Login')
    cy.get('input[type="email"]')
      .should('be.visible')
      .should('have.attr', 'placeholder', 'E-Mail')

    cy.get('input[type="password"]')
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Password')

    cy.get('button:contains("Login")')
      .should('be.visible')
      .should('not.be.disabled')

    cy.get('a[href="/reset-password"]')
      .should('be.visible')
      .should('contain.text', 'Forgot Password?')
  })
})
