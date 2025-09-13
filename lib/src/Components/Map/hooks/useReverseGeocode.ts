import { useState, useEffect } from 'react'

interface GeocodeResult {
  street?: string
  housenumber?: string
  postcode?: string
  city?: string
  town?: string
  village?: string
}

interface GeocodeFeature {
  properties: GeocodeResult
}

interface GeocodeResponse {
  features?: GeocodeFeature[]
}

export function useReverseGeocode(coordinates?: [number, number] | null, enabled: boolean = true) {
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
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
          const parts: string[] = []

          // Straße und Hausnummer zusammen
          if (props.street) {
            const streetPart = props.housenumber
              ? `${props.street} ${props.housenumber}`
              : props.street
            parts.push(streetPart)
          } else if (props.housenumber) {
            parts.push(props.housenumber)
          }

          // PLZ und Ort zusammen
          if (props.postcode || props.city || props.town || props.village) {
            const locationPart = [
              props.postcode,
              props.city || props.town || props.village
            ].filter(Boolean).join(' ')
            if (locationPart) parts.push(locationPart)
          }

          setAddress(parts.join(', '))
        } else {
          setAddress('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setAddress('')
      } finally {
        setLoading(false)
      }
    }

    void reverseGeocode()
  }, [coordinates, enabled])

  return { address, loading, error }
}