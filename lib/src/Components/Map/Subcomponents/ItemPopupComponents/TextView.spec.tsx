import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { TextView } from './TextView'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('#components/Map/hooks/useTags')
vi.mock('#components/Map/hooks/useItems')
vi.mock('#components/Map/hooks/useItemColor')
vi.mock('#components/Map/hooks/useFilter')

const mockTags: Tag[] = [
  { id: '1', name: 'nature', color: '#22c55e' },
  { id: '2', name: 'tech', color: '#3b82f6' },
]

const mockItems: Item[] = [
  { id: 'abc-123', name: 'Alice', color: '#ef4444' } as Item,
  { id: 'def-456', name: 'Bob', color: '#8b5cf6' } as Item,
]

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('<TextView />', () => {
  let mockUseTags: ReturnType<typeof vi.fn>
  let mockUseItems: ReturnType<typeof vi.fn>
  let mockUseGetItemColor: ReturnType<typeof vi.fn>
  let mockUseAddFilterTag: ReturnType<typeof vi.fn>
  let mockAddFilterTag: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockAddFilterTag = vi.fn()

    const { useTags } = await import('#components/Map/hooks/useTags')
    const { useItems } = await import('#components/Map/hooks/useItems')
    const { useGetItemColor } = await import('#components/Map/hooks/useItemColor')
    const { useAddFilterTag } = await import('#components/Map/hooks/useFilter')

    mockUseTags = vi.mocked(useTags)
    mockUseItems = vi.mocked(useItems)
    mockUseGetItemColor = vi.mocked(useGetItemColor)
    mockUseAddFilterTag = vi.mocked(useAddFilterTag)

    mockUseTags.mockReturnValue(mockTags)
    mockUseItems.mockReturnValue(mockItems)
    mockUseGetItemColor.mockReturnValue((item: Item | undefined) => item?.color ?? '#3b82f6')
    mockUseAddFilterTag.mockReturnValue(mockAddFilterTag)
  })

  describe('Rendering', () => {
    it('renders markdown content via TipTap', async () => {
      render(
        <Wrapper>
          <TextView text='Hello **world**' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('world')).toBeInTheDocument()
      })
    })

    it('returns null for empty text', () => {
      const { container } = render(
        <Wrapper>
          <TextView text='' />
        </Wrapper>,
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null for null text', () => {
      const { container } = render(
        <Wrapper>
          <TextView text={null} />
        </Wrapper>,
      )
      expect(container.firstChild).toBeNull()
    })

    it('shows login message when text is undefined', async () => {
      render(
        <Wrapper>
          <TextView text={undefined} />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument()
      })
    })

    it('uses item.text when item prop is provided', async () => {
      const item = { id: '1', name: 'Test', text: 'Item content here' } as Item
      render(
        <Wrapper>
          <TextView item={item} />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText(/Item content here/)).toBeInTheDocument()
      })
    })
  })

  describe('Truncation', () => {
    it('truncates long text when truncate=true', async () => {
      const longText = 'A'.repeat(150)
      render(
        <Wrapper>
          <TextView text={longText} truncate={true} />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
      })
    })
  })

  describe('Hashtag Rendering', () => {
    it('renders hashtag with correct styling', async () => {
      render(
        <Wrapper>
          <TextView text='Check out #nature' />
        </Wrapper>,
      )
      await waitFor(() => {
        const hashtag = screen.getByText('#nature')
        expect(hashtag).toHaveClass('hashtag')
      })
    })

    it('calls addFilterTag when hashtag is clicked', async () => {
      render(
        <Wrapper>
          <TextView text='Click #nature here' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('#nature')).toBeInTheDocument()
      })
      const hashtag = screen.getByText('#nature')
      fireEvent.click(hashtag)
      expect(mockAddFilterTag).toHaveBeenCalledWith(mockTags[0])
    })
  })

  describe('Item Mention Rendering', () => {
    it('renders item mention with correct styling', async () => {
      render(
        <Wrapper>
          <TextView text='Thanks [@Alice](/item/abc-123)' />
        </Wrapper>,
      )
      await waitFor(() => {
        const mention = screen.getByText('@Alice')
        expect(mention).toHaveClass('item-mention')
      })
    })
  })

  describe('Link Navigation', () => {
    it('navigates internally for relative links', async () => {
      render(
        <Wrapper>
          <TextView text='Go to [profile](/profile/123)' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('profile')).toBeInTheDocument()
      })
      const link = screen.getByText('profile')
      fireEvent.click(link)
      expect(mockNavigate).toHaveBeenCalledWith('/profile/123')
    })
  })
})

