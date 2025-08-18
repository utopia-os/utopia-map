import { control } from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import { useMap, useMapEvents } from 'react-leaflet'
import { toast } from 'react-toastify'

import TargetSVG from '#assets/target.svg'
import { useUpdateItem } from '#components/Map/hooks/useItems'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'
import type { LatLng } from 'leaflet'

// eslint-disable-next-line import/no-unassigned-import
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
export const LocateControl = (): JSX.Element => {
  const map = useMap()
  const myProfile = useMyProfile()
  const updateItem = useUpdateItem()

  // Prevent React 18 StrictMode from calling useEffect twice
  const init = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const [lc, setLc] = useState<any>(null)
  const [active, setActive] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false)
  const [foundLocation, setFoundLocation] = useState<LatLng | null>(null)
  const [hasUpdatedPosition, setHasUpdatedPosition] = useState<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentPosition = myProfile.myProfile?.position?.coordinates ?? null

  // Determine if modal should be shown based on distance and conditions
  const shouldShowModal = useCallback(
    (targetLocation: LatLng | null, hasUpdated: boolean): boolean => {
      if (!myProfile.myProfile || !targetLocation || hasUpdated) return false

      if (!currentPosition) return true // Show modal if user has no current position

      const distance = targetLocation.distanceTo([currentPosition[1], currentPosition[0]])
      return distance >= 100
    },
    [myProfile.myProfile, currentPosition],
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
      setShowLocationModal(true)
    }
  }, [active, foundLocation, showLocationModal, hasUpdatedPosition, shouldShowModal])

  useMapEvents({
    locationfound: (e) => {
      setLoading(false)
      setActive(true)
      setFoundLocation(e.latlng)

      // Show modal after delay if conditions are met
      if (shouldShowModal(e.latlng, hasUpdatedPosition)) {
        timeoutRef.current = setTimeout(() => {
          setShowLocationModal(true)
        }, 1000)
      }
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      lc.start()
      setLoading(true)
    }
  }

  const itemUpdatePosition = useCallback(async () => {
    if (myProfile.myProfile && foundLocation) {
      let success = false
      const updatedProfile = {
        id: myProfile.myProfile.id,
        position: { type: 'Point', coordinates: [foundLocation.lng, foundLocation.lat] },
      }
      const toastId = toast.loading('Updating item position')
      try {
        if (myProfile.myProfile.layer?.api?.updateItem) {
          await myProfile.myProfile.layer.api.updateItem(updatedProfile as Item)
        }
        success = true
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
      if (success) {
        updateItem({
          ...myProfile.myProfile,
          position: { type: 'Point', coordinates: [foundLocation.lng, foundLocation.lat] },
        })
        toast.update(toastId, {
          render: 'Item position updated',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        })
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
        setTimeout(() => setHasUpdatedPosition(false), 5000)
      }
    }
  }, [myProfile.myProfile, foundLocation, updateItem, lc])

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
        onClose={() => setShowLocationModal(false)}
        showCloseButton={true}
        closeOnClickOutside={true}
        className='tw:bottom-1/3 tw:mx-4 tw:sm:mx-auto'
      >
        <div className='tw:text-center'>
          <p className='tw:mb-4'>Do you like to place your profile at your current location?</p>
          <div className='tw:flex tw:justify-between'>
            <label
              className='tw:btn tw:mt-4 tw:btn-primary'
              onClick={() => {
                void itemUpdatePosition().then(() => setShowLocationModal(false))
              }}
            >
              Yes
            </label>
            <label className='tw:btn tw:mt-4' onClick={() => setShowLocationModal(false)}>
              No
            </label>
          </div>
        </div>
      </DialogModal>
    </>
  )
}
