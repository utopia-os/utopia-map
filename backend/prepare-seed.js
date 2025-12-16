#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const seedDir = path.join(__dirname, 'directus-config/development/seed')
const templatePath = path.join(seedDir, 'items.template.json')
const outputPath = path.join(seedDir, 'items.json')

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addHours(date, hours) {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19)
}

function calculateDates() {
  const now = new Date()
  
  return {
    // "Some Event" - long-running, started in past, ends far in future
    EVENT_1_START: formatDateTime(addDays(now, -30)),
    EVENT_1_END: formatDateTime(addDays(now, 365)),
    
    // "Tech Meetup Munich" - upcoming single-day event
    EVENT_2_START: formatDateTime(addHours(addDays(now, 7), 18)),
    EVENT_2_END: formatDateTime(addHours(addDays(now, 7), 21)),
    
    // "Sustainability Workshop NYC" - ongoing event (started yesterday, ends tomorrow)
    EVENT_3_START: formatDateTime(addHours(addDays(now, -1), 14)),
    EVENT_3_END: formatDateTime(addHours(addDays(now, 1), 17)),
    
    // "Open Source Conference" - upcoming multi-day conference
    EVENT_4_START: formatDateTime(addHours(addDays(now, 30), 9)),
    EVENT_4_END: formatDateTime(addHours(addDays(now, 32), 18)),
  }
}

function processTemplate() {
  const template = fs.readFileSync(templatePath, 'utf8')
  const dates = calculateDates()
  
  let output = template
  for (const [placeholder, value] of Object.entries(dates)) {
    output = output.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), value)
  }
  
  fs.writeFileSync(outputPath, output)
  console.log('Seed data prepared with dynamic dates:')
  for (const [key, value] of Object.entries(dates)) {
    console.log(`  ${key}: ${value}`)
  }
}

processTemplate()

