/// <reference types="cypress" />

import './commands'

// for screenshot embedding
import addContext from 'mochawesome/addContext'

const photonMockData: Record<string, object> = {
  berlin: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          osm_type: 'R',
          osm_id: 62422,
          osm_key: 'place',
          osm_value: 'city',
          type: 'city',
          countrycode: 'DE',
          name: 'Berlin',
          country: 'Germany',
          state: 'Berlin',
          extent: [13.088345, 52.6755087, 13.7611609, 52.3382448],
        },
        geometry: { type: 'Point', coordinates: [13.3951309, 52.5173885] },
      },
    ],
  },
  'wat arun': {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          osm_type: 'W',
          osm_id: 25867629,
          osm_key: 'tourism',
          osm_value: 'attraction',
          type: 'attraction',
          countrycode: 'TH',
          name: 'Wat Arun',
          country: 'Thailand',
          city: 'Bangkok',
          extent: [100.4882, 13.7437, 100.4912, 13.7407],
        },
        geometry: { type: 'Point', coordinates: [100.4897, 13.7437] },
      },
    ],
  },
}

beforeEach(() => {
  cy.intercept('GET', 'https://photon.komoot.io/api/*', (req) => {
    const url = new URL(req.url)
    const query = (url.searchParams.get('q') || '').toLowerCase()

    const mockKey = Object.keys(photonMockData).find((key) =>
      query.includes(key.toLowerCase()),
    )

    if (mockKey) {
      req.reply(photonMockData[mockKey])
    } else {
      req.reply({ type: 'FeatureCollection', features: [] })
    }
  }).as('photonApi')

  cy.intercept('GET', '**/items/layers*').as('getLayers')
  cy.intercept('GET', '**/items/items*').as('getLayerItems')
})

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
