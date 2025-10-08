/// <reference types="cypress" />

import './commands'

// for screenshot embedding
import addContext from 'mochawesome/addContext'

// Global exception handler
Cypress.on('uncaught:exception', (err) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught exception:', err.message)
  return false
})

// Add screenshots of failed tests to mochawesome report 
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    const adjustedSpecPath = Cypress.spec.relative.replace(/^e2e\//, '')

    // Build the full test hierarchy title like Cypress does for screenshot naming
    const titles: string[] = []
    let current = runnable

    while (current && current.parent) {
      if (current.title) {
        titles.unshift(current.title)
      }
      current = current.parent
    }

    const fullTitle = titles.join(' -- ').replace(/:/g, '')

    const screenshot = `screenshots/${adjustedSpecPath}/${fullTitle} (failed).png`
    addContext({ test }, screenshot)

    // Also add any retry screenshots if they exist
    const screenshot2 = `screenshots/${adjustedSpecPath}/${fullTitle} (failed) (attempt 2).png`
    const screenshot3 = `screenshots/${adjustedSpecPath}/${fullTitle} (failed) (attempt 3).png`

    // Add retry screenshots (mochawesome will handle non-existent files gracefully)
    addContext({ test }, screenshot2)
    addContext({ test }, screenshot3)
  }
})
