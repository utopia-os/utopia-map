/// <reference types="cypress" />



// Import commands.ts using ES2015 syntax:
// import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// This file is processed and loaded automatically before your test files.
// This is a great place to put global configuration and behavior that modifies Cypress.

// You can change the location of this file or turn off
// automatically serving support files with the 'supportFile' configuration option.

// Global exception handler
Cypress.on('uncaught:exception', (err, _runnable) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught exception:', err.message)
  // returning false here prevents Cypress from failing the test
  return false
})
