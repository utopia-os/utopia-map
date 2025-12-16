import { createContext, useContext } from 'react'

export interface Attestation {
  id: string
  text: string
  emoji: string
  color: string
  shape: string
  date_created: string
  user_created: { id: string; first_name: string }
  to: { directus_users_id: string }[]
}

export const AttestationsContext = createContext<Attestation[]>([])

export const useAttestations = () => useContext(AttestationsContext)
