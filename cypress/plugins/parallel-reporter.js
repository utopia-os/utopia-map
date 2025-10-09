/**
 * Cypress Plugin for Enhanced Parallel Test Reporting
 * Handles mochawesome report generation for parallel test execution
 */

const path = require('path')
const fs = require('fs')

module.exports = (on, config) => {
  // Ensure results directory exists
  const resultsDir = path.join(config.projectRoot, 'results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  // Configure mochawesome for parallel execution - JSON only for merging
  const splitIndex = process.env.SPLIT_INDEX || '0'
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  config.reporterOptions = {
    ...config.reporterOptions,
    reportFilename: `split-${splitIndex}-${timestamp}-[name]`,
    reportDir: resultsDir,
    overwrite: false,
    html: false,      // No individual HTML files
    json: true,       // Only JSON for merging into one report
    embeddedScreenshots: true,
    useInlineDiffs: true
  }

  // Task for logging parallel execution info
  on('task', {
    log(message) {
      console.log(`[Parallel ${splitIndex}] ${message}`)
      return null
    },
    
    logReportInfo() {
      console.log(`[Parallel ${splitIndex}] Report will be saved as: report-${splitIndex}-${timestamp}.json`)
      return null
    }
  })

  // Before run hook
  on('before:run', (details) => {
    console.log(`[Parallel ${splitIndex}] Starting test execution`)
    console.log(`[Parallel ${splitIndex}] Browser: ${details.browser.name}`)
    console.log(`[Parallel ${splitIndex}] Specs: ${details.specs.length}`)
    return details
  })

  // After run hook
  on('after:run', (results) => {
    console.log(`[Parallel ${splitIndex}] Test execution completed`)
    console.log(`[Parallel ${splitIndex}] Total tests: ${results.totalTests}`)
    console.log(`[Parallel ${splitIndex}] Passed: ${results.totalPassed}`)
    console.log(`[Parallel ${splitIndex}] Failed: ${results.totalFailed}`)
    
    // Ensure the report file was created
    const reportFile = path.join(resultsDir, `report-${splitIndex}-${timestamp}.json`)
    if (fs.existsSync(reportFile)) {
      console.log(`[Parallel ${splitIndex}] ✅ Report saved: ${reportFile}`)
    } else {
      console.log(`[Parallel ${splitIndex}] ❌ Report not found: ${reportFile}`)
    }
    
    return results
  })

  return config
}
