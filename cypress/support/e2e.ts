/// <reference types="cypress" />

import './commands'

// This file is processed and loaded automatically before your test files.
// This is a great place to put global configuration and behavior that modifies Cypress.

// Global exception handler
Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message)
  // returning false here prevents Cypress from failing the test
  return false
})
