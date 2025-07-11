import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { InviteLinkView } from './InviteLinkView'

import type { Item } from '#types/Item'

const itemWithSecret: Item = {
  secrets: [
    {
      secret: 'secret1',
    },
  ],
  id: '1',
  name: 'Test Item',
}

const itemWithoutSecret: Item = {
  secrets: [],
  id: '2',
  name: 'Test Item Without Secret',
}

const itemWithUndefinedSecrets: Item = {
  id: '3',
  name: 'Test Item With Undefined Secrets',
}

describe('<InviteLinkView />', () => {
  let wrapper: ReturnType<typeof render>

  const Wrapper = ({ item }: { item: Item }) => {
    return render(<InviteLinkView item={item} />)
  }

  describe('when item does not have secrets', () => {
    it('does not render anything', () => {
      wrapper = Wrapper({ item: itemWithoutSecret })
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when item has secrets undefined', () => {
    it('does not render anything', () => {
      wrapper = Wrapper({ item: itemWithUndefinedSecrets })
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when item has secrets', () => {
    beforeEach(() => {
      wrapper = Wrapper({ item: itemWithSecret })
    })

    it('renders the secret', () => {
      expect(wrapper.getByDisplayValue('secret1', { exact: false })).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      expect(wrapper.container.firstChild).toMatchSnapshot()
    })

    it('copies the secret to clipboard when button is clicked', () => {
      const copyButton = wrapper.getByRole('button')
      expect(copyButton).toBeInTheDocument()

      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText')

      fireEvent.click(copyButton)

      // TODO Implement in a way that the URL stays consistent on CI
      expect(clipboardSpy).toHaveBeenCalledWith('http://localhost:3000/invite/secret1')
    })
  })
})
