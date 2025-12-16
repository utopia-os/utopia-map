#!/usr/bin/env node

/**
 * Prepares seed data by updating event dates relative to the current date.
 *
 * This script modifies items.json in-place, updating all items with
 * layer "layer-events" to have realistic start/end dates that ensure
 * events are visible in the app (end dates in the future).
 *
 * Date strategy:
 * - Event 1 (item-event-1): Long-running, started 30 days ago, ends in 365 days
 * - Event 2 (item-event-2): Upcoming single-day event in 7 days
 * - Event 3 (item-event-3): Ongoing event, started yesterday, ends tomorrow
 * - Event 4 (item-event-4): Upcoming multi-day conference in 30 days
 */

const fs = require('fs')
const path = require('path')

const seedPath = path.join(__dirname, 'directus-config/development/seed/items.json')

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

/**
 * Calculate dynamic dates for each event based on current time
 */
function getEventDates(syncId, now) {
  const dateConfigs = {
    // "Some Event" - long-running, started in past, ends far in future
    'item-event-1': {
      start: addDays(now, -30),
      end: addDays(now, 365)
    },
    // "Tech Meetup Munich" - upcoming single-day event (the one used in search tests)
    'item-event-2': {
      start: addHours(addDays(now, 7), 18),
      end: addHours(addDays(now, 7), 21)
    },
    // "Sustainability Workshop NYC" - ongoing event (started yesterday, ends tomorrow)
    'item-event-3': {
      start: addHours(addDays(now, -1), 14),
      end: addHours(addDays(now, 1), 17)
    },
    // "Open Source Conference" - upcoming multi-day conference
    'item-event-4': {
      start: addHours(addDays(now, 30), 9),
      end: addHours(addDays(now, 32), 18)
    }
  }

  return dateConfigs[syncId] || null
}

function prepareSeedData() {
  // Read the current items.json
  const content = fs.readFileSync(seedPath, 'utf8')
  const seedData = JSON.parse(content)

  const now = new Date()
  let updatedCount = 0

  // Update event items with dynamic dates
  for (const item of seedData.data) {
    if (item.layer === 'layer-events' && item._sync_id) {
      const dates = getEventDates(item._sync_id, now)
      if (dates) {
        item.start = formatDateTime(dates.start)
        item.end = formatDateTime(dates.end)
        console.log(`  ${item._sync_id} (${item.name}):`)
        console.log(`    start: ${item.start}`)
        console.log(`    end:   ${item.end}`)
        updatedCount++
      }
    }
  }

  // Write back to items.json
  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 4))

  console.log(`\nUpdated ${updatedCount} event(s) with dynamic dates.`)
}

console.log('Preparing seed data with dynamic dates...\n')
prepareSeedData()

