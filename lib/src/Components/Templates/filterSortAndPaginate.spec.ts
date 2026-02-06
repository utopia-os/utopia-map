/* eslint-disable camelcase */ // Directus database fields use snake_case
import { describe, it, expect } from 'vitest'

import { filterSortAndPaginate } from './filterSortAndPaginate'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Minimal item factory — only the fields the helper inspects */
function makeItem(overrides: Partial<Item> & { id: string; layerName?: string }): Item {
  const { layerName, ...rest } = overrides
  return {
    ...rest,
    layer: layerName ? ({ name: layerName } as Item['layer']) : undefined,
  } as Item
}

/** Stub getItemTags: returns tags whose names appear as #hashtags in item.text */
function getItemTags(item: Item): Tag[] {
  if (!item.text) return []
  const matches = item.text.match(/#([a-zA-ZÀ-ÖØ-öø-ʸ0-9_-]+)/g)
  if (!matches) return []
  return matches.map((m) => ({
    id: m,
    name: m.slice(1),
    color: '#000',
  }))
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PLACES = 'places'
const EVENTS = 'events'

const items: Item[] = [
  makeItem({ id: '1', layerName: PLACES, text: '#nature', date_updated: '2025-03-01T00:00:00Z' }),
  makeItem({ id: '2', layerName: PLACES, text: '#food', date_created: '2025-02-01T00:00:00Z' }),
  makeItem({
    id: '3',
    layerName: PLACES,
    text: '#nature #food',
    date_updated: '2025-01-01T00:00:00Z',
  }),
  makeItem({ id: '4', layerName: EVENTS, text: '#nature', date_updated: '2025-04-01T00:00:00Z' }),
  makeItem({ id: '5', layerName: PLACES, text: '', date_created: '2025-05-01T00:00:00Z' }),
  makeItem({ id: '6', text: '#nature' }), // no layer
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('filterSortAndPaginate', () => {
  // ---- Layer filtering ----

  describe('layer filtering', () => {
    it('returns only items matching the given layer name', () => {
      const { visibleItems } = filterSortAndPaginate(items, PLACES, [], getItemTags, 100)
      expect(visibleItems.every((i) => i.layer?.name === PLACES)).toBe(true)
      expect(visibleItems).toHaveLength(4) // ids 1,2,3,5
    })

    it('excludes items with no layer', () => {
      const { visibleItems } = filterSortAndPaginate(items, PLACES, [], getItemTags, 100)
      expect(visibleItems.find((i) => i.id === '6')).toBeUndefined()
    })
  })

  // ---- Tag filtering ----

  describe('tag filtering', () => {
    it('returns all layer items when no filter tags are active', () => {
      const { visibleItems } = filterSortAndPaginate(items, PLACES, [], getItemTags, 100)
      expect(visibleItems).toHaveLength(4)
    })

    it('keeps only items that have at least one matching tag', () => {
      const filterTags: Tag[] = [{ id: 't1', name: 'food', color: '#000' }]
      const { visibleItems } = filterSortAndPaginate(items, PLACES, filterTags, getItemTags, 100)
      // ids 2 (#food) and 3 (#nature #food)
      expect(visibleItems.map((i) => i.id).sort()).toEqual(['2', '3'])
    })

    it('excludes items with no matching tags', () => {
      const filterTags: Tag[] = [{ id: 't1', name: 'food', color: '#000' }]
      const { visibleItems } = filterSortAndPaginate(items, PLACES, filterTags, getItemTags, 100)
      expect(visibleItems.find((i) => i.id === '1')).toBeUndefined() // #nature only
    })

    it('matches tags case-insensitively', () => {
      const filterTags: Tag[] = [{ id: 't1', name: 'Nature', color: '#000' }]
      const { visibleItems } = filterSortAndPaginate(items, PLACES, filterTags, getItemTags, 100)
      // ids 1 (#nature) and 3 (#nature #food)
      expect(visibleItems.map((i) => i.id)).toContain('1')
      expect(visibleItems.map((i) => i.id)).toContain('3')
    })

    it('items with no text (no tags) are excluded when filter is active', () => {
      const filterTags: Tag[] = [{ id: 't1', name: 'nature', color: '#000' }]
      const { visibleItems } = filterSortAndPaginate(items, PLACES, filterTags, getItemTags, 100)
      expect(visibleItems.find((i) => i.id === '5')).toBeUndefined()
    })
  })

  // ---- Sorting ----

  describe('sorting (newest first)', () => {
    it('sorts by date_updated descending', () => {
      const { visibleItems } = filterSortAndPaginate(items, PLACES, [], getItemTags, 100)
      const ids = visibleItems.map((i) => i.id)
      // Expected order: 5 (created May), 1 (updated Mar), 2 (created Feb), 3 (updated Jan)
      expect(ids).toEqual(['5', '1', '2', '3'])
    })

    it('falls back to date_created when date_updated is absent', () => {
      const a = makeItem({ id: 'a', layerName: PLACES, date_created: '2025-06-01T00:00:00Z' })
      const b = makeItem({ id: 'b', layerName: PLACES, date_updated: '2025-05-01T00:00:00Z' })
      const { visibleItems } = filterSortAndPaginate([a, b], PLACES, [], getItemTags, 100)
      expect(visibleItems[0].id).toBe('a')
    })

    it('items with no dates sort to the end', () => {
      const dated = makeItem({ id: 'd', layerName: PLACES, date_created: '2025-01-01T00:00:00Z' })
      const undated = makeItem({ id: 'u', layerName: PLACES })
      const { visibleItems } = filterSortAndPaginate([undated, dated], PLACES, [], getItemTags, 100)
      expect(visibleItems[0].id).toBe('d')
      expect(visibleItems[1].id).toBe('u')
    })
  })

  // ---- Pagination ----

  describe('pagination', () => {
    it('limits visible items to itemsToShow', () => {
      const { visibleItems, hasMore } = filterSortAndPaginate(items, PLACES, [], getItemTags, 2)
      expect(visibleItems).toHaveLength(2)
      expect(hasMore).toBe(true)
    })

    it('hasMore is false when all items fit within the limit', () => {
      const { hasMore } = filterSortAndPaginate(items, PLACES, [], getItemTags, 100)
      expect(hasMore).toBe(false)
    })

    it('hasMore is false when itemsToShow equals the item count exactly', () => {
      const { visibleItems, hasMore } = filterSortAndPaginate(items, PLACES, [], getItemTags, 4)
      expect(visibleItems).toHaveLength(4)
      expect(hasMore).toBe(false)
    })

    it('returns empty array when no items match', () => {
      const { visibleItems, hasMore } = filterSortAndPaginate(
        items,
        'nonexistent',
        [],
        getItemTags,
        30,
      )
      expect(visibleItems).toEqual([])
      expect(hasMore).toBe(false)
    })
  })
})
