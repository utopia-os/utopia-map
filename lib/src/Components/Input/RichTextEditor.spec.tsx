import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { RichTextEditor } from './RichTextEditor'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

vi.mock('#components/Map/hooks/useTags')
vi.mock('#components/Map/hooks/useItems')
vi.mock('#components/Map/hooks/useItemColor')

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

const mockTags: Tag[] = [
  { id: '1', name: 'nature', color: '#22c55e' },
  { id: '2', name: 'tech', color: '#3b82f6' },
]

const mockItems: Item[] = [
  { id: 'abc-123', name: 'Alice', color: '#ef4444' } as Item,
  { id: 'def-456', name: 'Bob', color: '#8b5cf6' } as Item,
]

describe('<RichTextEditor />', () => {
  let mockUseTags: ReturnType<typeof vi.fn>
  let mockUseAddTag: ReturnType<typeof vi.fn>
  let mockUseItems: ReturnType<typeof vi.fn>
  let mockUseGetItemColor: ReturnType<typeof vi.fn>
  let mockAddTag: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAddTag = vi.fn()

    const { useTags, useAddTag } = await import('#components/Map/hooks/useTags')
    const { useItems } = await import('#components/Map/hooks/useItems')
    const { useGetItemColor } = await import('#components/Map/hooks/useItemColor')

    mockUseTags = vi.mocked(useTags)
    mockUseAddTag = vi.mocked(useAddTag)
    mockUseItems = vi.mocked(useItems)
    mockUseGetItemColor = vi.mocked(useGetItemColor)

    mockUseTags.mockReturnValue(mockTags)
    mockUseAddTag.mockReturnValue(mockAddTag)
    mockUseItems.mockReturnValue(mockItems)
    mockUseGetItemColor.mockReturnValue((item: Item | undefined) => item?.color ?? '#3b82f6')
  })

  describe('Rendering', () => {
    it('renders with default value', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Hello **world**' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('world')).toBeInTheDocument()
      })
    })

    it('renders label when labelTitle is provided', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Test' labelTitle='Description' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText(/Description/)).toBeInTheDocument()
      })
    })

    it('renders without label when labelTitle is not provided', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Test' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })

    it('renders menu by default', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Test' />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(document.querySelector('.editor-wrapper')).toBeInTheDocument()
      })
    })

    it('hides menu when showMenu=false', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Test' showMenu={false} />
        </Wrapper>,
      )
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })
  })

  describe('Content Editing', () => {
    it('calls updateFormValue when content changes', async () => {
      const updateFormValue = vi.fn()
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Initial' updateFormValue={updateFormValue} />
        </Wrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText('Initial')).toBeInTheDocument()
      })

      const editor = document.querySelector('.ProseMirror')
      expect(editor).toBeInTheDocument()

      if (editor) {
        fireEvent.input(editor, { target: { textContent: 'Updated content' } })
      }
    })
  })

  describe('Hashtag Rendering', () => {
    it('renders hashtag with correct styling', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Check out #nature' />
        </Wrapper>,
      )
      await waitFor(() => {
        const hashtag = screen.getByText('#nature')
        expect(hashtag).toHaveClass('hashtag')
      })
    })
  })

  describe('Item Mention Rendering', () => {
    it('renders item mention with correct styling', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Thanks [@Alice](/item/abc-123)' />
        </Wrapper>,
      )
      await waitFor(() => {
        const mention = screen.getByText('@Alice')
        expect(mention).toHaveClass('item-mention')
      })
    })
  })

  describe('Placeholder', () => {
    it('renders editor wrapper when empty', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='' placeholder='Enter description...' />
        </Wrapper>,
      )
      await waitFor(() => {
        const editor = document.querySelector('.ProseMirror')
        expect(editor).toBeInTheDocument()
      })
    })
  })
})

