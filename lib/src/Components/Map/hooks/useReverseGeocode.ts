import { useState, useEffect } from 'react'

interface GeocodeResult {
  street?: string
  housenumber?: string
  postcode?: string
  city?: string
  town?: string
  village?: string
  district?: string
  suburb?: string
  neighbourhood?: string
  state?: string
  country?: string
}

interface GeocodeFeature {
  properties: GeocodeResult
}

interface GeocodeResponse {
  features?: GeocodeFeature[]
}

export function useReverseGeocode(
  coordinates?: [number, number] | null,
  enabled: boolean = true,
  accuracy: 'municipality' | 'street' | 'house_number' = 'municipality',
) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !coordinates) {
      setAddress('')
      return
    }

    const [longitude, latitude] = coordinates
    if (!latitude || !longitude) {
      return
    }

    const reverseGeocode = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}&lang=de&limit=1`,
        )

        if (!response.ok) {
          throw new Error('Geocoding request failed')
        }

        const data = (await response.json()) as GeocodeResponse

        if (data.features && data.features.length > 0) {
          const props = data.features[0].properties
          const municipality = props.city || props.town || props.village

          let addressString = ''

          switch (accuracy) {
            case 'municipality':
              addressString = municipality ?? ''
              break
            case 'street':
              if (props.street && municipality) {
                addressString = `${props.street}, ${municipality}`
              } else {
                addressString = municipality ?? ''
              }
              break
            case 'house_number':
              if (props.street && props.housenumber && municipality) {
                addressString = `${props.street} ${props.housenumber}, ${municipality}`
              } else if (props.street && municipality) {
                addressString = `${props.street}, ${municipality}`
              } else {
                addressString = municipality ?? ''
              }
              break
          }

          setAddress(addressString)
        } else {
          setAddress('')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        setAddress('')
        throw err
      } finally {
        setLoading(false)
      }
    }

    void reverseGeocode()
  }, [coordinates, enabled, accuracy])

  return { address, loading, error }
}