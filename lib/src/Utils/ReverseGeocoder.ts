/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'

interface ReverseGeocodeResponse {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  display_name: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    [key: string]: string | undefined
  }
  boundingbox: string[]
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`

  try {
    const response = await axios.get<ReverseGeocodeResponse>(url)
    const address = response.data.address

    // Extrahiere Straße, Hausnummer und Ort
    const street = address.road ?? ''
    const houseNumber = address.house_number ?? ''
    const city = address.city ?? address.town ?? address.village ?? ''

    // Formatiere die Adresse
    const formattedAddress = `${street} ${houseNumber}, ${city}`.trim()
    return formattedAddress || ''
    // eslint-disable-next-line no-catch-all/no-catch-all
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error:', error)
    return ''
  }
}
