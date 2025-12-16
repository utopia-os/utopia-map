/* eslint-disable camelcase */ // Directus database fields use snake_case
/* eslint-disable promise/always-return */
import { control } from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import { useMap, useMapEvents } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import TargetSVG from '#assets/target.svg'
import { useAuth } from '#components/Auth/useAuth'
import { useAddItem, useUpdateItem } from '#components/Map/hooks/useItems'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'
import type { LatLng } from 'leaflet'

// eslint-disable-next-line import-x/no-unassigned-import
import 'leaflet.locatecontrol'

// Type definitions for leaflet.locatecontrol
declare module 'leaflet' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace control {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function locate(options?: object): any
  }
}

/**
 * React wrapper for leaflet.locatecontrol that provides user geolocation functionality
 * @category Map Controls
 */
export const LocateControl = (): React.JSX.Element => {
  const map = useMap()
  const myProfile = useMyProfile()
  const updateItem = useUpdateItem()
  const addItem = useAddItem()
  const layers = useLayers()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Prevent React 18 StrictMode from calling useEffect twice
  const init = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const [lc, setLc] = useState<any>(null)
  const [active, setActive] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false)
  const [foundLocation, setFoundLocation] = useState<LatLng | null>(null)
  const [hasUpdatedPosition, setHasUpdatedPosition] = useState<boolean>(false)
  const [hasDeclinedModal, setHasDeclinedModal] = useState<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentPosition = myProfile.myProfile?.position?.coordinates ?? null

  // Determine if modal should be shown based on distance and conditions
  const shouldShowModal = useCallback(
    (targetLocation: LatLng | null, hasUpdated: boolean): boolean => {
      if (!targetLocation || hasUpdated || hasDeclinedModal || !user) return false

      // Show modal if user has no profile (new user)
      if (!myProfile.myProfile) return true

      // Show modal if user has no current position
      if (!currentPosition) return true

      const distance = targetLocation.distanceTo([currentPosition[1], currentPosition[0]])
      return distance >= 100
    },
    [myProfile.myProfile, currentPosition, hasDeclinedModal, user],
  )

  useEffect(() => {
    if (!init.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      setLc(control.locate().addTo(map))
      init.current = true
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check if user logged in while location is active and found
  useEffect(() => {
    if (
      active &&
      foundLocation &&
      !showLocationModal &&
      shouldShowModal(foundLocation, hasUpdatedPosition)
    ) {
      timeoutRef.current = setTimeout(() => {
        setShowLocationModal(true)
      }, 1000)
    }
  }, [active, foundLocation, showLocationModal, hasUpdatedPosition, shouldShowModal])

  useMapEvents({
    locationfound: (e) => {
      setLoading(false)
      setActive(true)
      setFoundLocation(e.latlng)
    },
    locationerror: () => {
      setLoading(false)
      setActive(false)
    },
  })

  const handleLocateClick = (): void => {
    if (!lc) return

    if (active) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      lc.stop()
      setActive(false)
      setHasDeclinedModal(false) // Reset declined state when turning off location
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      lc.start()
      setLoading(true)
      setHasDeclinedModal(false) // Reset declined state when turning on location
    }
  }

  const itemUpdatePosition = useCallback(async () => {
    if (!foundLocation || !user) return

    const toastId = toast.loading(
      myProfile.myProfile ? 'Updating position' : 'Creating profile at location',
    )

    try {
      let result: Item

      if (myProfile.myProfile) {
        // Update existing profile
        const updatedProfile = {
          id: myProfile.myProfile.id,
          position: { type: 'Point', coordinates: [foundLocation.lng, foundLocation.lat] },
        }
        if (!myProfile.myProfile.layer?.api?.updateItem) {
          throw new Error('Update API not available')
        }
        result = await myProfile.myProfile.layer.api.updateItem(updatedProfile as Item)
        // Use server response for local state update
        updateItem({ ...result, layer: myProfile.myProfile.layer, user_created: user })
        toast.update(toastId, {
          render: 'Position updated',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        })
      } else {
        // Create new profile
        const userLayer = layers.find((l) => l.userProfileLayer === true)
        if (!userLayer?.api?.createItem) {
          throw new Error('User profile layer or create API not available')
        }

        const newProfile = {
          id: crypto.randomUUID(),
          name: user.first_name ?? 'User',
          position: { type: 'Point', coordinates: [foundLocation.lng, foundLocation.lat] },
        }

        result = await userLayer.api.createItem(newProfile as Item)
        // Use server response for local state update
        addItem({
          ...result,
          user_created: user,
          layer: userLayer,
          public_edit: false,
        })
        toast.update(toastId, {
          render: 'Profile created at location',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        })
      }

      // Navigate to the profile to show the popup
      void navigate(`/${result.id}`)

      // Clean up and reset state
      setFoundLocation(null)
      setActive(false)
      setHasUpdatedPosition(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (lc) lc.stop()
      // Reset flag after a delay to allow future updates
      setTimeout(() => {
        setHasUpdatedPosition(false)
      }, 5000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.update(toastId, {
          render: error.message,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        })
      } else if (typeof error === 'string') {
        toast.update(toastId, {
          render: error,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        })
      } else {
        throw error
      }
    }
  }, [myProfile.myProfile, foundLocation, updateItem, addItem, layers, user, lc, navigate])

  return (
    <>
      <div className='tw:card tw:flex-none tw:h-12 tw:w-12 tw:bg-base-100 tw:shadow-xl tw:items-center tw:justify-center tw:hover:bg-slate-300 tw:hover:cursor-pointer tw:transition-all tw:duration-300 tw:ml-2'>
        <div
          className='tw:card-body tw:card tw:p-2 tw:h-10 tw:w-10'
          onClick={handleLocateClick}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleLocateClick()
            }
          }}
          aria-label={active ? 'Stop location tracking' : 'Start location tracking'}
        >
          {loading ? (
            <span className='tw:loading tw:loading-spinner tw:loading-md tw:mt-1' />
          ) : (
            <SVG
              src={TargetSVG}
              className='tw:mt-1 tw:p-[1px]'
              style={{ fill: active ? '#fc8702' : 'currentColor' }}
            />
          )}
        </div>
      </div>
      <DialogModal
        title='Location found'
        isOpened={showLocationModal}
        onClose={() => {
          setShowLocationModal(false)
          setHasDeclinedModal(true)
        }}
        showCloseButton={true}
        closeOnClickOutside={false}
        className='tw:bottom-1/3 tw:mx-4 tw:sm:mx-auto'
      >
        <div className='tw:text-center'>
          <p className='tw:mb-4'>
            {myProfile.myProfile
              ? 'Do you like to place your profile at your current location?'
              : 'Do you like to create your profile at your current location?'}
          </p>
          <div className='tw:flex tw:justify-between'>
            <label
              className='tw:btn tw:mt-4 tw:btn-primary'
              onClick={() => {
                void itemUpdatePosition().then(() => {
                  setShowLocationModal(false)
                })
              }}
            >
              Yes
            </label>
            <label
              className='tw:btn tw:mt-4'
              onClick={() => {
                setShowLocationModal(false)
                setHasDeclinedModal(true)
              }}
            >
              No
            </label>
          </div>
        </div>
      </DialogModal>
    </>
  )
}
