import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  TagsProvider,
  useTags,
  useAddTag,
  useSetTagApi,
  useProcessItemsTags,
  useGetItemTags,
} from './useTags'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'
import type { Tag } from '#types/Tag'
import type { ReactNode } from 'react'

vi.mock('#utils/RandomColor', () => ({
  randomColor: () => '#abc123',
}))

describe('useTags - Hashtag Auto-Creation Feature', () => {
  const createMockApi = () => {
    const createItem = vi.fn().mockResolvedValue({})
    const api: ItemsApi<Tag> = {
      getItems: vi.fn().mockResolvedValue([]),
      createItem,
    }
    return { api, createItem }
  }

  const createWrapper = (initialTags: Tag[] = []) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <TagsProvider initialTags={initialTags}>{children}</TagsProvider>
    )
    Wrapper.displayName = 'TagsProviderWrapper'
    return Wrapper
  }

  const mockItem = (text?: string, overrides: Partial<Item> = {}): Item => ({
    id: overrides.id ?? 'item-1',
    name: 'Test Item',
    text,
    ...overrides,
  })

  const existingTags: Tag[] = [
    { id: 'tag-1', name: 'nature', color: '#22c55e' },
    { id: 'tag-2', name: 'community', color: '#3b82f6' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Tag State Management', () => {
    it('initializes with provided tags', () => {
      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(existingTags),
      })

      expect(result.current).toHaveLength(2)
      expect(result.current.map((t) => t.name)).toContain('nature')
      expect(result.current.map((t) => t.name)).toContain('community')
    })

    it('adds new tags to state', () => {
      const { result } = renderHook(() => ({ tags: useTags(), addTag: useAddTag() }), {
        wrapper: createWrapper([]),
      })

      act(() => {
        result.current.addTag({ id: 'new-1', name: 'sustainability', color: '#10b981' })
      })

      expect(result.current.tags).toHaveLength(1)
      expect(result.current.tags[0].name).toBe('sustainability')
    })

    it('prevents duplicate tags (case-insensitive)', () => {
      const { result } = renderHook(() => ({ tags: useTags(), addTag: useAddTag() }), {
        wrapper: createWrapper(existingTags),
      })

      act(() => {
        result.current.addTag({ id: 'dup-1', name: 'NATURE', color: '#000000' })
        result.current.addTag({ id: 'dup-2', name: 'Community', color: '#ffffff' })
      })

      expect(result.current.tags).toHaveLength(2)
    })
  })

  describe('API Integration', () => {
    it('persists new tags via API.createItem', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(() => ({ addTag: useAddTag(), setTagApi: useSetTagApi() }), {
        wrapper: createWrapper([]),
      })

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.addTag({ id: 'new-1', name: 'permaculture', color: '#84cc16' })
      })

      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({ name: 'permaculture' }))
    })

    it('does not call API for existing tags', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(() => ({ addTag: useAddTag(), setTagApi: useSetTagApi() }), {
        wrapper: createWrapper(existingTags),
      })

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.addTag({ id: 'dup-1', name: 'nature', color: '#000000' })
      })

      expect(createItem).not.toHaveBeenCalled()
    })

    it('uses current API ref, not stale closure', () => {
      const { api: oldApi, createItem: oldCreateItem } = createMockApi()
      const { api: newApi, createItem: newCreateItem } = createMockApi()

      const { result } = renderHook(() => ({ addTag: useAddTag(), setTagApi: useSetTagApi() }), {
        wrapper: createWrapper([]),
      })

      act(() => {
        result.current.setTagApi(oldApi)
      })
      act(() => {
        result.current.setTagApi(newApi)
      })

      act(() => {
        result.current.addTag({ id: '1', name: 'test', color: '#ff0000' })
      })

      expect(newCreateItem).toHaveBeenCalled()
      expect(oldCreateItem).not.toHaveBeenCalled()
    })
  })

  describe('Hashtag Detection & Auto-Creation (processItemsTags)', () => {
    it('extracts hashtags from item text and creates tags', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper([]) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([mockItem('Join our #gardening workshop this weekend!')])
      })

      expect(result.current.tags).toHaveLength(1)
      expect(result.current.tags[0].name).toBe('gardening')
      expect(createItem).toHaveBeenCalledTimes(1)
    })

    it('skips hashtags that already exist as tags', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper(existingTags) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([mockItem('Love #nature and #community events')])
      })

      expect(result.current.tags).toHaveLength(2)
      expect(createItem).not.toHaveBeenCalled()
    })

    it('handles multiple hashtags in one item', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper([]) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([
          mockItem('Check out #solar #wind and #hydro energy solutions'),
        ])
      })

      expect(result.current.tags).toHaveLength(3)
      expect(result.current.tags.map((t) => t.name)).toEqual(
        expect.arrayContaining(['solar', 'wind', 'hydro']),
      )
      expect(createItem).toHaveBeenCalledTimes(3)
    })

    it('deduplicates same hashtag across multiple items', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper([]) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([
          mockItem('First post about #networking', { id: 'item-1' }),
          mockItem('Another #networking event', { id: 'item-2' }),
          mockItem('More #networking opportunities', { id: 'item-3' }),
        ])
      })

      expect(result.current.tags).toHaveLength(1)
      expect(result.current.tags[0].name).toBe('networking')
      expect(createItem).toHaveBeenCalledTimes(1)
    })

    it('handles items without text gracefully', () => {
      const { api, createItem } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper([]) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([
          mockItem(undefined),
          mockItem(''),
          mockItem('No hashtags here'),
        ])
      })

      expect(result.current.tags).toHaveLength(0)
      expect(createItem).not.toHaveBeenCalled()
    })

    it('assigns color to auto-created tags', () => {
      const { api } = createMockApi()

      const { result } = renderHook(
        () => ({
          tags: useTags(),
          processItemsTags: useProcessItemsTags(),
          setTagApi: useSetTagApi(),
        }),
        { wrapper: createWrapper([]) },
      )

      act(() => {
        result.current.setTagApi(api)
      })

      act(() => {
        result.current.processItemsTags([mockItem('New #colorful tag')])
      })

      expect(result.current.tags[0].color).toBe('#abc123')
    })
  })

  describe('Tag Retrieval (getItemTags)', () => {
    it('returns matching tags from item text', () => {
      const { result } = renderHook(() => ({ getItemTags: useGetItemTags() }), {
        wrapper: createWrapper(existingTags),
      })

      const item = mockItem('Beautiful #nature photography from our #community')
      const tags = result.current.getItemTags(item)

      expect(tags).toHaveLength(2)
      expect(tags.map((t) => t.name)).toContain('nature')
      expect(tags.map((t) => t.name)).toContain('community')
    })

    it('includes offers and needs tags', () => {
      const tagsWithOffersNeeds: Tag[] = [
        { id: 'offer-1', name: 'gardening-help', color: '#22c55e' },
        { id: 'need-1', name: 'tools', color: '#ef4444' },
      ]

      const { result } = renderHook(() => ({ getItemTags: useGetItemTags() }), {
        wrapper: createWrapper(tagsWithOffersNeeds),
      })

      /* eslint-disable camelcase */
      const item = mockItem('Looking for help', {
        offers: [{ tags_id: 'offer-1' }],
        needs: [{ tags_id: 'need-1' }],
      })
      /* eslint-enable camelcase */

      const tags = result.current.getItemTags(item)

      expect(tags).toHaveLength(2)
      expect(tags.map((t) => t.name)).toContain('gardening-help')
      expect(tags.map((t) => t.name)).toContain('tools')
    })

    it('matches hashtags case-insensitively', () => {
      const { result } = renderHook(() => ({ getItemTags: useGetItemTags() }), {
        wrapper: createWrapper(existingTags),
      })

      const item = mockItem('Love #NATURE and #CoMmUnItY')
      const tags = result.current.getItemTags(item)

      expect(tags).toHaveLength(2)
    })
  })
})
