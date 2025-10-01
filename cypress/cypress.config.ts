import { defineConfig } from 'cypress'
const cypressSplit = require('cypress-split')

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    viewportWidth: 1280,
    viewportHeight: 720,

    specPattern: 'e2e/**/*.cy.ts',
    supportFile: false,
    screenshotsFolder: 'reports/screenshots',
    videosFolder: 'reports/videos',
    video: false,
    screenshotOnRunFailure: true,

    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'reports/json',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
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
