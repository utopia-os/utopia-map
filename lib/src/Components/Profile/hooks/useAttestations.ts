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

// Using undefined as default to detect missing provider
export const AttestationsContext = createContext<Attestation[] | undefined>(undefined)

export const useAttestations = (): Attestation[] => {
  const context = useContext(AttestationsContext)
  if (context === undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      'useAttestations: AttestationsContext.Provider is missing. ' +
        'Make sure the component is wrapped in AttestationsContext.Provider.',
    )
    return []
  }
  return context
}
