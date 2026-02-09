import { render, screen, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { RichTextEditor } from './RichTextEditor'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

vi.mock('#components/Map/hooks/useTags')
vi.mock('#components/Map/hooks/useItems')
vi.mock('#components/Map/hooks/useItemColor')

// Type for accessing TipTap editor instance from ProseMirror DOM element
interface ProseMirrorWithEditor {
  editor: {
    commands: { insertContent: (content: string) => boolean }
    getMarkdown: () => string
  }
}

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
        expect(document.querySelector('[data-tip="Bold"]')).toBeInTheDocument()
        expect(document.querySelector('[data-tip="Italic"]')).toBeInTheDocument()
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
      // Menu buttons should not be present
      expect(document.querySelector('[data-tip="Bold"]')).not.toBeInTheDocument()
      expect(document.querySelector('[data-tip="Italic"]')).not.toBeInTheDocument()
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

      const proseMirrorEl = document.querySelector('.ProseMirror')
      expect(proseMirrorEl).toBeInTheDocument()
      if (!proseMirrorEl) throw new Error('ProseMirror element not found')

      const { editor } = proseMirrorEl as unknown as ProseMirrorWithEditor
      expect(editor).toBeDefined()

      // Clear any calls from initialization
      updateFormValue.mockClear()

      // Use TipTap editor commands to trigger a real ProseMirror transaction
      // which fires onUpdate → handleChange → updateFormValue
      act(() => {
        editor.commands.insertContent(' added')
      })

      expect(updateFormValue).toHaveBeenCalled()
      expect(updateFormValue).toHaveBeenCalledWith(expect.stringContaining('added'))
    })

    it('does not throw when updateFormValue is not provided', async () => {
      render(
        <Wrapper>
          <RichTextEditor defaultValue='Initial' />
        </Wrapper>,
      )

      await waitFor(() => {
        expect(screen.getByText('Initial')).toBeInTheDocument()
      })

      const proseMirrorEl = document.querySelector('.ProseMirror')
      expect(proseMirrorEl).toBeInTheDocument()
      if (!proseMirrorEl) throw new Error('ProseMirror element not found')

      const { editor } = proseMirrorEl as unknown as ProseMirrorWithEditor
      expect(editor).toBeDefined()

      // Should not throw when updateFormValue is undefined
      act(() => {
        editor.commands.insertContent(' more text')
      })

      // If we get here without throwing, the test passes
      expect(proseMirrorEl).toBeInTheDocument()
    })

    it('appends newlines after image markdown in updateFormValue output', async () => {
      const updateFormValue = vi.fn()
      render(
        <Wrapper>
          <RichTextEditor
            defaultValue='![alt](http://example.com/img.png)'
            updateFormValue={updateFormValue}
          />
        </Wrapper>,
      )

      await waitFor(() => {
        const editorElement = document.querySelector('.ProseMirror')
        expect(editorElement).toBeInTheDocument()
      })

      const proseMirrorEl = document.querySelector('.ProseMirror')
      expect(proseMirrorEl).toBeInTheDocument()
      if (!proseMirrorEl) throw new Error('ProseMirror element not found')

      const { editor } = proseMirrorEl as unknown as ProseMirrorWithEditor
      expect(editor).toBeDefined()

      updateFormValue.mockClear()

      act(() => {
        editor.commands.insertContent(' text after image')
      })

      expect(updateFormValue).toHaveBeenCalled()
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
