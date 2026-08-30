import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { TextViewStatic } from './TextViewStatic'

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

describe('<TextViewStatic />', () => {
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
    it('renders markdown content as HTML', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Hello **world**' />
        </Wrapper>,
      )
      expect(screen.getByText('world')).toBeInTheDocument()
      expect(screen.getByText('world').tagName).toBe('STRONG')
    })

    it('returns null for empty text', () => {
      const { container } = render(
        <Wrapper>
          <TextViewStatic text='' />
        </Wrapper>,
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null for null text', () => {
      const { container } = render(
        <Wrapper>
          <TextViewStatic text={null} />
        </Wrapper>,
      )
      expect(container.firstChild).toBeNull()
    })

    it('shows login message when text is undefined', () => {
      render(
        <Wrapper>
          <TextViewStatic text={undefined} />
        </Wrapper>,
      )
      expect(screen.getByText('Login')).toBeInTheDocument()
    })

    it('uses item.text when item prop is provided', () => {
      const item = { id: '1', name: 'Test', text: 'Item content here' } as Item
      render(
        <Wrapper>
          <TextViewStatic item={item} />
        </Wrapper>,
      )
      expect(screen.getByText(/Item content here/)).toBeInTheDocument()
    })

    it('uses rawText prop directly without processing', () => {
      render(
        <Wrapper>
          <TextViewStatic rawText='Raw **text** content' />
        </Wrapper>,
      )
      expect(screen.getByText('text')).toBeInTheDocument()
    })
  })

  describe('Truncation', () => {
    it('truncates long text when truncate=true', () => {
      const longText = 'A'.repeat(150)
      render(
        <Wrapper>
          <TextViewStatic text={longText} truncate={true} />
        </Wrapper>,
      )
      expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument()
    })

    it('does not truncate when truncate=false', () => {
      const longText = 'A'.repeat(150)
      render(
        <Wrapper>
          <TextViewStatic text={longText} truncate={false} />
        </Wrapper>,
      )
      expect(screen.queryByText(/\.\.\.$/)).not.toBeInTheDocument()
    })
  })

  describe('Hashtag Rendering', () => {
    it('renders hashtag with correct color', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Check out #nature' />
        </Wrapper>,
      )
      const hashtag = screen.getByText('#nature')
      expect(hashtag).toHaveStyle({ color: '#22c55e' })
    })

    it('renders unknown hashtag with inherit color', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Unknown #sometag here' />
        </Wrapper>,
      )
      const hashtag = screen.getByText('#sometag')
      expect(hashtag).toHaveStyle({ color: 'inherit' })
    })

    it('calls addFilterTag when hashtag is clicked', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Click #nature here' />
        </Wrapper>,
      )
      const hashtag = screen.getByText('#nature')
      fireEvent.click(hashtag)
      expect(mockAddFilterTag).toHaveBeenCalledWith(mockTags[0])
    })
  })

  describe('Item Mention Rendering', () => {
    it('renders item mention as link with correct color', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Thanks [@Alice](/item/abc-123)' />
        </Wrapper>,
      )
      const mention = screen.getByText('@Alice')
      expect(mention.tagName).toBe('A')
      expect(mention).toHaveAttribute('href', '/item/abc-123')
      expect(mention).toHaveStyle({ color: '#ef4444' })
    })

    it('renders unknown item mention with fallback color', () => {
      render(
        <Wrapper>
          <TextViewStatic text='See [@Unknown](/item/xyz-999)' />
        </Wrapper>,
      )
      const mention = screen.getByText('@Unknown')
      expect(mention).toBeInTheDocument()
    })
  })

  describe('Link Navigation', () => {
    it('navigates internally for relative links', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Go to [profile](/profile/123)' />
        </Wrapper>,
      )
      const link = screen.getByText('profile')
      fireEvent.click(link)
      expect(mockNavigate).toHaveBeenCalledWith('/profile/123')
    })

    it('does not navigate for external links', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Visit [Example](https://example.com)' />
        </Wrapper>,
      )
      const link = screen.getByText('Example')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Video Embed', () => {
    it('renders YouTube video as iframe', () => {
      render(
        <Wrapper>
          <TextViewStatic text='Watch <https://www.youtube.com/watch?v=dQw4w9WgXcQ>' />
        </Wrapper>,
      )
      const iframe = document.querySelector('iframe')
      expect(iframe).toBeInTheDocument()
      expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    })
  })
})

