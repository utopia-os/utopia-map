/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { OverlayItemsIndexPage } from './OverlayItemsIndexPage'

import type { Item } from '#types/Item'

vi.mock('./ItemCard', () => ({
  ItemCard: ({ i }: { i: Item }) => <div data-testid={`item-${i.id}`}>{i.name}</div>,
}))
vi.mock('./MapOverlayPage', () => ({
  MapOverlayPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('#components/Map/Subcomponents/Controls/Control', () => ({
  Control: () => null,
}))
vi.mock('#components/Map/Subcomponents/Controls/SearchControl', () => ({
  SearchControl: () => null,
}))
vi.mock('#components/Map/Subcomponents/Controls/TagsControl', () => ({
  TagsControl: () => null,
}))
vi.mock('#components/Profile/Subcomponents/PlusButton', () => ({
  PlusButton: () => null,
}))
vi.mock('#components/Map/Subcomponents/ItemPopupComponents', () => ({
  PopupStartEndInput: () => null,
}))
vi.mock('#components/Input', () => ({
  TextInput: () => null,
}))
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('#components/Auth/useAuth')
vi.mock('#components/Map/hooks/useFilter')
vi.mock('#components/Map/hooks/useItems')
vi.mock('#components/Map/hooks/useLayers')
vi.mock('#components/Map/hooks/useTags')

let observerCallback: IntersectionObserverCallback
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

class MockIntersectionObserver {
  // eslint-disable-next-line promise/prefer-await-to-callbacks
  constructor(cb: IntersectionObserverCallback) {
    observerCallback = cb
  }

  observe = mockObserve
  disconnect = mockDisconnect
  unobserve = vi.fn()
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${String(i)}`,
    name: `Item ${String(i)}`,
    date_created: new Date(2025, 0, count - i).toISOString(),
    layer: { name: 'places' } as Item['layer'],
  })) as Item[]
}

const mockLayer = {
  name: 'places',
  menuText: 'Places',
  itemType: { show_start_end_input: false },
  userProfileLayer: false,
  api: { createItem: vi.fn(), deleteItem: vi.fn() },
}

function triggerIntersection() {
  observerCallback(
    [{ isIntersecting: true } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  )
}

describe('OverlayItemsIndexPage – infinite scroll', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const { useAuth } = await import('#components/Auth/useAuth')
    const { useFilterTags } = await import('#components/Map/hooks/useFilter')
    const { useItems, useAddItem, useRemoveItem } = await import('#components/Map/hooks/useItems')
    const { useLayers } = await import('#components/Map/hooks/useLayers')
    const { useTags, useAddTag, useGetItemTags } = await import('#components/Map/hooks/useTags')

    vi.mocked(useAuth).mockReturnValue({ user: null } as any)
    vi.mocked(useFilterTags).mockReturnValue([])
    vi.mocked(useItems).mockReturnValue(makeItems(50))
    vi.mocked(useAddItem).mockReturnValue(vi.fn())
    vi.mocked(useRemoveItem).mockReturnValue(vi.fn())
    vi.mocked(useLayers).mockReturnValue([mockLayer] as any)
    vi.mocked(useTags).mockReturnValue([])
    vi.mocked(useAddTag).mockReturnValue(vi.fn())
    vi.mocked(useGetItemTags).mockReturnValue((() => []) as any)
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <OverlayItemsIndexPage url='/places' layerName='places' />
      </MemoryRouter>,
    )
  }

  it('renders the first batch of 30 items with a sentinel', () => {
    renderPage()

    expect(screen.getAllByTestId(/^item-/)).toHaveLength(30)
    expect(screen.getByTestId('scroll-sentinel')).toBeInTheDocument()
  })

  it('loads more items when the sentinel becomes visible', async () => {
    renderPage()
    expect(screen.getAllByTestId(/^item-/)).toHaveLength(30)

    act(() => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(screen.getAllByTestId(/^item-/)).toHaveLength(50)
    })
  })

  it('removes the sentinel after all items are loaded', async () => {
    renderPage()

    act(() => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(screen.queryByTestId('scroll-sentinel')).not.toBeInTheDocument()
    })
  })

  it('only loads one batch when triggered twice before re-render', async () => {
    const { useItems } = await import('#components/Map/hooks/useItems')
    vi.mocked(useItems).mockReturnValue(makeItems(80))

    renderPage()
    expect(screen.getAllByTestId(/^item-/)).toHaveLength(30)

    act(() => {
      triggerIntersection()
      triggerIntersection()
    })

    await waitFor(() => {
      expect(screen.getAllByTestId(/^item-/)).toHaveLength(54)
    })
  })
})
