import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { RoutingLinksView } from './RoutingLinksView'

import type { Item } from '#types/Item'

const itemWithPosition: Item = {
  id: '1',
  name: 'Test Location',
  position: {
    type: 'Point',
    coordinates: [9.667615, 50.588632], // longitude, latitude format
  },
}

const itemWithoutPosition: Item = {
  id: '2',
  name: 'Test Item Without Position',
}

const itemWithNullPosition: Item = {
  id: '3',
  name: 'Test Item With Null Position',
  position: null,
}

describe('<RoutingLinksView />', () => {
  describe('when item has position coordinates', () => {
    it('renders routing service links', () => {
      const wrapper = render(<RoutingLinksView item={itemWithPosition} />)

      expect(wrapper.getByText('Get Directions')).toBeInTheDocument()
      expect(wrapper.getByText('Google Maps')).toBeInTheDocument()
      expect(wrapper.getByText('Apple Maps')).toBeInTheDocument()
      expect(wrapper.getByText('OpenStreetMap')).toBeInTheDocument()
    })

    it('generates correct Google Maps URL', () => {
      const wrapper = render(<RoutingLinksView item={itemWithPosition} />)
      const googleMapsLink = wrapper.getByText('Google Maps').closest('a')

      expect(googleMapsLink).toHaveAttribute(
        'href',
        'https://www.google.com/maps/dir/?api=1&destination=50.588632,9.667615',
      )
    })

    it('generates correct Apple Maps URL', () => {
      const wrapper = render(<RoutingLinksView item={itemWithPosition} />)
      const appleMapsLink = wrapper.getByText('Apple Maps').closest('a')

      expect(appleMapsLink).toHaveAttribute(
        'href',
        'https://maps.apple.com/?daddr=50.588632,9.667615',
      )
    })

    it('generates correct OpenStreetMap URL', () => {
      const wrapper = render(<RoutingLinksView item={itemWithPosition} />)
      const osmLink = wrapper.getByText('OpenStreetMap').closest('a')

      expect(osmLink).toHaveAttribute(
        'href',
        'https://www.openstreetmap.org/directions?to=50.588632,9.667615',
      )
    })

    it('opens links in new tab', () => {
      const wrapper = render(<RoutingLinksView item={itemWithPosition} />)
      const links = wrapper.container.querySelectorAll('a')

      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('when item does not have position', () => {
    it('does not render anything', () => {
      const wrapper = render(<RoutingLinksView item={itemWithoutPosition} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })

  describe('when item has null position', () => {
    it('does not render anything', () => {
      const wrapper = render(<RoutingLinksView item={itemWithNullPosition} />)
      expect(wrapper.container.firstChild).toBeNull()
    })
  })
})
