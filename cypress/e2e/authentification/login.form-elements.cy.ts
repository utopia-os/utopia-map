/// <reference types="cypress" />

describe('Utopia Map Login Form Elements', () => {

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

  it('should fail intentionally to test artifact upload', () => {
    // This test is intentionally failing to verify artifact creation and upload
    cy.get('h2').should('contain.text', 'Login')

    // Take a screenshot before the intentional failure
    cy.screenshot('before-intentional-failure')

    // This assertion will fail intentionally
    cy.get('body').should('contain.text', 'This text does not exist on the page')
  })
})
