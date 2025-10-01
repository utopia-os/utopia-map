import { defineConfig } from 'cypress'
const cypressSplit = require('cypress-split')

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,

    specPattern: 'e2e/**/*.cy.ts',
    supportFile: 'support/e2e.ts',
    screenshotsFolder: 'reports/screenshots',
    videosFolder: 'reports/videos',
    video: false,
    screenshotOnRunFailure: true,

    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports',
      charts: true,
      reportPageTitle: 'Utopia Map E2E Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      saveJson: true,
      saveHtml: false,
    },
    
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    testIsolation: true,
    
    retries: {
      runMode: 2,
      openMode: 0
    },

    env: {
      apiUrl: 'http://localhost:8055',
      validEmail: 'admin@it4c.dev',
      validPassword: 'admin123',
      invalidEmail: 'invalid@example.com',
      invalidPassword: 'wrongpassword'
    },
    
    setupNodeEvents(on, config) {
      // Load cypress-mochawesome-reporter plugin
      require('cypress-mochawesome-reporter/plugin')(on)

      // Load cypress-split plugin
      cypressSplit(on, config)

      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })

      return config
    },
  },
})
