/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent, act } from '@testing-library/react'
import { MapContainer } from 'react-leaflet'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { LocateControl } from './LocateControl'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'
import type { ItemType } from '#types/ItemType'
import type { LayerProps as Layer } from '#types/LayerProps'
import type { MarkerIcon } from '#types/MarkerIcon'
import type { Mock } from 'vitest'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

// Mock external dependencies
vi.mock('react-toastify', () => ({
  toast: {
    loading: vi.fn(() => 'toast-id'),
    update: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('react-leaflet', async () => {
  const actual = await vi.importActual('react-leaflet')
  return {
    ...actual,
    useMap: vi.fn(() => ({
      closePopup: vi.fn(),
    })),
    useMapEvents: vi.fn((eventHandlers) => {
      ;(global as any).mockMapEventHandlers = eventHandlers
      return null
    }),
  }
})

vi.mock('leaflet', () => ({
  control: {
    locate: vi.fn(() => ({
      addTo: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
  },
}))

vi.mock('#components/Auth/useAuth')
vi.mock('#components/Map/hooks/useMyProfile')
vi.mock('#components/Map/hooks/useItems')
vi.mock('#components/Map/hooks/useLayers')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUser: User = {
  id: 'user-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
}

const mockApi: ItemsApi<Item> = {
  getItems: vi.fn().mockResolvedValue([]),
  getItem: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  collectionName: 'test-collection',
}

const mockMarkerIcon: MarkerIcon = {
  image: 'test-icon.svg',
  size: 32,
}

const mockItemType: ItemType = {
  name: 'user',
  show_name_input: true,
  show_profile_button: true,
  show_start_end: false,
  show_start_end_input: false,
  show_text: true,
  show_text_input: true,
  custom_text: '',
  profileTemplate: [],
  offers_and_needs: false,
  icon_as_labels: false,
  relations: false,
  template: 'simple',
  questlog: false,
}

const mockLayer: Layer = {
  id: 'layer-1',
  name: 'Users',
  menuIcon: 'user',
  menuColor: '#ff0000',
  menuText: 'Users',
  markerIcon: mockMarkerIcon,
  markerShape: 'circle',
  markerDefaultColor: '#ff0000',
  itemType: mockItemType,
  userProfileLayer: true,
  api: mockApi,
}

const mockProfile: Item = {
  id: 'profile-1',
  name: 'John Doe',
  position: {
    type: 'Point',
    coordinates: [10.0, 50.0],
  },
  user_created: mockUser,
  layer: mockLayer,
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <MapContainer center={[51.505, -0.09]} zoom={13}>
      {children}
    </MapContainer>
  </MemoryRouter>
)

describe('<LocateControl />', () => {
  let mockUseAuth: Mock
  let mockUseMyProfile: Mock
  let mockUseUpdateItem: Mock
  let mockUseAddItem: Mock
  let mockUseLayers: Mock

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockNavigate.mockClear()
    ;(global as any).mockMapEventHandlers = {}

    const { useAuth } = await import('#components/Auth/useAuth')
    const { useMyProfile } = await import('#components/Map/hooks/useMyProfile')
    const { useUpdateItem, useAddItem } = await import('#components/Map/hooks/useItems')
    const { useLayers } = await import('#components/Map/hooks/useLayers')

    mockUseAuth = vi.mocked(useAuth)
    mockUseMyProfile = vi.mocked(useMyProfile)
    mockUseUpdateItem = vi.mocked(useUpdateItem)
    mockUseAddItem = vi.mocked(useAddItem)
    mockUseLayers = vi.mocked(useLayers)

    mockUseAuth.mockReturnValue({ user: mockUser })
    mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })
    mockUseUpdateItem.mockReturnValue(vi.fn())
    mockUseAddItem.mockReturnValue(vi.fn())
    mockUseLayers.mockReturnValue([mockLayer])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders the locate control button', () => {
      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const button = screen.getByRole('button', { name: /start location tracking/i })
      expect(button).toBeInTheDocument()
    })

    it('displays target icon when not active', () => {
      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const button = screen.getByRole('button', { name: /start location tracking/i })
      expect(button).toBeInTheDocument()
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('matches snapshot', () => {
      const { container } = render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Modal Display Logic', () => {
    it('shows modal for new user without profile when location is found', () => {
      mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const locationEvent = {
        latlng: { lat: 52.5, lng: 13.4, distanceTo: vi.fn(() => 200) },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/create your profile at your current location/i)).toBeInTheDocument()
    })

    it('shows modal for existing user when location is far from current position', () => {
      const profileWithPosition = {
        ...mockProfile,
        position: {
          type: 'Point' as const,
          coordinates: [10.0, 50.0],
        },
      }
      mockUseMyProfile.mockReturnValue({ myProfile: profileWithPosition, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const locationEvent = {
        latlng: {
          lat: 52.5,
          lng: 13.4,
          distanceTo: vi.fn(() => 200),
        },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/place your profile at your current location/i)).toBeInTheDocument()
    })

    it('does not show modal when distance is less than 100m', () => {
      const profileWithPosition = {
        ...mockProfile,
        position: {
          type: 'Point' as const,
          coordinates: [10.0, 50.0],
        },
      }
      mockUseMyProfile.mockReturnValue({ myProfile: profileWithPosition, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      // Mock distanceTo to return a distance < 100m
      const locationEvent = {
        latlng: {
          lat: 50.001, // Very close to current position
          lng: 10.001,
          distanceTo: vi.fn(() => 50), // Distance less than 100m
        },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Modal should not appear
      expect(
        screen.queryByText(/place your profile at your current location/i),
      ).not.toBeInTheDocument()
    })

    it('does not show modal when location error occurs', () => {
      mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      // Simulate location error
      act(() => {
        ;(global as any).mockMapEventHandlers?.locationerror?.()
      })

      act(() => {
        vi.runAllTimers()
      })

      // Modal should not appear
      expect(
        screen.queryByText(/create your profile at your current location/i),
      ).not.toBeInTheDocument()
    })

  })

  describe('Profile Creation', () => {
    it('creates new profile when user has no existing profile', async () => {
      const mockCreateItem = vi.fn().mockResolvedValue({
        id: 'new-profile-1',
        name: 'John',
        position: { type: 'Point', coordinates: [13.4, 52.5] },
      })
      const mockAddItem = vi.fn()

      mockApi.createItem = mockCreateItem
      mockUseAddItem.mockReturnValue(mockAddItem)
      mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const locationEvent = {
        latlng: { lat: 52.5, lng: 13.4, distanceTo: vi.fn(() => 200) },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/create your profile/i)).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')

      await act(async () => {
        fireEvent.click(yesButton)
        // Allow promises to resolve
        await vi.runAllTimersAsync()
      })

      // Verify API calls were made
      expect(mockCreateItem).toHaveBeenCalled()
      expect(mockAddItem).toHaveBeenCalled()
      expect(toast.loading).toHaveBeenCalledWith('Creating profile at location')
    })

    it('updates existing profile position', async () => {
      const mockUpdateItem = vi.fn().mockResolvedValue({
        id: 'profile-1',
        position: { type: 'Point', coordinates: [13.4, 52.5] },
      })
      const mockUpdateItemHook = vi.fn()

      // Create a profile with a current position far from the new location
      const profileWithCurrentPosition = {
        ...mockProfile,
        position: {
          type: 'Point' as const,
          coordinates: [10.0, 50.0], // lng, lat format - far from 13.4, 52.5
        },
      }

      if (profileWithCurrentPosition.layer?.api) {
        profileWithCurrentPosition.layer.api.updateItem = mockUpdateItem
      }
      mockUseUpdateItem.mockReturnValue(mockUpdateItemHook)
      mockUseMyProfile.mockReturnValue({
        myProfile: profileWithCurrentPosition,
        isMyProfileLoaded: true,
      })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      // Mock distanceTo to return a distance > 100m
      const mockDistanceTo = vi.fn(() => 200)
      const locationEvent = {
        latlng: { lat: 52.5, lng: 13.4, distanceTo: mockDistanceTo },
      }
      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      // Verify distanceTo was called with swapped coordinates [lat, lng]
      // Verify distanceTo was called with swapped coordinates [lat, lng]
      expect(mockDistanceTo).toHaveBeenCalledWith([50.0, 10.0])

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/place your profile/i)).toBeInTheDocument()

      // Find the Yes button by text content instead of role
      const yesButton = screen.getByText('Yes')

      await act(async () => {
        fireEvent.click(yesButton)
        // Allow promises to resolve
        await vi.runAllTimersAsync()
      })

      // Verify API calls were made
      expect(mockUpdateItem).toHaveBeenCalled()
      expect(mockUpdateItemHook).toHaveBeenCalled()
      expect(toast.loading).toHaveBeenCalledWith('Updating position')
    })
  })

  describe('Navigation', () => {
    it('navigates to profile after successful creation', async () => {
      const mockCreateItem = vi.fn().mockResolvedValue({
        id: 'new-profile-1',
        name: 'John',
        position: { type: 'Point', coordinates: [13.4, 52.5] },
      })

      mockApi.createItem = mockCreateItem
      mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const locationEvent = {
        latlng: { lat: 52.5, lng: 13.4, distanceTo: vi.fn(() => 200) },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/create your profile/i)).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')

      await act(async () => {
        fireEvent.click(yesButton)
        // Allow promises to resolve
        await vi.runAllTimersAsync()
      })

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/new-profile-1')
    })
  })

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const mockCreateItem = vi.fn().mockRejectedValue(new Error('Network error'))
      mockApi.createItem = mockCreateItem
      mockUseMyProfile.mockReturnValue({ myProfile: null, isMyProfileLoaded: true })

      render(
        <TestWrapper>
          <LocateControl />
        </TestWrapper>,
      )

      const locationEvent = {
        latlng: { lat: 52.5, lng: 13.4, distanceTo: vi.fn(() => 200) },
      }

      act(() => {
        ;(global as any).mockMapEventHandlers?.locationfound?.(locationEvent)
      })

      act(() => {
        vi.runAllTimers()
      })

      // Check if modal appears after timeout
      expect(screen.getByText(/create your profile/i)).toBeInTheDocument()

      const yesButton = screen.getByText('Yes')

      await act(async () => {
        fireEvent.click(yesButton)
        // Allow promises to resolve
        await vi.runAllTimersAsync()
      })

      // Verify error toast was shown
      expect(toast.update).toHaveBeenCalledWith('toast-id', {
        render: 'Network error',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      })
    })
  })
})
