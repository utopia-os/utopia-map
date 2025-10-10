import { useState, useEffect } from 'react'

import { useMyProfile } from './useMyProfile'

import type { Point } from 'geojson'

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

export const useGeoDistance = (targetPoint?: Point) => {
  const [distance, setDistance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { myProfile, isMyProfileLoaded } = useMyProfile()

  useEffect(() => {
    setError(null)
    setDistance(null)

    if (!isMyProfileLoaded) {
      return
    }

    if (!myProfile?.position || !targetPoint) {
      setError('Missing location data')
      return
    }

    try {
      const userGeoJson = myProfile.position
      const [userLon, userLat] = userGeoJson.coordinates
      const [targetLon, targetLat] = targetPoint.coordinates

      const dist = getDistance(userLat, userLon, targetLat, targetLon)
      setDistance(dist)
    } catch (err) {
      setError('Calculation error')
    }
  }, [myProfile, isMyProfileLoaded, targetPoint])

  return { distance, error, userLocation: myProfile?.position as Point | undefined }
}
