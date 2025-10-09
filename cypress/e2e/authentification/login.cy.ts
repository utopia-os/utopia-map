/// <reference types="cypress" />

describe('Utopia Map Login', () => {
  const testData = {
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

  it('should successfully login with valid credentials', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest')

    cy.get('input[type="email"]').clear()
    cy.get('input[type="email"]').type(testData.validUser.email)
    cy.get('input[type="password"]').clear()
    cy.get('input[type="password"]').type(testData.validUser.password)
    cy.get('button:contains("Login")').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200)
      expect(interception.request.body).to.deep.include({
        email: testData.validUser.email,
        password: testData.validUser.password
      })

      expect(interception.response?.body).to.have.property('data')
      expect(interception.response?.body.data).to.have.property('access_token')
      expect(interception.response?.body.data.access_token).to.be.a('string')
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(interception.response?.body.data.access_token).to.not.be.empty
    })

    cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should show error for missing password', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest')

    cy.get('input[type="email"]').type(testData.validUser.email)
    cy.get('button:contains("Login")').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(400)
      expect(interception.request.body).to.deep.include({
        email: testData.validUser.email,
        password: ''
      })

      expect(interception.response?.body).to.have.property('errors')
      expect(interception.response?.body.errors).to.be.an('array')
      expect(interception.response?.body.errors).to.have.length.greaterThan(0)
      expect(interception.response?.body.errors[0]).to.have.property('message')
    })

    cy.get('.Toastify__toast--error', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should show error for missing email', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest')

    cy.get('input[type="password"]').type(testData.validUser.password)
    cy.get('button:contains("Login")').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(400)
      expect(interception.request.body).to.deep.include({
        email: '',
        password: testData.validUser.password
      })

      expect(interception.response?.body).to.have.property('errors')
      expect(interception.response?.body.errors).to.be.an('array')
      expect(interception.response?.body.errors).to.have.length.greaterThan(0)
    })

    cy.get('.Toastify__toast--error', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should show error for missing credentials', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest')

    cy.get('button:contains("Login")').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(400)
      expect(interception.request.body).to.deep.include({
        email: '',
        password: ''
      })

      expect(interception.response?.body).to.have.property('errors')
      expect(interception.response?.body.errors).to.be.an('array')
      expect(interception.response?.body.errors).to.have.length.greaterThan(0)
    })

    cy.get('.Toastify__toast--error', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest')

    cy.get('input[type="email"]').clear()
    cy.get('input[type="email"]').type(testData.invalidUser.email)
    cy.get('input[type="password"]').clear()
    cy.get('input[type="password"]').type(testData.invalidUser.password)
    cy.get('button:contains("Login")').click()

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(401)
      expect(interception.request.body).to.deep.include({
        email: testData.invalidUser.email,
        password: testData.invalidUser.password
      })

      expect(interception.response?.body).to.have.property('errors')
      expect(interception.response?.body.errors).to.be.an('array')
      expect(interception.response?.body.errors[0]).to.have.property('message')
      expect(interception.response?.body.errors[0].message).to.contain('Invalid user credentials')
    })

    cy.get('.Toastify__toast--error', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/login')
  })

  it('should show loading state during login', () => {
    cy.intercept('POST', '**/auth/login', {
      delay: 1000,
      statusCode: 200,
      body: {
        data: {
          access_token: 'test_token_123',
          expires: 900000,
          refresh_token: 'refresh_token_123'
        }
      }
    }).as('loginRequest')

    cy.get('input[type="email"]').type(testData.validUser.email)
    cy.get('input[type="password"]').type(testData.validUser.password)
    cy.get('button:contains("Login")').click()

    cy.get('.tw\\:loading-spinner', { timeout: 5000 }).should('be.visible')

    cy.wait('@loginRequest')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
