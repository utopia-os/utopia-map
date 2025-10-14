/// <reference types="cypress" />

describe('Utopia Map Search', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })

    cy.visit('/')
    cy.waitForMapReady()
  })

  describe('Item Search', () => {
    it('should find items by exact name match', () => {
      cy.searchFor('Tech Meetup Munich')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Tech Meetup Munich')
    })

    it('should find items by partial name match (case insensitive)', () => {
      cy.searchFor('café collaboration')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Café Collaboration London')
    })

    it('should find items by text content', () => {
      cy.searchFor('sustainability')
      cy.get('[data-cy="search-suggestions"]').should('contain', 'Alex Entrepreneur')
    })

    it('should navigate to item profile when clicking search result', () => {
      cy.searchFor('welcome')
      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.get('[data-cy="search-item-result"]').contains('Welcome to Utopia Map').click()
      })

      cy.url().should('match', /\/(item\/|[a-f0-9-]+)/)
      cy.get('body').should('contain', 'Welcome to Utopia Map')
    })
  })

  describe('Geographic Search', () => {
    it('should find geographic locations and related items for a city', () => {
      cy.searchFor('Berlin')

      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.get('[data-cy="search-geo-result"]').should('contain', 'Berlin')
        cy.get('[data-cy="search-item-result"]').should('contain', 'Community Garden Berlin')
      })
    })

    it('should navigate to geographic location when clicking search result', () => {
      cy.searchFor('Berlin')

      // Click geographic result -> temporary marker
      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.get('[data-cy="search-geo-result"]').contains('Berlin').click()
      })

      // User sees temporary marker with location popup
      cy.get('.leaflet-popup').should('be.visible')
      cy.get('.leaflet-popup-content').should('contain', 'Berlin')

      // Search input is blurred and suggestions hidden
      cy.get('[data-cy="search-input"]').should('not.be.focused')
      cy.get('[data-cy="search-suggestions"]').should('not.exist')
    })

    it('should find specific addresses and landmarks', () => {
      cy.searchFor('Wat Arun')
      cy.get('[data-cy="search-suggestions"]').should('be.visible')

      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.contains('Wat Arun').first().click()
      })

      cy.get('.leaflet-popup').should('be.visible')
      cy.get('.leaflet-popup-content').should('contain', 'Wat Arun')
    })

    it('should navigate to precise coordinates', () => {
      const coordinates = '52.5200,13.4050'
      cy.searchFor(coordinates)

      // User sees coordinate option with flag icon
      cy.get('[data-cy="search-suggestions"]').within(() => {
        cy.get('[data-cy="search-coordinate-result"]').should('contain', coordinates)
        cy.get('[data-cy="search-coordinate-icon"]').should('exist')
        cy.get('[data-cy="search-coordinate-result"]').click()
      })

      cy.get('.leaflet-popup').should('be.visible')
      cy.get('.leaflet-popup-content').should('contain.text', '52.52, 13.40')
    })

    it('should differentiate between database items and geographic locations', () => {
      cy.searchFor('Berlin')

      cy.get('[data-cy="search-suggestions"]').within(() => {
        // Database item should have custom icon and simple name
        cy.get('[data-cy="search-item-result"]').first().within(() => {
          // Should have either an icon or placeholder for database items
          cy.get('[data-cy="search-item-icon"], [data-cy="search-item-icon-placeholder"]').should('exist')
        })
        cy.get('[data-cy="search-item-result"]').should('contain', 'Community Garden Berlin')

        // Geographic result should have magnifying glass icon and detailed info
        cy.get('[data-cy="search-geo-result"]').first().within(() => {
          cy.get('[data-cy="search-geo-icon"]').should('exist')
          cy.get('[data-cy="search-geo-details"]').should('exist')
        })
      })
    })
  })
})
