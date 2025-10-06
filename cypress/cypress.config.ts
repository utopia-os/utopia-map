import { defineConfig } from 'cypress'
const cypressSplit = require('cypress-split')

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,

    specPattern: 'e2e/**/*.cy.ts',
    supportFile: 'support/e2e.ts',
    screenshotsFolder: 'screenshots',
    videosFolder: 'videos',
    video: false,
    screenshotOnRunFailure: true,

    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'results',
      reportFilename: '[name]',
      overwrite: false,
      html: false,  // Only generate JSON during test runs for merging
      json: true,   // Generate JSON for merging
      embeddedScreenshots: true,
      useInlineDiffs: true,
      screenshotOnRunFailure: true
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
      // Load cypress-split plugin
      cypressSplit(on, config)

      // Load parallel reporter plugin
      const parallelReporter = require('./plugins/parallel-reporter')
      config = parallelReporter(on, config)

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
