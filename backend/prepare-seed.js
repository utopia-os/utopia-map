#!/usr/bin/env node

/**
 * Prepares seed data for development environment.
 *
 * This script performs two main tasks:
 *
 * 1. Updates event dates relative to the current date:
 *    - Modifies items.json in-place, updating all items with layer "layer-events"
 *    - Ensures events are visible in the app (end dates in the future)
 *
 * 2. Extracts hashtags from items and generates tags.json:
 *    - Parses all #hashtag patterns from text fields in items.json
 *    - Preserves existing tag colors from tags.json if present
 *    - Generates new colors for new hashtags
 *    - Ensures hashtag filtering works in the application
 *
 * Date strategy:
 * - Event 1 (item-event-1): Long-running, started 30 days ago, ends in 365 days
 * - Event 2 (item-event-2): Upcoming single-day event in 7 days
 * - Event 3 (item-event-3): Ongoing event, started yesterday, ends tomorrow
 * - Event 4 (item-event-4): Upcoming multi-day conference in 30 days
 */

const fs = require('fs')
const path = require('path')

const seedDir = path.join(__dirname, 'directus-config/development/seed')
const seedPath = path.join(seedDir, 'items.json')
const tagsPath = path.join(seedDir, 'tags.json')

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
 * Color palette for auto-generated tag colors.
 * Uses modern, accessible colors with good contrast.
 */
const TAG_COLORS = [
  '#22C55E', // green
  '#3B82F6', // blue
  '#EAB308', // yellow
  '#F97316', // orange
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#84CC16', // lime
  '#A855F7', // violet
  '#0EA5E9', // sky
  '#10B981', // emerald
  '#EF4444', // red
  '#64748B', // slate
]

/**
 * Extract all unique hashtags from items.json text fields
 */
function extractHashtags(items) {
  const hashtags = new Set()
  const hashtagRegex = /#([a-zA-Z0-9_-]+)/g

  for (const item of items) {
    if (item.text) {
      let match
      while ((match = hashtagRegex.exec(item.text)) !== null) {
        hashtags.add(match[1].toLowerCase())
      }
    }
  }

  return Array.from(hashtags).sort()
}

/**
 * Load existing tags.json to preserve colors
 */
function loadExistingTags() {
  try {
    if (fs.existsSync(tagsPath)) {
      const content = fs.readFileSync(tagsPath, 'utf8')
      const tagsData = JSON.parse(content)
      const colorMap = {}
      for (const tag of tagsData.data || []) {
        colorMap[tag.name.toLowerCase()] = tag.color
      }
      return colorMap
    }
  } catch (error) {
    console.warn('  Warning: Could not read existing tags.json:', error.message)
  }
  return {}
}

/**
 * Generate tags.json from extracted hashtags
 */
function generateTagsSeed(hashtags, existingColors) {
  const data = hashtags.map((name, index) => ({
    _sync_id: `tag-${name}`,
    name: name,
    color: existingColors[name] || TAG_COLORS[index % TAG_COLORS.length],
  }))

  return {
    collection: 'tags',
    meta: {
      insert_order: 0,
      create: true,
      update: true,
      delete: true,
      preserve_ids: false,
      ignore_on_update: [],
    },
    data: data,
  }
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

/**
 * Update event dates in items.json
 */
function updateEventDates(seedData) {
  const now = new Date()
  let updatedCount = 0

  console.log('Updating event dates:')
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

  console.log(`  Updated ${updatedCount} event(s) with dynamic dates.\n`)
}

/**
 * Generate tags.json from hashtags in items.json
 */
function updateTagsSeed(seedData) {
  console.log('Generating tags from hashtags:')

  // Extract hashtags from items
  const hashtags = extractHashtags(seedData.data)
  console.log(`  Found ${hashtags.length} unique hashtag(s): ${hashtags.join(', ')}`)

  // Load existing colors to preserve them
  const existingColors = loadExistingTags()
  const preservedCount = Object.keys(existingColors).filter((name) => hashtags.includes(name)).length
  if (preservedCount > 0) {
    console.log(`  Preserving colors for ${preservedCount} existing tag(s)`)
  }

  // Generate and write tags.json
  const tagsSeed = generateTagsSeed(hashtags, existingColors)
  fs.writeFileSync(tagsPath, JSON.stringify(tagsSeed, null, 4))
  console.log(`  Written ${hashtags.length} tag(s) to tags.json\n`)
}

/**
 * Main entry point
 */
function prepareSeedData() {
  console.log('Preparing seed data...\n')

  // Read the current items.json
  const content = fs.readFileSync(seedPath, 'utf8')
  const seedData = JSON.parse(content)

  // 1. Update event dates
  updateEventDates(seedData)

  // Write back to items.json (with updated dates)
  fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 4))

  // 2. Generate tags.json from hashtags
  updateTagsSeed(seedData)

  console.log('Done!')
}

prepareSeedData()
